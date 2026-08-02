'use client'

import { Skeleton } from "@heroui/react";

function SkeletonLine({ className }: { className: string }) {
    return <Skeleton className={`rounded-lg ${className}`} />;
}

export function WeeklyChecklistSkeleton() {
    return (
        <section
            aria-label="주간 숙제 현황을 불러오는 중"
            className="mb-6 w-full overflow-hidden rounded-2xl border border-gray-200/80 bg-white dark:border-white/10 dark:bg-[#171717]">
            <div className="border-b border-gray-200/80 px-4 py-4 sm:px-5 dark:border-white/10">
                <SkeletonLine className="h-7 w-40" />
                <SkeletonLine className="mt-2 h-4 w-64 max-w-full" />
            </div>
            <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 lg1200:grid-cols-3">
                {[0, 1, 2].map((item) => (
                    <div
                        key={item}
                        className="flex min-h-32 flex-col justify-center gap-3 rounded-xl border border-gray-200/80 bg-gray-50/60 p-4 dark:border-white/10 dark:bg-white/[0.025]">
                        <SkeletonLine className="h-5 w-28" />
                        <SkeletonLine className="h-3 w-full" />
                        <SkeletonLine className="h-3 w-4/5" />
                        <SkeletonLine className="h-3 w-2/3" />
                    </div>
                ))}
            </div>
        </section>
    );
}

export function WeeklyScheduleSkeleton() {
    return (
        <section
            aria-label="이번 주 일정을 불러오는 중"
            className="mb-6 w-full overflow-hidden rounded-2xl border border-gray-200/80 bg-white dark:border-white/10 dark:bg-[#171717]">
            <div className="border-b border-gray-200/80 px-4 py-4 sm:px-5 dark:border-white/10">
                <SkeletonLine className="h-7 w-32" />
                <SkeletonLine className="mt-2 h-4 w-56 max-w-full" />
            </div>
            <div className="overflow-hidden p-3 sm:p-4">
                <div className="grid grid-flow-col auto-cols-[minmax(172px,1fr)] gap-2 lg1200:grid-flow-row lg1200:grid-cols-7 lg1200:auto-cols-auto">
                    {[0, 1, 2, 3, 4, 5, 6].map((item) => (
                        <div
                            key={item}
                            className="min-h-48 rounded-xl border border-gray-200/80 bg-gray-50/60 p-2.5 dark:border-white/10 dark:bg-white/[0.025]">
                            <SkeletonLine className="h-8 w-full" />
                            <SkeletonLine className="mt-3 h-14 w-full" />
                            <SkeletonLine className="mt-2 h-14 w-full" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function HomeAuthenticatedContentSkeleton() {
    return (
        <>
            <WeeklyChecklistSkeleton />
            <WeeklyScheduleSkeleton />
        </>
    );
}
