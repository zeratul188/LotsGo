import type { Cube } from "../../api/checklist/cube/route";
import type { CheckCharacter } from "../../store/checklistSlice";

export function getColumnsByCubeTiers(cubes: Cube[]): number[] {
    const results: number[] = [];
    for (const cube of cubes) {
        if (!results.includes(cube.tier)) {
            results.push(cube.tier);
        }
    }
    return results;
}

export type CubeStatue = {
    level: number,
    cubeCount: CubeCount[]
}

type CubeCount = {
    tier: number,
    count: number
}

export function getCubeStatues(character: CheckCharacter, cubes: Cube[]): CubeStatue[] {
    const tiers: number[] = getColumnsByCubeTiers(cubes);
    const allCounts: CubeCount[] = [];
    for (const tier of tiers) {
        const newCount: CubeCount = {
            tier: tier,
            count: 0
        }
        allCounts.push(newCount);
    }
    for (const data of character.cubelist) {
        if (data.count > 0) {
            const item = getCubeCountByID(cubes, data.id);
            if (item) {
                const index = allCounts.findIndex(c => c.tier === item.tier);
                if (index !== -1) {
                    const all = item.count * data.count;
                    allCounts[index].count += all;
                }
            }
        }
    }
    const statues: CubeStatue[] = [];
    for (let i = 1; i <= 10; i++) {
        const cubeCount: CubeCount[] = [];
        for (const count of allCounts) {
            const newCount: CubeCount = {
                tier: count.tier,
                count: 0
            }
            if (count.count > 0) {
                const remainGems = count.count % 3;
                newCount.count = remainGems;
                count.count = Math.floor(count.count / 3);
            }
            cubeCount.push(newCount);
        }
        if (!isNotRemainGems(cubeCount)) {
            const newStatue: CubeStatue = {
                level: i,
                cubeCount: cubeCount
            }
            statues.push(newStatue);
        }
    }
    return statues;
}

function isNotRemainGems(counts: CubeCount[]): boolean {
    for (const count of counts) {
        if (count.count > 0) {
            return false;
        }
    }
    return true;
}

function getCubeCountByID(cubes: Cube[], id: string): CubeCount | null {
    const cube = cubes.find(item => item.id === id);
    if (cube) {
        const cubeCount: CubeCount = {
            tier: cube.tier,
            count: cube.reward
        }
        return cubeCount;
    }
    return null;
}

export function getCubeCountByCharacter(character: CheckCharacter, cube: Cube): number {
    const cubeItem = character.cubelist.find(item => item.id === cube.id);
    if (cubeItem) {
        return cubeItem.count;
    }
    return 0;
}

export function getCubeCountByChecklist(checklist: CheckCharacter[], cube: Cube): number {
    let sum = 0;
    for (const character of checklist) {
        const cubeItem = character.cubelist.find(item => item.id === cube.id);
        if (cubeItem) {
            sum += cubeItem.count;
        }
    }
    return sum;
}

export function getGemCountByCharacter(character: CheckCharacter, cubes: Cube[], tier: number): number[] {
    let sum = 0;
    for (const data of character.cubelist) {
        if (data.count > 0) {
            const item = getCubeCountByID(cubes, data.id);
            if (item && item.tier === tier) {
                const all = item.count * data.count;
                sum += all;
            }
        }
    }
    const gems: number[] = [];
    for (let i = 1; i <= 10; i++) {
        gems.push(i === 10 ? sum : sum % 3);
        sum = Math.floor(sum / 3);
    }
    return gems;
}

export function getGemCountByChecklist(checklist: CheckCharacter[], cubes: Cube[], tier: number): number[] {
    let sum = 0;
    for (const character of checklist) {
        for (const data of character.cubelist) {
            if (data.count > 0) {
                const item = getCubeCountByID(cubes, data.id);
                if (item && item.tier === tier) {
                    const all = item.count * data.count;
                    sum += all;
                }
            }
        }
    }
    const gems: number[] = [];
    for (let i = 1; i <= 10; i++) {
        gems.push(i === 10 ? sum : sum % 3);
        sum = Math.floor(sum / 3);
    }
    return gems;
}
