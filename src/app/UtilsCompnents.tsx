import {Spinner} from "@heroui/react";

export function LoadingComponent() {
    return (
        <div className="flex justify-center items-center flex-col p-5 sm:p-0 w-full h-[calc(100vh-105px)]">
            <Spinner size="lg" variant="gradient"/>
            <p className="mt-6">데이터를 불러오는 중입니다...</p>
        </div>
    )
}