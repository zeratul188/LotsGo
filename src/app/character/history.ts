export type CharacterHistory = {
    nickname: string,
    job: string,
    level: number,
    server: string,
    date: Date
}

// 캐릭터 검색 후 검색 기록 저장
export function saveHistory(newHistory: CharacterHistory) {
    const storedHistorys = localStorage.getItem('historys');
    const historys: CharacterHistory[] = storedHistorys ? JSON.parse(storedHistorys) : [];
    const findIndex = historys.findIndex(history => history.nickname === newHistory.nickname);
    if (findIndex !== -1) {
        historys.splice(findIndex, 1);
    }
    historys.push(newHistory);
    localStorage.setItem('historys', JSON.stringify(historys));
}

// 캐릭터 갱신 후 최신화 작업
export function updateHistory(history: CharacterHistory) {
    const storedHistorys = localStorage.getItem('historys');
    const historys: CharacterHistory[] = storedHistorys ? JSON.parse(storedHistorys) : [];
    const findIndex = historys.findIndex(history => history.nickname === history.nickname);
    if (findIndex !== -1) {
        historys[findIndex].job = history.job;
        historys[findIndex].level = history.level;
        historys[findIndex].server = history.server;
        localStorage.setItem('historys', JSON.stringify(historys));
    }
}