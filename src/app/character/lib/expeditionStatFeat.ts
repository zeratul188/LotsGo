import { ExpeditionCharacter } from "../characterlist/model/types";

export type GemLevelChartData = {
    level: string,
    attack: number,
    cooldown: number
}

// 닉네임 유무, 로딩 상태, 데이터 유무에 맞는 안내 문구를 반환한다.
export function getExpeditionStatStatusMessage(
    nickname: string | null,
    isLoading: boolean,
    count: number
): string | null {
    if (!nickname) {
        return '캐릭터 닉네임이 없습니다.';
    }
    if (isLoading) {
        return '원정대 정보를 불러오는 중입니다.';
    }
    if (count === 0) {
        return '원정대 캐릭터 정보가 없습니다.';
    }
    return null;
}

// 특정 캐릭터의 보석 레벨 평균을 반환한다.
export function getSumGemByCharacter(character: ExpeditionCharacter): number {
    if (character.gems.length === 0) return 0;
    return character.gems.reduce((total, gem) => {
        return total + gem.level;
    }, 0) / character.gems.length;
}

// 조건에 맞는 전체 보석들의 평균 레벨을 반환한다.
export function getAverageGemLevel(
    characters: ExpeditionCharacter[],
    filter?: (gem: ExpeditionCharacter['gems'][number]) => boolean
): number {
    const gems = characters.flatMap(character => character.gems).filter(gem => filter ? filter(gem) : true);
    if (gems.length === 0) return 0;

    return gems.reduce((total, gem) => {
        return total + gem.level;
    }, 0) / gems.length;
}

// 특정 캐릭터의 겁화 보석 개수를 반환한다.
export function getCountAttackGem(character: ExpeditionCharacter): number {
    return character.gems.filter(gem => gem.skillStr.includes('피해') || gem.skillStr.includes('지원 효과')).length;
}

// 특정 캐릭터의 귀속 겁화 보석 개수를 반환한다.
export function getCountAttackBoundGem(character: ExpeditionCharacter): number {
    return character.gems.filter(gem => (gem.skillStr.includes('피해') || gem.skillStr.includes('지원 효과')) && gem.name.includes('귀속')).length;
}

// 특정 캐릭터의 귀속 작열 보석 개수를 반환한다.
export function getCountCooldownBoundGem(character: ExpeditionCharacter): number {
    return character.gems.filter(gem => !gem.skillStr.includes('피해') && !gem.skillStr.includes('지원 효과') && gem.name.includes('귀속')).length;
}

// 특정 캐릭터의 4티어 보석 개수만 반환한다.
export function getTier4Gem(character: ExpeditionCharacter): number {
    return character.gems.filter(gem => gem.name.includes('겁화') || gem.name.includes('작열') || gem.name.includes('광휘')).length;
}

// 특정 캐릭터의 4티어 귀속 보석 개수만 반환한다.
export function getTier4BoundGem(character: ExpeditionCharacter): number {
    return character.gems.filter(gem => (gem.name.includes('겁화') || gem.name.includes('작열') || gem.name.includes('광휘')) && gem.name.includes('귀속')).length;
}

// 특정 캐릭터의 3티어 보석 개수만 반환한다.
export function getTier3Gem(character: ExpeditionCharacter): number {
    return character.gems.filter(gem => gem.name.includes('멸화') || gem.name.includes('홍염')).length;
}

// 특정 캐릭터의 3티어 귀속 보석 개수만 반환한다.
export function getTier3BoundGem(character: ExpeditionCharacter): number {
    return character.gems.filter(gem => (gem.name.includes('멸화') || gem.name.includes('홍염')) && gem.name.includes('귀속')).length;
}

// 선택한 티어의 보석을 레벨별 겁화/작열 개수 차트 데이터로 변환한다.
export function getGemLevelChartData(
    characters: ExpeditionCharacter[],
    tier: string,
    isBound: boolean
): GemLevelChartData[] {
    const gems = characters.flatMap(character => character.gems).filter((gem) => {
        if (isBound && !gem.name.includes('귀속')) {
            return false;
        }

        if (tier === '4') {
            return gem.name.includes('겁화') || gem.name.includes('작열') || gem.name.includes('광휘');
        }
        if (tier === '3') {
            return gem.name.includes('멸화') || gem.name.includes('홍염');
        }
        return !(
            gem.name.includes('겁화') ||
            gem.name.includes('작열') ||
            gem.name.includes('광휘') ||
            gem.name.includes('멸화') ||
            gem.name.includes('홍염')
        );
    });

    const levelMap = new Map<number, { attack: number, cooldown: number }>();

    for (const gem of gems) {
        const current = levelMap.get(gem.level) ?? { attack: 0, cooldown: 0 };
        if (gem.skillStr.includes('피해') || gem.skillStr.includes('지원 효과')) {
            current.attack += 1;
        } else {
            current.cooldown += 1;
        }
        levelMap.set(gem.level, current);
    }

    return [...levelMap.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([level, value]) => ({
            level: `${level}레벨`,
            attack: value.attack * -1,
            cooldown: value.cooldown
        }));
}

// 차트의 좌우 축 범위를 맞추기 위한 최대 개수를 반환한다.
export function getGemLevelChartRange(data: GemLevelChartData[]): number {
    const max = data.reduce((currentMax, item) => {
        return Math.max(currentMax, Math.abs(item.attack), Math.abs(item.cooldown));
    }, 0);

    return max === 0 ? 1 : max;
}
