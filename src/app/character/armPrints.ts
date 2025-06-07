import { getParsedText } from "./characterFeat";

// 팔찌 팔찌 효과 가져오기
export function printEffectInTooltip(parsed: any): string[] {
    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        const element000 = value?.Element_000;
        const element001 = value?.Element_001;
        if (typeof element000 === 'string' && typeof element001 === 'string' && element000.includes('팔찌 효과')) {
            let text = getParsedText(element001.replaceAll('<BR>', '\r\n'));
            return text.split(/\r?\n/);
        }
    }

    return [];
}

// 팔찌 부여 여부 가져오기
export function printBooleanInTooltip(parsed: any): string {
    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        if (typeof value === 'string' && value.includes('부여')) {
            let text = getParsedText(value);
            return text;
        }
    }

    return '';
}

// 팔찌 도약 가져오기
export function printArmPointInTooltip(parsed: any): string {
    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        const element000 = value?.Element_000;
        const element001 = value?.Element_001
        if (typeof element000 === 'string' && typeof element001 === 'string' && element000.includes('아크 패시브')) {
            let text = getParsedText(element001.replaceAll('<BR>', '\r\n'));
            return text;
        }
    }

    return "";
}

// 팔찌 획득처 가져오기
export function printArmUseInTooltip(parsed: any): string {
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