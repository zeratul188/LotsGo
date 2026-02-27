import { Collect } from "../model/types";

// 수집품 완료한 갯수
export function getCompletePoint(collect: Collect): number {
    let sum = 0;
    for (const item of collect.items) {
        sum += item.point;
    }
    return sum;
}

// 수집품 총 갯수
export function getCompleteMaxPoint(collect: Collect): number {
    let sum = 0;
    for (const item of collect.items) {
        sum += item.maxPoint;
    }
    return sum;
}

// 전체 진행도 값 반환 함수
export function getProgressData(collects: Collect[]): number {
    let value = 0;
    for (const collect of collects) {
        let now = 0, max = 0;
        for (const item of collect.items) {
            now += item.point;
            max += item.maxPoint;
        }
        const percent = now / max * 100;
        value += percent;
    }
    return Math.round(value);
}

// 수집품 진행률에 따른 색상 반환
export function getColorByProgress(value: number, max: number): "primary" | "default" | "secondary" | "success" | "warning" | "danger" | undefined {
    const percent = value / max * 100;
    if (percent === 100) { return 'success' }
    if (percent >= 75) { return 'secondary' }
    if (percent >= 50) { return 'primary' }
    if (percent >= 25) { return'warning' }
    if (percent > 0) { return 'danger' }
    return 'default'
}