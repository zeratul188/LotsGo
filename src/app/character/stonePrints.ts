import { getParsedText } from "./characterFeat";

// 스톤 기본 효과 가져오기
export function printDefaultStoneInTooltip(parsed: any): string {
    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        const element000 = value?.Element_000;
        const element001 = value?.Element_001
        if (typeof element000 === 'string' && typeof element001 === 'string' && element000.includes('기본 효과')) {
            let text = getParsedText(element001);
            return text;
        }
    }

    return "";
}

// 스톤 보너스 가져오기
export function printBonusStoneInTooltip(parsed: any): string {
    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        const element000 = value?.Element_000;
        const element001 = value?.Element_001
        if (typeof element000 === 'string' && typeof element001 === 'string' && element000.includes('세공 단계 보너스')) {
            let text = getParsedText(element001);
            return text;
        }
    }

    return "";
}

// 스톤 획득처 가져오기
export function printStoneUseInTooltip(parsed: any): string {
    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        if (typeof value === 'string' && value.includes('획득처')) {
            let text = getParsedText(value.replaceAll('<BR>', '\r\n'));
            return text;
        }
    }

    return "";
}