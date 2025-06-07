import { getParsedText } from "./characterFeat";

// 장비 - 진화 포인트 가져오기
export function printCountInTooltip(parsed: any): string | null {
    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        if (typeof value === "string" && value.includes("내구도")) {
            const result = getParsedText(value);
            return result;
        }
    }
    return null;
}

// 장비 - 엘릭서 조합 가져오기
export type ElixirType = {
    topStr: string,
    line1: string,
    line2: string
}
export function printAllElixirInTooltip(parsed: any): ElixirType | null {
    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        const topStr = value?.Element_000?.topStr;
        if (typeof topStr === "string" && topStr.includes("연성 추가 효과")) {
            const element000 = value?.Element_000;
            const parsedTopStr = getParsedText(topStr);
            const line1 = getParsedText(element000.contentStr.Element_000.contentStr.replaceAll('<br>', '\r\n').replaceAll('<BR>', '\r\n'));
            const line2 = getParsedText(element000.contentStr.Element_001.contentStr.replaceAll('<br>', '\r\n').replaceAll('<BR>', '\r\n'));
            return {
                topStr: parsedTopStr,
                line1: line1,
                line2: line2
            }
        }
    }
    return null;
}

// 장비 - 엘릭서 데이터 가져오기
export function printElixirInTooltip(parsed: any): ElixirType | null {
    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        const topStr = value?.Element_000?.topStr;
        if (typeof topStr === "string" && topStr.includes("[엘릭서]")) {
            const element000 = value?.Element_000;
            const parsedTopStr = getParsedText(topStr);
            const line1 = getParsedText(element000.contentStr.Element_000.contentStr.replaceAll('<br>', '\r\n').replaceAll('<BR>', '\r\n'));
            const line2 = getParsedText(element000.contentStr.Element_001.contentStr.replaceAll('<br>', '\r\n').replaceAll('<BR>', '\r\n'));
            return {
                topStr: parsedTopStr,
                line1: line1,
                line2: line2
            }
        }
    }
    return null;
}

// 장비 - 초월 데이터 가져오기
export type PowerType = {
    topStr: string,
    stat: string,
    allStatue: string,
    line1: string,
    line2: string,
    line3: string,
    line4: string
}
export function printPowerInTooltip(parsed: any): PowerType | null {
    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        const topStr = value?.Element_000?.topStr;
        if (typeof topStr === "string" && topStr.includes("초월")) {
            let parsedTopStr = getParsedText(topStr);
            const contentStr = value?.Element_000?.contentStr;
            const stat = contentStr?.Element_000?.contentStr;
            const allStatue = getParsedText(contentStr?.Element_001?.contentStr);
            const line1 = getParsedText(contentStr?.Element_002?.contentStr);
            const line2 = getParsedText(contentStr?.Element_003?.contentStr);
            const line3 = getParsedText(contentStr?.Element_004?.contentStr);
            const line4 = getParsedText(contentStr?.Element_005?.contentStr);
            return {
                topStr: parsedTopStr,
                stat: stat,
                allStatue: allStatue,
                line1: line1,
                line2: line2,
                line3: line3,
                line4: line4
            };
        }
    }
    return null;
}

// 장비 - 상재 문구 가져오기
export function printHighUpgradeInTooltip(parsed: any): string {
    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        if (typeof value === 'string' && value.includes('상급')) {
            let text = getParsedText(value);
            return text;
        }
    }

    return "";
}

// 장비 - 기본 효과 가져오기
export type DefaultInfo = {
    title: string,
    content: string
}
export function printInfoInTooltip(parsed: any): DefaultInfo | null {
    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        const element000 = value?.Element_000;
        const element001 = value?.Element_001;
        if (typeof element000 === 'string' && element000.includes('기본 효과') && typeof element001 === 'string') {
            const title = getParsedText(element000);
            const content = element001.replaceAll('<BR>', '\r\n');
            return {
                title: title,
                content: content
            };
        }
    }

    return null;
}

// 장비 - 추가 효과 가져오기
export function printBonusInTooltip(parsed: any): DefaultInfo | null {
    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        const element000 = value?.Element_000;
        const element001 = value?.Element_001;
        if (typeof element000 === 'string' && element000.includes('추가 효과') && typeof element001 === 'string') {
            const title = getParsedText(element000);
            const content = element001.replaceAll('<BR>', '\r\n');
            return {
                title: title,
                content: content
            };
        }
    }

    return null;
}