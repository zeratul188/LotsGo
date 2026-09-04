export type CharacterHistory = {
    nickname: string,
    job: string,
    level: number,
    server: string,
    date: Date
}

function readHistorys(): CharacterHistory[] {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const storedHistorys = localStorage.getItem('historys');
        if (!storedHistorys) {
            return [];
        }

        const parsed: unknown = JSON.parse(storedHistorys);
        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.flatMap((item): CharacterHistory[] => {
            if (
                typeof item !== 'object' || item === null ||
                !('nickname' in item) || typeof item.nickname !== 'string' ||
                !('job' in item) || typeof item.job !== 'string' ||
                !('level' in item) || typeof item.level !== 'number' ||
                !('server' in item) || typeof item.server !== 'string' ||
                !('date' in item)
            ) {
                return [];
            }

            const date = new Date(item.date as string | number | Date);
            if (Number.isNaN(date.getTime())) {
                return [];
            }

            return [{
                nickname: item.nickname,
                job: item.job,
                level: item.level,
                server: item.server,
                date
            }];
        });
    } catch {
        return [];
    }
}

export function getRecentCharacterHistory(limit = 5): CharacterHistory[] {
    return readHistorys()
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, Math.max(0, limit));
}

// 캐릭터 검색 후 검색 기록 저장
export function saveHistory(newHistory: CharacterHistory) {
    const historys = readHistorys();
    const findIndex = historys.findIndex(history => history.nickname === newHistory.nickname);
    if (findIndex !== -1) {
        historys.splice(findIndex, 1);
    }
    historys.push(newHistory);
    localStorage.setItem('historys', JSON.stringify(historys));
}

// 캐릭터 갱신 후 최신화 작업
export function updateHistory(history: CharacterHistory) {
    const historys = readHistorys();
    const findIndex = historys.findIndex(item => item.nickname === history.nickname);
    if (findIndex !== -1) {
        historys[findIndex].job = history.job;
        historys[findIndex].level = history.level;
        historys[findIndex].server = history.server;
        localStorage.setItem('historys', JSON.stringify(historys));
    }
}
