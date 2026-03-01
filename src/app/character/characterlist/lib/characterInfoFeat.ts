// 장비 이름에서 장비 강화 수치만 반환하는 함수
export function getEnhanceLevel(name: string): string {
    const match = name.match(/^\s*(\+\d+)/);
    return match ? match[1] : '-';
}