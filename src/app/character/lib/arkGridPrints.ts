import { ArkGridGem, Core } from "../model/types";

// 특정 index의 아크 그리드 코어 반환
export function getCore(cores: Core[], index: number): Core | undefined {
    return cores.find(core => core.index === index);
}

// 특정 index의 아크그리드 젬 반환
export function getGem(gems: ArkGridGem[], index: number): ArkGridGem | undefined {
    return gems.find(gem => gem.index === index);
}

// 의지력 효율 가져오기
export function getPower(options: string[]): number {
    const item = options.find(item => item.includes('의지력 효율'));
    if (item) {
        console.log(item.split(' : ')[1]);
        return Number(item.split(' : ')[1].split('의지력 효율 ')[1].replaceAll(')', ""));
    }
    return 0;
}

// 질서 혹은 혼돈 가져오기
export function getPoint(options: string[]): number {
    const item = options.find(item => item.includes('혼돈 포인트') || item.includes('질서 포인트'));
    if (item) {
        return Number(item.split(' : ')[1]);
    }
    return 0;
}

// 기타 옵션 가져오기
export function getOtherOptions(options: string[]): string[] {
    const items = options.filter(item => item.includes('[') && item.includes(']'));
    for (let i = 0; i < items.length; i++) {
        items[i] = items[i].replaceAll('[', '').replaceAll(']', '');
    }
    return items;
}

// 효과 색상 적용 (공격형인지 지원형인지)
export function getColorByType(name: string): 'success' | 'danger' {
    if (name === '공격력' || name === '보스 피해' || name === '추가 피해') return 'danger';
    return 'success';
}