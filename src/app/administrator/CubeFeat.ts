import { SetStateFn } from "@/utiils/utils";
import { Cube } from "../api/checklist/cube/route";
import { addToast } from "@heroui/react";

// 큐브 추가
export function useOnAddCube(
    inputName: string, 
    inputLevel: number, 
    cubes: Cube[],
    setCubes: SetStateFn<Cube[]>,
    setInputName: SetStateFn<string>,
    setInputLevel: SetStateFn<number>
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
        const res = await fetch(`/api/checklist/cube`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: inputName,
                level: inputLevel,
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
            const newCube: Cube = {
                id: data.id,
                name: inputName,
                level: inputLevel
            }
            const newCubes: Cube[] = [...(cubes || []), newCube];
            newCubes.sort((a, b) => a.level - b.level);
            setCubes(newCubes);
        }
        setInputName('');
        setInputLevel(0);
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

    const removeRes = await fetch(`/api/checklist/cube`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: removeID,
            type: 'remove'
        })
    });
    if (!removeRes.ok) {
        addToast({
            title: `데이터 삭제 오류 (${removeRes.status})`,
            description: `데이터를 삭제제하는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        setCubes(prevCubes);
    } else {
        addToast({
            title: "데이터 삭제 완료",
            description: `데이터를 삭제하는데 성공하였습니다.`,
            color: "success"
        });
    }
}