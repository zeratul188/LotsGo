import { addToast } from "@heroui/react";
import type { Boss, Difficulty } from "../../api/checklist/boss/route";
import type { AppDispatch } from "../../store/store";
import {
    removeCharacter
} from "../../store/checklistSlice";
import type {
    CheckCharacter,
    Checklist,
    ChecklistItem
} from "../../store/checklistSlice";
import type { LoginUser } from "../../store/loginSlice";

type AutoRegistrationOptions = {
    autoDeleteUnselectedRaids: boolean,
    targetNickname?: string
}

type RaidCandidate = {
    boss: Boss,
    bossIndex: number,
    checklist: Checklist,
    totalGold: number,
    hasOnceStage: boolean
}

type OnceOwnerMap = Map<string, Map<string, string>>;

function isSupportedDifficulty(difficulty: Difficulty): boolean {
    return !difficulty.difficulty.includes('싱글');
}

function getOnceStages(boss: Boss): Set<number> {
    return new Set(boss.difficulty
        .filter((difficulty) => isSupportedDifficulty(difficulty) && difficulty.isOnce)
        .map((difficulty) => difficulty.stage));
}

function canEnterOnceStage(character: CheckCharacter, boss: Boss): boolean {
    return boss.difficulty.some((difficulty) => isSupportedDifficulty(difficulty)
        && difficulty.isOnce
        && character.level >= difficulty.level);
}

function hasAssignedOnceStage(character: CheckCharacter, boss: Boss): boolean {
    const onceStages = getOnceStages(boss);
    if (onceStages.size === 0) return false;

    const registeredRaid = character.checklist.find((content) => content.name === boss.name);
    return registeredRaid?.items.some((item) => onceStages.has(item.stage)) ?? false;
}

function buildOnceOwners(
    checklist: CheckCharacter[],
    bosses: Boss[],
    targetNickname?: string
): OnceOwnerMap {
    const owners: OnceOwnerMap = new Map();
    const accounts = Array.from(new Set(checklist.map((character) => character.account)));

    for (const account of accounts) {
        const accountCharacters = checklist.filter((character) => character.account === account);
        const accountOwners = new Map<string, string>();

        for (const boss of bosses) {
            if (getOnceStages(boss).size === 0) continue;

            if (targetNickname) {
                const existingOwner = accountCharacters.find((character) => character.nickname !== targetNickname
                    && hasAssignedOnceStage(character, boss));
                if (existingOwner) {
                    accountOwners.set(boss.name, existingOwner.nickname);
                    continue;
                }
            }

            const owner = accountCharacters
                .filter((character) => character.isGold && canEnterOnceStage(character, boss))
                .sort((a, b) => b.level - a.level || a.position - b.position
                    || checklist.indexOf(a) - checklist.indexOf(b))[0];

            if (owner) accountOwners.set(boss.name, owner.nickname);
        }

        owners.set(account, accountOwners);
    }

    return owners;
}

function selectDifficultyForStage(
    characterLevel: number,
    boss: Boss,
    stage: number
): Difficulty | undefined {
    return boss.difficulty
        .map((difficulty, index) => ({ difficulty, index }))
        .filter(({ difficulty }) => isSupportedDifficulty(difficulty)
            && difficulty.stage === stage
            && characterLevel >= difficulty.level)
        .sort((a, b) => b.difficulty.level - a.difficulty.level
            || (b.difficulty.gold + b.difficulty.boundGold) - (a.difficulty.gold + a.difficulty.boundGold)
            || a.index - b.index)[0]?.difficulty;
}

function createChecklistItem(
    difficulty: Difficulty,
    previousItem?: ChecklistItem
): ChecklistItem {
    return {
        difficulty: difficulty.difficulty,
        stage: difficulty.stage,
        isCheck: previousItem?.isCheck ?? false,
        isDisable: previousItem?.isDisable ?? false,
        isBonus: previousItem?.isBonus ?? false,
        isBiweekly: difficulty.isBiweekly
    };
}

function buildCandidates(
    character: CheckCharacter,
    bosses: Boss[],
    onceOwners: OnceOwnerMap
): RaidCandidate[] {
    const accountOwners = onceOwners.get(character.account);

    return bosses.map((boss, bossIndex): RaidCandidate | null => {
        const previousRaid = character.checklist.find((content) => content.name === boss.name);
        const stages = Array.from(new Set(boss.difficulty
            .filter(isSupportedDifficulty)
            .map((difficulty) => difficulty.stage)))
            .sort((a, b) => a - b);
        const onceStages = getOnceStages(boss);
        const isOnceOwner = accountOwners?.get(boss.name) === character.nickname;
        const selectedDifficulties: Difficulty[] = [];

        for (const stage of stages) {
            if (onceStages.has(stage) && !isOnceOwner) continue;
            const difficulty = selectDifficultyForStage(character.level, boss, stage);
            if (difficulty) selectedDifficulties.push(difficulty);
        }

        if (selectedDifficulties.length === 0) return null;

        const items = selectedDifficulties.map((difficulty) => createChecklistItem(
            difficulty,
            previousRaid?.items.find((item) => item.stage === difficulty.stage)
        ));
        return {
            boss,
            bossIndex,
            checklist: {
                name: boss.name,
                items,
                isGold: true,
                busGold: previousRaid?.busGold ?? 0
            },
            totalGold: selectedDifficulties.reduce(
                (total, difficulty) => total + difficulty.gold + difficulty.boundGold,
                0
            ),
            hasOnceStage: selectedDifficulties.some((difficulty) => onceStages.has(difficulty.stage))
        };
    }).filter((candidate): candidate is RaidCandidate => candidate !== null);
}

function updateCharacterRaids(
    character: CheckCharacter,
    bosses: Boss[],
    onceOwners: OnceOwnerMap,
    autoDeleteUnselectedRaids: boolean
): CheckCharacter {
    const candidates = buildCandidates(character, bosses, onceOwners);
    const orderedCandidates = candidates.slice().sort((a, b) => b.totalGold - a.totalGold
        || a.bossIndex - b.bossIndex);
    const selectedCandidates = orderedCandidates.filter((candidate) => !candidate.hasOnceStage).slice(0, 3);
    selectedCandidates.push(...orderedCandidates.filter((candidate) => candidate.hasOnceStage));

    const candidateMap = new Map(candidates.map((candidate) => [candidate.boss.name, candidate]));
    const selectedNames = new Set(selectedCandidates.map((candidate) => candidate.boss.name));
    const updatedRaids: Checklist[] = [];

    for (const existingRaid of character.checklist) {
        const candidate = candidateMap.get(existingRaid.name);
        if (selectedNames.has(existingRaid.name) && candidate) {
            updatedRaids.push(candidate.checklist);
            continue;
        }

        if (autoDeleteUnselectedRaids) continue;

        updatedRaids.push(candidate ? {
            ...candidate.checklist,
            isGold: false
        } : {
            ...existingRaid,
            isGold: false
        });
    }

    for (const candidate of selectedCandidates) {
        if (!updatedRaids.some((raid) => raid.name === candidate.boss.name)) {
            updatedRaids.push(candidate.checklist);
        }
    }

    return {
        ...character,
        checklist: updatedRaids
    };
}

export function buildAutoRegisteredChecklist(
    checklist: CheckCharacter[],
    bosses: Boss[],
    options: AutoRegistrationOptions
): CheckCharacter[] {
    const onceOwners = buildOnceOwners(checklist, bosses, options.targetNickname);
    return checklist.map((character) => {
        if (options.targetNickname && character.nickname !== options.targetNickname) return character;
        return updateCharacterRaids(
            character,
            bosses,
            onceOwners,
            options.autoDeleteUnselectedRaids
        );
    });
}

export async function registerRaidsAutomatically(
    checklist: CheckCharacter[],
    bosses: Boss[],
    dispatch: AppDispatch,
    options: AutoRegistrationOptions
): Promise<boolean> {
    if (bosses.length === 0 || checklist.length === 0) {
        addToast({
            title: "자동 등록을 실행할 수 없습니다",
            description: "캐릭터 또는 레이드 데이터를 먼저 불러와주세요.",
            color: "warning"
        });
        return false;
    }

    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    if (!storedUser) return false;

    const nextChecklist = buildAutoRegisteredChecklist(checklist, bosses, options);
    dispatch(removeCharacter(nextChecklist));

    try {
        const response = await fetch('/api/checklist/list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: storedUser.id,
                checklist,
                type: 'updated-checklist',
                newChecklist: nextChecklist
            })
        });

        if (!response.ok) throw new Error('AUTO_REGISTRATION_FAILED');
        addToast({
            title: options.targetNickname ? "레이드 자동 등록 완료" : "전체 자동 등록 완료",
            description: options.targetNickname
                ? `${options.targetNickname} 캐릭터의 입장 가능한 레이드를 갱신했습니다.`
                : `저장된 ${nextChecklist.length}개 캐릭터의 입장 가능한 레이드를 갱신했습니다.`,
            color: "success"
        });
        return true;
    } catch {
        dispatch(removeCharacter(checklist));
        addToast({
            title: "레이드 자동 등록 실패",
            description: "변경 내용을 저장하지 못해 이전 상태로 되돌렸습니다.",
            color: "danger"
        });
        return false;
    }
}
