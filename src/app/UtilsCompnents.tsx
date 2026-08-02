'use client'

import { Spinner } from "@heroui/react";
import { useLoadingTask } from "./components/loading/LoadingProgress";

type LoadingComponentProps = {
    heightStyle: string;
    message?: string;
    detail?: string;
}

export function LoadingComponent({
    heightStyle,
    message = "데이터 불러오는 중..."
}: LoadingComponentProps) {
    useLoadingTask(message);

    return (
        <div
            aria-live="polite"
            className={`flex w-full flex-col items-center justify-center gap-3 p-5 ${heightStyle}`}>
            <Spinner size="lg" color="primary"/>
            <p className="text-sm font-medium text-default-500">{message}</p>
        </div>
    )
}

export function EmptyComponent({heightStyle}: LoadingComponentProps) {
    return (
        <div className={`flex justify-center items-center flex-col p-5 sm:p-0 w-full ${heightStyle}`}>
            <Spinner size="lg" variant="dots" color="danger"/>
            <p className="mt-3">데이터가 존재하지 않습니다.</p>
        </div>
    )
}
