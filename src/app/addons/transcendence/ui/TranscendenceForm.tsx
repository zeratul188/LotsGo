'use client'

import { addToast, Button, Card, CardBody, Chip, Select, SelectItem, Tooltip } from "@heroui/react";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import TranscendenceIcon from "@/Icons/TranscendenceIcon";
import { useMobileQuery } from "@/utiils/utils";
import presetData from "../data/transcendence.json";
import {
    canTargetDistorted,
    createGame,
    exchangeCard,
    executeTurn,
    getCompletionGuide,
    getPreview,
} from "../lib/transcendenceFeat";
import {
    EQUIPMENTS,
    Equipment,
    EquipmentPreset,
    GameState,
    Position,
    PreviewCell,
    SpiritCard,
} from "../model/types";
import "./transcendence.css";

const presets = presetData.preset as EquipmentPreset[];
const levels = [1, 2, 3, 4, 5, 6, 7];

const SPIRIT_STYLE: Record<string, string> = {
    "업화": "from-orange-600 to-red-950",
    "대폭발": "from-red-500 to-amber-950",
    "벼락": "from-sky-400 to-indigo-950",
    "낙뢰": "from-cyan-400 to-blue-950",
    "용오름": "from-sky-300 to-teal-900",
    "충격파": "from-lime-400 to-stone-900",
    "지진": "from-amber-500 to-stone-900",
    "해일": "from-blue-400 to-cyan-950",
    "폭풍우": "from-slate-400 to-blue-950",
    "정화": "from-emerald-300 to-green-950",
    "분출": "from-teal-300 to-slate-900",
    "세계수의 공명": "from-green-300 to-emerald-950",
};

const SPIRIT_ARTWORK: Record<string, { normal: string; level3: string }> = {
    "업화": {
        normal: "/images/transcendence/cards/fire-level-1-2.webp",
        level3: "/images/transcendence/cards/fire-level-3.webp",
    },
    "대폭발": {
        normal: "/images/transcendence/cards/great-explosion-level-1-2.webp",
        level3: "/images/transcendence/cards/great-explosion-level-3.webp",
    },
    "벼락": {
        normal: "/images/transcendence/cards/lightning-level-1-2.webp",
        level3: "/images/transcendence/cards/lightning-level-3.webp",
    },
    "낙뢰": {
        normal: "/images/transcendence/cards/lightning-strike-level-1-2.webp",
        level3: "/images/transcendence/cards/lightning-strike-level-3.webp",
    },
    "용오름": {
        normal: "/images/transcendence/cards/waterspout-level-1-2.webp",
        level3: "/images/transcendence/cards/waterspout-level-3.webp",
    },
    "충격파": {
        normal: "/images/transcendence/cards/shockwave-level-1-2.webp",
        level3: "/images/transcendence/cards/shockwave-level-3.webp",
    },
    "지진": {
        normal: "/images/transcendence/cards/earthquake-level-1-2.webp",
        level3: "/images/transcendence/cards/earthquake-level-3.webp",
    },
    "해일": {
        normal: "/images/transcendence/cards/tidal-wave-level-1-2.webp",
        level3: "/images/transcendence/cards/tidal-wave-level-3.webp",
    },
    "폭풍우": {
        normal: "/images/transcendence/cards/rainstorm-level-1-2.webp",
        level3: "/images/transcendence/cards/rainstorm-level-3.webp",
    },
    "정화": {
        normal: "/images/transcendence/cards/purification-level-1-2.webp",
        level3: "/images/transcendence/cards/purification-level-3.webp",
    },
    "분출": {
        normal: "/images/transcendence/cards/eruption.webp",
        level3: "/images/transcendence/cards/eruption.webp",
    },
    "세계수의 공명": {
        normal: "/images/transcendence/cards/world-tree-resonance.webp",
        level3: "/images/transcendence/cards/world-tree-resonance.webp",
    },
};

const SPECIAL_TILE_CLASS: Record<string, string> = {
    "재배치": "stone-special--white",
    "축복": "stone-special--yellow",
    "추가": "stone-special--lime",
    "신비": "stone-special--orange",
    "강화": "stone-special--purple",
    "복제": "stone-special--blue",
};

const SPECIAL_TILE_DESCRIPTION: Record<string, string> = {
    "재배치": "남아 있는 일반·왜곡 석판을 유효 발판 안에서 무작위로 다시 배치합니다.",
    "축복": "이번 정령 사용은 초월 사용 횟수를 증가시키지 않습니다.",
    "추가": "정령 교체 가능 횟수가 1회 증가합니다.",
    "신비": "사용하지 않은 카드를 분출 또는 세계수의 공명으로 교체합니다.",
    "강화": "사용하지 않은 정령의 효과를 한 단계 강화합니다.",
    "복제": "사용하지 않은 카드를 이번에 사용한 정령과 같은 단계로 교체합니다.",
};

const displayName = (card: SpiritCard) => {
    if (card.level === 1) return card.name;
    if (card.level === 2) return `강화된 ${card.name}`;
    const owner: Record<string, string> = {
        "업화": "에페르니아", "대폭발": "에페르니아", "벼락": "실페리온",
        "낙뢰": "실페리온", "용오름": "실페리온", "충격파": "그노시스",
        "지진": "그노시스", "해일": "운다트", "폭풍우": "운다트", "정화": "엘조윈",
    };
    return `${owner[card.name] ?? "정령"}의 ${card.name}`;
};

function SpiritCardView({ card, selected, small, mini, onClick }: {
    card: SpiritCard;
    selected?: boolean;
    small?: boolean;
    mini?: boolean;
    onClick?: () => void;
}) {
    const artworkSet = SPIRIT_ARTWORK[card.name];
    const artwork = artworkSet
        ? card.level === 3 ? artworkSet.level3 : artworkSet.normal
        : null;

    return (
        <button
            type="button"
            aria-label={displayName(card)}
            onClick={onClick}
            className={clsx(
                "relative overflow-hidden rounded-xl border text-left text-white shadow-md transition",
                "bg-gradient-to-br", SPIRIT_STYLE[card.name],
                mini
                    ? "h-14 w-10 cursor-default rounded-lg sm:h-16 sm:w-12"
                    : small
                    ? ["h-20 w-16 sm:h-24 sm:w-20", onClick ? "cursor-pointer hover:-translate-y-0.5" : "cursor-default"]
                    : "h-44 w-36 hover:-translate-y-1",
                selected ? "border-amber-400 ring-4 ring-amber-400/30" : "border-white/20",
            )}>
            {artwork && (
                <img
                    src={artwork}
                    alt=""
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-cover object-center"/>
            )}
            {!artwork && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(255,255,255,.4),transparent_45%)]"/>
            )}
            <div className={clsx("relative flex h-full flex-col justify-between", mini ? "p-1" : small ? "p-2 sm:p-3" : "p-3")}>
                <div className={clsx("flex justify-between drop-shadow-[0_1px_2px_rgba(0,0,0,.95)]", mini ? "text-[8px]" : "text-xs")}>
                    <span>{"✦".repeat(card.level)}</span>
                    {selected && <span className="font-semibold text-amber-300">선택됨</span>}
                </div>
                {!mini && <div className="drop-shadow-[0_1px_2px_rgba(0,0,0,.95)]">
                    <p className={clsx("font-bold break-keep", small ? "text-xs" : "text-sm")}>{displayName(card)}</p>
                    {!small && (
                        <p className="mt-1 text-[11px] text-white/70">
                            정령 효과 {card.level === 3 ? "최고단계" : `${card.level}단계`}
                        </p>
                    )}
                </div>}
            </div>
        </button>
    );
}

const keyOf = ({ row, col }: Position) => `${row}-${col}`;

function Board({ game, hovered, destroyingKeys, enableHoverPreview, onHover, onLeave, onClick }: {
    game: GameState;
    hovered: Position | null;
    destroyingKeys: ReadonlySet<string>;
    enableHoverPreview: boolean;
    onHover: (position: Position) => void;
    onLeave: () => void;
    onClick: (position: Position) => void;
}) {
    const preview = useMemo(() => {
        if (!hovered || game.selectedCardIndex === null) return [];
        return getPreview(game.board, game.cards[game.selectedCardIndex], hovered);
    }, [game, hovered]);
    const previewMap = new Map(preview.map((cell) => [keyOf(cell), cell]));
    const selectedCard = game.selectedCardIndex === null ? null : game.cards[game.selectedCardIndex];
    const size = game.stage <= 3 ? 6 : game.stage <= 5 ? 7 : 8;
    const offset = game.stage <= 3 ? 1 : 0;
    const visibleRows = game.board.slice(offset, offset + size);

    return (
        <div
            className="grid aspect-square w-full max-w-[620px] gap-1 rounded-2xl bg-default-100 p-2 shadow-inner"
            style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
            onMouseLeave={enableHoverPreview ? onLeave : undefined}>
            {visibleRows.flatMap((row, visibleRowIndex) => row.slice(offset, offset + size).map((tile, visibleColIndex) => {
                const rowIndex = visibleRowIndex + offset;
                const colIndex = visibleColIndex + offset;
                const position = { row: rowIndex, col: colIndex };
                const initial = game.preset.blocks[rowIndex][colIndex];
                const previewCell = previewMap.get(keyOf(position)) as PreviewCell | undefined;
                const isDestroying = destroyingKeys.has(keyOf(position));
                const targetable = tile?.base === "normal"
                    || tile?.base === "distorted" && selectedCard !== null && canTargetDistorted(selectedCard.name);
                const tileButton = (
                    <button
                        type="button"
                        aria-label={tile ? `${tile.special ?? (tile.base === "distorted" ? "왜곡" : "일반")} 석판` : "빈 발판"}
                        disabled={initial === 0 || !targetable}
                        onMouseEnter={() => enableHoverPreview && targetable && onHover(position)}
                        onFocus={() => enableHoverPreview && targetable && onHover(position)}
                        onClick={() => targetable && onClick(position)}
                        className={clsx(
                            "relative aspect-square rounded-md border transition",
                            initial === 0 && "invisible",
                            initial !== 0 && !tile && "border-dashed border-default-300 bg-default-50",
                            tile && "transcendence-stone",
                            tile?.base === "distorted" && "transcendence-stone--distorted",
                            tile?.base === "distorted" && !targetable && "cursor-not-allowed",
                            tile?.special && ["transcendence-stone--special", SPECIAL_TILE_CLASS[tile.special]],
                            previewCell && "transcendence-stone--preview z-10 ring-2 ring-orange-400/60",
                        )}>
                        {previewCell && (
                            <span className={clsx(
                                "absolute inset-0 z-30 flex items-center justify-center text-xs font-bold sm:text-base",
                                previewCell.distorted ? "text-purple-950" : "text-white",
                            )}>
                                {previewCell.chance === 0
                                    ? "안전"
                                    : previewCell.distorted && game.cards[game.selectedCardIndex!].level < 3
                                    ? `위험 ${previewCell.chance}%`
                                    : `${previewCell.chance}%`}
                            </span>
                        )}
                        {isDestroying && (
                            <span className="stone-destroy-effect" aria-hidden="true">
                                {Array.from({ length: 8 }, (_, index) => (
                                    <span key={index} className="stone-destroy-fragment"/>
                                ))}
                            </span>
                        )}
                    </button>
                );
                return (
                    <Tooltip
                        key={keyOf(position)}
                        showArrow
                        placement="top"
                        delay={250}
                        isDisabled={!tile?.special}
                        content={tile?.special ? (
                            <div className="max-w-64 px-1 py-1">
                                <p className="font-bold">{tile.special} 석판</p>
                                <p className="mt-1 text-xs text-default-500">{SPECIAL_TILE_DESCRIPTION[tile.special]}</p>
                            </div>
                        ) : null}>
                        {tileButton}
                    </Tooltip>
                );
            }))}
        </div>
    );
}

export default function TranscendenceForm() {
    const isMobile = useMobileQuery();
    const [equipment, setEquipment] = useState<Equipment>("투구");
    const [stage, setStage] = useState(1);
    const getPreset = (nextEquipment = equipment, nextStage = stage) =>
        presets.find((preset) => preset.equipment === nextEquipment)!.setting[nextStage - 1];
    const [game, setGame] = useState(() => createGame(equipment, stage, getPreset()));
    const [hovered, setHovered] = useState<Position | null>(null);
    const [destroyingKeys, setDestroyingKeys] = useState<Set<string>>(() => new Set());

    useEffect(() => {
        if (destroyingKeys.size === 0) return;
        const timeout = window.setTimeout(() => setDestroyingKeys(new Set()), 520);
        return () => window.clearTimeout(timeout);
    }, [destroyingKeys]);

    const restart = (nextEquipment = equipment, nextStage = stage) => {
        setGame(createGame(nextEquipment, nextStage, getPreset(nextEquipment, nextStage)));
        setHovered(null);
        setDestroyingKeys(new Set());
    };

    const confirmRestart = () => {
        if (window.confirm("정말로 초기화하시겠습니까?")) restart();
    };

    const selectCard = (index: 0 | 1) => {
        setGame((state) => ({
            ...state,
            selectedCardIndex: state.selectedCardIndex === index ? null : index,
        }));
        setHovered(null);
    };

    const changeCard = (index: 0 | 1) => {
        setGame((state) => exchangeCard(state, index));
        setHovered(null);
    };

    const attackTile = (position: Position) => {
        if (isMobile && (!hovered || keyOf(hovered) !== keyOf(position))) {
            setHovered(position);
            return;
        }

        const result = executeTurn(game, position);
        result.notices.forEach((notice) => addToast({
            title: notice.title,
            description: notice.description,
            color: notice.kind === "spawn" ? "danger" : "success",
        }));
        setDestroyingKeys(new Set(result.destroyedPositions.map(keyOf)));
        setGame(result.game);
        setHovered(null);
    };

    const normalCount = game.board.flat().filter((tile) => tile?.base === "normal").length;
    const distortedCount = game.board.flat().filter((tile) => tile?.base === "distorted").length;
    const completionGuide = getCompletionGuide(game);

    return (
        <div className={clsx("mx-auto max-w-[1180px] pb-10", isMobile && "pb-52")}>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm text-default-500">추억 속 장비 성장 미니게임</p>
                    <h1 className="text-2xl font-bold">초월 시뮬레이터</h1>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Select
                        label="장비 부위"
                        selectionMode="single"
                        isRequired
                        selectedKeys={[equipment]}
                        className="w-32"
                        onSelectionChange={(keys) => {
                            const selectedKey = Array.from(keys)[0];
                            if (!selectedKey || !EQUIPMENTS.includes(selectedKey as Equipment)) {
                                addToast({
                                    title: "선택을 해제할 수 없습니다.",
                                    description: "장비 부위는 반드시 1개를 선택해야 합니다.",
                                    color: "warning",
                                });
                                return;
                            }
                            const value = selectedKey as Equipment;
                            setEquipment(value); restart(value, stage);
                        }}>
                        {EQUIPMENTS.map((item) => <SelectItem key={item}>{item}</SelectItem>)}
                    </Select>
                    <Select
                        label="초월 단계"
                        selectionMode="single"
                        isRequired
                        selectedKeys={new Set([String(stage)])}
                        className="w-32"
                        onSelectionChange={(keys) => {
                            const selectedKey = Array.from(keys)[0];
                            const value = Number(selectedKey);
                            if (!selectedKey || !levels.includes(value)) {
                                addToast({
                                    title: "선택을 해제할 수 없습니다.",
                                    description: "초월 단계는 반드시 1개를 선택해야 합니다.",
                                    color: "warning",
                                });
                                return;
                            }
                            setStage(value); restart(equipment, value);
                        }}>
                        {levels.map((level) => (
                            <SelectItem key={String(level)} textValue={`${level}단계`}>
                                {`${level}단계`}
                            </SelectItem>
                        ))}
                    </Select>
                    <Button color="danger" variant="flat" className="h-14" onPress={confirmRestart}>초기화</Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,620px)_1fr]">
                <div>
                    <Board
                        game={game} hovered={hovered} destroyingKeys={destroyingKeys}
                        enableHoverPreview={!isMobile}
                        onHover={setHovered} onLeave={() => setHovered(null)}
                        onClick={attackTile}/>
                    <Card className="mx-auto mt-4 w-fit">
                        <CardBody className="flex-row items-center gap-2 px-5 py-3">
                            {game.completedGrade !== null ? (
                                <div className="flex items-center gap-2 font-bold text-success">
                                    <span>초월 완료</span>
                                    <span
                                        className={clsx(
                                            "flex items-center gap-0.5",
                                            game.completedGrade > 0 ? "text-amber-500" : "text-default-300",
                                        )}
                                        aria-label={game.completedGrade > 0 ? `${game.completedGrade}성` : "1성 미달"}>
                                        {Array.from({ length: game.completedGrade || 1 }, (_, index) => (
                                            <TranscendenceIcon key={index} className="h-5 w-5"/>
                                        ))}
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <span>{completionGuide.grade > 0 ? `${completionGuide.turnsLeft}회 안에 완료 시` : "등급 달성 불가"}</span>
                                    {completionGuide.grade > 0 ? (
                                        <span className="flex items-center gap-0.5 text-amber-500" aria-label={`${completionGuide.grade}성`}>
                                            {Array.from({ length: completionGuide.grade }, (_, index) => (
                                                <TranscendenceIcon key={index} className="h-5 w-5"/>
                                            ))}
                                        </span>
                                    ) : null}
                                </>
                            )}
                        </CardBody>
                    </Card>
                </div>

                {!isMobile && <aside className="relative overflow-hidden rounded-3xl border border-default-200 bg-content1/80 p-5 shadow-xl backdrop-blur-sm">
                    <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-primary-200/20 blur-3xl"/>
                    <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-warning-200/15 blur-3xl"/>

                    <div className="relative flex h-full flex-col gap-4">
                        <header className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">Transcendence</p>
                                <h2 className="mt-1 text-xl font-bold">초월 진행 현황</h2>
                                <p className="mt-1 text-xs text-default-500">정령을 선택하고 석판을 타격하세요.</p>
                            </div>
                            <Chip color="warning" variant="flat" className="shrink-0">
                                교체 {game.remainingChanges}회
                            </Chip>
                        </header>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="rounded-2xl border border-default-200 bg-default-50/80 px-3 py-2.5">
                                <div className="flex items-center gap-1.5 text-xs text-default-500">
                                    <span className="h-2 w-2 rounded-full bg-default-500"/>
                                    일반 석판
                                </div>
                                <p className="mt-1 text-2xl font-bold tabular-nums">{normalCount}</p>
                            </div>
                            <div className="rounded-2xl border border-purple-300/40 bg-purple-50/60 px-3 py-2.5 dark:bg-purple-950/20">
                                <div className="flex items-center gap-1.5 text-xs text-purple-500">
                                    <span className="h-2 w-2 rounded-full bg-purple-500"/>
                                    왜곡 석판
                                </div>
                                <p className="mt-1 text-2xl font-bold tabular-nums text-purple-500">{distortedCount}</p>
                            </div>
                            <div className="rounded-2xl border border-default-200 bg-default-50/80 px-3 py-2.5">
                                <div className="flex items-center gap-1.5 text-xs text-default-500">
                                    <span className="h-2 w-2 rounded-full bg-primary"/>
                                    사용 횟수
                                </div>
                                <p className="mt-1 text-2xl font-bold tabular-nums">{game.usedTurns}</p>
                            </div>
                        </div>

                        <section className="rounded-2xl border border-default-200 bg-default-100/45 px-4 py-3">
                            <div className="mb-2.5 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold">다음 카드</h3>
                                    <p className="text-[11px] text-default-500">앞으로 등장할 정령</p>
                                </div>
                                <span className="rounded-full bg-default-200/70 px-2 py-1 text-[10px] font-medium text-default-600">3장 미리보기</span>
                            </div>
                            <div className="flex justify-center gap-3">
                                {game.upcoming.slice(0, 3).map((card) => <SpiritCardView key={card.id} card={card} small/>)}
                            </div>
                        </section>

                        <section className="flex-1">
                            <div className="mb-2.5 flex items-end justify-between">
                                <div>
                                    <h3 className="text-sm font-bold">현재 정령</h3>
                                    <p className="text-[11px] text-default-500">사용할 카드 한 장을 선택하세요.</p>
                                </div>
                                <span className={clsx(
                                    "text-[11px] font-medium",
                                    game.selectedCardIndex === null ? "text-default-400" : "text-success",
                                )}>
                                    {game.selectedCardIndex === null ? "선택 대기" : `${displayName(game.cards[game.selectedCardIndex])} 선택됨`}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {game.cards.map((card, index) => (
                                    <div
                                        key={card.id}
                                        className={clsx(
                                            "flex flex-col items-center gap-2 rounded-2xl border p-3 transition-colors",
                                            game.selectedCardIndex === index
                                                ? "border-warning-400 bg-warning-50/60 dark:bg-warning-950/15"
                                                : "border-default-200 bg-default-50/65",
                                        )}>
                                        <SpiritCardView
                                            card={card}
                                            selected={game.selectedCardIndex === index}
                                            onClick={() => selectCard(index as 0 | 1)}/>
                                        <Button
                                            fullWidth
                                            size="sm"
                                            variant="flat"
                                            className="max-w-36 font-semibold"
                                            isDisabled={game.remainingChanges <= 0 || game.completedGrade !== null}
                                            onPress={() => changeCard(index as 0 | 1)}>
                                            교체하기
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </aside>}
            </div>
            {isMobile && (
                <div className="fixed inset-x-2 bottom-2 z-[100] mx-auto max-w-md rounded-2xl border border-default-200 bg-content1/95 p-2 shadow-2xl backdrop-blur-md [padding-bottom:max(.5rem,env(safe-area-inset-bottom))]">
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <Chip size="sm" color="warning" variant="flat">{game.remainingChanges}회 교체 가능</Chip>
                        <span className="text-[11px] text-default-500">
                            {game.selectedCardIndex === null ? "카드를 선택하세요" : "석판을 두 번 탭해 타격하세요"}
                        </span>
                    </div>
                    <div className="flex items-end justify-center gap-2">
                        {game.cards.map((card, index) => (
                            <div key={card.id} className="flex flex-col items-center gap-1">
                                <SpiritCardView
                                    card={card}
                                    small
                                    selected={game.selectedCardIndex === index}
                                    onClick={() => selectCard(index as 0 | 1)}/>
                                <Button
                                    size="sm"
                                    className="h-7 w-16 min-w-0 px-1 text-xs sm:w-20"
                                    variant="flat"
                                    isDisabled={game.remainingChanges <= 0 || game.completedGrade !== null}
                                    onPress={() => changeCard(index as 0 | 1)}>
                                    교체
                                </Button>
                            </div>
                        ))}
                        <div className="ml-1 self-center">
                            <p className="mb-1 text-center text-[10px] text-default-500">다음 카드</p>
                            <div className="flex gap-1">
                                {game.upcoming.slice(0, 3).map((card) => (
                                    <SpiritCardView key={card.id} card={card} mini/>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
