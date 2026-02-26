import { SetStateFn } from "@/utiils/utils"
import { Avatar } from "../model/types";

// 아바타 데이터 가져오기
export function loadAvatars(datas: any[] | null, setAvatars: SetStateFn<Avatar[]>) {
    let avatars: Avatar[] = [];
    if (datas) {
        for (const item of datas) {
            const newAvatar: Avatar = {
                type: item.Type,
                name: item.Name,
                icon: item.Icon,
                grade: item.Grade,
                isInner: Boolean(item.IsInner)
            }
            avatars.push(newAvatar);
        }
    }
    const typeOrder = ["무기 아바타", "머리 아바타", "상의 아바타", "하의 아바타", "얼굴1 아바타", "얼굴2 아바타", "악기 아바타", "이동 효과"];
    avatars = avatars.sort((a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type));
    setAvatars(avatars);
}

// 캐릭터 이미지 가져오기
export function loadImage(data: any | null, setCharacterImage: SetStateFn<string | null>) {
    if (data) {
        const imageUrl = data.CharacterImage;
        setCharacterImage(imageUrl);
        return;
    }
    setCharacterImage(null);
}