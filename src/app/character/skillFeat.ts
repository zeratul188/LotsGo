import { SetStateFn } from "@/utiils/utils"
import { Gem, getParsedText } from "./characterFeat"

// 스킬 포인트 가져오기
export function loadSkillPoint(
    data: any | null, 
    setSkillPoint: SetStateFn<number>, 
    setMaxPoint: SetStateFn<number>
) {
    if (data) {
        const point: number = Number(data.UsingSkillPoint);
        const max: number = Number(data.TotalSkillPoint);
        setSkillPoint(point);
        setMaxPoint(max);
    }
}

export type Skill = {
    name: string,
    icon: string,
    level: number,
    type: string,
    isCounter: boolean, // 카운터 여부
    power: string, // 무력 수치
    destroy: number, // 파괴 수치
    tripods: Tripod[],
    rune: Rune | null,
    attackGem: Gem | null,
    timeGem: Gem | null
}
export type Tripod = {
    tier: number,
    slot: number,
    name: string,
    icon: string,
    level: number
}
export type Rune = {
    name: string,
    icon: string,
    grade: string,
    description: string
}
// 스킬 데이터 가져오기기
export function loadSkills(
    datas: any[] | null,
    gems: Gem[],
    setSkills: SetStateFn<Skill[]>
) {
    const skills: Skill[] = [];
    if (datas) {
        for (const item of datas) {
            if (Number(item.Level) > 1) {
                const parsedTooltip = JSON.parse(item.Tooltip);
                const info = findSkillInfoInTooltip(parsedTooltip);
                const tripods: Tripod[] = [];
                for (const tripod of item.Tripods) {
                    if (Boolean(tripod.IsSelected)) {
                        const newTripod: Tripod = {
                            tier: Number(tripod.Tier),
                            slot: Number(tripod.Slot),
                            name: tripod.Name,
                            icon: tripod.Icon,
                            level: Number(tripod.Level)
                        }
                        tripods.push(newTripod);
                    }
                }
                let rune: Rune | null = null;
                if (item.Rune) {
                    const parsedRuneTooltip = JSON.parse(item.Tooltip);
                    const runeDescription = findRuneInTooltip(parsedRuneTooltip);
                    rune = {
                        name: item.Rune.Name,
                        icon: item.Rune.Icon,
                        grade: item.Rune.Grade,
                        description: runeDescription
                    }
                }
                let attackGem: Gem | null = null;
                let timeGem: Gem | null = null;
                for (const gem of gems) {
                    if (gem.skillStr.includes(item.Name)) {
                        if (gem.skillStr.includes('피해')) {
                            attackGem = gem;
                        } else if (gem.skillStr.includes('재사용 대기시간')) {
                            timeGem = gem;
                        }
                    }
                }
                const newSkill: Skill = {
                    name: item.Name,
                    icon: item.Icon,
                    level: Number(item.Level),
                    type: item.Type,
                    isCounter: info.isCounter,
                    power: info.power,
                    destroy: info.destroy,
                    tripods: tripods,
                    rune: rune,
                    attackGem: attackGem,
                    timeGem: timeGem
                }
                skills.push(newSkill);
            }
        }
    }
    setSkills(skills);
}

// 파괴, 카운터, 무력 수치, 설명 내용 가져오기
type SkillInfo = {
    power: string,
    destroy: number,
    isCounter: boolean
}
function findSkillInfoInTooltip(parsed: any): SkillInfo {
    const info: SkillInfo = {
        power: '',
        destroy: 0,
        isCounter: false
    }
    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        if (typeof value === 'string') {
            if (value.includes('카운터 : 가능')) {
                info.isCounter = true;
            }
            if (value.includes('무력화')) {
                const text = getParsedText(value);
                const match = text.match(/무력화\s*:\s*(하|중|중상|상|최상)/);
                const power = match ? match[1] : ''
                info.power = power;
            }
            if (value.includes('부위 파괴 : ')) {
                const text = getParsedText(value);
                const match = text.match(/부위\s*파괴\s*:\s*레벨\s*(\d+)/);
                const destroy = match ? Number(match[1]) : 0
                info.destroy = destroy;
            }
        }
    }
    return info;
}

// 룬 설명 가져오기
function findRuneInTooltip(parsed: any): string {
    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        const element000 = value?.Element_000;
        const element001 = value?.Element_001;
        if (typeof element000 === 'string' && typeof element001 === 'string' && element000.includes('스킬 룬 효과')) {
            return element001;
        }
    }
    return "";
}

// 겁화 보석의 피해 문구 가져오기
export function getTextAttack(str: string): string {
    const match = str.match(/피해\s[\d.]+%\s증가/);
    const result = match ? match[0] : '-';
    return result;
}

// 겁화 보석의 피해 문구 가져오기
export function getTextTime(str: string): string {
    const match = str.match(/재사용\s대기시간\s[\d.]+%\s감소/);
    const result = match ? match[0] : '-';
    return result.replaceAll('재사용 대기시간', "쿨타임");
}

// 총 파괴 수치 가져오기
export function getAllDestory(skills: Skill[]) {
    let sum = 0;
    for (const skill of skills) {
        sum += skill.destroy;
    }
    return sum;
}