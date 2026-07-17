import type { SetStateFn } from "@/utiils/utils";
import type { Boss, Difficulty } from "../model/types";
import { useCallback } from "react";
import { addToast } from "@heroui/react";

type BossMutationResponse = {
    id?: string,
    message?: string,
    error?: string
}

async function requestBossMutation(body: Record<string, unknown>): Promise<BossMutationResponse> {
    const storedToken = sessionStorage.getItem('token');
    if (!storedToken) throw new Error('로그인 토큰이 없습니다. 다시 로그인해주세요.');
    let token: string = storedToken;

    const request = (accessToken: string) => fetch('/api/checklist/boss', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
        },
        credentials: 'include',
        body: JSON.stringify(body)
    });

    let response = await request(token);
    if (response.status === 401) {
        const refreshResponse = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
        const refreshData = await refreshResponse.json().catch(() => null);
        if (refreshResponse.ok && typeof refreshData?.accessToken === 'string') {
            token = refreshData.accessToken;
            sessionStorage.setItem('token', token);
            response = await request(token);
        }
    }

    const result: BossMutationResponse = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error ?? '콘텐츠 데이터를 저장하지 못했습니다.');
    return result;
}

// 콘텐츠 데이터 로딩 함수
export async function loadBoss(
    setLoading: SetStateFn<boolean>,
    setBoss: SetStateFn<Boss[]>
) {
    try {
        const response = await fetch('/api/checklist/boss', { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed load boss database.');
        const bosses: Boss[] = await response.json();
        setBoss(bosses);
        setLoading(false);
    } catch(err) {
        addToast({
            title: "데이터 로딩 오류",
            description: '알 수 없는 오류로 인해 데이터를 불러올 수 없습니다.',
            color: "danger"
        });
        console.error(err);
    }
}

// 콘텐츠 추가의 Modal에서 "난이도 추가" 버튼 클릭 시 데이터 추가 이벤트
export function useOnAddInput(setInputs: SetStateFn<Difficulty[]>) {
    const emptyDifficulty: Difficulty = {
        difficulty: '',
        stage: 0,
        level: 0,
        isBiweekly: false,
        gold: 0,
        boundGold: 0,
        bonus: 0,
        isOnce: false
    }
    return () => setInputs(prev => [...prev, emptyDifficulty]);
}

// "난이도 추가" 이벤트로 생성된 입력 요소들의 이벤트
export function useInputHandlers(inputs: Difficulty[], setInputs: SetStateFn<Difficulty[]>) {
    const updateInputData = useCallback((updated: Partial<Difficulty>, index: number) => {
        const newInputs = inputs.map((item, i) =>
            i === index
            ? { ...item, ...updated }
            : { ...item }
        );
        setInputs(newInputs);
    }, [inputs, setInputs]);

    return {
        onValueChangeDifficulty: (value: string, index: number) => updateInputData({ difficulty: value }, index),
        onValueChangeLevel: (value: number, index: number) => updateInputData({ level: value }, index),
        onValueChangeGold: (value: number, index: number) => updateInputData({ gold: value }, index),
        onValueChangeBoundGold: (value: number, index: number) => updateInputData({ boundGold: value }, index),
        onValueChangeBiweekly: (isSelected: boolean, index: number) => updateInputData({ isBiweekly: isSelected }, index),
        onValueChangeStage: (value: number, index: number) => updateInputData({ stage: value }, index),
        onValueChangeBonus: (value: number, index: number) => updateInputData({ bonus: value }, index),
        onValueChangeOnce: (isSelected: boolean, index: number) => updateInputData({ isOnce: isSelected }, index)
    }
}

// Modal을 닫았을 경우 데이터 초기화 이벤트
export function useClearData(
    setInputName: SetStateFn<string>, 
    setInputSimple: SetStateFn<string>, 
    setInputScreenNames: SetStateFn<string>,
    setInputs: SetStateFn<Difficulty[]>,
    setEditMode: SetStateFn<boolean>,
    setEditIndex: SetStateFn<number>,
    setInputMax: SetStateFn<number>
) {
    return () => {
        setInputName('');
        setInputSimple('');
        setInputScreenNames('');
        setInputMax(0);
        setInputs([]);
        setEditMode(false);
        setEditIndex(-1);
    }
}

// 난이도 항목 제거 함수
export function useOnRemoveDifficulty(
    removeIndex: number,
    inputs: Difficulty[], 
    setInputs: SetStateFn<Difficulty[]>
) {
    const removedInputs = inputs.filter((_, index) => index !== removeIndex);
    setInputs(removedInputs);
}

// 콘텐츠 수정 Modal에서 난이도 항목 순서 변경
export function moveDifficulty(
    index: number,
    direction: -1 | 1,
    inputs: Difficulty[],
    setInputs: SetStateFn<Difficulty[]>
) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= inputs.length) return;

    const reorderedInputs = [...inputs];
    [reorderedInputs[index], reorderedInputs[targetIndex]] = [
        reorderedInputs[targetIndex],
        reorderedInputs[index]
    ];
    setInputs(reorderedInputs);
}

// 입력된 콘텐츠의 난이도마다 빈 내용이 있는지 체크 여부
function isEmptyValue(inputs: Difficulty[]) {
    let isEmpty = false;
    inputs.forEach((input) => {
        if (input.difficulty.trim() === '') isEmpty = true;
    });
    return isEmpty;
}

// 데이터 추가 또는 수정 이벤트
export async function useOnAddData(
    inputName: string, 
    inputSimple: string,
    inputScreenNames: string,
    inputMax: number,
    inputs: Difficulty[],
    onClose: () => void,
    boss: Boss[],
    setBoss: SetStateFn<Boss[]>,
    isEditMode: boolean,
    editIndex: number
) {
    const screenNames = Array.from(new Set(inputScreenNames
        .split(/[\n,]/)
        .map((name) => name.trim())
        .filter(Boolean)));

    if (inputName.trim() === '') {
        addToast({
            title: "내용 없음",
            description: `콘텐츠 명이 비어있습니다. 입력 후 다시 시도해주세요.`,
            color: "danger"
        });
        return;
    } else if (isEmptyValue(inputs)) {
        addToast({
            title: "내용 없음",
            description: `난이도의 내용이 비어있습니다. 입력 후 다시 시도해주세요.`,
            color: "danger"
        });
        return;
    } else if (isEmptyValue(inputs)) {
        addToast({
            title: "내용 없음",
            description: `난이도의 내용이 비어있습니다. 입력 후 다시 시도해주세요.`,
            color: "danger"
        });
        return;
    } else if (isNaN(inputMax)) {
        addToast({
            title: "내용 없음",
            description: `최대 인원의 내용이 비어있습니다. 입력 후 다시 시도해주세요.`,
            color: "danger"
        });
        return;
    }

    const normalizedScreenNames = screenNames.map(normalizeScreenName);
    const duplicatedScreenName = boss.some((item, index) => index !== editIndex &&
        (item.screenNames ?? []).some((name) => normalizedScreenNames.includes(normalizeScreenName(name))));
    if (duplicatedScreenName) {
        addToast({
            title: "중복된 화면 표시 이름",
            description: "다른 콘텐츠에서 이미 사용 중인 화면 표시 이름이 있습니다.",
            color: "danger"
        });
        return;
    }

    if (isEditMode) {
        try {
            await requestBossMutation({
                type: 'edit',
                id: boss[editIndex].id,
                inputName,
                inputSimple,
                inputMax,
                screenNames,
                inputs
            });
            addToast({
                title: "데이터 수정 완료",
                description: `\"${inputName}\" 콘텐츠의 데이터를 수정하는데 성공하였습니다.`,
                color: "success"
            });
            const editBoss = [...boss];
            editBoss[editIndex].name = inputName;
            editBoss[editIndex].simple = inputSimple;
            editBoss[editIndex].screenNames = screenNames;
            editBoss[editIndex].max = inputMax;
            editBoss[editIndex].difficulty = inputs;
            setBoss(editBoss);
        } catch(err) {
            addToast({
                title: `데이터 수정 오류`,
                description: `데이터를 수정하는데 문제가 발생하였습니다.`,
                color: "danger"
            });
            console.error(err);
        }
    } else {
        try {
            const result = await requestBossMutation({
                type: 'add',
                inputName,
                inputSimple,
                inputMax,
                screenNames,
                inputs
            });
            if (!result.id) throw new Error('추가된 콘텐츠 ID를 확인할 수 없습니다.');
            addToast({
                title: "데이터 저장 완료",
                description: `\"${inputName}\" 콘텐츠의 데이터를 저장하는데 성공하였습니다.`,
                color: "success"
            });
            const newBoss: Boss = {
                name: inputName,
                simple: inputSimple,
                screenNames,
                max: inputMax,
                difficulty: inputs,
                id: result.id
            }
            setBoss([...(boss || []), newBoss]);
        } catch(err) {
            addToast({
                title: `데이터 저장 오류`,
                description: `데이터를 저장하는데 문제가 발생하였습니다.`,
                color: "danger"
            });
            console.error(err);
        }
    }
    onClose();
}

// 데이터 수정 버튼 이벤트
export function onClickEdit(
    index: number,
    setEditMode: SetStateFn<boolean>,
    setEditIndex: SetStateFn<number>,
    onOpen: () => void,
    selectBoss: Boss,
    setInputName: SetStateFn<string>,
    setInputSimple: SetStateFn<string>,
    setInputScreenNames: SetStateFn<string>,
    setInputMax: SetStateFn<number>,
    setInputs: SetStateFn<Difficulty[]>
) {
    setEditMode(true);
    setEditIndex(index);
    setInputName(selectBoss.name);
    setInputs(selectBoss.difficulty);
    setInputSimple(selectBoss.simple);
    setInputScreenNames((selectBoss.screenNames ?? []).join('\n'));
    setInputMax(selectBoss.max);
    onOpen();
}

function normalizeScreenName(value: string): string {
    return value.normalize('NFKC').replace(/[^0-9A-Za-z가-힣]/g, '').toLowerCase();
}

// 데이터 삭제 버튼 이벤트
export async function onClickRemove(
    removeIndex: number,
    boss: Boss[],
    setBoss: SetStateFn<Boss[]>,
) {
    if (confirm('데이터를 삭제하면 되돌릴 수 없습니다. 정말 데이터를 삭제하시겠습니까?')) {
        try {
            await requestBossMutation({ type: 'remove', id: boss[removeIndex].id });
            addToast({
                title: "데이터 삭제 완료",
                description: `\"${boss[removeIndex].name}\" 콘텐츠의 데이터를 저장하는데 성공하였습니다.`,
                color: "success"
            });
            const removedBoss = boss.filter((_, index) => index !== removeIndex);
            setBoss(removedBoss);
        } catch(err) {
            addToast({
                title: `데이터 삭제 오류`,
                description: `데이터를 삭제하는데 문제가 발생하였습니다.`,
                color: "danger"
            });
            console.error(err);
        }
    }
}
