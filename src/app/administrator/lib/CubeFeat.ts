import { SetStateFn } from "@/utiils/utils";
import { Cube } from "../model/types";
import { addToast } from "@heroui/react";
import { addDoc, collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { firestore } from "@/utiils/firebase";

// 큐브 데이터 불러오기
export async function loadCubes(
    setCubes: SetStateFn<Cube[]>,
    setLoading: SetStateFn<boolean>
) {
    try {
        const snapshot = await getDocs(collection(firestore, 'cube'));
        const cubes: Cube[] = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            level: Number(doc.data().level),
            tier: doc.data().tier ? Number(doc.data().tier) : 0,
            reward: doc.data().reward ? Number(doc.data().reward) : 0
        }));
        cubes.sort((a, b) => a.level - b.level);
        setCubes(cubes);
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

// 큐브 추가
export function useOnAddCube(
    inputName: string, 
    inputLevel: number, 
    inputTier: number,
    inputReward: number,
    cubes: Cube[],
    setCubes: SetStateFn<Cube[]>,
    setInputName: SetStateFn<string>,
    setInputLevel: SetStateFn<number>,
    setInputTier: SetStateFn<number>,
    setInputReward: SetStateFn<number>
) {
    return async () => {
        if (inputName.trim() === '') {
            addToast({
                title: "내용 없음",
                description: `큐브명이 비어있습니다. 입력 후 다시 시도해주세요.`,
                color: "danger"
            });
            return;
        }
        try {
            const cube = {
                name: inputName,
                level: inputLevel,
                tier: inputTier,
                reward: inputReward
            }
            const addRef = await addDoc(collection(firestore, 'cube'), cube);
            addToast({
                title: "데이터 저장 완료",
                description: `\"${inputName}\" 콘텐츠의 데이터를 저장하는데 성공하였습니다.`,
                color: "success"
            });
            const newCube: Cube = {
                id: addRef.id,
                name: inputName,
                level: inputLevel,
                tier: inputTier,
                reward: inputReward
            }
            const newCubes: Cube[] = [...(cubes || []), newCube];
            newCubes.sort((a, b) => a.level - b.level);
            setCubes(newCubes);
        } catch(err) {
            addToast({
                title: `데이터 저장 오류`,
                description: `데이터를 저장하는데 문제가 발생하였습니다.`,
                color: "danger"
            });
            console.error(err);
        }
        setInputName('');
        setInputLevel(0);
        setInputTier(0);
        setInputReward(0);
    }
}

// 큐브 제거
export async function handleRemoveCube(
    index: number,
    cubes: Cube[],
    setCubes: SetStateFn<Cube[]>
) {
    const removeID = cubes[index].id;
    const prevCubes = [...cubes];
    const removedCubes = cubes.filter((_, idx) => idx !== index);
    setCubes(removedCubes);

    try {
        const removeRef = doc(firestore, 'cube', removeID);
        await deleteDoc(removeRef);
        addToast({
            title: "데이터 삭제 완료",
            description: `데이터를 삭제하는데 성공하였습니다.`,
            color: "success"
        });
    } catch(err) {
        addToast({
            title: `데이터 삭제 오류`,
            description: `데이터를 삭제제하는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        setCubes(prevCubes);
        console.error(err);
    }
}
