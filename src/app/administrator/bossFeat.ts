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

// 데이터 추가 이벤트
export async function useOnAddData(
    inputName: string, 
    inputs: Difficulty[],
    onClose: () => void,
    boss: Boss[],
    setBoss: SetStateFn<Boss[]>
) {
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
            title: "데이터 저장 오류",
            description: `데이터를 저장하는데 문제가 발생하였습니다.`,
            color: "danger"
        });
    } else {
        addToast({
            title: "데이터 저장 완료",
            description: `\"${inputName}\" 콘텐츠의 데이터를 저장하는데 성공하였습니다.`,
            color: "success"
        });
        const newBoss: Boss = {
            name: inputName,
            difficulty: inputs
        }
        setBoss([...(boss || []), newBoss]);
    }
    onClose();
}