import { SetStateFn } from "@/utiils/utils";
import { ExpeditionCharacter } from "../model/types";

// 원정대 캐릭터 데이터 가져오기
type LoadCharacterListResponse = {
    expeditionCharacters?: ExpeditionCharacter[]
}
export async function loadCharacterList(
    characterName: string, 
    setExpeditionCharacters: SetStateFn<ExpeditionCharacter[]>,
    setLoading: SetStateFn<boolean>
) {
    const res = await fetch(`/api/characterlist?characterName=${encodeURIComponent(characterName)}`);
    if (!res.ok) {
        setExpeditionCharacters([]);
        setLoading(false);
        return;
    }

    const data: LoadCharacterListResponse = await res.json();
    const characters: ExpeditionCharacter[] = [...(data.expeditionCharacters ?? [])].sort(
        (a, b) => b.profile.itemLevel - a.profile.itemLevel
    );
    setExpeditionCharacters(characters);
    setLoading(false);
}