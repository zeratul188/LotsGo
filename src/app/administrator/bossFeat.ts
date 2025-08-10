import type { SetStateFn } from "@/utiils/utils";
import type { Boss, Difficulty } from "../api/checklist/boss/route";
import { useCallback } from "react";
import { addToast } from "@heroui/react";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { firestore } from "@/utiils/firebase";

// 콘텐츠 데이터 로딩 함수
export async function loadBoss(
    setLoading: SetStateFn<boolean>,
    setBoss: SetStateFn<Boss[]>
) {
    try {
        const snapshot = await getDocs(collection(firestore, 'boss'));
        const bosses: Boss[] = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            simple: doc.data().simple ? doc.data().simple : '',
            difficulty: doc.data().difficulty.map((d: any) => ({
                difficulty: d.difficulty,
                stage: d.stage ?? 0,
                level: d.level,
                isBiweekly: d.isBiweekly,
                gold: d.gold,
                boundGold: d.boundGold ?? 0,
                bonus: d.bonus ?? 0,
                isOnce: d.isOnce ?? false
            }))
        }));
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
    setInputs: SetStateFn<Difficulty[]>,
    setEditMode: SetStateFn<boolean>,
    setEditIndex: SetStateFn<number>
) {
    return () => {
        setInputName('');
        setInputSimple('');
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
    inputSimple: string,
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

    const inputBoss = {
        name: inputName,
        simple: inputSimple,
        difficulty: inputs
    }
    if (isEditMode) {
        try {
            const docRef = doc(firestore, "boss", boss[editIndex].id);
            await updateDoc(docRef, inputBoss);
            addToast({
                title: "데이터 수정 완료",
                description: `\"${inputName}\" 콘텐츠의 데이터를 수정하는데 성공하였습니다.`,
                color: "success"
            });
            const editBoss = [...boss];
            editBoss[editIndex].name = inputName;
            editBoss[editIndex].simple = inputSimple;
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
            const addRef = await addDoc(collection(firestore, 'boss'), inputBoss);
            addToast({
                title: "데이터 저장 완료",
                description: `\"${inputName}\" 콘텐츠의 데이터를 저장하는데 성공하였습니다.`,
                color: "success"
            });
            const newBoss: Boss = {
                name: inputName,
                simple: inputSimple,
                difficulty: inputs,
                id: addRef.id
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
    setInputs: SetStateFn<Difficulty[]>
) {
    setEditMode(true);
    setEditIndex(index);
    setInputName(selectBoss.name);
    setInputs(selectBoss.difficulty);
    setInputSimple(selectBoss.simple);
    onOpen();
}

// 데이터 삭제 버튼 이벤트
export async function onClickRemove(
    removeIndex: number,
    boss: Boss[],
    setBoss: SetStateFn<Boss[]>,
) {
    if (confirm('데이터를 삭제하면 되돌릴 수 없습니다. 정말 데이터를 삭제하시겠습니까?')) {
        try {
            const removeRef = doc(firestore, "boss", boss[removeIndex].id);
            await deleteDoc(removeRef);
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