import { useEffect, useState } from "react";
import { DateValue } from "@internationalized/date";

export type SetStateFn<T> = React.Dispatch<React.SetStateAction<T>>;

// 모바일 화면인지 확인하는 함수
export function useMobileQuery(): boolean {
    const query = '(max-width: 768px)';
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        setMatches(media.matches);

        const handler = () => setMatches(media.matches);
        media.addEventListener('change', handler);
        return () => media.removeEventListener('change', handler);
    });

    return matches;
}

// 등급 별 색깔 확인 함수
export function getColorTextByGrade(grade: string): string {
    switch(grade) {
        case '일반': return "text-normal";
        case '고급': return "text-advanced";
        case '희귀': return "text-rare";
        case '영웅': return "text-hero"
        case '전설': return "text-legend"
        case '유물': return "text-relics";
        case '고대': return "text-ancient";
        case '에스더': return "text-special";
    }
    return "#000000";
}

// 등급 별 색깔 확인 함수
export function getBackgroundByGrade(grade: string): string {
    switch(grade) {
        case '일반': return "bgc-normal";
        case '고급': return "bgc-advanced";
        case '희귀': return "bgc-rare";
        case '영웅': return "bgc-hero"
        case '전설': return "bgc-legend"
        case '유물': return "bgc-relics";
        case '고대': return "bgc-ancient";
        case '에스더': return "bgc-special";
    }
    return "bgc-nothing";
}

// 등급 별 색깔 확인 함수
export function getBackgroundRightByGrade(grade: string): string {
    switch(grade) {
        case '일반': return "bgc-normal-r";
        case '고급': return "bgc-advanced-r";
        case '희귀': return "bgc-rare-r";
        case '영웅': return "bgc-hero-r"
        case '전설': return "bgc-legend-r"
        case '유물': return "bgc-relics-r";
        case '고대': return "bgc-ancient-r";
        case '에스더': return "bgc-special-r";
    }
    return "bgc-nothing";
}

// DateValue 객체를 Date 객체로 변환
export function dateValueToDate(date: DateValue | null): Date | null {
    if (!date) return null;
    return date.toDate("Asia/Seoul"); // 서울 타임존으로 변경
}