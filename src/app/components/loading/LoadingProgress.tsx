'use client'

import clsx from "clsx";
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from "react";

type LoadingProgressState = {
    isLoading: boolean;
    progress: number;
    label: string;
};

type LoadingProgressActions = {
    startTask: (id: string, label: string) => void;
    finishTask: (id: string) => void;
};

const LoadingProgressStateContext = createContext<LoadingProgressState>({
    isLoading: false,
    progress: 0,
    label: "데이터를 불러오는 중이에요"
});

const LoadingProgressActionsContext = createContext<LoadingProgressActions>({
    startTask: () => undefined,
    finishTask: () => undefined
});

export function LoadingProgressProvider({ children }: { children: React.ReactNode }) {
    const [tasks, setTasks] = useState<Map<string, string>>(new Map());
    const [progress, setProgress] = useState(0);
    const [isVisible, setVisible] = useState(false);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const startTask = useCallback((id: string, label: string) => {
        setTasks((current) => {
            const next = new Map(current);
            next.set(id, label);
            return next;
        });
    }, []);

    const finishTask = useCallback((id: string) => {
        setTasks((current) => {
            if (!current.has(id)) return current;
            const next = new Map(current);
            next.delete(id);
            return next;
        });
    }, []);

    useEffect(() => {
        if (tasks.size === 0) {
            if (!isVisible) return;
            setProgress(100);
            hideTimerRef.current = setTimeout(() => {
                setVisible(false);
                setProgress(0);
            }, 420);
            return;
        }

        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        setVisible(true);
        setProgress((current) => current === 0 || current >= 100 ? 7 : current);

        const interval = window.setInterval(() => {
            setProgress((current) => {
                if (current < 32) return Math.min(32, current + 5);
                if (current < 62) return Math.min(62, current + 3);
                if (current < 82) return Math.min(82, current + 1.5);
                if (current < 93) return Math.min(93, current + 0.45);
                return current;
            });
        }, 360);

        return () => window.clearInterval(interval);
    }, [isVisible, tasks.size]);

    useEffect(() => () => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    }, []);

    const label = Array.from(tasks.values()).at(-1) ?? "데이터를 불러오는 중이에요";
    const state = useMemo(() => ({
        isLoading: isVisible,
        progress,
        label
    }), [isVisible, label, progress]);
    const actions = useMemo(() => ({
        startTask,
        finishTask
    }), [finishTask, startTask]);

    return (
        <LoadingProgressActionsContext.Provider value={actions}>
            <LoadingProgressStateContext.Provider value={state}>
                {children}
            </LoadingProgressStateContext.Provider>
        </LoadingProgressActionsContext.Provider>
    );
}

export function useLoadingTask(label = "데이터를 불러오는 중이에요", enabled = true) {
    const id = useId();
    const { startTask, finishTask } = useContext(LoadingProgressActionsContext);

    useEffect(() => {
        if (!enabled) return;
        startTask(id, label);
        return () => finishTask(id);
    }, [enabled, finishTask, id, label, startTask]);
}

export function NavbarLoadingIndicator() {
    useLoadingTask("페이지 데이터를 불러오는 중이에요");

    return null;
}

export function NavbarLoadingBar() {
    const { isLoading, progress, label } = useContext(LoadingProgressStateContext);

    return (
        <div
            aria-hidden={!isLoading}
            aria-label={label}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={Math.round(progress)}
            role="progressbar"
            className={clsx(
                "pointer-events-none fixed inset-x-0 top-16 z-[60] h-[3px] overflow-visible transition-opacity duration-300",
                isLoading ? "opacity-100" : "opacity-0"
            )}>
            <div className="absolute inset-0 bg-primary/10 dark:bg-primary/15"/>
            <div
                className="relative h-full bg-gradient-to-r from-blue-600 via-primary to-sky-400 shadow-[0_0_8px_rgba(0,112,243,0.55)] transition-[width] duration-500 ease-out"
                style={{ width: `${progress}%` }}>
                <span className="absolute -right-2 top-1/2 h-3 w-7 -translate-y-1/2 rounded-full bg-sky-300/80 blur-[5px] animate-pulse"/>
                <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_7px_3px_rgba(125,211,252,0.9)]"/>
            </div>
        </div>
    );
}
