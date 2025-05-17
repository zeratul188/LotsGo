import type { SetStateFn } from "@/utiils/utils";
import type { Boss, Difficulty } from "../api/checklist/boss/route";
import { useCallback } from "react";
import { addToast } from "@heroui/react";

// 콘텐츠 추가의 Modal에서 "난이도 추가" 버튼 클릭 시 데이터 추가 이벤트
export function useOnAddInput(setInputs: SetStateFn<Difficulty[]>) {
    const emptyDifficulty: Difficulty = {
        difficulty: '',
        level: 0,
        isBiweekly: false,
        gold: 0
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
        onValueChangeBiweekly: (isSelected: boolean, index: number) => updateInputData({ isBiweekly: isSelected }, index)
    }
}

// Modal을 닫았을 경우 데이터 초기화 이벤트
export function useClearData(
    setInputName: SetStateFn<string>, 
    setInputs: SetStateFn<Difficulty[]>,
    setEditMode: SetStateFn<boolean>,
    setEditIndex: SetStateFn<number>
) {
    return () => {
        setInputName('');
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
    inputs: Difficulty[],
    onClose: () => void,
    boss: Boss[],
    setBoss: SetStateFn<Boss[]>,
    isEditMode: boolean,
    editIndex: number
) {
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
            description: `난이도의 내용용이 비어있습니다. 입력 후 다시 시도해주세요.`,
            color: "danger"
        });
        return;
    }

    if (isEditMode) {
        const res = await fetch(`/api/checklist/boss`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                inputName: inputName,
                inputs: inputs,
                type: 'edit',
                id: boss[editIndex].id
            })
        });

        if (!res.ok) {
            addToast({
                title: `데이터 수정 오류 (${res.status})`,
                description: `데이터를 수정하는데 문제가 발생하였습니다.`,
                color: "danger"
            });
        } else {
            addToast({
                title: "데이터 수정 완료",
                description: `\"${inputName}\" 콘텐츠의 데이터를 수정하는데 성공하였습니다.`,
                color: "success"
            });
            const editBoss = [...boss];
            editBoss[editIndex].name = inputName;
            editBoss[editIndex].difficulty = inputs;
            setBoss(editBoss);
        }
    } else {
        const res = await fetch(`/api/checklist/boss`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                inputName: inputName,
                inputs: inputs,
                type: 'add'
            })
        });

        if (!res.ok) {
            addToast({
                title: `데이터 저장 오류 (${res.status})`,
                description: `데이터를 저장하는데 문제가 발생하였습니다.`,
                color: "danger"
            });
        } else {
            const data = await res.json();
            addToast({
                title: "데이터 저장 완료",
                description: `\"${inputName}\" 콘텐츠의 데이터를 저장하는데 성공하였습니다.`,
                color: "success"
            });
            const newBoss: Boss = {
                name: inputName,
                difficulty: inputs,
                id: data.id
            }
            setBoss([...(boss || []), newBoss]);
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
    setInputs: SetStateFn<Difficulty[]>
) {
    setEditMode(true);
    setEditIndex(index);
    setInputName(selectBoss.name);
    setInputs(selectBoss.difficulty);
    onOpen();
}

// 데이터 삭제 버튼 이벤트
export async function onClickRemove(
    removeIndex: number,
    boss: Boss[],
    setBoss: SetStateFn<Boss[]>,
) {
    if (confirm('데이터를 삭제하면 되돌릴 수 없습니다. 정말 데이터를 삭제하시겠습니까?')) {
        const res = await fetch(`/api/checklist/boss`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                inputName: "",
                inputs: [],
                type: 'remove',
                id: boss[removeIndex].id
            })
        });

        if (!res.ok) {
            addToast({
                title: `데이터 삭제 오류 (${res.status})`,
                description: `데이터를 삭제하는데 문제가 발생하였습니다.`,
                color: "danger"
            });
        } else {
            addToast({
                title: "데이터 삭제 완료",
                description: `\"${boss[removeIndex].name}\" 콘텐츠의 데이터를 저장하는데 성공하였습니다.`,
                color: "success"
            });
            const removedBoss = boss.filter((_, index) => index !== removeIndex);
            setBoss(removedBoss);
        }
    }
}