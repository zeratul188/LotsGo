import type { Checklist } from "@/app/api/raids/members/route";

export const CONTENT_ORDER_STORAGE_KEY = "partyHomeworkContentOrder";

export function getContentNames(characters: Checklist[]): string[] {
    return [...new Set(characters.flatMap(character => character.contents.map(content => content.name)))];
}

export function sortContentNames(contentNames: string[], savedOrder: string[]): string[] {
    const ranks = new Map(savedOrder.map((name, index) => [name, index]));
    return [...contentNames].sort((a, b) => {
        const rankA = ranks.get(a);
        const rankB = ranks.get(b);
        if (rankA === undefined && rankB === undefined) return 0;
        if (rankA === undefined) return 1;
        if (rankB === undefined) return -1;
        return rankA - rankB;
    });
}

export function readContentOrder(): string[] {
    try {
        const value: unknown = JSON.parse(localStorage.getItem(CONTENT_ORDER_STORAGE_KEY) ?? "[]");
        return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
    } catch {
        return [];
    }
}
