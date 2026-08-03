'use client'

import { Skeleton } from "@heroui/react";
import { useLoadingTask } from "../../components/loading/LoadingProgress";

function SkeletonLine({ className }: { className: string }) {
    return <Skeleton className={`rounded-lg ${className}`}/>;
}

function ChecklistCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#171717]">
            <div className="flex items-center gap-3 border-b border-gray-200/80 pb-3 dark:border-white/10">
                <SkeletonLine className="h-10 w-10 shrink-0 rounded-full"/>
                <div className="min-w-0 grow">
                    <SkeletonLine className="h-4 w-32 max-w-full"/>
                    <SkeletonLine className="mt-2 h-3 w-48 max-w-full"/>
                </div>
                <SkeletonLine className="h-7 w-16 shrink-0"/>
            </div>
            <SkeletonLine className="mt-4 h-3 w-full"/>
            <SkeletonLine className="mt-2 h-3 w-4/5"/>
            <div className="mt-4 space-y-2">
                {[0, 1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center gap-2 rounded-lg border border-gray-200/70 px-2.5 py-2 dark:border-white/10">
                        <SkeletonLine className="h-4 w-4 shrink-0 rounded-full"/>
                        <SkeletonLine className="h-3 w-32 max-w-[55%]"/>
                        <SkeletonLine className="ml-auto h-6 w-12 shrink-0"/>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function ChecklistLoadingSkeleton() {
    useLoadingTask("캐릭터 숙제 데이터를 불러오고 있어요");

    return (
        <section
            aria-label="캐릭터별 숙제 현황을 불러오는 중"
            className="mx-auto mt-5 w-full max-w-[1280px]">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <div>
                    <SkeletonLine className="h-5 w-36"/>
                    <SkeletonLine className="mt-2 h-3 w-56 max-w-full"/>
                </div>
                <SkeletonLine className="h-8 w-24 shrink-0"/>
            </div>
            <div className="grid grid-cols-1 gap-4 min-[1137px]:grid-cols-2 min-[1713px]:grid-cols-3">
                {[0, 1, 2, 3, 4, 5].map((item) => (
                    <ChecklistCardSkeleton key={item}/>
                ))}
            </div>
        </section>
    );
}
