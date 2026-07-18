import type { CheckCharacter, Day } from "@/app/store/checklistSlice";

export function normalizeChecklist(value: unknown): CheckCharacter[] {
    if (!Array.isArray(value)) return [];

    return value.map((rawItem) => {
        const item = rawItem as Partial<CheckCharacter>;
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
        };

        return {
            nickname: item.nickname ?? '',
            memo: typeof item.memo === 'string' ? item.memo : '',
            paradisePower: typeof item.paradisePower === 'number' && Number.isFinite(item.paradisePower)
                ? Math.max(0, Math.trunc(item.paradisePower))
                : 0,
            hallsHourglassCheck: item.hallsHourglassCheck === true,
            level: item.level ?? 0,
            job: item.job ?? '',
            server: item.server ?? '',
            day: item.day ?? defaultDay,
            daylist: item.daylist ?? [],
            checklist: Array.isArray(item.checklist) ? item.checklist.map((entry) => ({
                ...entry,
                items: Array.isArray(entry.items) ? entry.items.map((checkItem) => {
                    const legacyItem = checkItem as typeof checkItem & { busGold?: number };
                    return {
                        difficulty: checkItem.difficulty,
                        stage: checkItem.stage,
                        isCheck: checkItem.isCheck,
                        isDisable: checkItem.isDisable,
                        isBonus: checkItem.isBonus,
                        isBiweekly: checkItem.isBiweekly ?? false,
                        busGold: legacyItem.busGold ?? 0
                    };
                }) : []
            })) : [],
            weeklist: item.weeklist ?? [],
            cube: item.cube ?? 0,
            cubelist: item.cubelist ?? [],
            isGold: item.isGold ?? false,
            otherGold: item.otherGold ?? 0,
            position: item.position ?? 9999,
            account: item.account ?? '본계정'
        };
    });
}
