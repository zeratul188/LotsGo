import { SetStateFn } from "@/utiils/utils";
import { addToast } from "@heroui/react";

// 저장된 경매가 계산 데이터
export type CalData = {
    person: number,
    gold: number,
    self: number,
    breakpoint: number,
    first: number,
    first25: number,
    first50: number,
    first75: number
}

// 저장된 기록들을 불러오기
export function loadData(setDatas: SetStateFn<CalData[]>) {
    const localData = localStorage.getItem('caldatas');
    if (localData) {
        const loadedData: CalData[] = JSON.parse(localData);
        setDatas(loadedData);
    }
}

// 인원 수 클릭 이벤트
export function useClickPersons(
    inputPerson: number, 
    setPerson: SetStateFn<number>, 
    setType: SetStateFn<string>
) {
    return (value: string) => {
        setType(value);
        if (value === 'custom') {
            if (!isNaN(inputPerson)) {
                if (inputPerson > 0) {
                    setPerson(inputPerson);
                    return;
                }
            }
            setPerson(1);
        }
        setPerson(Number(value));
    }
}

// 입찰가 금액을 표시할 문자열 반환 함수
export function formatGold(value: number): string {
    if (isNaN(value)) return '0';
    const result = Math.floor(value);
    return result.toLocaleString();
}

// 순익분기점 계산
export function getBreakpointGold(value: number, person: number): number {
    return Math.floor(value * 0.95 * (person - 1) / person);
}

// 저장하기 이벤트
export function useClickSaveData(
    datas: CalData[], 
    setDatas: SetStateFn<CalData[]>, 
    gold: number, 
    person: number
) {
    return () => {
        const copyDatas: CalData[] = structuredClone(datas);
        const newData: CalData = {
            person: person,
            gold: gold,
            self: Math.floor(gold * (person - 1) / person),
            breakpoint: getBreakpointGold(gold, person),
            first: getBreakpointGold(gold, person) / 1.1,
            first25: getBreakpointGold(gold, person) / 1.025,
            first50: getBreakpointGold(gold, person) / 1.05,
            first75: getBreakpointGold(gold, person) / 1.075
        }
        copyDatas.push(newData);
        setDatas(copyDatas);
        localStorage.setItem('caldatas', JSON.stringify(copyDatas));
    }
}

// 데이터 초기화
export function useClickResetDatas(setDatas: SetStateFn<CalData[]>, setPage: SetStateFn<number>) {
    return () => {
        if (confirm("모든 기록을 초기화하시겠습니까? 한번 초기화한 후에는 데이터를 복구할 수 없습니다.")) {
            setDatas([]);
            setPage(0);
            localStorage.removeItem('caldatas');
            addToast({
                title: "초기화 완료",
                description: `데이터를 모두 삭제하였습니다.`,
                color: "success"
            });
        }
    }
}