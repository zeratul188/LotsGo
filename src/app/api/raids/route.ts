import { Party, Raid, TeamCharacter } from "@/app/raids/model/types";
import { EditBox } from "@/app/raids/ui/RaidsForm";
import { firestore } from "@/utiils/firebase"
import { addDoc, arrayUnion, collection, doc, documentId, getDoc, getDocs, limit, query, runTransaction, updateDoc, where } from "firebase/firestore"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const link = searchParams.get('link');

    try {
        const snapshot = await getDocs(collection(firestore, 'raids'));
        const raids: Raid[] = snapshot.docs.map((doc => ({
            id: doc.id,
            isOpen: doc.data().isOpen,
            isPwd: doc.data().isPwd,
            link: doc.data().link,
            avgLevel: doc.data().avgLevel,
            managerId: doc.data().managerId,
            managerNickname: doc.data().managerNickname,
            members: doc.data().members,
            name: doc.data().name,
            party: doc.data().party,
            pwd: doc.data().pwd
        })));

        let joinRaids: Raid[] = [];

        if (id) {
            const q = query(collection(firestore, 'members'), where("id", "==", id), limit(1));
            const memberSnapshot = await getDocs(q);
            if (!memberSnapshot.empty) {
                const targetDoc = memberSnapshot.docs[0];
                const data = targetDoc.data();
                const joined: string[] = data.joined ? data.joined : [];
                joinRaids = raids.filter(raid => joined.includes(raid.id));
            }
        } else if (link) {
            const findRaid = raids.find(raid => raid.link === link);
            if (findRaid) {
                joinRaids.push(findRaid);
            }
        }
        
        return NextResponse.json({ raids: raids, joinRaids: joinRaids });
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}

// userId가 더 있는지 없는게 있는지 파악하는 함수
function isSameUserIds(a: TeamCharacter[], b: TeamCharacter[]): boolean {
    if (a.length !== b.length) return false;

    const setA = new Set(a.map(v => v.userId));
    const setB = new Set(b.map(v => v.userId));

    if (setA.size !== setB.size) return false;

    for (const userId of setA) {
        if (!setB.has(userId)) return false;
    }

    return true;
}

// 참여했을 때 해당 자리에 사람이 있는지 파악하는 함수
function isAlreadyExistPosition(joinCharacter: TeamCharacter, members: TeamCharacter[]): boolean {
    return members.some(m => m.partyIndex === joinCharacter.partyIndex && m.position === joinCharacter.position);
}

// 해당 파티에 userId가 있는 사람이 존재하는지 파악하는 함수
function isHaveUserIdByParty(members: TeamCharacter[], userId: string): boolean {
    return members.some(c => c.userId === userId);
}

type ActionType = "add" | "join" | "addParty" | "involvedParty" | "cancelInvolvedParty" | "changePositionParty" | "changeManagerParty" | "deleteParty" | "editParty";
type Handler = (body: any) => Promise<NextResponse>;

const handlers: Record<ActionType, Handler> = {
    add: async (body) => {
        const id = body.id;
        const raid: Raid = body.raid;
        const addRaid = {
            name: raid.name,
            managerId: raid.managerId,
            managerNickname: raid.managerNickname,
            link: raid.link,
            isOpen: raid.isOpen,
            isPwd: raid.isPwd,
            pwd: raid.pwd,
            members: raid.members,
            party: raid.party,
            avgLevel: raid.avgLevel
        }

        if (typeof id !== "string" || id.trim() === "") {
            return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });
        }

        const addRef = await addDoc(collection(firestore, 'raids'), addRaid);
        const q = query(collection(firestore, 'members'), where("id", "==", id), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return NextResponse.json({ error: 'Not found a member with a specific ID.' }, { status: 300 });
        }

        const targetDoc = snapshot.docs[0];
        const docRef = doc(firestore, "members", targetDoc.id);
        const data = targetDoc.data();
        const joined: string[] = data.joined ? data.joined : [];
        joined.push(addRef.id);

        await updateDoc(docRef, {
            joined: joined
        });
        return NextResponse.json({ message: '데이터 추가가 정상적으로 처리도었습니다.', id: addRef.id }, { status: 200 });       
    },
    join: async (body) => {
        const id = body.id;
        const joinRaid: Raid = body.raid;

        try {
            if (typeof id !== "string" || id.trim() === "") throw new Error('ID_NOT_FOUND');
            const raidDoc = doc(firestore, 'raids', joinRaid.id);
            const memberQuery = query(collection(firestore, 'members'), where('id', '==', id), limit(1));
            const memberSnapshot = await getDocs(memberQuery);
            if (memberSnapshot.empty) throw new Error("MEMBER_NOT_FOUND");
            const memberRef = memberSnapshot.docs[0].ref;

            await runTransaction(firestore, async (tx) => {
                const raidSnapshot = await tx.get(raidDoc);
                if (!raidSnapshot.exists()) throw new Error('RAID_NOT_FOUND');
                const raidMembers: string[] = raidSnapshot.data()?.members ?? [];
                if (raidMembers.includes(id)) throw new Error("ALREADY_JOINED");
                tx.update(raidDoc, { members: arrayUnion(id) });
                tx.update(memberRef, { joined: arrayUnion(joinRaid.id) });
            });
            return NextResponse.json({ message: '데이터 수정이 정상적으로 처리되었습니다.' }, { status: 200 });
        } catch (e: any) {
            if (e.message === "ID_NOT_FOUND") {
                return NextResponse.json({ error: 'id가 필요합니다.' }, { status: 400 });
            }
            if (e.message === "RAID_NOT_FOUND") {
                return NextResponse.json({ error: '해당 레이드의 데이터를 찾을 수 없습니다.' }, { status: 400 });
            }
            if (e.message === "ALREADY_JOINED") {
                return NextResponse.json({ error: '이미 해당 파티에 참여하였습니다.' }, { status: 400 });
            }
            if (e.message === "MEMBER_NOT_FOUND") {
                return NextResponse.json({ error: '해당 ID를 가진 회원을 찾을 수 없습니다.' }, { status: 400 });
            }
            return NextResponse.json({ error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 });
        }
    },
    addParty: async (body) => {
        const partyId = body.partyId;
        const addParty: Party = body.addParty;

        if (!partyId) {
            return NextResponse.json({ error: 'Not found a raid with a specific ID.' }, { status: 300 });
        } else {
            const arq = doc(firestore, "raids", partyId);
            const ass = await getDoc(arq);

            if (!ass.exists()) {
                return NextResponse.json({ error: 'Not found a raid with a specific ID.' }, { status: 300 });
            }

            await updateDoc(arq, { party: arrayUnion(addParty) });
            return NextResponse.json({ message: '데이터 수정이 정상적으로 처리되었습니다.' }, { status: 200 });
        }
    },
    involvedParty: async (body) => {
        const raidId = body.raidId;
        const partyId = body.partyId;
        const userId = body.userId;
        const character: TeamCharacter = body.teamCharacter;
        try {
            const raidDoc = doc(firestore, 'raids', raidId);

            const nextPartys = await runTransaction(firestore, async (tx) => {
                const raidSnapshot = await tx.get(raidDoc);
                if (!raidSnapshot.exists()) throw new Error('RAID_NOT_FOUND');

                const partys: Party[] = raidSnapshot.data()?.party ?? [];
                const party = partys.find(p => p.id === partyId);

                if (!party) throw new Error('PARTY_NOT_FOUND');
                if (party.teams.some(t => t.userId === userId)) throw new Error('ALREADY_JOINED');
                if (isAlreadyExistPosition(character, party.teams)) throw new Error('ALREADY_EXISTS');

                const nextPartys = partys.map((p) => {
                    if (p.id !== partyId) return p;
                    return {
                        ...p,
                        teams: [...(p.teams ?? []), character]
                    };
                });

                tx.update(raidDoc, { party: nextPartys });
                return nextPartys;
            });
            return NextResponse.json({ message: '해당 레이드에 참여하였습니다.', partys: nextPartys }, { status: 200 });
        } catch (e: any) {
            if (e.message === "RAID_NOT_FOUND") {
                return NextResponse.json({ error: '해당 레이드의 데이터를 찾을 수 없습니다.' }, { status: 400 });
                }
            if (e.message === "PARTY_NOT_FOUND") {
                return NextResponse.json({ error: '찾고자 한 파티가 존재하지 않습니다.' }, { status: 400 });
            }
            if (e.message === "PARTY_FULL") {
                return NextResponse.json({ error: '이미 해당 파티의 인원이 가득 찼습니다.' }, { status: 400 });
            }
            if (e.message === "ALREADY_JOINED") {
                return NextResponse.json({ error: '이미 해당 파티에 참여하였습니다.' }, { status: 400 });
            }
            if (e.message === "ALREADY_EXISTS") {
                return NextResponse.json({ error: '이미 해당 파티의 자리에 참여한 사람이 있습니다.' }, { status: 400 });
            }
            return NextResponse.json({ error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 });
        }
    },
    cancelInvolvedParty: async (body) => {
        const raidId = body.raidId;
        const partyId = body.partyId;
        const userId = body.userId;
        try {
            const raidDoc = doc(firestore, 'raids', raidId);

            const nextPartys = await runTransaction(firestore, async (tx) => {
                const raidSnapshot = await tx.get(raidDoc);
                if (!raidSnapshot.exists()) throw new Error('RAID_NOT_FOUND');

                const partys: Party[] = raidSnapshot.data()?.party ?? [];
                const party = partys.find(p => p.id === partyId);

                if (!party) throw new Error('PARTY_NOT_FOUND');

                const nextPartys = partys.map((p) => {
                    if (p.id !== partyId) return p;
                    return {
                        ...p,
                        teams: (p.teams ?? []).filter(t => t.userId !== userId)
                    };
                });

                tx.update(raidDoc, { party: nextPartys });
                return nextPartys;
            });
            return NextResponse.json({ message: '해당 레이드의 참여를 취소하였습니다.', partys: nextPartys }, { status: 200 });
        } catch (e: any) {
            if (e.message === "RAID_NOT_FOUND") {
                return NextResponse.json({ error: '해당 레이드의 데이터를 찾을 수 없습니다.' }, { status: 400 });
                }
            if (e.message === "PARTY_NOT_FOUND") {
                return NextResponse.json({ error: '찾고자 한 파티가 존재하지 않습니다.' }, { status: 400 });
            }
            return NextResponse.json({ error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 });
        }
    },
    changePositionParty: async (body) => {
        const raidId = body.raidId;
        const partyId = body.partyId;
        const changeTeams = body.changeTeams as TeamCharacter[];
        try {
            const raidDoc = doc(firestore, 'raids', raidId);

            const nextPartys = await runTransaction(firestore, async (tx) => {
                const raidSnapshot = await tx.get(raidDoc);
                if (!raidSnapshot.exists()) throw new Error('RAID_NOT_FOUND');

                const partys: Party[] = raidSnapshot.data()?.party ?? [];
                const party = partys.find(p => p.id === partyId);

                if (!party) throw new Error('PARTY_NOT_FOUND');
                if (!isSameUserIds(changeTeams, party.teams)) throw new Error('PARTY_NOT_SAME');

                const nextPartys = partys.map(p => {
                    if (p.id !== partyId) return p;
                    return {
                        ...p,
                        teams: changeTeams
                    }
                })

                tx.update(raidDoc, { party: nextPartys });
                return nextPartys;
            });
            return NextResponse.json({ message: '해당 레이드의 파티원의 순서를 변경하였습니다.', partys: nextPartys }, { status: 200 });
        } catch (e: any) {
            if (e.message === "RAID_NOT_FOUND") {
                return NextResponse.json({ error: '해당 레이드의 데이터를 찾을 수 없습니다.' }, { status: 400 });
            }
            if (e.message === "PARTY_NOT_FOUND") {
                return NextResponse.json({ error: '찾고자 한 파티가 존재하지 않습니다.' }, { status: 400 });
            }
            if (e.message === "PARTY_NOT_SAME") {
                return NextResponse.json({ error: '파티의 정보가 최신의 정보가 아닙니다. 새로고침을 통해 데이터 최신화 진행 후 다시 시도하십시오.' }, { status: 400 });
            }
            console.log(e);
            return NextResponse.json({ error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 });
        }
    },
    changeManagerParty: async (body) => {
        const raidId = body.raidId;
        const partyId = body.partyId;
        const notUserId = body.notUserId;
        const changeUserId = body.changeUserId;
        try {
            const raidDoc = doc(firestore, 'raids', raidId);

            const nextPartys = await runTransaction(firestore, async (tx) => {
                const raidSnapshot = await tx.get(raidDoc);
                if (!raidSnapshot.exists()) throw new Error('RAID_NOT_FOUND');

                const partys: Party[] = raidSnapshot.data()?.party ?? [];
                const party = partys.find(p => p.id === partyId);

                if (!party) throw new Error('PARTY_NOT_FOUND');
                if (!isHaveUserIdByParty(party.teams, notUserId) || !isHaveUserIdByParty(party.teams, changeUserId)) throw new Error('NOT_FOUND_USERID');

                const changeTeams = party.teams.map(t => {
                    if (t.userId === notUserId) return { ...t, isManager: false };
                    if (t.userId === changeUserId) return { ...t, isManager: true };
                    return t;
                })

                const nextPartys = partys.map(p => {
                    if (p.id !== partyId) return p;
                    return {
                        ...p,
                        teams: changeTeams
                    }
                })

                tx.update(raidDoc, { party: nextPartys });
                return nextPartys;
            });
            return NextResponse.json({ message: '해당 레이드의 파티원의 순서를 변경하였습니다.', partys: nextPartys }, { status: 200 });
        } catch (e: any) {
            if (e.message === "RAID_NOT_FOUND") {
                return NextResponse.json({ error: '해당 레이드의 데이터를 찾을 수 없습니다.' }, { status: 400 });
            }
            if (e.message === "PARTY_NOT_FOUND") {
                return NextResponse.json({ error: '찾고자 한 파티가 존재하지 않습니다.' }, { status: 400 });
            }
            if (e.message === "NOT_FOUND_USERID") {
                return NextResponse.json({ error: '위임할 캐릭터 또는 위임받을 캐릭터가 존재하지 않습니다.' }, { status: 400 });
            }
            console.log(e);
            return NextResponse.json({ error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 });
        }
    },
    deleteParty: async (body) => {
        const raidId = body.raidId;
        const partyId = body.partyId;
        try {
            const raidDoc = doc(firestore, 'raids', raidId);

            const nextPartys = await runTransaction(firestore, async (tx) => {
                const raidSnapshot = await tx.get(raidDoc);
                if (!raidSnapshot.exists()) throw new Error('RAID_NOT_FOUND');

                const partys: Party[] = raidSnapshot.data()?.party ?? [];
                const party = partys.find(p => p.id === partyId);

                if (!party) throw new Error('PARTY_NOT_FOUND');

                const nextPartys = partys.filter(p => p.id !== partyId);

                tx.update(raidDoc, { party: nextPartys });
                return nextPartys;
            });
            return NextResponse.json({ message: '해당 레이드의 파티를 삭제하였습니다.', partys: nextPartys }, { status: 200 });
        } catch (e: any) {
            if (e.message === "RAID_NOT_FOUND") {
                return NextResponse.json({ error: '해당 레이드의 데이터를 찾을 수 없습니다.' }, { status: 400 });
            }
            if (e.message === "PARTY_NOT_FOUND") {
                return NextResponse.json({ error: '찾고자 한 파티가 존재하지 않습니다.' }, { status: 400 });
            }
            console.log(e);
            return NextResponse.json({ error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 });
        }
    },
    editParty: async (body) => {
        const raidId = body.raidId;
        const partyId = body.partyId;
        const box: EditBox = body.editBox;
        const boxDate: Date = body.boxDate;
        const boxContent = body.boxContent;
        const partyLength: number = body.partyLength;
        try {
            const raidDoc = doc(firestore, 'raids', raidId);

            const nextPartys = await runTransaction(firestore, async (tx) => {
                const raidSnapshot = await tx.get(raidDoc);
                if (!raidSnapshot.exists()) throw new Error('RAID_NOT_FOUND');

                const partys: Party[] = raidSnapshot.data()?.party ?? [];
                const party = partys.find(p => p.id === partyId);

                if (!party) throw new Error('PARTY_NOT_FOUND');

                const nextPartys = partys.map(p => {
                    if (p.id !== partyId) return p;
                    return {
                        ...p,
                        name: box.name,
                        date: boxDate,
                        content: boxContent,
                        stages: box.stages,
                        teams: p.teams.filter(t => t.partyIndex <= partyLength)
                    }
                })

                tx.update(raidDoc, { party: nextPartys });
                return nextPartys;
            });
            return NextResponse.json({ message: '해당 레이드의 파티를 수정하였습니다.', partys: nextPartys }, { status: 200 });
        } catch (e: any) {
            if (e.message === "RAID_NOT_FOUND") {
                return NextResponse.json({ error: '해당 레이드의 데이터를 찾을 수 없습니다.' }, { status: 400 });
            }
            if (e.message === "PARTY_NOT_FOUND") {
                return NextResponse.json({ error: '찾고자 한 파티가 존재하지 않습니다.' }, { status: 400 });
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

        if (!type || !(type in handlers)) {
            return NextResponse.json({ error: "처리 종류(type)가 올바르지 않습니다." }, { status: 400 });
        }

        return await handlers[type](body);
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}