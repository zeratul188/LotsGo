import { SetStateFn } from "@/utiils/utils"
import { getParsedText } from "./characterFeat"

export type Core = {
    index: number,
    icon: string,
    name: string,
    point: number,
    grade: string,
    gems: ArkGridGem[]
}

export type ArkGridGem = {
    index: number,
    icon: string,
    isActive: boolean,
    grade: string,
    name: string,
    options: string[]
}

export type ArkGridOption = {
    name: string,
    level: number,
    description: string
}

// 아크 그리드 데이터 불러오기
export function loadArkGrid(
    data: any, 
    setCores: SetStateFn<Core[]>, 
    setOptions: SetStateFn<ArkGridOption[]>
) {
    if (data) {
        const slots: any[] | null = data.Slots;
        if (slots) {
            const cores: Core[] = [];
            for (const item of slots) {
                const gems: ArkGridGem[] = [];
                for (const gem of item.Gems) {
                    gems.push(getDataGem(gem));
                }
                const core: Core = {
                    index: Number(item.Index),
                    icon: item.Icon,
                    name: item.Name,
                    point: Number(item.Point),
                    grade: item.Grade,
                    gems: gems
                }
                cores.push(core);
            }
            setCores(cores);
        }
        const effects = data.Effects;
        if (effects) {
            const effs: ArkGridOption[] = [];
            for (const item of effects) {
                const eff: ArkGridOption = {
                    name: item.Name,
                    level: Number(item.Level),
                    description: getParsedText(item.Tooltip)
                }
                effs.push(eff);
            }
            setOptions(effs);
        }
    }
}

// 아크 그리드 젬 데이터 가져오기
function getDataGem(data: any): ArkGridGem {
    let name = '';
    const options: string[] = [];
    const parsedTooltip = JSON.parse(data.Tooltip);
    for (const key in parsedTooltip) {
        const element = parsedTooltip[key];
        const type = element?.type;
        const value = element?.value;

        if (typeof type === 'string' && type === 'NameTagBox') {
            name = getParsedText(value);
        }

        const element000 = value?.Element_000;
        const element001 = value?.Element_001;
        if (typeof element000 === 'string' && typeof element001 === 'string' && element000.includes('젬 옵션')) {
            const strs = element001?.split('<br>');
            for (const str of strs) {
                options.push(getParsedText(str));
            }
        }
    }
    const gem: ArkGridGem = {
        index: Number(data.Index),
        icon: data.Icon,
        isActive: data.IsActive,
        grade: data.Grade,
        name: name,
        options: options
    }
    return gem;
}

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
        return Number(item.split(' : ')[1]);
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