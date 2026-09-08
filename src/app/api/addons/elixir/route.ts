import { normalizeElixirStorage } from "@/app/addons/elixir/model/types";
import { firestore } from "@/utiils/firebase";
import { collection, doc, getDoc, getDocs, limit, query, runTransaction, where } from "firebase/firestore";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.LOSTARK_JWT_SECRET!;

type AccessTokenPayload = {
    id: string;
    sessionId: string;
};

const getAuthenticatedUserId = async (req: NextRequest) => {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");

    let decoded: AccessTokenPayload;
    try {
        decoded = jwt.verify(authHeader.slice(7), JWT_SECRET) as AccessTokenPayload;
    } catch {
        throw new Error("UNAUTHORIZED");
    }

    const sessionSnapshot = await getDoc(doc(firestore, "sessions", decoded.sessionId));
    const session = sessionSnapshot.data();
    if (!sessionSnapshot.exists() || session?.revoked || session?.userId !== decoded.id) {
        throw new Error("UNAUTHORIZED");
    }
    return decoded.id;
};

const getMemberDocument = async (userId: string) => {
    const memberQuery = query(collection(firestore, "members"), where("id", "==", userId), limit(1));
    const snapshot = await getDocs(memberQuery);
    if (snapshot.empty) throw new Error("MEMBER_NOT_FOUND");
    return snapshot.docs[0];
};

const errorResponse = (error: unknown) => {
    const message = error instanceof Error ? error.message : "";
    if (message === "UNAUTHORIZED" || message.includes("jwt")) {
        return NextResponse.json({ error: "로그인 정보가 유효하지 않습니다." }, { status: 401 });
    }
    if (message === "MEMBER_NOT_FOUND") {
        return NextResponse.json({ error: "사용자 정보를 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ error: "엘릭서 정보를 처리하지 못했습니다." }, { status: 500 });
};

export async function GET(req: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(req);
        const member = await getMemberDocument(userId);
        return NextResponse.json({ storage: normalizeElixirStorage(member.data().elixirStorage) });
    } catch (error) {
        return errorResponse(error);
    }
}

export async function PUT(req: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(req);
        const body = await req.json();
        if (!body || typeof body !== "object" || !("storage" in body)) {
            return NextResponse.json({ error: "올바르지 않은 엘릭서 정보입니다." }, { status: 400 });
        }
        const storage = normalizeElixirStorage(body.storage);
        const member = await getMemberDocument(userId);
        await runTransaction(firestore, async (transaction) => {
            await transaction.get(member.ref);
            transaction.update(member.ref, { elixirStorage: storage });
        });
        return NextResponse.json({ storage });
    } catch (error) {
        return errorResponse(error);
    }
}
