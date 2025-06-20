import { SetStateFn } from "@/utiils/utils";
import { Member } from "../api/auth/members/route";
import { addToast } from "@heroui/react";

// 맴버들 데이터 가져오기
export async function loadData(setMembers: SetStateFn<Member[]>, setLoading: SetStateFn<boolean>) {
    const res = await fetch('/api/auth/members');
    if (!res.ok) {
        addToast({
            title: "로드 오류",
            description: `데이터를 불러오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        return;
    }
    const items = await res.json();
    const members: Member[] = [];
    for (const item of items) {
        const member: Member = {
            ...item,
            loginDate: item.loginDate ? new Date(item.loginDate.seconds * 1000 + item.loginDate.nanoseconds / 1_000_000) : '-'
        }
        members.push(member);
    }
    members.sort((a, b) => a.character.localeCompare(b.character, 'ko-KR'));
    setMembers(members);
    setLoading(false);
}

// 특정 맴버 제거 이벤트 함수
export async function handleRemoveMember(
    uid: string, 
    id: string,
    members: Member[],
    setMembers: SetStateFn<Member[]>,
    setLoadingButton: SetStateFn<boolean>
) {
    setLoadingButton(true);
    const deleteRes = await fetch(`/api/auth/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            uid: uid,
            id: id
        })
    });
    if (deleteRes.ok) {
        const removedMembers = members.filter(member => member.id !== id);
        setMembers(removedMembers);
        addToast({
            title: "삭제 완료",
            description: `데이터를 삭제하였습니다.`,
            color: "success"
        });
    } else {
        addToast({
            title: "삭제 오류",
            description: `데이터를 삭제하는데 문제가 발생하였습니다.`,
            color: "danger"
        });
    }
    setLoadingButton(false);
}