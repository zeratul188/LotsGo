import { SetStateFn } from "@/utiils/utils";
import { Party, Raid } from "../api/raids/route";

// 파티 데이터 불러오기
export function loadPartys(
    selectedParty: Raid | null, 
    setPartys: SetStateFn<Party[]>,
    setResults: SetStateFn<Party[]>
) {
    if (selectedParty) {
        const partys: Party[] = selectedParty.party;
        setPartys(partys);
        setResults(partys);
    }
}