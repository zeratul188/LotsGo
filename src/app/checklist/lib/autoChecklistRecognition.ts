import type { Boss } from '../../api/checklist/boss/route';

export type RaidCompletion = {
    type: 'stage' | 'all',
    stage: number | null,
    label: string
}

export function normalizeRecognitionText(value: string): string {
    return value
        .normalize('NFKC')
        .replace(/[^0-9A-Za-z가-힣]/g, '')
        .toLowerCase();
}

export function findBossByRecognitionText(text: string, bosses: Boss[]): Boss | null {
    const normalizedText = normalizeRecognitionText(text);
    if (!normalizedText) return null;

    const candidates = bosses.flatMap((boss) => (boss.screenNames ?? []).map((screenName) => ({
        boss,
        screenName,
        normalizedName: normalizeRecognitionText(screenName)
    }))).filter((candidate) => candidate.normalizedName.length >= 2)
        .sort((a, b) => b.normalizedName.length - a.normalizedName.length);

    return candidates.find((candidate) => normalizedText.includes(candidate.normalizedName))?.boss ?? null;
}

export function findRaidCompletion(text: string): RaidCompletion | null {
    const normalizedText = normalizeRecognitionText(text);
    if (/던[전젼]클리어/.test(normalizedText)) {
        return { type: 'all', stage: null, label: '던전 클리어' };
    }

    const stageMatch = normalizedText.match(/([1-9])관문(돌파|클리어)/);
    if (!stageMatch) return null;

    return {
        type: 'stage',
        stage: Number(stageMatch[1]),
        label: `${stageMatch[1]}관문 ${stageMatch[2]}`
    };
}
