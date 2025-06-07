import { getParsedText } from "./characterFeat";

// 악세 기본 효과 가져오기
export function printDefaultInTooltip(parsed: any): string {
    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        const element000 = value?.Element_000;
        const element001 = value?.Element_001
        if (typeof element000 === 'string' && typeof element001 === 'string' && element000.includes('기본 효과')) {
            let text = getParsedText(element001.replaceAll('<BR>', '\r\n'));
            return text;
        }
    }

    return "";
}

// 악세 연마 효과 가져오기
export function printListInTooltip(parsed: any): string {
    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        const element000 = value?.Element_000;
        const element001 = value?.Element_001
        if (typeof element000 === 'string' && typeof element001 === 'string' && element000.includes('연마 효과')) {
            let text = getParsedText(element001.replaceAll('<BR>', '\r\n'));
            return text;
        }
    }

    return "";
}

// 악세 깨달음 가져오기
export function printPointInTooltip(parsed: any): string {
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

// 악세 획득처 가져오기
export function printUseInTooltip(parsed: any): string {
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