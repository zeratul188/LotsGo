import { CharacterInfo } from "./characterFeat";
import data from "@/data/characters/data.json";

// 캐릭터 검색 함수
export function handleSelectCharacter(nickname: string) {
    const params = new URLSearchParams(window.location.search);
    params.set("nickname", nickname);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
    window.location.href = newUrl; // 또는
    window.location.reload();
}

// 서버 종류 가져오기
export function getServerNames(expeditions: CharacterInfo[]) {
    const servers: string[] = [];
    for (const character of expeditions) {
        if (!servers.includes(character.server)) {
            servers.push(character.server);
        }
    }
    return servers;
}

// 레벨에 맞는 배경 색상 가져오기
export function getBgColorByLevels(level: number): string {
    for (const item of data.levels) {
        if (level >= item.level) {
            return item.bg;
        }
    }
    return '';
}

// 해당 레벨 이상 캐릭터 수 반환 함수
export function getCountByLevel(level: number, undoLevel: number, expeditions: CharacterInfo[]) {
    let sum = 0;
    for (const character of expeditions) {
        if (character.level >= level && character.level < undoLevel) {
            sum++;
        }
    }
    return sum;
}

// 해당 레벨에 맞는 색 반환 함수
export function getBorderColorByLevel(level: number): string {
    for (const item of data.levels) {
        if (level >= item.level) {
            return item.border;
        }
    }
    return '';
}