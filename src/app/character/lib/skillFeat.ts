import { Skill } from "../model/types";

// 무력화 계산
export type PowerData = {
    type: string,
    level: number,
    bonus: number
}
const powerTable: PowerData[] = [
    { type: '', level: 1, bonus: 0 },
    { type: '하', level: 2, bonus: 0 },
    { type: '중', level: 3, bonus: 1 },
    { type: '중상', level: 4, bonus: 2 },
    { type: '상', level: 5, bonus: 3 },
    { type: '최상', level: 6, bonus: 5 }
]
export function AvgSkillPowers(skills: Skill[]): string {
    let avgLevel = 0, sum = 0;
    for (const skill of skills) {
        const powerData = powerTable.find(data => data.type === skill.power);
        sum += powerData ? powerData.level + powerData.bonus : 0;
    }
    avgLevel = Math.round(sum / skills.length);
    if (avgLevel > 6) avgLevel = 6;
    else if (avgLevel < 0) avgLevel = 0;
    const resultData = powerTable.find(data => data.level === avgLevel);
    return resultData ? resultData.type : '';
}

// 겁화 보석의 피해 문구 가져오기
export function getTextAttack(str: string): string {
    const match = str.match(/(피해|지원 효과)\s([\d.]+|[\d.]+\s)%\s증가/);
    const result = match ? match[0] : '-';
    return result.replaceAll('지원 효과', "지원");
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