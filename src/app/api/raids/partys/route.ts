import { LeaveDataBox, MemberBox, Party, Raid } from "@/app/raids/model/types";
import { firestore } from "@/utiils/firebase";
import { collection, doc, getDoc, getDocs, limit, query, runTransaction, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const raidId = searchParams.get('raidId');

    try {
        if (!raidId || raidId === 'null') {
            return NextResponse.json({ error: "raidId is required." }, { status: 400 });
        }

        const ref = doc(firestore, 'raids', raidId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
            return NextResponse.json({ error: "Raid not found." }, { status: 404 });
        }

        const data = snap.data() as { party?: Party[] };
        const partys: Party[] = data.party ?? [];
        return NextResponse.json(partys, { status: 200 });
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}

type ActionType = "changeName" | "changeManager" | "changeLink" | "settingPwd" | "changePwd" | "switchPublic" | "leaveParty";
type Handler = (body: any) => Promise<NextResponse>;

const handlers: Record<ActionType, Handler> = {
    changeName: async (body) => {
        const raidId = body.raidId;
        const changeName = body.changeName;
        try {
            const raidDoc = doc(firestore, "raids", raidId);
            await runTransaction(firestore, async (tx) => {
                const raidSnapshot = await tx.get(raidDoc);
                if (!raidSnapshot.exists()) throw new Error('RAID_NOT_FOUND');

                tx.update(raidDoc, { name: changeName });
            });
            return NextResponse.json({ message: '해당 레이드의 파티명을 수정하였습니다.' }, { status: 200 });
        } catch (e: any) {
            if (e.message === "RAID_NOT_FOUND") {
                return NextResponse.json({ error: '해당 레이드의 데이터를 찾을 수 없습니다.' }, { status: 400 });
            }
            console.log(e);
            return NextResponse.json({ error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 });
        }
    },
    changeManager: async (body) => {
        const raidId = body.raidId;
        const managerBox: MemberBox = body.managerBox;
        try {
            const raidDoc = doc(firestore, "raids", raidId);
            await runTransaction(firestore, async (tx) => {
                const raidSnapshot = await tx.get(raidDoc);
                if (!raidSnapshot.exists()) throw new Error('RAID_NOT_FOUND');

                tx.update(raidDoc, { managerId: managerBox.userId, managerNickname: managerBox.nickname });
            });
            return NextResponse.json({ message: '해당 레이드의 파티장을 변경하였습니다.' }, { status: 200 });
        } catch (e: any) {
            if (e.message === "RAID_NOT_FOUND") {
                return NextResponse.json({ error: '해당 레이드의 데이터를 찾을 수 없습니다.' }, { status: 400 });
            }
            console.log(e);
            return NextResponse.json({ error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 });
        }
    },
    changeLink: async (body) => {
        const raidId = body.raidId;
        const link = body.link;
        try {
            const raidDoc = doc(firestore, "raids", raidId);
            await runTransaction(firestore, async (tx) => {
                const raidSnapshot = await tx.get(raidDoc);
                if (!raidSnapshot.exists()) throw new Error('RAID_NOT_FOUND');

                tx.update(raidDoc, { link: link });
            });
            return NextResponse.json({ message: '해당 레이드의 초대 코드를 다시 생성하였습니다.' }, { status: 200 });
        } catch (e: any) {
            if (e.message === "RAID_NOT_FOUND") {
                return NextResponse.json({ error: '해당 레이드의 데이터를 찾을 수 없습니다.' }, { status: 400 });
            }
            console.log(e);
            return NextResponse.json({ error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 });
        }
    },
    settingPwd: async (body) => {
        const raidId = body.raidId;
        const isSelected: boolean = body.isSelected;
        try {
            const raidDoc = doc(firestore, "raids", raidId);
            await runTransaction(firestore, async (tx) => {
                const raidSnapshot = await tx.get(raidDoc);
                if (!raidSnapshot.exists()) throw new Error('RAID_NOT_FOUND');

                tx.update(raidDoc, { isPwd: isSelected });
            });
            const message = isSelected ? '해당 레이드의 비밀번호 설정을 활성화하였습니다.' : '해당 레이드의 비밀번호 설정을 비활성화하였습니다.'
            return NextResponse.json({ message: message }, { status: 200 });
        } catch (e: any) {
            if (e.message === "RAID_NOT_FOUND") {
                return NextResponse.json({ error: '해당 레이드의 데이터를 찾을 수 없습니다.' }, { status: 400 });
            }
            console.log(e);
            return NextResponse.json({ error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 });
        }
    },
    changePwd: async (body) => {
        const raidId = body.raidId;
        const encryptedPwd = body.encryptedPwd;
        try {
            const raidDoc = doc(firestore, "raids", raidId);
            await runTransaction(firestore, async (tx) => {
                const raidSnapshot = await tx.get(raidDoc);
                if (!raidSnapshot.exists()) throw new Error('RAID_NOT_FOUND');

                tx.update(raidDoc, { pwd: encryptedPwd });
            });
            return NextResponse.json({ message: '해당 레이드의 비밀번호가 변경되었습니다.' }, { status: 200 });
        } catch (e: any) {
            if (e.message === "RAID_NOT_FOUND") {
                return NextResponse.json({ error: '해당 레이드의 데이터를 찾을 수 없습니다.' }, { status: 400 });
            }
            console.log(e);
            return NextResponse.json({ error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 });
        }
    },
    switchPublic: async (body) => {
        const raidId = body.raidId;
        const isSelected: boolean = body.isSelected;
        try {
            const raidDoc = doc(firestore, "raids", raidId);
            await runTransaction(firestore, async (tx) => {
                const raidSnapshot = await tx.get(raidDoc);
                if (!raidSnapshot.exists()) throw new Error('RAID_NOT_FOUND');

                tx.update(raidDoc, { isOpen: isSelected });
            });
            return NextResponse.json({ message: '해당 레이드의 공개상태가 변경되었습니다.' }, { status: 200 });
        } catch (e: any) {
            if (e.message === "RAID_NOT_FOUND") {
                return NextResponse.json({ error: '해당 레이드의 데이터를 찾을 수 없습니다.' }, { status: 400 });
            }
            console.log(e);
            return NextResponse.json({ error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 });
        }
    },
    leaveParty: async (body) => {
        const raidId = body.raidId;
        const userId = body.userId;
        try {
            const raidDoc = doc(firestore, "raids", raidId);
            if (!userId || !raidId) throw new Error('BODY_ERROR');
            const memberQuery = query(collection(firestore, 'members'), where('id', '==', userId), limit(1));
            const memberSnapshot = await getDocs(memberQuery);
            if (memberSnapshot.empty) throw new Error('MEMBER_NOT_FOUND');
            const memberDoc = memberSnapshot.docs[0];
            const memberRef = memberSnapshot.docs[0].ref;
            const leaveBox: LeaveDataBox = await runTransaction(firestore, async (tx) => {
                const raidSnapshot = await tx.get(raidDoc);
                if (!raidSnapshot.exists()) throw new Error('RAID_NOT_FOUND');
                if (!raidSnapshot.data()?.party || !raidSnapshot.data()?.members || !memberDoc.data()?.joined) throw new Error("LOADED_UNDEFINED");
                
                const partys: Party[] = raidSnapshot.data()?.party;

                const nextPartys = partys.map(p => {
                    if (!p.teams.some(t => t.userId === userId)) return p;
                    return {
                        ...p,
                        teams: (p.teams ?? []).filter(t => t.userId !== userId)
                    }
                });
                const members: string[] = raidSnapshot.data()?.members;
                const nextMembers = members.filter(m => m !== userId);

                tx.update(raidDoc, { party: nextPartys, members: nextMembers });

                const joined: string[] = memberDoc.data()?.joined;
                const nextJoined = joined.filter(j => j !== raidId);

                tx.update(memberRef, { joined: nextJoined });
                return { raidId: raidId, party: nextPartys, members: nextMembers };
            });
            return NextResponse.json({ message: '해당 파티를 탈퇴하였습니다.', leaveBox: leaveBox }, { status: 200 });
        } catch (e: any) {
            if (e.message === "BODY_ERROR" || e.message === 'LOADED_UNDEFINED') {
                return NextResponse.json({ error: '데이터 불러오는데 문제가 발생하였습니다.' }, { status: 400 });
            }
            if (e.message === "MEMBER_NOT_FOUND") {
                return NextResponse.json({ error: '해당 ID를 가진 회원의 데이터를 찾을 수 없습니다.' }, { status: 400 });
            }
            if (e.message === "RAID_NOT_FOUND") {
                return NextResponse.json({ error: '해당 레이드의 데이터를 찾을 수 없습니다.' }, { status: 400 });
            }
            console.log(e);
            return NextResponse.json({ error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 });
        }
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const type = body?.type as ActionType | undefined;

        if (!type || !(type in handlers)) return NextResponse.json({ error: "처리 종류(type)가 올바르지 않습니다." }, { status: 400 });

        return await handlers[type](body);
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}