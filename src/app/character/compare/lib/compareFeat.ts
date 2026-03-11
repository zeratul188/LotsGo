import { addToast } from "@heroui/react";
import { decrypt } from "@/utiils/crypto";
import { LoginUser } from "@/app/store/loginSlice";
import { CharacterInfo } from "../../model/types";
import { CharacterFile } from "../../lib/characterFeat";
import { getCharacterInfoByFile, toNumber } from "../../lib/characterInfo";

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY ? process.env.NEXT_PUBLIC_SECRET_KEY : 'null';

export async function loadCompareCharacterInfo(nickname: string): Promise<CharacterInfo | null> {
    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) {
        return null;
    }

    const res = await fetch(`/api/characters?nickname=${trimmedNickname}`);
    let shouldLoadFromApi = false;

    if (res.ok) {
        const data = await res.json();
        if (data.date && data.character) {
            const basedDate = new Date(data.date.seconds * 1000 + data.date.nanoseconds / 1_000_000);
            const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
            const now = new Date();
            const hasPassed3Days = (now.getTime() - basedDate.getTime()) >= threeDaysInMs;

            if (!hasPassed3Days) {
                return data.character as CharacterInfo;
            }
        }

        shouldLoadFromApi = true;
    } else if (res.status === 401) {
        shouldLoadFromApi = true;
    } else {
        addToast({
            title: "불러오기 오류",
            description: "데이터베이스에서 캐릭터 정보를 불러오지 못했습니다.",
            color: "danger"
        });
        return null;
    }

    if (!shouldLoadFromApi) {
        return null;
    }

    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const decryptedApiKey = storedUser?.apiKey ? decrypt(storedUser.apiKey, secretKey) : null;

    const lostarkRes = await fetch(`/api/lostark?value=${trimmedNickname}&code=5&key=${decryptedApiKey}`);
    if (!lostarkRes.ok) {
        addToast({
            title: "불러오기 오류",
            description: "입력한 캐릭터 정보를 불러오지 못했습니다.",
            color: "danger"
        });
        return null;
    }

    const data = await lostarkRes.json();
    const file: CharacterFile = {
        profile: data.ArmoryProfile,
        equipment: data.ArmoryEquipment,
        gem: data.ArmoryGem?.Gems ?? null,
        cards: data.ArmoryCard,
        stats: data.ArmoryProfile?.Stats ?? null,
        engraving: data.ArmoryEngraving ? data.ArmoryEngraving.ArkPassiveEffects : null,
        arkpassive: data.ArkPassive,
        skills: data.ArmorySkills,
        collects: data.Collectibles,
        avatars: data.ArmoryAvatars,
        arkGrid: data.ArkGrid
    };
    const combatPower = toNumber(file.profile?.CombatPower);

    return getCharacterInfoByFile(file, combatPower);
}
