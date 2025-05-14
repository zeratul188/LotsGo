import {Spinner} from "@heroui/react";

type LoadingComponentProps = {
    heightStyle: string;
}

export function LoadingComponent({heightStyle}: LoadingComponentProps) {
    return (
        <div className={`flex justify-center items-center flex-col p-5 sm:p-0 w-full ${heightStyle}`}>
            <Spinner size="lg" variant="gradient"/>
            <p className="mt-6">데이터를 불러오는 중입니다...</p>
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