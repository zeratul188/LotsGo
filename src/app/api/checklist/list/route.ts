import { CheckCharacter, Day } from "@/app/store/checklistSlice";
import { firestore } from "@/utiils/firebase";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    try {
        const q = query(collection(firestore, 'members'), where("id", "==", id));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return NextResponse.json({ error: 'Not found a member with a specific ID.' }, { status: 400 });
        }

        const targetDoc = snapshot.docs[0];
        const data = targetDoc.data();
        //const checklist = data.checklist ?? [];
        const checklist: CheckCharacter[] = data.checklist ? data.checklist.map((item: CheckCharacter) => {
            const defaultDay: Day = {
                boss: 0,
                bossBonus: 0,
                bossUsing: 0,
                dungeon: 0,
                dungeonBouus: 0,
                dungeonUsing: 0,
                quest: 0,
                questBonus: 0,
                questUsing: 0
            }
            return {
                nickname: item.nickname ?? '',
                level: item.level ?? 0,
                job: item.job ?? '',
                server: item.server ?? '',
                day: item.day ?? defaultDay,
                daylist: item.daylist ?? [],
                checklist: item.checklist ?? [],
                weeklist: item.weeklist ?? [],
                cube: item.cube ?? 0,
                cubelist: item.cubelist ?? [],
                isGold: item.isGold ?? false,
                otherGold: item.otherGold ?? 0,
                position: item.position ?? 9999,
                account: item.account ?? '본계정'
            }
        }) : [];
        return NextResponse.json(checklist);
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const id = body.id;
    const checklist: CheckCharacter[] = body.checklist;
    const updatedChecklist = [...checklist];

    try {
        const q = query(collection(firestore, 'members'), where("id", "==", id));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return NextResponse.json({ error: 'Not found a member with a specific ID.' }, { status: 300 });
        }

        const targetDoc = snapshot.docs[0];
        const docRef = doc(firestore, "members", targetDoc.id);

        let characterIndex = -1, checklistIndex = -1, listIndex = -1;
        
        switch(body.type) {
            case 'init':
                await updateDoc(docRef, {
                    checklist: checklist
                });
                return NextResponse.json({ message: '데이터 추가가 정상적으로 처리도었습니다.' }, { status: 200 });
            case 'edit-day':
                const day: Day = body.day;
                const nickname = body.nickname;
                const index = findIndexByNickname(checklist, nickname);
                updatedChecklist[index] = {
                    ...updatedChecklist[index],
                    day: day
                }
                await updateDoc(docRef, {
                    checklist: updatedChecklist
                });
                return NextResponse.json({ message: '데이터 수정이 정상적으로 처리도었습니다.' }, { status: 200 });
            case 'check-week':
                characterIndex = body.characterIndex;
                checklistIndex = body.checklistIndex;
                const checklistItem = body.checklistItem;
                updatedChecklist[characterIndex].checklist[checklistIndex] = checklistItem;
                await updateDoc(docRef, {
                    checklist: updatedChecklist
                });
                return NextResponse.json({ message: '데이터 수정이 정상적으로 처리도었습니다.' }, { status: 200 });
            case 'check-week-list':
                characterIndex = body.characterIndex;
                listIndex = body.listIndex;
                const weekListItem = body.listItem;
                updatedChecklist[characterIndex].weeklist[listIndex] = weekListItem;
                await updateDoc(docRef, {
                    checklist: updatedChecklist
                });
                return NextResponse.json({ message: '데이터 수정이 정상적으로 처리도었습니다.' }, { status: 200 });
            case 'check-day-list':
                characterIndex = body.characterIndex;
                listIndex = body.listIndex;
                const dayListItem = body.listItem;
                updatedChecklist[characterIndex].daylist[listIndex] = dayListItem;
                await updateDoc(docRef, {
                    checklist: updatedChecklist
                });
                return NextResponse.json({ message: '데이터 삭제 또는 추가가 정상적으로 처리도었습니다.' }, { status: 200 });
            case 'remove-week-item':
                characterIndex = body.characterIndex;
                const weekChecklist = body.weekChecklist;
                updatedChecklist[characterIndex].checklist = weekChecklist;
                await updateDoc(docRef, {
                    checklist: updatedChecklist
                });
                return NextResponse.json({ message: '데이터 삭제 또는 추가가 정상적으로 처리도었습니다.' }, { status: 200 });
            case 'edit-week-list-item':
                characterIndex = body.characterIndex;
                const weekList = body.weekList;
                updatedChecklist[characterIndex].weeklist = weekList;
                await updateDoc(docRef, {
                    checklist: updatedChecklist
                });
                return NextResponse.json({ message: '데이터 삭제 또는 추가가 정상적으로 처리도었습니다.' }, { status: 200 });
            case 'save-rest':
                characterIndex = body.characterIndex;
                const newDay = body.day;
                updatedChecklist[characterIndex].day = newDay;
                await updateDoc(docRef, {
                    checklist: updatedChecklist
                });
                return NextResponse.json({ message: '휴식 게이지 저장이 정상적으로 처리도었습니다.' }, { status: 200 });
            case 'edit-day-list-item':
                characterIndex = body.characterIndex;
                const dayList = body.daylist;
                updatedChecklist[characterIndex].daylist = dayList;
                await updateDoc(docRef, {
                    checklist: updatedChecklist
                });
                return NextResponse.json({ message: '데이터 삭제 또는 추가가 정상적으로 처리도었습니다.' }, { status: 200 });
            case 'edit-cube':
                characterIndex = body.characterIndex;
                const cubelist = body.cubelist;
                updatedChecklist[characterIndex].cubelist = cubelist;
                await updateDoc(docRef, {
                    checklist: updatedChecklist
                });
                return NextResponse.json({ message: '데이터 삭제 또는 추가가 정상적으로 처리도었습니다.' }, { status: 200 });
            case 'check-gold':
                characterIndex = body.characterIndex;
                const isGold = body.isGold;
                updatedChecklist[characterIndex].isGold = isGold;
                await updateDoc(docRef, {
                    checklist: updatedChecklist
                });
                return NextResponse.json({ message: '데이터 삭제 또는 추가가 정상적으로 처리도었습니다.' }, { status: 200 });
            case 'remove-character':
                characterIndex = body.characterIndex;
                const removedList = updatedChecklist.filter((_, index) => index !== characterIndex);
                await updateDoc(docRef, {
                    checklist: removedList
                });
                return NextResponse.json({ message: '데이터 삭제가 정상적으로 처리도었습니다.' }, { status: 200 });
            case 'updated-checklist':
                const newChecklist = body.newChecklist;
                await updateDoc(docRef, {
                    checklist: newChecklist
                });
                return NextResponse.json({ message: '데이터 삭제 또는 추가가 정상적으로 처리도었습니다.' }, { status: 200 });
            case 'caculate-other-gold':
                characterIndex = body.characterIndex;
                const otherGold = body.otherGold;
                updatedChecklist[characterIndex].otherGold = otherGold;
                await updateDoc(docRef, {
                    checklist: updatedChecklist
                });
                return NextResponse.json({ message: '데이터 수정이 정상적으로 처리도었습니다.' }, { status: 200 });
            case 'reset-cube':
                characterIndex = body.characterIndex;
                updatedChecklist[characterIndex].cubelist = [];
                await updateDoc(docRef, {
                    checklist: updatedChecklist
                });
                return NextResponse.json({ message: '데이터 수정이 정상적으로 처리도었습니다.' }, { status: 200 });
            case 'update-account':
                characterIndex = body.characterIndex;
                const account = body.account;
                updatedChecklist[characterIndex].account = account;
                await updateDoc(docRef, {
                    checklist: updatedChecklist
                });
                return NextResponse.json({ message: '데이터 수정이 정상적으로 처리도었습니다.' }, { status: 200 });
            default: 
                return NextResponse.json({ message: '처리 종류를 선택하지 않았습니다.' }, { status: 400 });
        }
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed load Database.' }, { status: 500 });
    }
}

function findIndexByNickname(
    characters: CheckCharacter[], 
    nickname: string
): number {
    return characters.findIndex((item) => item.nickname === nickname);
}