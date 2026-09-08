'use client'

import {
    addToast,
    Button,
    Card,
    CardBody,
    Chip,
    Progress,
    Select,
    SelectItem,
} from "@heroui/react";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import {
    categoryMatchesPart,
    chooseAdvice,
    completedElixir,
    createElixirGame,
    finishElixir,
    formatAdviceText,
    forgeElixir,
    getAdvicePreview,
    getAdviceTargets,
    getAppliedEffects,
    refreshOptions,
    selectEffect,
} from "../lib/elixirFeat";
import {
    AdviceOffer,
    createEmptyElixirStorage,
    ELIXIR_PARTS,
    ElixirGame,
    ElixirPart,
    ElixirStorage,
    ELIXIR_TOTAL_TURNS,
    normalizeElixirStorage,
    StoredElixir,
    elixirLevel,
} from "../model/types";
import "./elixir.css";

const SAGE_NAMES = ["비르디타스", "치트리니", "루베도"];
const GUEST_ELIXIR_STORAGE_KEY = "lotsgo:elixir-storage:v1";

const refreshAccessToken = async () => {
    const response = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
    const data = await response.json().catch(() => null);
    if (!response.ok || typeof data?.accessToken !== "string") return null;
    sessionStorage.setItem("token", data.accessToken);
    return data.accessToken as string;
};

const requestElixirStorage = async (init?: RequestInit) => {
    let token = sessionStorage.getItem("token");
    if (!token) throw new Error("로그인 토큰이 없습니다.");
    const request = (accessToken: string) => fetch("/api/addons/elixir", {
        ...init,
        credentials: "include",
        headers: { ...(init?.headers ?? {}), authorization: `Bearer ${accessToken}` },
    });
    let response = await request(token);
    if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) response = await request(refreshed);
    }
    return response;
};

const LEVEL_TRACK_COLORS = [
    "border-amber-500 bg-amber-400",
    "border-emerald-600 bg-emerald-500",
    "border-sky-600 bg-sky-500",
    "border-violet-600 bg-violet-500",
    "border-orange-600 bg-orange-500",
    "border-rose-600 bg-rose-500",
];

function PointTrack({ points, sealed, delta = 0, animationId = 0, compact = false }: {
    points: number;
    sealed?: boolean;
    delta?: number;
    animationId?: number;
    compact?: boolean;
}) {
    const color = LEVEL_TRACK_COLORS[elixirLevel(points)];
    return (
        <div className={clsx("grid grid-cols-10", compact ? "gap-0.5" : "gap-1")} aria-label={`${points}/10칸`}>
            {Array.from({ length: 10 }, (_, index) => {
                const gained = delta > 0 && index >= points - delta && index < points;
                const lost = delta < 0 && index >= points && index < points - delta;
                return (
                <span
                    key={`${animationId}-${index}`}
                    className={clsx(
                        "rounded-sm border",
                        compact ? "h-1.5" : "h-3",
                        sealed
                            ? "border-danger-300 bg-danger-100 dark:bg-danger-950/40"
                            : index < points
                            ? color
                            : "border-default-200 bg-default-100",
                        gained && "elixir-track-cell--gain",
                        lost && "elixir-track-cell--loss",
                    )}/>
                );
            })}
        </div>
    );
}

function AlignmentStack({ alignment, stack }: { alignment: "order" | "chaos" | null; stack: number }) {
    if (alignment === null) return <span className="text-[10px] font-semibold text-default-400 min-[700px]:text-xs">중립</span>;
    const maximum = alignment === "order" ? 3 : 6;
    return (
        <div className="flex items-center gap-1 min-[700px]:gap-2" aria-label={`${alignment === "order" ? "질서" : "혼돈"} ${stack}/${maximum}`}>
            <span className={clsx("text-[10px] font-bold min-[700px]:text-xs", alignment === "order" ? "text-sky-600" : "text-fuchsia-600")}>
                {alignment === "order" ? "질서" : "혼돈"}
            </span>
            <span className="flex items-center gap-0.5 min-[700px]:gap-1">
                {Array.from({ length: maximum }, (_, index) => <span
                    key={index}
                    className={clsx(
                        "block h-2 w-2 border transition-all min-[700px]:h-3 min-[700px]:w-3 min-[700px]:border-2",
                        alignment === "order" ? "rotate-45 border-sky-500" : "rounded-full border-fuchsia-500",
                        index < stack
                            ? alignment === "order" ? "bg-sky-500" : "bg-fuchsia-500"
                            : "bg-transparent",
                    )}/>) }
            </span>
        </div>
    );
}

function AdviceRefreshButton({ count, onPress }: { count: number; onPress: () => void }) {
    return (
        <Button
            radius="full"
            variant="bordered"
            isDisabled={count <= 0}
            aria-label={`다른 조언 보기, ${count}회 남음`}
            onPress={onPress}
            className="h-11 shrink-0 border-secondary-200 bg-secondary-50/70 px-2.5 pr-2 text-secondary-700 shadow-sm transition-shadow hover:shadow-md dark:border-secondary-800 dark:bg-secondary-950/25 dark:text-secondary-300"
            startContent={
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-lg font-bold leading-none text-secondary-foreground" aria-hidden="true">↻</span>
            }>
            <span className="font-bold">다른 조언 보기</span>
            <span className="ml-1 flex h-7 min-w-7 items-center justify-center rounded-full bg-content1 px-2 text-xs font-black text-secondary shadow-sm">
                {count}회
            </span>
        </Button>
    );
}

function EffectSelection({ game, onSelect, onRefresh }: {
    game: ElixirGame;
    onSelect: (index: number) => void;
    onRefresh: () => void;
}) {
    const finalSelection = game.selectedEffects.length === 4;
    return (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
            <Card className="border border-default-200 shadow-sm">
                <CardBody className="gap-4 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <Chip size="sm" color="secondary" variant="flat">효과 정제 {game.selectedEffects.length + 1}/5</Chip>
                            <h2 className="mt-3 text-xl font-bold">{finalSelection ? "마지막 효과를 선택하세요" : "세 효과 중 하나를 선택하세요"}</h2>
                            <p className="mt-1 text-sm text-default-500">{finalSelection ? "원하는 효과를 직접 선택할 수 있습니다. 이미 선택한 효과와 선택된 부위 전용 효과는 제외됩니다." : "이미 선택했거나 현재 등장한 효과는 중복해서 나오지 않습니다."}</p>
                        </div>
                        <AdviceRefreshButton count={game.refreshes} onPress={onRefresh}/>
                    </div>
                    <div className={clsx("grid gap-3", finalSelection ? "sm:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-3")}>
                        {game.effectOptions.map((effect, index) => (
                            <button
                                key={`${effect.name}-${index}`}
                                type="button"
                                onClick={() => onSelect(index)}
                                className="group flex min-h-0 cursor-pointer items-center justify-between gap-3 rounded-2xl border border-default-200 bg-content1 p-4 text-left transition hover:-translate-y-0.5 hover:border-secondary hover:bg-secondary-50/40 hover:shadow-lg dark:hover:bg-secondary-950/20">
                                <p className="min-w-0 break-keep text-lg font-bold group-hover:text-secondary">{effect.name}</p>
                                <span className={clsx(
                                    "inline-flex shrink-0 rounded-full px-2 py-1 text-xs font-semibold",
                                    effect.category === "공용"
                                        ? "bg-default-100 text-default-600"
                                        : "bg-secondary-100 text-secondary-700 dark:bg-secondary-950/40 dark:text-secondary-300",
                                )}>{effect.category}</span>
                            </button>
                        ))}
                    </div>
                </CardBody>
            </Card>
            <Card className="border border-default-200 shadow-sm">
                <CardBody className="gap-3 p-5">
                    <h3 className="font-bold">선택한 효과</h3>
                    {Array.from({ length: 5 }, (_, index) => {
                        const effect = game.selectedEffects[index];
                        return (
                            <div key={index} className="flex min-h-14 items-center gap-3 rounded-xl border border-default-200 px-3 py-2">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-default-100 text-xs font-bold">{index + 1}</span>
                                {effect ? <div className="min-w-0">
                                    <p className="truncate font-semibold">{effect.name}</p>
                                    <p className="text-xs text-default-400">{effect.category}</p>
                                </div> : <span className="text-sm text-default-400">효과 선택 대기</span>}
                            </div>
                        );
                    })}
                </CardBody>
            </Card>
        </div>
    );
}

function ForgingWorkspace({ game, completionProgress, pendingSage, pendingTarget, onConfirmAdvice, onForge, onPending, onTarget, onRefresh }: {
    game: ElixirGame;
    completionProgress: number;
    pendingSage: number | null;
    pendingTarget: number | null;
    onConfirmAdvice: () => void;
    onForge: () => void;
    onPending: (sageIndex: number | null) => void;
    onTarget: (index: number) => void;
    onRefresh: () => void;
}) {
    const pendingAdvice = pendingSage === null ? null : game.advices.find((advice) => advice.sageIndex === pendingSage) ?? null;
    const targets = pendingAdvice ? getAdviceTargets(game, pendingAdvice) : [];
    const adviceApplied = Boolean(game.selectedAdvice);
    const needsTarget = pendingAdvice?.target === "selected";
    const canConfirm = Boolean(pendingAdvice && (!needsTarget || pendingTarget !== null && targets.includes(pendingTarget)));
    const resultMessages = game.resultMessages ?? [];
    const lastChanges = game.lastChanges ?? [];
    const greatSuccessSlots = game.greatSuccessSlots ?? [];
    const animationId = game.animationId ?? 0;
    const sealing = game.turnsRemaining <= 3 && !game.forceNormalAdvice;
    const finalizing = game.phase === "finalizing";
    const preview = pendingAdvice && !adviceApplied
        ? getAdvicePreview(game, pendingAdvice, pendingTarget ?? undefined)
        : null;
    return (
        <div className="grid gap-5 min-[700px]:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <div className="fixed inset-x-2 bottom-2 z-40 flex max-h-[40vh] flex-col overflow-hidden rounded-2xl border border-secondary-200 bg-content1/95 p-3 shadow-2xl backdrop-blur-md min-[700px]:hidden">
                <div className="mb-2 flex shrink-0 items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-black">효과 현황</p>
                        <p className="text-[11px] text-default-500">{needsTarget && !adviceApplied ? "효과를 눌러 조언 대상을 선택하세요." : `남은 연성 ${game.turnsRemaining}회`}</p>
                    </div>
                    <Chip size="sm" color={sealing ? "danger" : "secondary"} variant="flat">{sealing ? "봉인 연성" : "효과 연성"}</Chip>
                </div>
                <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto">
                    {game.slots.map((slot, index) => {
                        const canTarget = Boolean(needsTarget && !adviceApplied && targets.includes(index));
                        const change = lastChanges.find((entry) => entry.index === index);
                        const great = greatSuccessSlots.includes(index);
                        const displayedProbability = adviceApplied
                            ? game.turnPlan?.probabilities[index] ?? slot.probability
                            : preview?.[index].probability ?? slot.probability;
                        const displayedGreatSuccess = preview?.[index].greatSuccess ?? slot.greatSuccess;
                        const displayedPoints = preview?.[index].points ?? slot.points;
                        const probabilityPreviewed = !adviceApplied && Math.abs(displayedProbability - slot.probability) > 0.001;
                        const greatSuccessPreviewed = !adviceApplied && Math.abs(displayedGreatSuccess - slot.greatSuccess) > 0.001;
                        const pointsPreviewed = !adviceApplied && displayedPoints !== slot.points;
                        return (
                            <button
                                key={`mobile-${slot.effect.name}-${index}-${animationId}`}
                                type="button"
                                disabled={!canTarget}
                                onClick={() => onTarget(index)}
                                className={clsx(
                                    "w-full rounded-xl border px-2.5 py-2 text-left transition",
                                    slot.sealed ? "border-danger-300/60 bg-danger-50/70 opacity-65 dark:bg-danger-950/20" : "border-default-200 bg-content1",
                                    canTarget && "cursor-pointer hover:border-warning hover:bg-warning-50/60 dark:hover:bg-warning-950/20",
                                    canTarget && pendingTarget === index && "border-warning bg-warning-50 ring-2 ring-warning/30 dark:bg-warning-950/20",
                                    change?.pointsDelta && "elixir-slot--changed",
                                    great && "elixir-slot--great-success",
                                )}>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex min-w-0 items-center gap-1.5">
                                        <span className="shrink-0 text-[10px] font-bold text-default-400">{index + 1}번</span>
                                        <span className={clsx("truncate text-xs font-bold", slot.sealed && "line-through")}>{slot.effect.name}</span>
                                        {slot.sealed && <span className="shrink-0 text-[10px] font-bold text-danger">봉인</span>}
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1.5 text-[11px] font-black tabular-nums">
                                        {change?.pointsDelta ? <span className="text-secondary">{change.pointsDelta > 0 ? "+" : ""}{change.pointsDelta}</span> : null}
                                        {great && <span className="text-amber-500">대성공</span>}
                                        <span>Lv.{elixirLevel(displayedPoints)} · {displayedPoints}/10</span>
                                    </div>
                                </div>
                                <div className="mt-1.5">
                                    <PointTrack
                                        points={displayedPoints}
                                        sealed={slot.sealed}
                                        delta={pointsPreviewed ? displayedPoints - slot.points : change?.pointsDelta ?? 0}
                                        animationId={pointsPreviewed ? animationId + pendingSage! + 1 : animationId}
                                        compact/>
                                </div>
                                <div className="mt-1 flex items-center justify-between gap-2 text-[10px] tabular-nums text-default-500">
                                    <span>연성 {probabilityPreviewed ? `${slot.probability.toFixed(1)}% → ` : ""}<strong className={clsx(probabilityPreviewed && "text-secondary")}>{displayedProbability.toFixed(1)}%</strong></span>
                                    <span>대성공 {greatSuccessPreviewed ? `${slot.greatSuccess.toFixed(1)}% → ` : ""}<strong className={clsx(greatSuccessPreviewed && "text-amber-600")}>{displayedGreatSuccess.toFixed(1)}%</strong></span>
                                </div>
                            </button>
                        );
                    })}
                </div>
                {!finalizing && (
                    <div className="mt-2 shrink-0 border-t border-default-200 pt-2">
                        {!adviceApplied ? (
                            <Button color="secondary" size="sm" isDisabled={!canConfirm} onPress={onConfirmAdvice} className="w-full font-bold">
                                {needsTarget && pendingTarget === null ? "효과를 선택하세요" : "조언 선택"}
                            </Button>
                        ) : (
                            <Button color="warning" size="sm" onPress={onForge} className="w-full font-black">연성하기</Button>
                        )}
                    </div>
                )}
            </div>

            <Card className="hidden border border-default-200 shadow-sm min-[700px]:flex">
                <CardBody className="gap-3 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <Chip size="sm" color={sealing ? "danger" : "secondary"} variant="flat">
                                {sealing ? "봉인 연성" : "효과 연성"}
                            </Chip>
                            <h2 className="mt-2 text-xl font-bold">남은 연성 {game.turnsRemaining}회</h2>
                        </div>
                    </div>
                    <Progress value={(ELIXIR_TOTAL_TURNS - game.turnsRemaining) / ELIXIR_TOTAL_TURNS * 100} color="secondary" size="sm" aria-label="연성 진행도"/>
                    {needsTarget && !adviceApplied && (
                        <div className="rounded-xl border border-warning-300 bg-warning-50 px-3 py-2 text-sm font-semibold text-warning-700 dark:bg-warning-950/20">
                            조언을 적용할 효과를 아래 목록에서 선택하세요.
                        </div>
                    )}
                    <div className="mt-1 grid gap-3">
                        {game.slots.map((slot, index) => {
                            const canTarget = Boolean(needsTarget && !adviceApplied && targets.includes(index));
                            const change = lastChanges.find((entry) => entry.index === index);
                            const great = greatSuccessSlots.includes(index);
                            const displayedProbability = adviceApplied
                                ? game.turnPlan?.probabilities[index] ?? slot.probability
                                : preview?.[index].probability ?? slot.probability;
                            const displayedGreatSuccess = preview?.[index].greatSuccess ?? slot.greatSuccess;
                            const displayedPoints = preview?.[index].points ?? slot.points;
                            const probabilityPreviewed = !adviceApplied && Math.abs(displayedProbability - slot.probability) > 0.001;
                            const greatSuccessPreviewed = !adviceApplied && Math.abs(displayedGreatSuccess - slot.greatSuccess) > 0.001;
                            const pointsPreviewed = !adviceApplied && displayedPoints !== slot.points;
                            return (
                            <button key={`${slot.effect.name}-${index}-${animationId}`} type="button" disabled={!canTarget} onClick={() => onTarget(index)} className={clsx(
                                "relative w-full rounded-2xl border p-3 text-left transition",
                                slot.sealed ? "border-danger-300/60 bg-danger-50/50 opacity-70 dark:bg-danger-950/15" : "border-default-200 bg-content1",
                                canTarget && "cursor-pointer hover:border-warning hover:bg-warning-50/50 hover:shadow-md dark:hover:bg-warning-950/15",
                                canTarget && pendingTarget === index && "border-warning bg-warning-50 ring-2 ring-warning/30 dark:bg-warning-950/20",
                                change?.pointsDelta && "elixir-slot--changed",
                                great && "elixir-slot--great-success",
                            )}>
                                {great && <span className="elixir-great-badge absolute -right-2 -top-2 z-10 rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-amber-950 shadow-lg">대성공!</span>}
                                <div className="mb-2 flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs font-bold text-default-400">{index + 1}번</span>
                                            <p className={clsx("font-bold", slot.sealed && "line-through")}>{slot.effect.name}</p>
                                            {slot.sealed && <Chip size="sm" color="danger" variant="flat">봉인</Chip>}
                                        </div>
                                        <p className="mt-0.5 text-xs text-default-400">{slot.effect.category}</p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="font-bold text-secondary">
                                            {pointsPreviewed && <span className="text-default-400">Lv.{elixirLevel(slot.points)} → </span>}
                                            Lv.{elixirLevel(displayedPoints)}
                                        </p>
                                        <p className="text-xs tabular-nums text-default-500">
                                            {pointsPreviewed && <>{slot.points}/10 → </>}{displayedPoints}/10
                                        </p>
                                    </div>
                                </div>
                                <PointTrack
                                    points={displayedPoints}
                                    sealed={slot.sealed}
                                    delta={pointsPreviewed ? displayedPoints - slot.points : change?.pointsDelta ?? 0}
                                    animationId={pointsPreviewed ? animationId + pendingSage! + 1 : animationId}/>
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    <div className={clsx(
                                        "rounded-xl border px-3 py-2",
                                        probabilityPreviewed ? "border-secondary-300 bg-secondary-50 dark:bg-secondary-950/20" : "border-default-200 bg-default-100/70",
                                    )}>
                                        <p className="text-[11px] font-bold text-default-500">연성 확률</p>
                                        <p className="mt-0.5 text-base font-black tabular-nums">
                                            {probabilityPreviewed && <><span className="text-default-500">{slot.probability.toFixed(1)}%</span><span className="mx-1.5 text-secondary">→</span></>}
                                            <span className={clsx(probabilityPreviewed && "text-secondary")}>{displayedProbability.toFixed(1)}%</span>
                                        </p>
                                    </div>
                                    <div className={clsx(
                                        "rounded-xl border px-3 py-2 text-right",
                                        greatSuccessPreviewed ? "border-amber-300 bg-amber-50 dark:bg-amber-950/20" : "border-default-200 bg-default-100/70",
                                    )}>
                                        <p className="text-[11px] font-bold text-default-500">대성공 확률</p>
                                        <p className="mt-0.5 text-base font-black tabular-nums">
                                            {greatSuccessPreviewed && <><span className="text-default-500">{slot.greatSuccess.toFixed(1)}%</span><span className="mx-1.5 text-amber-500">→</span></>}
                                            <span className={clsx(greatSuccessPreviewed && "text-amber-600")}>{displayedGreatSuccess.toFixed(1)}%</span>
                                        </p>
                                    </div>
                                </div>
                            </button>
                            );
                        })}
                    </div>
                </CardBody>
            </Card>

            <Card className="border border-default-200 shadow-sm">
                <CardBody className="gap-4 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-bold">{finalizing ? "마지막 연성 결과" : "현자의 조언"}</h2>
                            <p className="mt-1 text-sm text-default-500">
                                {finalizing ? "마지막으로 연성된 효과를 확인하세요." : "같은 조언과 같은 그룹은 한 차수에 중복되지 않습니다."}
                            </p>
                        </div>
                        {!finalizing && <AdviceRefreshButton count={adviceApplied ? 0 : game.refreshes} onPress={onRefresh}/>} 
                    </div>
                    {!finalizing && <div className="grid grid-cols-1 gap-2 min-[700px]:gap-3 md:grid-cols-3">
                        {game.advices.map((advice) => {
                            const sage = game.sages[advice.sageIndex];
                            const exhausted = Boolean(advice.disabled || sage.exhausted);
                            const selected = adviceApplied ? game.selectedAdvice?.sageIndex === advice.sageIndex : pendingSage === advice.sageIndex;
                            const fullStack = !exhausted && (sage.alignment === "order" ? sage.stack >= 3 : sage.alignment === "chaos" ? sage.stack >= 6 : false);
                            return (
                                <button
                                    key={`${advice.sageIndex}-${advice.id}`}
                                    type="button"
                                    disabled={adviceApplied || exhausted}
                                    onClick={() => onPending(selected ? null : advice.sageIndex)}
                                    className={clsx(
                                        "flex min-h-28 cursor-pointer flex-col rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-default disabled:hover:translate-y-0 min-[700px]:min-h-56 min-[700px]:rounded-2xl min-[700px]:p-4",
                                        selected ? "border-warning bg-warning-50/60 ring-2 ring-warning/25 dark:bg-warning-950/20" : "border-default-200 bg-content1",
                                        adviceApplied && !selected && "opacity-45",
                                        advice.special === "order" && "border-sky-400 bg-sky-50/60 dark:bg-sky-950/20",
                                        advice.special === "chaos" && "border-fuchsia-400 bg-fuchsia-50/60 dark:bg-fuchsia-950/20",
                                        advice.special === "seal" && "border-danger-300 bg-danger-50/40 dark:bg-danger-950/15",
                                        fullStack && sage.alignment === "order" && "elixir-stack-full-order",
                                        fullStack && sage.alignment === "chaos" && "elixir-stack-full-chaos",
                                        exhausted && "cursor-not-allowed border-default-200 bg-default-100 opacity-55 grayscale disabled:cursor-not-allowed",
                                    )}>
                                    <div className="flex w-full items-center">
                                        <span className="text-[11px] font-black min-[700px]:text-sm">{SAGE_NAMES[advice.sageIndex]}</span>
                                    </div>
                                    <p className="my-auto break-keep py-2 text-[11px] font-bold leading-snug min-[700px]:py-5 min-[700px]:text-base min-[700px]:leading-relaxed">{formatAdviceText(advice, game.slots)}</p>
                                    {exhausted
                                        ? <span className="text-[10px] text-default-400 min-[700px]:text-xs">선택할 수 없습니다</span>
                                        : <AlignmentStack alignment={sage.alignment} stack={sage.stack}/>} 
                                </button>
                            );
                        })}
                    </div>}
                    {resultMessages.length > 0 && (
                        <div className={clsx("rounded-2xl border p-4", adviceApplied ? "border-secondary-300 bg-secondary-50/60 dark:bg-secondary-950/20" : "border-default-200 bg-default-100/70")}>
                            <p className="font-bold">{adviceApplied ? "조언 적용 결과" : "직전 연성 결과"}</p>
                            <div className="mt-2 space-y-1 text-sm text-default-600">
                                {resultMessages.map((message, index) => <p key={`${animationId}-${index}`}>• {message}</p>)}
                            </div>
                        </div>
                    )}
                    {finalizing ? (
                        <div className="rounded-2xl border border-success-300 bg-success-50/60 p-4 dark:bg-success-950/20">
                            <div className="mb-2 flex items-center justify-between gap-3 text-sm font-bold text-success-700 dark:text-success-300">
                                <span>완성된 엘릭서로 이동합니다</span>
                                <span className="tabular-nums">{Math.ceil(completionProgress / 10) / 10}초</span>
                            </div>
                            <Progress
                                value={completionProgress}
                                color="success"
                                size="md"
                                aria-label="완성 화면 전환까지 남은 시간"/>
                        </div>
                    ) : (
                        <div className="hidden min-[700px]:block">
                            {!adviceApplied ? (
                                <Button color="secondary" size="lg" isDisabled={!canConfirm} onPress={onConfirmAdvice} className="w-full font-bold">
                                    {needsTarget && pendingTarget === null ? "왼쪽에서 효과를 선택하세요" : "조언 선택"}
                                </Button>
                            ) : (
                                <Button color="warning" size="lg" onPress={onForge} className="w-full font-black">연성하기</Button>
                            )}
                        </div>
                    )}
                    <div className="h-[min(40vh,20rem)] min-[700px]:hidden" aria-hidden="true"/>
                </CardBody>
            </Card>
        </div>
    );
}

function CompletedResult({ game, storage, isSaving, canSave, onSave, onRestart }: {
    game: ElixirGame;
    storage: ElixirStorage;
    isSaving: boolean;
    canSave: boolean;
    onSave: (part: ElixirPart, slot: number) => void;
    onRestart: () => void;
}) {
    const [part, setPart] = useState<ElixirPart>("투구");
    const [slot, setSlot] = useState(0);
    const result = completedElixir(game);
    return (
        <Card className="border border-success-300 shadow-sm">
            <CardBody className="gap-5 p-5 sm:p-7">
                <div>
                    <Chip color="success" variant="flat">연성 완료</Chip>
                    <h2 className="mt-3 text-2xl font-bold">완성된 엘릭서</h2>
                    <p className="mt-1 text-sm text-default-500">봉인되지 않은 두 효과만 저장됩니다.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    {result?.effects.map((effect, index) => {
                        const applicable = categoryMatchesPart(effect.category, part);
                        return (
                            <div key={`${effect.name}-${index}`} className={clsx(
                                "rounded-2xl border p-4",
                                applicable ? "border-success-300 bg-success-50/50 dark:bg-success-950/15" : "border-danger-300 bg-danger-50/50 dark:bg-danger-950/15",
                            )}>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="font-bold">{effect.name}</p>
                                        <p className="text-xs text-default-400">{effect.category}</p>
                                    </div>
                                    <span className="text-xl font-black">Lv.{effect.level}</span>
                                </div>
                                <PointTrack points={effect.points}/>
                                {!applicable && <p className="mt-2 text-xs font-semibold text-danger">{part}에 저장하면 적용되지 않습니다.</p>}
                            </div>
                        );
                    })}
                </div>
                <div className="space-y-4 rounded-2xl bg-default-100 p-4">
                    <Select
                        label="저장 부위"
                        labelPlacement="outside"
                        disallowEmptySelection
                        selectedKeys={new Set([part])}
                        onSelectionChange={(keys) => {
                            const selectedPart = Array.from(keys)[0];
                            if (selectedPart !== undefined) setPart(String(selectedPart) as ElixirPart);
                        }}
                        classNames={{ label: "font-semibold", trigger: "min-h-10 bg-content1" }}>
                        {ELIXIR_PARTS.map((item) => <SelectItem key={item}>{item}</SelectItem>)}
                    </Select>
                    <div>
                        <p className="mb-2 text-sm font-semibold">저장 슬롯</p>
                        <div className="grid gap-3 sm:grid-cols-3">
                            {storage[part].slots.map((stored, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    aria-pressed={slot === index}
                                    disabled={isSaving}
                                    onClick={() => setSlot(index)}
                                    className={clsx(
                                        "min-h-32 cursor-pointer rounded-2xl border bg-content1 p-3 text-left transition hover:-translate-y-0.5 hover:border-success hover:shadow-md disabled:cursor-not-allowed disabled:hover:translate-y-0",
                                        slot === index
                                            ? "border-success ring-2 ring-success/25"
                                            : "border-default-200",
                                    )}>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-xs font-bold text-default-500">{index + 1}번 슬롯</span>
                                        <span className="flex flex-wrap gap-1">
                                            {storage[part].selected === index && <Chip size="sm" color="secondary" variant="flat">적용 중</Chip>}
                                            {slot === index && <Chip size="sm" color="success" variant="flat">선택됨</Chip>}
                                        </span>
                                    </div>
                                    {stored ? (
                                        <div className="mt-3 space-y-2">
                                            {stored.effects.map((effect, effectIndex) => (
                                                <div key={`${effect.name}-${effectIndex}`} className="flex items-center justify-between gap-2 rounded-xl bg-default-100 px-3 py-2">
                                                    <span className="min-w-0 truncate text-sm font-semibold">{effect.name}</span>
                                                    <span className="shrink-0 text-sm font-black">Lv.{effect.level}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex min-h-20 items-center justify-center text-sm font-semibold text-default-400">비어 있음</div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button color="success" isLoading={isSaving} isDisabled={!canSave} onPress={() => onSave(part, slot)} className="min-w-28 font-bold">저장</Button>
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button variant="flat" onPress={onRestart}>새 엘릭서 시작</Button>
                </div>
            </CardBody>
        </Card>
    );
}

function StoredElixirCard({ elixir, part, slot, selected, disabled, onSelect, onDelete }: {
    elixir: StoredElixir | null;
    part: ElixirPart;
    slot: number;
    selected: boolean;
    disabled: boolean;
    onSelect: () => void;
    onDelete: () => void;
}) {
    return (
        <div className={clsx(
            "rounded-2xl border p-3 transition",
            selected ? "border-secondary bg-secondary-50/50 ring-2 ring-secondary/20 dark:bg-secondary-950/15" : "border-default-200",
        )}>
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-default-400">{slot + 1}번 슬롯</span>
                {selected && <Chip size="sm" color="secondary" variant="flat">적용 중</Chip>}
            </div>
            {elixir ? (
                <>
                    <div className="mt-3 space-y-2">
                        {elixir.effects.map((effect, index) => {
                            const active = categoryMatchesPart(effect.category, part);
                            return <div key={`${effect.name}-${index}`} className={clsx("rounded-xl bg-default-100 px-3 py-2", !active && "bg-danger-50 dark:bg-danger-950/20")}>
                                <div className="flex justify-between gap-2">
                                    <span className={clsx("truncate text-sm font-semibold", !active && "text-danger")}>{effect.name}</span>
                                    <span className="shrink-0 text-sm font-bold">Lv.{effect.level}</span>
                                </div>
                                {!active && <p className="mt-1 text-[11px] text-danger">{effect.category} · 부위 불일치로 미적용</p>}
                            </div>;
                        })}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <Button
                            size="sm"
                            color={selected ? "default" : "secondary"}
                            variant="flat"
                            isDisabled={disabled}
                            onPress={onSelect}
                            className="cursor-pointer data-[disabled=true]:cursor-not-allowed">
                            {selected ? "적용 해제" : "적용"}
                        </Button>
                        <Button size="sm" color="danger" variant="light" isDisabled={disabled} onPress={onDelete}>삭제</Button>
                    </div>
                </>
            ) : <div className="flex min-h-28 items-center justify-center text-sm text-default-400">저장된 엘릭서 없음</div>}
        </div>
    );
}

function StorageWorkspace({ storage, isLogined, status, onChange }: {
    storage: ElixirStorage;
    isLogined: boolean;
    status: "loading" | "idle" | "saving" | "error";
    onChange: (storage: ElixirStorage) => void;
}) {
    const applied = useMemo(() => getAppliedEffects(storage), [storage]);
    const unavailable = status !== "idle";
    const mutate = (callback: (next: ElixirStorage) => void) => {
        const next = structuredClone(storage);
        callback(next);
        onChange(next);
    };
    return (
        <section className="mt-6 space-y-5">
            <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
                <Card className="border border-default-200 shadow-sm">
                    <CardBody className="gap-4 p-5">
                        <div>
                            <p className="text-sm font-semibold text-default-500">적용 효과 레벨 총합</p>
                            <p className="mt-1 text-4xl font-black text-secondary">{applied.totalLevel}</p>
                        </div>
                        <div className="space-y-2">
                            {applied.active.length ? applied.active.map((effect) => (
                                <div key={effect.name} className="rounded-xl bg-default-100 px-3 py-2">
                                    <div className="flex justify-between gap-3"><span className="font-semibold">{effect.name}</span><span className="font-bold">Lv.{effect.level}</span></div>
                                    <p className="mt-1 text-xs text-default-400">{effect.sources.map((source) => `${source.part} ${source.level}`).join(" · ")}</p>
                                </div>
                            )) : <p className="rounded-xl border border-dashed border-default-300 p-4 text-center text-sm text-default-400">적용 중인 효과가 없습니다.</p>}
                        </div>
                        {applied.inactive.length > 0 && <div className="rounded-xl bg-danger-50 p-3 text-xs text-danger dark:bg-danger-950/20">
                            <p className="font-bold">부위 불일치 효과</p>
                            {applied.inactive.map((effect, index) => <p key={`${effect.part}-${effect.name}-${index}`} className="mt-1">{effect.part}: {effect.name} Lv.{effect.level} ({effect.requiredPart} 전용)</p>)}
                        </div>}
                    </CardBody>
                </Card>
                <Card className="border border-default-200 shadow-sm">
                    <CardBody className="gap-4 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div><h2 className="text-xl font-bold">부위별 엘릭서 보관함</h2><p className="mt-1 text-sm text-default-500">부위마다 세 개를 저장하고 하나만 적용할 수 있습니다.</p></div>
                            <Chip variant="flat" color={status === "error" ? "danger" : status === "saving" ? "warning" : "success"}>
                                {status === "loading" ? "불러오는 중" : status === "saving" ? "저장 중" : status === "error" ? "저장 오류" : isLogined ? "계정에 저장됨" : "이 브라우저에 저장됨"}
                            </Chip>
                        </div>
                        {!isLogined && <p className="rounded-xl bg-default-100 px-3 py-2 text-xs text-default-500">로그인 전 데이터는 이 브라우저에 보관됩니다. 로그인하면 계정에 저장된 엘릭서가 표시됩니다.</p>}
                        <div className="space-y-5">
                            {ELIXIR_PARTS.map((part) => (
                                <div key={part}>
                                    <div className="mb-2 flex items-center gap-2"><h3 className="font-bold">{part}</h3><span className="text-xs text-default-400">3개 슬롯</span></div>
                                    <div className="grid gap-3 md:grid-cols-3">
                                        {storage[part].slots.map((elixir, slot) => (
                                            <StoredElixirCard
                                                key={slot}
                                                elixir={elixir}
                                                part={part}
                                                slot={slot}
                                                selected={storage[part].selected === slot}
                                                disabled={unavailable}
                                                onSelect={() => mutate((next) => {
                                                    next[part].selected = next[part].selected === slot ? null : slot;
                                                })}
                                                onDelete={() => {
                                                    if (!window.confirm(`${part} ${slot + 1}번 슬롯의 엘릭서를 삭제하시겠습니까?`)) return;
                                                    mutate((next) => {
                                                        next[part].slots[slot] = null;
                                                        if (next[part].selected === slot) next[part].selected = null;
                                                    });
                                                }}/>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            </div>
        </section>
    );
}

export default function ElixirForm() {
    const isCheckedToken = useSelector((state: RootState) => state.login.isCheckedToken);
    const isLogined = useSelector((state: RootState) => state.login.isLogined);
    const userId = useSelector((state: RootState) => state.login.user.id);
    const [game, setGame] = useState(createElixirGame);
    const [pendingSage, setPendingSage] = useState<number | null>(null);
    const [pendingTarget, setPendingTarget] = useState<number | null>(null);
    const [storage, setStorage] = useState<ElixirStorage>(createEmptyElixirStorage);
    const [storageStatus, setStorageStatus] = useState<"loading" | "idle" | "saving" | "error">("loading");
    const [completionProgress, setCompletionProgress] = useState(100);

    useEffect(() => {
        if (game.phase !== "finalizing") return;
        const duration = 1000;
        const startedAt = performance.now();
        let animationFrame = 0;
        const updateProgress = (now: number) => {
            const remaining = Math.max(0, 1 - (now - startedAt) / duration);
            setCompletionProgress(remaining * 100);
            if (remaining === 0) {
                setGame((current) => finishElixir(current));
                setCompletionProgress(100);
                return;
            }
            animationFrame = requestAnimationFrame(updateProgress);
        };
        setCompletionProgress(100);
        animationFrame = requestAnimationFrame(updateProgress);
        return () => cancelAnimationFrame(animationFrame);
    }, [game.phase]);

    useEffect(() => {
        if (!isCheckedToken) return;
        if (!isLogined) {
            try {
                const saved = window.localStorage.getItem(GUEST_ELIXIR_STORAGE_KEY);
                setStorage(saved ? normalizeElixirStorage(JSON.parse(saved)) : createEmptyElixirStorage());
                setStorageStatus("idle");
            } catch {
                setStorage(createEmptyElixirStorage());
                setStorageStatus("error");
                addToast({ title: "엘릭서 불러오기 실패", description: "이 브라우저에 보관된 엘릭서 정보를 불러오지 못했습니다.", color: "danger" });
            }
            return;
        }
        let cancelled = false;
        setStorageStatus("loading");
        void requestElixirStorage().then(async (response) => {
            const data = await response.json().catch(() => null);
            if (!response.ok) throw new Error(data?.error ?? "엘릭서를 불러오지 못했습니다.");
            if (!cancelled) {
                setStorage(normalizeElixirStorage(data.storage));
                setStorageStatus("idle");
            }
        }).catch(() => {
            if (!cancelled) {
                setStorage(createEmptyElixirStorage());
                setStorageStatus("error");
                addToast({ title: "엘릭서 불러오기 실패", description: "계정에 저장된 엘릭서 정보를 불러오지 못했습니다.", color: "danger" });
            }
        });
        return () => { cancelled = true; };
    }, [isCheckedToken, isLogined, userId]);

    const persistStorage = async (next: ElixirStorage) => {
        if (storageStatus !== "idle") return false;
        const previous = storage;
        setStorage(next);
        setStorageStatus("saving");
        try {
            if (!isLogined) {
                window.localStorage.setItem(GUEST_ELIXIR_STORAGE_KEY, JSON.stringify(next));
                setStorageStatus("idle");
                return true;
            }
            const response = await requestElixirStorage({
                method: "PUT",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ storage: next }),
            });
            const data = await response.json().catch(() => null);
            if (!response.ok) throw new Error(data?.error ?? "엘릭서를 저장하지 못했습니다.");
            setStorage(normalizeElixirStorage(data.storage));
            setStorageStatus("idle");
            return true;
        } catch {
            setStorage(previous);
            setStorageStatus("error");
            addToast({ title: "엘릭서 저장 실패", description: `${isLogined ? "계정에" : "이 브라우저에"} 변경 내용을 저장하지 못해 이전 상태로 되돌렸습니다.`, color: "danger" });
            return false;
        }
    };

    const confirmAdvice = () => {
        if (pendingSage === null) return;
        const resetsElixir = game.advices.find((offer) => offer.sageIndex === pendingSage)?.kind === "reset";
        setGame((current) => chooseAdvice(current, pendingSage, pendingTarget ?? undefined));
        if (resetsElixir) {
            setPendingSage(null);
            setPendingTarget(null);
        }
    };

    const handleForge = () => {
        setGame((current) => forgeElixir(current));
        setPendingSage(null);
        setPendingTarget(null);
    };

    const restart = () => {
        setGame(createElixirGame());
        setPendingSage(null);
        setPendingTarget(null);
    };

    const saveCompleted = async (part: ElixirPart, slot: number) => {
        const result = completedElixir(game);
        if (!result) return;
        if (storage[part].slots[slot] && !window.confirm(`${part} ${slot + 1}번 슬롯의 기존 엘릭서를 덮어쓰시겠습니까?`)) return;
        const next = structuredClone(storage);
        next[part].slots[slot] = result;
        next[part].selected = slot;
        if (await persistStorage(next)) {
            addToast({ title: "엘릭서 저장 완료", description: `${part} ${slot + 1}번 슬롯에 저장하고 적용했습니다.`, color: "success" });
            restart();
        }
    };

    return (
        <div className="space-y-5 pb-12">
            <Card className="overflow-hidden border border-default-200 bg-gradient-to-br from-violet-950 via-slate-950 to-fuchsia-950 text-white shadow-xl">
                <CardBody className="p-5 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div><p className="text-sm font-bold text-violet-300">로스트아크 과거 성장 시스템</p><h1 className="mt-1 text-2xl font-black sm:text-3xl">엘릭서 시뮬레이션</h1><p className="mt-2 max-w-2xl text-sm text-white/65">다섯 효과를 정제하고 현자의 조언으로 {ELIXIR_TOTAL_TURNS}회 연성한 뒤, 완성된 두 효과를 부위별로 저장하세요.</p></div>
                        <Button color="secondary" variant="flat" className="bg-white/10 text-white" onPress={() => {
                            if (game.phase === "effects" && game.selectedEffects.length === 0 || window.confirm("현재 엘릭서 진행 상황을 초기화하시겠습니까?")) restart();
                        }}>현재 엘릭서 초기화</Button>
                    </div>
                    <div className="mt-5 rounded-xl bg-white/10 px-4 py-3 text-sm text-white/80">{game.notice}</div>
                </CardBody>
            </Card>

            {game.phase === "effects" && (
                <EffectSelection
                    game={game}
                    onSelect={(index) => setGame((current) => selectEffect(current, index))}
                    onRefresh={() => setGame((current) => refreshOptions(current))}/>
            )}
            {(game.phase === "forging" || game.phase === "finalizing") && (
                <ForgingWorkspace
                    game={game}
                    completionProgress={completionProgress}
                    pendingSage={pendingSage}
                    pendingTarget={pendingTarget}
                    onConfirmAdvice={confirmAdvice}
                    onForge={handleForge}
                    onPending={(sageIndex) => { setPendingSage(sageIndex); setPendingTarget(null); }}
                    onTarget={setPendingTarget}
                    onRefresh={() => { setGame((current) => refreshOptions(current)); setPendingSage(null); setPendingTarget(null); }}/>
            )}
            {game.phase === "complete" && (
                <CompletedResult
                    game={game}
                    storage={storage}
                    isSaving={storageStatus === "saving"}
                    canSave={storageStatus === "idle"}
                    onSave={(part, slot) => void saveCompleted(part, slot)}
                    onRestart={restart}/>
            )}

            <StorageWorkspace
                storage={storage}
                isLogined={isLogined}
                status={storageStatus}
                onChange={(next) => void persistStorage(next)}/>
        </div>
    );
}
