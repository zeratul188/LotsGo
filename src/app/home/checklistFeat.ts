import { SetStateFn } from "@/utiils/utils";
import { LoginUser } from "../store/loginSlice";
import { addToast } from "@heroui/react";
import { CheckCharacter } from "../store/checklistSlice";

// 로그인 여부 확인 함수
export function isLogin(): boolean {
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    if (!storedUser) {
        return false;
    }
    return true;
}

// 숙제 데이터 불러오는 함수
export async function loadChecklist(
    setChecklist: SetStateFn<CheckCharacter[]>,
    setLoading: SetStateFn<boolean>
) {
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;

    const res = await fetch(`/api/checklist/list?id=${id}`);

    if (!res.ok) {
        addToast({
            title: "데이터 로드 오류",
            description: `데이터를 가져오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        return;
    }

    const checklist: CheckCharacter[] = await res.json();
    checklist.sort((a, b) => b.level - a.level);
    checklist.sort((a, b) => {
        if (a.isGold && !b.isGold) return -1;
        if (!a.isGold && b.isGold) return 1;
        return 0;
    });
    checklist.sort((a, b) => a.position - b.position);
    setChecklist(checklist);
    setLoading(false);
}

// 숙제가 남아있는지 확인 여부
export function getUnfinishedChecklist(checklist: CheckCharacter[]): CheckCharacter[] {
    return checklist.filter((character) => {
        for (const item of character.checklist) {
            if (item.isGold && !item.isCheck) return true;
        }
        return false;
    });
}

// 숙제가 남은 특정 캐릭터의 콘텐츠 반환 함수
export function getUnfinishedContents(character: CheckCharacter): string[] {
    const list: string[] = [];
    for (const item of character.checklist) {
        if (!item.isCheck && item.isGold) {
            list.push(`${item.name} ${item.difficulty}`);
        }
    }
    return list;
}