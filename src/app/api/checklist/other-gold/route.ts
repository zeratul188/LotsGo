import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import {
    isOtherGoldIconType,
    normalizeOtherGoldRecords
} from "@/app/checklist/lib/otherGold";
import type { CheckCharacter } from "@/app/store/checklistSlice";
import type { OtherGoldRecord } from "@/app/checklist/model/types";

const JWT_SECRET = process.env.LOSTARK_JWT_SECRET!;
const MAX_RECORDS_PER_CHARACTER = 200;
const MAX_SOURCE_LENGTH = 20;
const MAX_GOLD = 999999999;

type AccessTokenPayload = {
    id: string;
    sessionId: string;
};

type OtherGoldAction = "add" | "update" | "delete";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const authHeader = req.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");

        let decoded: AccessTokenPayload;
        try {
            decoded = jwt.verify(authHeader.slice(7), JWT_SECRET) as AccessTokenPayload;
        } catch {
            throw new Error("UNAUTHORIZED");
        }

        const action = body.action as OtherGoldAction;
        const nickname = typeof body.nickname === "string" ? body.nickname.trim() : "";
        if (!["add", "update", "delete"].includes(action) || !nickname || body.id !== decoded.id) {
            throw new Error("INVALID_REQUEST");
        }

        const { adminDB } = await import("@/utiils/firebaseAdmin");
        const [sessionSnapshot, memberSnapshot] = await Promise.all([
            adminDB.collection("sessions").doc(decoded.sessionId).get(),
            adminDB.collection("members").where("id", "==", decoded.id).limit(1).get()
        ]);
        const session = sessionSnapshot.data();
        if (!sessionSnapshot.exists || session?.revoked || session?.userId !== decoded.id) {
            throw new Error("UNAUTHORIZED");
        }
        if (memberSnapshot.empty) throw new Error("MEMBER_NOT_FOUND");

        const memberRef = memberSnapshot.docs[0].ref;
        let responseRecords: OtherGoldRecord[] = [];

        await adminDB.runTransaction(async (transaction) => {
            const memberDocument = await transaction.get(memberRef);
            const storedChecklist = Array.isArray(memberDocument.data()?.checklist)
                ? structuredClone(memberDocument.data()!.checklist) as CheckCharacter[]
                : [];
            const characterIndex = storedChecklist.findIndex((character) => character.nickname === nickname);
            if (characterIndex === -1) throw new Error("CHARACTER_NOT_FOUND");

            const character = storedChecklist[characterIndex];
            let records = normalizeOtherGoldRecords(character.otherGoldRecords, character.otherGold);

            if (action === "delete") {
                const recordId = typeof body.recordId === "string" ? body.recordId : "";
                if (!recordId || !records.some((record) => record.id === recordId)) {
                    throw new Error("RECORD_NOT_FOUND");
                }
                records = records.filter((record) => record.id !== recordId);
            } else {
                const icon = body.icon;
                const gold = Number(body.gold);
                const inputSource = typeof body.source === "string" ? body.source.trim() : "";
                if (!isOtherGoldIconType(icon)
                    || !Number.isInteger(gold)
                    || gold === 0
                    || Math.abs(gold) > MAX_GOLD
                    || inputSource.length > MAX_SOURCE_LENGTH) {
                    throw new Error("INVALID_RECORD");
                }

                const source = inputSource;

                if (action === "add") {
                    if (records.length >= MAX_RECORDS_PER_CHARACTER) throw new Error("RECORD_LIMIT");
                    records = [{
                        id: randomUUID(),
                        icon,
                        source,
                        createdAt: new Date().toISOString(),
                        gold
                    }, ...records];
                } else {
                    const recordId = typeof body.recordId === "string" ? body.recordId : "";
                    const recordIndex = records.findIndex((record) => record.id === recordId);
                    if (recordIndex === -1) throw new Error("RECORD_NOT_FOUND");
                    records[recordIndex] = {
                        ...records[recordIndex],
                        icon,
                        source,
                        gold
                    };
                }
            }

            storedChecklist[characterIndex] = {
                ...character,
                otherGoldRecords: records,
                otherGold: records.reduce((sum, record) => sum + record.gold, 0)
            };
            transaction.update(memberRef, { checklist: storedChecklist });
            responseRecords = records;
        });

        return NextResponse.json({ nickname, records: responseRecords });
    } catch (error) {
        const message = error instanceof Error ? error.message : "UNKNOWN";
        if (message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "로그인이 만료되었습니다. 다시 로그인해주세요." }, { status: 401 });
        }
        if (message === "MEMBER_NOT_FOUND" || message === "CHARACTER_NOT_FOUND" || message === "RECORD_NOT_FOUND") {
            return NextResponse.json({ error: "부수입 기록 또는 캐릭터를 찾을 수 없습니다." }, { status: 404 });
        }
        if (message === "RECORD_LIMIT") {
            return NextResponse.json({ error: "캐릭터당 부수입 기록은 최대 200개까지 저장할 수 있습니다." }, { status: 400 });
        }
        if (message === "INVALID_REQUEST" || message === "INVALID_RECORD") {
            return NextResponse.json({ error: "부수입 기록 요청이 올바르지 않습니다." }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json({ error: "부수입 기록을 저장하지 못했습니다." }, { status: 500 });
    }
}
