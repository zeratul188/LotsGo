import type { Boss } from "@/app/api/checklist/boss/route";
import type { CheckCharacter } from "@/app/store/checklistSlice";
import type { AnalysisGold, ContentGoldAnalysis, GoldAnalysisDifficulty } from "../model/types";
import { getOtherGoldTotal } from "./otherGold";

export const GOLD_ANALYSIS_DIFFICULTIES: { key: GoldAnalysisDifficulty; label: string }[] = [
    { key: "single", label: "매칭/싱글" },
    { key: "normal", label: "노말" },
    { key: "hard", label: "하드" },
    { key: "nightmare", label: "나이트메어" }
];

export function emptyAnalysisGold(): AnalysisGold {
    return { shared: 0, bound: 0, other: 0, total: 0 };
}

export function sumAnalysisGold(values: AnalysisGold[]): AnalysisGold {
    return values.reduce((sum, value) => ({
        shared: sum.shared + value.shared,
        bound: sum.bound + value.bound,
        other: sum.other + value.other,
        total: sum.total + value.total
    }), emptyAnalysisGold());
}

export function goldAnalysisPercent(value: number, total: number): number {
    return total > 0 ? value / total * 100 : 0;
}

// 막대 양 끝에서 보정된 안내 상자가 실제로 겹치는 경우에만 위쪽 줄을 사용합니다.
export function getGoldCompositionLanes(points: number[], visible: boolean[], width: number): number[] {
    const lanes = points.map(() => 0);
    const occupied: { left: number; right: number }[][] = [];
    if (width <= 0) return lanes;
    for (let index = points.length - 1; index >= 0; index--) {
        if (!visible[index]) continue;
        const center = width < 152 ? width / 2 : Math.max(76, Math.min(width - 76, width * points[index] / 100));
        const interval = { left: center - 76, right: center + 76 };
        let lane = 0;
        while (occupied[lane]?.some(other => interval.left < other.right + 8 && interval.right + 8 > other.left)) lane++;
        (occupied[lane] ??= []).push(interval);
        lanes[index] = lane;
    }
    return lanes;
}

function difficultyGroup(difficulty: string): GoldAnalysisDifficulty | undefined {
    if (/싱글|매칭/.test(difficulty)) return "single";
    if (/나이트메어|3단계/.test(difficulty)) return "nightmare";
    if (/하드|2단계/.test(difficulty)) return "hard";
    if (/노말|1단계/.test(difficulty)) return "normal";
}

// 분석은 화면 필터와 버스 골드를 제외하고, 관문별 더보기 비용을 귀속부터 차감합니다.
export function buildGoldAnalysis(bosses: Boss[], checklist: CheckCharacter[], includeIncomplete: boolean) {
    const bossByName = new Map(bosses.map(boss => [boss.name, boss]));
    const contents = new Map<string, ContentGoldAnalysis>();
    const characters = [...checklist]
        .sort((a, b) => (a.position ?? 9999) - (b.position ?? 9999))
        .map(character => {
            const gold = emptyAnalysisGold();
            gold.other = getOtherGoldTotal(character);
            for (const content of character.checklist ?? []) {
                const boss = bossByName.get(content.name);
                const key = boss?.id ?? content.name;
                let row = contents.get(key);
                if (!row) {
                    row = {
                        key, name: content.name,
                        maxLevel: Math.max(0, ...(boss?.difficulty ?? []).map(diff => diff.level ?? 0)),
                        supported: [...new Set((boss?.difficulty ?? []).flatMap(diff => {
                            const group = difficultyGroup(diff.difficulty);
                            return group ? [group] : [];
                        }))],
                        difficulties: {
                            single: emptyAnalysisGold(), normal: emptyAnalysisGold(),
                            hard: emptyAnalysisGold(), nightmare: emptyAnalysisGold()
                        },
                        gold: emptyAnalysisGold()
                    };
                    contents.set(key, row);
                }
                if (!character.isGold) continue;
                for (const gate of content.items ?? []) {
                    if (gate.isDisable || (!includeIncomplete && !gate.isCheck)) continue;
                    const diff = boss?.difficulty?.find(diff => diff.stage === gate.stage && diff.difficulty === gate.difficulty);
                    if (!diff) continue;
                    const boundReward = content.isGold ? diff.boundGold ?? 0 : 0;
                    const sharedReward = content.isGold ? diff.gold ?? 0 : 0;
                    const bonus = gate.isBonus ? diff.bonus ?? 0 : 0;
                    const bound = Math.max(0, boundReward - bonus);
                    const shared = sharedReward - Math.max(0, bonus - boundReward);
                    const value = { shared, bound, other: 0, total: shared + bound };
                    gold.shared += shared;
                    gold.bound += bound;
                    row.gold = sumAnalysisGold([row.gold, value]);
                    const group = difficultyGroup(gate.difficulty);
                    if (group) row.difficulties[group] = sumAnalysisGold([row.difficulties[group], value]);
                }
            }
            gold.total = gold.shared + gold.bound + gold.other;
            return { key: `${character.server}:${character.nickname}`, character, gold };
        });
    const accounts = new Map<string, AnalysisGold>();
    for (const row of characters) {
        const account = row.character.account || "본계정";
        accounts.set(account, sumAnalysisGold([accounts.get(account) ?? emptyAnalysisGold(), row.gold]));
    }
    return {
        characters, accounts,
        contents: [...contents.values()].sort((a, b) => b.maxLevel - a.maxLevel),
        gold: sumAnalysisGold(characters.map(row => row.gold))
    };
}
