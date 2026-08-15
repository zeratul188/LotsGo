'use client'

import { useEffect, useMemo, useState } from "react";
import { CharacterInfo } from "../model/types";
import {
    ARK_GRID_OPTION_NAMES,
    AVATAR_SLOTS,
    braceletRawOptions,
    braceletSpecialOptions,
    calculateBraceletCombatPowerPercent,
    calculateExpectedCombatPower,
    CORE_GRADES,
    CORE_POINTS,
    createInitialState,
    clampWristGuardLevelForGrade,
    ENGRAVING_NAMES,
    ENGRAVING_ICON_BY_NAME,
    EQUIPMENT_SLOTS,
    getAccessoryMaxMainStat,
    getAccessoryOptions,
    getBraceletInputMax,
    STONE_HEALTH_BONUSES,
    getCoreChoices,
    getEquipmentSet,
    getHoningRange,
    getWristGuardGradeForLevel,
    normalizeEquipmentSlot,
    WRIST_GUARD_GRADES,
    OptionGrade,
    SimulatorSection,
    SimulatorState,
} from "../lib/combatSimulatorFeat";

const simulatorSections: Array<{ key: SimulatorSection; label: string; detail: string }> = [
    { key: "equipment", label: "장비", detail: "재련 · 품질 · 장신구" },
    { key: "avatar", label: "아바타", detail: "등급별 주스탯" },
    { key: "bracelet", label: "팔찌", detail: "특성과 특수 효과" },
    { key: "gem", label: "보석", detail: "레벨별 전투력" },
    { key: "engraving", label: "각인", detail: "유각 · 어빌리티 스톤" },
    { key: "arkgrid", label: "아크그리드", detail: "코어 · 젬 효과" },
    { key: "arkpassive", label: "아크패시브", detail: "카르마 레벨" },
];
const gradeLabels: Record<OptionGrade, string> = { none: "없음", sm: "하", md: "중", lg: "상" };
const accessoryGrades: OptionGrade[] = ["sm", "md", "lg"];
const accessoryGradeClasses: Record<OptionGrade, string> = {
    none: "",
    sm: "border-sky-400 text-sky-600 dark:border-sky-500 dark:text-sky-300",
    md: "border-fuchsia-400 text-fuchsia-600 dark:border-fuchsia-500 dark:text-fuchsia-300",
    lg: "border-amber-400 text-amber-600 dark:border-amber-500 dark:text-amber-300",
};
const accessoryGradeActiveClasses: Record<OptionGrade, string> = {
    none: "",
    sm: "!border-sky-500 !bg-sky-500 !text-white ring-2 ring-sky-200 dark:ring-sky-500/30",
    md: "!border-fuchsia-500 !bg-fuchsia-500 !text-white ring-2 ring-fuchsia-200 dark:ring-fuchsia-500/30",
    lg: "!border-amber-400 !bg-amber-400 !text-white ring-2 ring-amber-200 dark:ring-amber-500/30",
};
const controlClass = "h-9 rounded-lg border border-default-300 bg-content1 px-2 text-sm outline-none focus:border-primary dark:border-white/15";
const cardClass = "rounded-2xl border border-default-200/80 bg-content1 p-4 shadow-sm dark:border-white/10";

function SimulatorSectionIcon({ section }: { section: SimulatorSection }) {
    const commonProps = {
        className: "h-5 w-5",
        fill: "none",
        stroke: "currentColor",
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
        strokeWidth: 1.8,
        viewBox: "0 0 24 24",
    };

    if (section === "equipment") return <svg {...commonProps}><path d="M12 3 5 6v5c0 4.6 2.8 8.1 7 10 4.2-1.9 7-5.4 7-10V6l-7-3Z"/><path d="m9.5 12 1.7 1.7 3.6-3.9"/></svg>;
    if (section === "avatar") return <svg {...commonProps}><path d="m8 4-4 3 2 4 2-1v10h8V10l2 1 2-4-4-3c-.8 1.2-2.2 2-4 2S8.8 5.2 8 4Z"/></svg>;
    if (section === "bracelet") return <svg {...commonProps}><path d="M8.2 5.2a7.5 7.5 0 1 0 7.6 0"/><path d="M9 3h6v5H9z"/></svg>;
    if (section === "gem") return <svg {...commonProps}><path d="m12 3 7 6-7 12L5 9l7-6Z"/><path d="m5 9 7 3 7-3M12 3v9"/></svg>;
    if (section === "engraving") return <svg {...commonProps}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16ZM20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z"/></svg>;
    if (section === "arkgrid") return <svg {...commonProps}><circle cx="12" cy="5" r="2"/><circle cx="6" cy="17" r="2"/><circle cx="18" cy="17" r="2"/><path d="m11 7-4 8m6-8 4 8M8 17h8"/></svg>;
    return <svg {...commonProps}><path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z"/></svg>;
}

function clamp(value: number, max: number, min = 0) {
    return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

type SimulationChangeEntry = {
    id: string;
    category: string;
    label: string;
    detail: string;
    combatPower: number;
};

function getSimulationChangeEntries(info: CharacterInfo, initial: SimulatorState, state: SimulatorState, currentPower: number): SimulationChangeEntry[] {
    const entries: SimulationChangeEntry[] = [];
    const same = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
    const add = (id: string, category: string, label: string, detail: string, changed: boolean, revert: (next: SimulatorState) => void) => {
        if (!changed) return;
        const reverted = structuredClone(state);
        revert(reverted);
        const combatPower = currentPower - calculateExpectedCombatPower(info, initial, reverted);
        if (Math.abs(combatPower) < 0.005) return;
        entries.push({ id, category, label, detail, combatPower });
    };
    const equipmentSlots = EQUIPMENT_SLOTS;
    for (const slot of equipmentSlots) {
        const before = {
            level: initial.equipment.levels[slot] ?? 0,
            advancedLevel: initial.equipment.advancedLevels[slot] ?? 0,
            quality: initial.equipment.qualities[slot] ?? 0,
            grade: initial.equipment.grades[slot] ?? "",
        };
        const after = {
            level: state.equipment.levels[slot] ?? before.level,
            advancedLevel: state.equipment.advancedLevels[slot] ?? before.advancedLevel,
            quality: state.equipment.qualities[slot] ?? before.quality,
            grade: state.equipment.grades[slot] ?? before.grade,
        };
        const details = [
            before.level !== after.level ? `재련 +${before.level} → +${after.level}` : "",
            before.advancedLevel !== after.advancedLevel ? `상급 ${before.advancedLevel} → ${after.advancedLevel}` : "",
            before.quality !== after.quality ? `품질 ${before.quality} → ${after.quality}` : "",
            before.grade !== after.grade ? `${before.grade} → ${after.grade}` : "",
        ].filter(Boolean);
        add(`equipment-${slot}`, "장비", slot, details.join(" · "), !same(before, after), (next) => {
            next.equipment.levels[slot] = before.level;
            next.equipment.advancedLevels[slot] = before.advancedLevel;
            next.equipment.qualities[slot] = before.quality;
            next.equipment.grades[slot] = before.grade;
            if (slot === "무기") next.equipment.weaponQuality = before.quality;
        });
    }
    for (let index = 0; index < state.accessories.length; index++) {
        const before = initial.accessories[index];
        const after = state.accessories[index];
        if (!before || !after) continue;
        const details = [
            before.mainStat !== after.mainStat ? `주스탯 ${before.mainStat.toLocaleString()} → ${after.mainStat.toLocaleString()}` : "",
            before.vitality !== after.vitality ? `체력 ${before.vitality.toLocaleString()} → ${after.vitality.toLocaleString()}` : "",
            !same(before.options, after.options) ? "연마 옵션 변경" : "",
        ].filter(Boolean);
        add(`accessory-${index}`, "장신구", `${after.type} ${index + 1}`, details.join(" · "), !same(before, after), (next) => { next.accessories[index] = structuredClone(before); });
    }
    for (const slot of AVATAR_SLOTS) {
        const before = initial.avatars[slot] ?? "없음";
        const after = state.avatars[slot] ?? before;
        add(`avatar-${slot}`, "아바타", slot, `${before} → ${after}`, before !== after, (next) => { next.avatars[slot] = before; });
    }
    const describeBracelet = (item: SimulatorState["bracelet"][number] | undefined) => {
        if (!item || item.type === "없음") return "없음";
        const raw = braceletRawOptions.find((option) => option.name === item.type);
        return raw ? `${raw.label} ${item.value.toLocaleString()}` : `${item.type} ${gradeLabels[item.grade]}`;
    };
    for (let index = 0; index < 5; index++) {
        const before = initial.bracelet[index] ?? { type: "없음", value: 0, grade: "none" as OptionGrade };
        const after = state.bracelet[index] ?? before;
        add(`bracelet-${index}`, "팔찌", `효과 ${index + 1}`, `${describeBracelet(before)} → ${describeBracelet(after)}`, !same(before, after), (next) => { next.bracelet[index] = structuredClone(before); });
    }
    for (let index = 0; index < state.gems.length; index++) {
        const before = initial.gems[index] ?? 1;
        const after = state.gems[index] ?? before;
        add(`gem-${index}`, "보석", `보석 ${index + 1}`, `${before}레벨 → ${after}레벨`, before !== after, (next) => { next.gems[index] = before; });
    }
    for (let index = 0; index < state.engravings.length; index++) {
        const before = initial.engravings[index];
        const after = state.engravings[index];
        if (!before || !after) continue;
        add(`engraving-${index}`, "각인", after.name, `유물 ${before.level}단계 → ${after.level}단계`, !same(before, after), (next) => { next.engravings[index] = structuredClone(before); });
    }
    for (let index = 0; index < Math.max(initial.stones.length, state.stones.length); index++) {
        const before = initial.stones[index];
        const after = state.stones[index];
        if (!after || !before) continue;
        add(`stone-${index}`, "어빌리티 스톤", `스톤 각인 ${index + 1}`, `${before.name} ${before.level}레벨 → ${after.name} ${after.level}레벨`, !same(before, after), (next) => { next.stones[index] = structuredClone(before); });
    }
    add("stone-health", "어빌리티 스톤", "세공 보너스 체력", `${initial.stoneHealthBonus.toLocaleString()} → ${state.stoneHealthBonus.toLocaleString()}`, initial.stoneHealthBonus !== state.stoneHealthBonus, (next) => { next.stoneHealthBonus = initial.stoneHealthBonus; });
    const coreLabels = ["질서 해", "질서 달", "질서 별", "혼돈 해", "혼돈 달", "혼돈 별"];
    for (let index = 0; index < 6; index++) {
        const before = initial.cores[index];
        const after = state.cores[index];
        if (!before || !after) continue;
        add(`core-${index}`, "아크그리드", coreLabels[index], `${before.grade} ${before.point}p → ${after.grade} ${after.point}p`, !same(before, after), (next) => { next.cores[index] = structuredClone(before); });
    }
    for (const name of ARK_GRID_OPTION_NAMES) {
        const before = initial.arkGridOptions[name] ?? 0;
        const after = state.arkGridOptions[name] ?? before;
        add(`ark-option-${name}`, "아크그리드", name, `${before}레벨 → ${after}레벨`, before !== after, (next) => { next.arkGridOptions[name] = before; });
    }
    for (const name of ["진화", "깨달음", "도약"]) {
        const before = initial.karma[name] ?? 0;
        const after = state.karma[name] ?? before;
        add(`karma-${name}`, "아크패시브", name, `${before}레벨 → ${after}레벨`, before !== after, (next) => { next.karma[name] = before; });
    }
    return entries;
}

export function CombatSimulatorComponent({ info }: { info: CharacterInfo }) {
    const initial = useMemo(() => createInitialState(info), [info]);
    const [state, setState] = useState<SimulatorState>(() => structuredClone(initial));
    const [section, setSection] = useState<SimulatorSection>("equipment");
    const support = info.profile.characterType === "supportor";

    useEffect(() => setState(structuredClone(initial)), [initial]);

    const expected = useMemo(() => calculateExpectedCombatPower(info, initial, state), [info, initial, state]);
    const difference = expected - info.profile.combatPower;
    const change = info.profile.combatPower ? difference / info.profile.combatPower * 100 : 0;
    const hasCombatPowerChange = Math.abs(difference) >= 0.005;
    const itemLevelDifference = EQUIPMENT_SLOTS.slice(0, 6).reduce((sum, slot) => {
        const honingDifference = ((state.equipment.levels[slot] ?? 0) - (initial.equipment.levels[slot] ?? 0)) * 5;
        const advancedHoningDifference = (state.equipment.advancedLevels[slot] ?? 0) - (initial.equipment.advancedLevels[slot] ?? 0);
        return sum + (honingDifference + advancedHoningDifference) / 6;
    }, 0);
    const expectedItemLevel = info.profile.itemLevel + itemLevelDifference;
    const hasItemLevelChange = Math.abs(itemLevelDifference) >= 0.005;
    const changeEntries = useMemo(() => getSimulationChangeEntries(info, initial, state, expected), [info, initial, state, expected]);
    const update = (recipe: (next: SimulatorState) => void) => setState((previous) => {
        const next = structuredClone(previous);
        recipe(next);
        return next;
    });

    return (
        <div className="combat-simulator-form grid w-full gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
            <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
                <div className="overflow-hidden rounded-2xl border border-primary/20 bg-content1 shadow-sm dark:border-primary/25">
                    <div className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-primary/5 to-content1 p-4">
                        <span className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl"/>
                        <div className="relative flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-primary/75">예상 전투력</p>
                            <span className="rounded-full border border-primary/20 bg-content1/80 px-2 py-0.5 text-[10px] font-black text-primary">{support ? "서포터" : "딜러"}</span>
                        </div>
                        <p className="relative mt-2 text-3xl font-black tracking-tight text-primary">{expected.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        <div className="relative mt-3 flex items-center justify-between gap-2 text-xs">
                            <span className="text-default-500">현재 {info.profile.combatPower.toLocaleString()}</span>
                            {hasCombatPowerChange && (
                                <span className={`rounded-full px-2 py-1 font-bold tabular-nums ${difference > 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" : "bg-danger/10 text-danger"}`}>
                                    {difference > 0 ? "+" : ""}{difference.toFixed(2)} ({change > 0 ? "+" : ""}{change.toFixed(2)}%)
                                </span>
                            )}
                        </div>
                        <div className="relative mt-3 flex items-center justify-between gap-2 border-t border-primary/10 pt-3">
                            <span className="text-[11px] font-semibold text-default-500">예상 아이템 레벨</span>
                            <span className="text-sm font-black tabular-nums text-foreground">
                                {expectedItemLevel.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                {hasItemLevelChange && <span className={`ml-1.5 text-[10px] ${itemLevelDifference > 0 ? "text-emerald-600 dark:text-emerald-300" : "text-danger"}`}>({itemLevelDifference > 0 ? "+" : ""}{itemLevelDifference.toFixed(2)})</span>}
                            </span>
                        </div>
                    </div>
                    <div className="border-t border-default-200/80 p-3 dark:border-white/10">
                        <button className="h-9 w-full cursor-pointer rounded-xl border border-default-200 bg-default-50 text-sm font-bold transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary dark:border-white/10 dark:bg-white/[0.03]" onClick={() => setState(structuredClone(initial))}>전체 초기화</button>
                        <p className="mt-2 text-center text-[10px] leading-4 text-default-400">변경 항목의 증감률을 합산한 근사치</p>
                    </div>
                </div>
                <nav aria-label="시뮬레이션 메뉴" className={`${cardClass} p-2`}>
                    <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                        {simulatorSections.map(({ key, label, detail }) => {
                            const active = section === key;
                            return (
                                <button
                                    aria-current={active ? "page" : undefined}
                                    className={`group relative flex min-w-0 cursor-pointer items-center gap-2.5 overflow-hidden rounded-xl border px-2.5 py-2.5 text-left transition-all ${active ? "border-primary/25 bg-primary/10 text-primary shadow-sm" : "border-transparent text-foreground hover:border-default-200 hover:bg-default-100/80"}`}
                                    key={key}
                                    onClick={() => setSection(key)}
                                    type="button"
                                >
                                    <span className={`absolute inset-y-2 left-0 w-1 rounded-r-full transition-colors ${active ? "bg-primary" : "bg-transparent"}`}/>
                                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${active ? "bg-primary text-primary-foreground shadow-sm" : "bg-default-100 text-default-500 group-hover:bg-content1 group-hover:text-primary"}`}>
                                        <SimulatorSectionIcon section={key}/>
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-bold">{label}</span>
                                        <span className={`mt-0.5 hidden truncate text-[11px] lg:block ${active ? "text-primary/70" : "text-default-400"}`}>{detail}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </nav>
                <SimulationChangeHistory entries={changeEntries}/>
            </aside>

            <main className="min-w-0">
                {section === "equipment" && <EquipmentEditor info={info} support={support} state={state} update={update}/>} 
                {section === "avatar" && <AvatarEditor info={info} state={state} update={update}/>}
                {section === "bracelet" && <BraceletEditor info={info} initial={initial} support={support} state={state} update={update}/>}
                {section === "gem" && <GemEditor info={info} state={state} update={update}/>}
                {section === "engraving" && <EngravingEditor info={info} state={state} update={update}/>}
                {section === "arkgrid" && <ArkGridEditor info={info} support={support} state={state} update={update}/>}
                {section === "arkpassive" && <ArkPassiveEditor state={state} update={update}/>} 
            </main>
        </div>
    );
}

function SimulationChangeHistory({ entries }: { entries: SimulationChangeEntry[] }) {
    const pageSize = 15;
    const [page, setPage] = useState(0);
    const pageCount = Math.ceil(entries.length / pageSize);

    useEffect(() => {
        setPage((current) => Math.min(current, Math.max(pageCount - 1, 0)));
    }, [pageCount]);

    if (entries.length === 0) return null;
    const visibleEntries = entries.slice(page * pageSize, (page + 1) * pageSize);

    return (
        <section className={`${cardClass} p-3`}>
            <div className="mb-3 flex items-center justify-between gap-2 px-1">
                <div>
                    <h3 className="text-sm font-black">변경 내역</h3>
                    <p className="mt-0.5 text-[10px] text-default-400">항목별 전투력 기여도</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">{entries.length}</span>
            </div>
            <div className="space-y-1.5">
                {visibleEntries.map((entry) => (
                    <div className="rounded-xl border border-default-200/70 bg-default-50/70 px-2.5 py-2 dark:border-white/10 dark:bg-white/[0.03]" key={entry.id}>
                        <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                                <p className="truncate text-xs font-bold">{entry.label}</p>
                                <p className="mt-0.5 truncate text-[9px] text-default-400">{entry.category} · {entry.detail}</p>
                            </div>
                            <span className={`shrink-0 text-xs font-black tabular-nums ${entry.combatPower > 0 ? "text-emerald-600 dark:text-emerald-300" : "text-danger"}`}>
                                {entry.combatPower > 0 ? "+" : ""}{entry.combatPower.toFixed(2)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            {pageCount > 1 && (
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-default-200/70 pt-3 dark:border-white/10">
                    <button aria-label="이전 변경 내역" className="h-8 cursor-pointer rounded-lg border border-default-200 px-2.5 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-30 dark:border-white/10" disabled={page === 0} onClick={() => setPage((current) => current - 1)} type="button">이전</button>
                    <span className="text-[10px] font-bold text-default-400">{page + 1} / {pageCount}</span>
                    <button aria-label="다음 변경 내역" className="h-8 cursor-pointer rounded-lg border border-default-200 px-2.5 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-30 dark:border-white/10" disabled={page >= pageCount - 1} onClick={() => setPage((current) => current + 1)} type="button">다음</button>
                </div>
            )}
        </section>
    );
}

type EditorProps = { state: SimulatorState; update: (recipe: (next: SimulatorState) => void) => void };

function Heading({ title, detail }: { title: string; detail: string }) {
    return <div className="mb-4"><h2 className="text-xl font-bold">{title}</h2><p className="mt-1 text-sm text-default-500">{detail}</p></div>;
}

function AccessoryGradeButtons({ value, disabled, onChange }: { value: OptionGrade; disabled: boolean; onChange: (grade: OptionGrade) => void }) {
    return <div className="flex items-center gap-1">{accessoryGrades.map((grade) => (
        <button
            aria-label={`${gradeLabels[grade]} 등급`}
            aria-pressed={value === grade}
            className={`h-9 w-9 rounded-xl border bg-content1 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-30 ${accessoryGradeClasses[grade]} ${value === grade ? accessoryGradeActiveClasses[grade] : "hover:bg-default-100"}`}
            disabled={disabled}
            key={grade}
            onClick={() => onChange(grade)}
            type="button"
        >{gradeLabels[grade]}</button>
    ))}</div>;
}

function EquipmentEditor({ info, support, state, update }: EditorProps & { info: CharacterInfo; support: boolean }) {
    const [bulkHoning, setBulkHoning] = useState(20);
    const [bulkQuality, setBulkQuality] = useState(100);
    const [bulkAdvanced, setBulkAdvanced] = useState(40);
    const equipmentBySlot = Object.fromEntries(info.equipment.equipments.map((item) => [normalizeEquipmentSlot(item.type), item]));
    const hasEstherEquipment = info.equipment.equipments.some((item) => item.grade === "에스더");
    const advancedSlots = EQUIPMENT_SLOTS.filter((slot) => {
        const item = equipmentBySlot[slot];
        return item && item.grade !== "에스더" && item.highUpgrade >= 0;
    });
    const qualitySlots = (support ? ["투구", "견갑", "상의", "하의", "장갑"] : ["무기"])
        .filter((slot) => equipmentBySlot[slot] && equipmentBySlot[slot].grade !== "에스더");
    const applyBulkHoning = () => update((next) => {
        for (const slot of EQUIPMENT_SLOTS) {
            const item = equipmentBySlot[slot];
            if (!item || item.grade === "에스더" || slot === "완갑") continue;
            const range = getHoningRange(getEquipmentSet(item.name), slot, item.name);
            if (range.length) {
                const level = Math.min(bulkHoning, Math.max(...range));
                next.equipment.levels[slot] = level;
            }
        }
    });
    const applyBulkQuality = () => update((next) => {
        for (const slot of qualitySlots) {
            next.equipment.qualities[slot] = bulkQuality;
            if (slot === "무기") next.equipment.weaponQuality = bulkQuality;
        }
    });
    const applyBulkAdvanced = () => update((next) => {
        for (const slot of advancedSlots) next.equipment.advancedLevels[slot] = bulkAdvanced;
    });
    return <>
        <Heading title="장비" detail={`일반·상급 재련과 ${support ? "방어구 품질" : "무기 품질"}, 장신구 기본 효과 및 연마 옵션을 변경합니다.${hasEstherEquipment ? " 에스더 장비는 시뮬레이션에서 제외됩니다." : ""}`}/>
        <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div className={`${cardClass} flex items-center gap-2`}>
                <div className="mr-auto"><p className="text-sm font-bold">일괄 재련</p><p className="mt-0.5 text-[11px] text-default-400">완갑 제외</p></div>
                <select aria-label="일괄 재련 단계" className={controlClass} value={bulkHoning} onChange={(event) => setBulkHoning(Number(event.target.value))}>{Array.from({ length: 16 }, (_, i) => i + 10).map((level) => <option key={level} value={level}>+{level}</option>)}</select>
                <button className="h-9 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground" onClick={applyBulkHoning}>적용</button>
            </div>
            {qualitySlots.length ? <div className={`${cardClass} flex items-center gap-2`}>
                <div className="mr-auto"><p className="text-sm font-bold">일괄 품질</p><p className="mt-0.5 text-[11px] text-default-400">계산 대상 부위</p></div>
                <input aria-label="일괄 품질 수치" className={`${controlClass} w-20`} max={100} min={0} type="number" value={bulkQuality} onChange={(event) => setBulkQuality(clamp(Number(event.target.value), 100))}/>
                <button className="h-9 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground" onClick={applyBulkQuality}>적용</button>
            </div> : null}
            {advancedSlots.length ? <div className={`${cardClass} flex items-center gap-2`}>
                <div className="mr-auto"><p className="text-sm font-bold">일괄 상급 재련</p><p className="mt-0.5 text-[11px] text-default-400">보유 장비만</p></div>
                <select aria-label="일괄 상급 재련 단계" className={controlClass} value={bulkAdvanced} onChange={(event) => setBulkAdvanced(Number(event.target.value))}>{Array.from({ length: 41 }, (_, i) => <option value={i} key={i}>{i}단계</option>)}</select>
                <button className="h-9 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground" onClick={applyBulkAdvanced}>적용</button>
            </div> : null}
        </div>
        <div className="grid gap-3 xl:grid-cols-2">
            {EQUIPMENT_SLOTS.map((slot) => {
                const item = equipmentBySlot[slot];
                if (!item || item.grade === "에스더") return null;
                const set = getEquipmentSet(item.name);
                const range = getHoningRange(set, slot, item.name);
                return <div className={cardClass} key={slot}>
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-default-200 bg-default-100 p-1.5 dark:border-white/10"><img alt={`${slot} 아이콘`} className="h-full w-full object-contain" src={item.icon}/></div>
                        <div className="min-w-0 grow"><div className="mb-1 flex items-center gap-1.5"><span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">{slot}</span><span className="text-xs font-semibold text-default-500">{set} · {item.grade}</span></div><p className="truncate text-sm font-bold">{item.name}</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-default-50 p-3 sm:grid-cols-3 dark:bg-white/[0.03]">
                        <label className="grid gap-1 text-xs text-default-500">재련<select className={controlClass} value={state.equipment.levels[slot] ?? 0} onChange={(e) => update((next) => { const level = Number(e.target.value); next.equipment.levels[slot] = level; if (slot === "완갑") next.equipment.grades[slot] = getWristGuardGradeForLevel(level, next.equipment.grades[slot]); })}>{range.map((level) => <option value={level} key={level}>+{level}</option>)}</select></label>
                        {advancedSlots.includes(slot) ? <label className="grid gap-1 text-xs text-default-500">상급 재련<select className={controlClass} value={state.equipment.advancedLevels[slot] ?? 0} onChange={(e) => update((next) => { next.equipment.advancedLevels[slot] = Number(e.target.value); })}>{Array.from({ length: 41 }, (_, i) => <option value={i} key={i}>{i}단계</option>)}</select></label> : null}
                        {slot === "완갑" ? <label className="grid gap-1 text-xs text-default-500">등급<select aria-label="완갑 등급" className={controlClass} value={state.equipment.grades[slot]} onChange={(e) => update((next) => { const grade = e.target.value; next.equipment.grades[slot] = grade; next.equipment.levels[slot] = clampWristGuardLevelForGrade(next.equipment.levels[slot], grade); })}>{WRIST_GUARD_GRADES.map((grade) => <option key={grade}>{grade}</option>)}</select></label> : null}
                        {!support && slot === "무기" ? <label className="grid gap-1 text-xs text-default-500">품질<input className={controlClass} type="number" min={0} max={100} value={state.equipment.weaponQuality} onChange={(e) => update((next) => { const quality = clamp(Number(e.target.value), 100); next.equipment.weaponQuality = quality; next.equipment.qualities.무기 = quality; })}/></label> : null}
                        {support && ["투구", "견갑", "상의", "하의", "장갑"].includes(slot) ? <label className="grid gap-1 text-xs text-default-500">품질<input className={controlClass} type="number" min={0} max={100} value={state.equipment.qualities?.[slot] ?? item.quality ?? 0} onChange={(e) => update((next) => { next.equipment.qualities ??= {}; next.equipment.qualities[slot] = clamp(Number(e.target.value), 100); })}/></label> : null}
                    </div>
                </div>;
            })}
        </div>
        <Heading title="장신구" detail="부위와 연마 개수에 따른 주스탯 상한을 자동으로 적용합니다."/>
        <div className="grid gap-3 xl:grid-cols-2">
            {state.accessories.map((accessory, index) => {
                const source = info.equipment.accessories[index];
                const options = getAccessoryOptions(accessory.type);
                const maxMain = getAccessoryMaxMainStat(accessory);
                return <div className={cardClass} key={accessory.key}>
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-default-200 bg-default-100 p-1.5 dark:border-white/10">{source?.icon ? <img alt={`${accessory.type} 아이콘`} className="h-full w-full object-contain" src={source.icon}/> : null}</div>
                        <div className="min-w-0 grow"><div className="mb-1 flex items-center gap-1.5"><span className="rounded-md bg-secondary/10 px-2 py-0.5 text-[11px] font-bold text-secondary">{accessory.type}</span><span className="text-xs font-semibold text-default-500">{source?.grade ?? ""}{source?.point ? ` · 깨달음 +${source.point}` : ""}</span></div><p className="truncate text-sm font-bold">{accessory.name}</p></div>
                    </div>
                    <div className="mb-3 grid grid-cols-2 gap-2 rounded-xl bg-default-50 p-3 dark:bg-white/[0.03]">
                        <label className="grid gap-1 text-xs text-default-500">주스탯 · 최대 {maxMain.toLocaleString()}<input className={controlClass} type="number" min={0} max={maxMain} value={accessory.mainStat} onChange={(e) => update((next) => { next.accessories[index].mainStat = clamp(Number(e.target.value), maxMain); })}/></label>
                        <label className="grid gap-1 text-xs text-default-500">체력<input className={controlClass} type="number" min={0} max={999999} value={accessory.vitality} onChange={(e) => update((next) => { next.accessories[index].vitality = clamp(Number(e.target.value), 999999); })}/></label>
                    </div>
                    <div className="space-y-2">{accessory.options.map((option, optionIndex) => <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2" key={optionIndex}>
                        <select className={controlClass} value={option.name} onChange={(e) => update((next) => { const changed = next.accessories[index].options[optionIndex]; changed.name = e.target.value; changed.grade = e.target.value === "없음" ? "none" : changed.grade === "none" ? "sm" : changed.grade; })}>{options.map((item, i) => <option key={`${item.small}-${i}`} value={item.small}>{item.small.endsWith("%") ? `${item.name}%` : item.name}</option>)}</select>
                        <AccessoryGradeButtons disabled={option.name === "없음"} value={option.grade} onChange={(grade) => update((next) => { next.accessories[index].options[optionIndex].grade = grade; })}/>
                    </div>)}</div>
                </div>;
            })}
        </div>
    </>;
}

const avatarGrades = ["없음", "영웅", "전설"] as const;
const avatarGradeStyles: Record<string, string> = {
    없음: "border-default-200 bg-default-100 text-default-400 dark:border-white/10 dark:bg-white/[0.05]",
    영웅: "border-violet-300 bg-gradient-to-br from-violet-100 to-fuchsia-50 text-violet-600 dark:border-violet-500/30 dark:from-violet-500/20 dark:to-fuchsia-500/10 dark:text-violet-300",
    전설: "border-amber-300 bg-gradient-to-br from-amber-100 to-orange-50 text-amber-600 dark:border-amber-500/30 dark:from-amber-500/20 dark:to-orange-500/10 dark:text-amber-300",
};

function getSimulatorAvatar(info: CharacterInfo, slot: string) {
    const gradeRank: Record<string, number> = { 영웅: 1, 전설: 2 };
    const candidates = info.avatars.filter((avatar) => {
        if (!gradeRank[avatar.grade]) return false;
        if (slot === "무기") return avatar.type.startsWith("무기");
        if (slot === "투구") return avatar.type.startsWith("머리");
        if (slot === "상의") return avatar.type.startsWith("상의");
        return avatar.type.startsWith("하의") || (avatar.type.startsWith("상의") && /상하의|한벌|한 벌/.test(avatar.name));
    });
    const equippedCandidates = candidates.some((avatar) => avatar.isInner) ? candidates.filter((avatar) => avatar.isInner) : candidates;
    return equippedCandidates.sort((left, right) => gradeRank[right.grade] - gradeRank[left.grade])[0];
}

function AvatarEditor({ info, state, update }: EditorProps & { info: CharacterInfo }) {
    const uniformGrade = avatarGrades.find((grade) => AVATAR_SLOTS.every((slot) => state.avatars[slot] === grade));
    const applyAll = (grade: string) => update((next) => {
        AVATAR_SLOTS.forEach((slot) => { next.avatars[slot] = grade; });
    });

    return <>
        <Heading title="아바타" detail="덧입기는 제외하며 영웅은 +1%, 전설은 +2%의 주스탯 효과를 적용합니다."/>
        <div className={`${cardClass} mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}>
            <div>
                <p className="text-sm font-bold">일괄 등급</p>
                <p className="mt-1 text-xs text-default-500">무기, 투구, 상의, 하의 등급을 한 번에 변경합니다.</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {avatarGrades.map((grade) => (
                    <button
                        aria-pressed={uniformGrade === grade}
                        className={`h-9 min-w-16 cursor-pointer rounded-xl border px-3 text-sm font-bold transition ${uniformGrade === grade ? avatarGradeStyles[grade] + " ring-2 ring-current/15" : "border-default-200 bg-content1 text-default-500 hover:bg-default-100 dark:border-white/10"}`}
                        key={grade}
                        onClick={() => applyAll(grade)}
                        type="button"
                    >{grade}</button>
                ))}
            </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
            {AVATAR_SLOTS.map((slot) => {
                const grade = state.avatars[slot];
                const avatar = getSimulatorAvatar(info, slot);
                return (
                    <div className={`${cardClass} flex items-center gap-4`} key={slot}>
                        <div className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border ${avatarGradeStyles[avatar?.grade ?? "없음"]}`}>
                            {avatar ? (
                                <img alt={`${slot} ${avatar.name}`} className="h-full w-full object-cover" src={avatar.icon}/>
                            ) : (
                                <svg aria-label={`${slot} 아바타 없음`} className="h-7 w-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" viewBox="0 0 24 24">
                                    <path d="M7 7l10 10M17 7 7 17"/>
                                </svg>
                            )}
                        </div>
                        <div className="min-w-0 grow">
                            <div className="mb-2 flex min-w-0 items-center gap-2">
                                <p className="shrink-0 font-bold">{slot}</p>
                                <span className={`truncate rounded-full border px-2 py-0.5 text-[10px] font-semibold ${avatarGradeStyles[grade] ?? avatarGradeStyles.없음}`}>{grade}</span>
                            </div>
                            <p className="mb-3 truncate text-xs text-default-500">{avatar ? `${avatar.name} · 현재 ${avatar.grade}` : "장착된 영웅·전설 아바타 없음"}</p>
                            <select className={`${controlClass} w-full cursor-pointer`} value={grade} onChange={(e) => update((next) => { next.avatars[slot] = e.target.value; })}>
                                {avatarGrades.map((option) => <option key={option}>{option}</option>)}
                            </select>
                        </div>
                    </div>
                );
            })}
        </div>
    </>;
}

function BraceletEditor({ info, initial, support, state, update }: EditorProps & { info: CharacterInfo; initial: SimulatorState; support: boolean }) {
    const selected = new Set(state.bracelet.map((item) => item.type).filter((type) => type !== "없음"));
    const emptyBracelet = Array.from({ length: 5 }, () => ({ type: "없음", value: 0, grade: "none" as OptionGrade }));
    const { totalPercent, optionPercents } = useMemo(() => {
        const withoutBracelet = structuredClone(state);
        withoutBracelet.bracelet = structuredClone(emptyBracelet);
        const basePower = calculateExpectedCombatPower(info, initial, withoutBracelet);
        const percentages = state.bracelet.map((item, index) => {
            if (item.type === "없음") return 0;
            const singleOption = structuredClone(withoutBracelet);
            singleOption.bracelet[index] = structuredClone(item);
            const optionPower = calculateExpectedCombatPower(info, initial, singleOption);
            return basePower > 0 ? (optionPower / basePower - 1) * 100 : 0;
        });
        return {
            totalPercent: calculateBraceletCombatPowerPercent(info, initial, state),
            optionPercents: percentages,
        };
    }, [info, initial, state]);

    return <>
        <Heading title="팔찌" detail="최대 5개 효과를 설정합니다. 같은 효과는 중복 선택할 수 없습니다."/>
        <div className="mb-4 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-content1 p-5 shadow-sm dark:border-primary/25">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary/70">Bracelet Effect</p>
                    <p className="mt-1 text-lg font-black">팔찌 전투력 효과 합계</p>
                    <p className="mt-1 text-xs text-default-500">팔찌를 장착하지 않은 상태를 기준으로 선택한 효과를 합산합니다.</p>
                </div>
                <p className="text-3xl font-black tabular-nums text-primary">{totalPercent >= 0 ? "+" : ""}{totalPercent.toFixed(2)}%</p>
            </div>
        </div>
        <div className="space-y-3">
            {Array.from({ length: 5 }, (_, index) => {
                const item = state.bracelet[index];
                const rawOption = braceletRawOptions.find((option) => option.name === item.type);
                const contribution = optionPercents[index] ?? 0;
                return (
                    <div className={`${cardClass} p-3 sm:p-4`} key={index}>
                        <div className="grid gap-3 md:grid-cols-[44px_minmax(0,1fr)_190px_120px] md:items-center">
                            <div className="flex items-center justify-between md:block">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-default-100 text-sm font-black text-default-500 dark:bg-white/[0.06]">{index + 1}</span>
                                <span className="text-xs font-semibold text-default-400 md:hidden">효과 {index + 1}</span>
                            </div>
                            <select
                                aria-label={`팔찌 효과 ${index + 1}`}
                                className={`${controlClass} w-full cursor-pointer`}
                                value={item.type}
                                onChange={(e) => update((next) => {
                                    const type = e.target.value;
                                    const raw = braceletRawOptions.some((option) => option.name === type);
                                    next.bracelet[index] = { type, value: 0, grade: type === "없음" || raw ? "none" : "sm" };
                                })}
                            >
                                <option value="없음">없음</option>
                                <optgroup label="수치 효과">{braceletRawOptions.map((option) => <option key={option.name} value={option.name} disabled={selected.has(option.name) && option.name !== item.type}>{option.label}</option>)}</optgroup>
                                <optgroup label="특수 효과">{braceletSpecialOptions.map((option) => <option key={option.name} value={option.name} disabled={selected.has(option.name) && option.name !== item.type}>{option.label}</option>)}</optgroup>
                            </select>
                            <div className="flex min-h-9 items-center md:justify-end">
                                {rawOption ? (
                                    <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 md:grid-cols-[120px_auto] md:justify-end">
                                        <input
                                            aria-label={`${rawOption.label} 수치`}
                                            className={`${controlClass} w-full`}
                                            max={getBraceletInputMax(item.type)}
                                            min={0}
                                            type="number"
                                            value={item.value}
                                            onChange={(e) => update((next) => { next.bracelet[index].value = clamp(Number(e.target.value), getBraceletInputMax(item.type)); })}
                                        />
                                        <span className="text-xs font-semibold text-default-400">최대 {rawOption.max.toLocaleString()}</span>
                                    </div>
                                ) : (
                                    <AccessoryGradeButtons
                                        disabled={item.type === "없음"}
                                        value={item.grade}
                                        onChange={(grade) => update((next) => { next.bracelet[index].grade = grade; })}
                                    />
                                )}
                            </div>
                            <div className={`rounded-xl border px-3 py-2 text-right ${contribution > 0 ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300" : "border-default-200 bg-default-50 text-default-400 dark:border-white/10 dark:bg-white/[0.03]"}`}>
                                <p className="text-[10px] font-semibold">독립 전투력</p>
                                <p className="mt-0.5 text-sm font-black tabular-nums">{contribution >= 0 ? "+" : ""}{contribution.toFixed(2)}%</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </>;
}

function GemEditor({ info, state, update }: EditorProps & { info: CharacterInfo }) {
    const gems = Array.from({ length: 11 }, (_, index) => state.gems[index] ?? 1);
    const [bulkGemLevel, setBulkGemLevel] = useState(Math.max(...gems));
    return <>
        <Heading title="보석" detail="현재 장착 보석 11개를 기준으로 각 보석의 티어 4 레벨을 변경합니다."/>
        <div className={`${cardClass} overflow-hidden`}>
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-default-200/80 pb-3 dark:border-white/10">
                <div>
                    <p className="font-bold">장착 보석</p>
                    <p className="mt-1 text-xs text-default-500">아이콘 아래에서 적용할 레벨을 선택하세요.</p>
                </div>
                <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-black text-white shadow-sm">{info.gems.slice(0, 11).length} / 11</span>
            </div>
            <div className="mb-5 flex flex-col gap-3 rounded-xl border border-default-200/80 bg-default-50/70 p-3 sm:flex-row sm:items-center dark:border-white/10 dark:bg-white/[0.03]">
                <div className="min-w-0 grow">
                    <p className="text-sm font-bold">보석 레벨 일괄 적용</p>
                    <p className="mt-1 text-xs text-default-400">장착 슬롯 11개의 레벨을 한 번에 변경합니다.</p>
                </div>
                <div className="grid grid-cols-[100px_64px] gap-2">
                    <select aria-label="일괄 보석 레벨" className={`${controlClass} cursor-pointer text-center font-bold`} value={bulkGemLevel} onChange={(e) => setBulkGemLevel(Number(e.target.value))}>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => <option key={value} value={value}>{value}레벨</option>)}
                    </select>
                    <button className="h-9 cursor-pointer rounded-lg bg-primary text-sm font-bold text-primary-foreground transition hover:opacity-90" onClick={() => update((next) => { next.gems = Array.from({ length: 11 }, () => bulkGemLevel); })} type="button">적용</button>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-x-2 gap-y-5 sm:grid-cols-6 xl:grid-cols-11">
                {gems.map((level, index) => {
                    const gem = info.gems[index];
                    return (
                        <div className="flex min-w-0 flex-col items-center" key={index} title={gem?.name ?? `보석 ${index + 1}`}>
                            <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-amber-300 bg-gradient-to-br from-amber-100 to-orange-100 shadow-sm dark:border-amber-500/30 dark:from-amber-500/20 dark:to-orange-500/10">
                                {gem?.icon ? (
                                    <img alt={gem.name} className="h-full w-full object-cover" src={gem.icon}/>
                                ) : (
                                    <svg aria-label={`보석 ${index + 1} 없음`} className="h-6 w-6 text-default-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" viewBox="0 0 24 24">
                                        <path d="M7 7l10 10M17 7 7 17"/>
                                    </svg>
                                )}
                                <span className="absolute right-0 top-0 min-w-5 rounded-bl-lg bg-primary px-1 py-0.5 text-center text-[10px] font-black leading-none text-primary-foreground shadow-sm">{level}</span>
                            </div>
                            <select
                                aria-label={`보석 ${index + 1} 레벨`}
                                className={`${controlClass} mt-2 w-14 cursor-pointer px-1 text-center font-bold`}
                                value={level}
                                onChange={(e) => update((next) => { next.gems[index] = Number(e.target.value); })}
                            >
                                {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => <option key={value} value={value}>{value}</option>)}
                            </select>
                        </div>
                    );
                })}
            </div>
        </div>
    </>;
}

function EngravingIcon({ name, className = "h-12 w-12" }: { name: string; className?: string }) {
    const icon = ENGRAVING_ICON_BY_NAME[name];
    return (
        <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-violet-300 bg-gradient-to-br from-violet-100 to-fuchsia-50 shadow-sm dark:border-violet-500/30 dark:from-violet-500/20 dark:to-fuchsia-500/10 ${className}`}>
            {icon ? (
                <img alt={`${name} 각인`} className="h-full w-full object-cover" src={icon}/>
            ) : (
                <svg aria-label={`${name} 각인 아이콘 없음`} className="h-5 w-5 text-violet-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16ZM20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z"/>
                </svg>
            )}
        </div>
    );
}

function EngravingEditor({ info, state, update }: EditorProps & { info: CharacterInfo }) {
    const names = ENGRAVING_NAMES;
    const abilityStone = info.equipment.stone;
    return <>
        <Heading title="각인" detail="현재 각인의 유물 각인서 단계와 어빌리티 스톤 레벨을 변경합니다."/>
        <div className="grid gap-3 sm:grid-cols-2">
            {state.engravings.map((engraving, index) => (
                <div className={`${cardClass} flex items-center gap-3`} key={`${engraving.name}-${index}`}>
                    <EngravingIcon name={engraving.name}/>
                    <div className="min-w-0 grow">
                        <p className="truncate font-bold">{engraving.name}</p>
                        <p className="mt-1 text-xs text-default-400">전투 각인</p>
                    </div>
                    <select
                        aria-label={`${engraving.name} 유물 단계`}
                        className={`${controlClass} shrink-0 cursor-pointer`}
                        value={engraving.level}
                        onChange={(e) => update((next) => { next.engravings[index].level = Number(e.target.value); })}
                    >
                        {Array.from({ length: 5 }, (_, i) => <option key={i} value={i}>유물 {i}단계</option>)}
                    </select>
                </div>
            ))}
        </div>

        <div className={`${cardClass} mt-6 overflow-hidden p-0`}>
            <div className="flex items-center gap-4 border-b border-default-200/80 bg-default-50/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-default-200 bg-default-100 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
                    {abilityStone?.icon ? (
                        <img alt={abilityStone.name} className="h-full w-full object-cover" src={abilityStone.icon}/>
                    ) : (
                        <svg aria-label="어빌리티 스톤 없음" className="h-7 w-7 text-default-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path d="m12 3 7 6-7 12L5 9l7-6Z"/><path d="m5 9 7 3 7-3"/>
                        </svg>
                    )}
                </div>
                <div className="min-w-0 grow">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black">어빌리티 스톤</h3>
                        {abilityStone?.grade && <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">{abilityStone.grade}</span>}
                    </div>
                    <p className="mt-1 truncate text-sm text-default-500">{abilityStone?.name ?? "장착된 어빌리티 스톤 없음"}</p>
                </div>
            </div>

            <div className="grid gap-3 p-4 lg:grid-cols-2">
                {Array.from({ length: 2 }, (_, index) => {
                    const stone = state.stones[index] ?? { name: names[index] ?? names[0] ?? "", level: 0 };
                    return (
                        <div className="rounded-2xl border border-default-200/80 bg-content1 p-3 dark:border-white/10" key={index}>
                            <div className="mb-3 flex items-center gap-3">
                                <EngravingIcon className="h-11 w-11" name={stone.name}/>
                                <div>
                                    <p className="text-xs font-semibold text-default-400">스톤 각인 {index + 1}</p>
                                    <p className="mt-0.5 font-bold">{stone.name}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-[minmax(0,1fr)_100px] gap-2">
                                <select aria-label={`스톤 각인 ${index + 1}`} className={`${controlClass} min-w-0 cursor-pointer`} value={stone.name} onChange={(e) => update((next) => { next.stones[index] = { ...stone, name: e.target.value }; })}>{names.map((name) => <option key={name}>{name}</option>)}</select>
                                <select aria-label={`스톤 각인 ${index + 1} 레벨`} className={`${controlClass} cursor-pointer`} value={stone.level} onChange={(e) => update((next) => { next.stones[index] = { ...stone, level: Number(e.target.value) }; })}>{Array.from({ length: 5 }, (_, i) => <option key={i} value={i}>{i}레벨</option>)}</select>
                            </div>
                        </div>
                    );
                })}
                <label className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 lg:col-span-2 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20.8 5.7a5.5 5.5 0 0 0-7.8 0L12 6.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z"/></svg>
                    </span>
                    <span className="min-w-0 grow">
                        <span className="block text-sm font-bold text-emerald-700 dark:text-emerald-300">세공 보너스 체력</span>
                        <span className="mt-1 block text-xs text-emerald-600/70 dark:text-emerald-300/60">서포터 전투력 계산에 적용됩니다.</span>
                    </span>
                    <select aria-label="세공 보너스 체력" className={`${controlClass} w-32 shrink-0 cursor-pointer`} value={state.stoneHealthBonus} onChange={(e) => update((next) => { next.stoneHealthBonus = Number(e.target.value); })}>{STONE_HEALTH_BONUSES.map((value) => <option key={value} value={value}>{value.toLocaleString()}</option>)}</select>
                </label>
            </div>
        </div>
    </>;
}

const coreGradeStyles: Record<string, string> = {
    영웅: "border-violet-300 bg-violet-50 text-violet-600 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300",
    전설: "border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
    유물: "border-orange-300 bg-orange-50 text-orange-600 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300",
    고대: "border-[#c2b098] bg-[#c2b098]/15 text-[#98856b] dark:border-[#ac977a] dark:bg-[#ac977a]/15 dark:text-[#e3c7a1]",
};

function getAllowedCorePoints(grade: string) {
    return grade === "영웅" ? [0, 10] : grade === "전설" ? [0, 10, 14] : CORE_POINTS;
}

function clampCorePointForGrade(point: number, grade: string) {
    return getAllowedCorePoints(grade).filter((allowed) => allowed <= point).at(-1) ?? 0;
}

function ArkGridEditor({ info, support, state, update }: EditorProps & { info: CharacterInfo; support: boolean }) {
    const labels = ["질서 해", "질서 달", "질서 별", "혼돈 해", "혼돈 달", "혼돈 별"];
    const visibleOptions = support ? ARK_GRID_OPTION_NAMES.slice(3) : ARK_GRID_OPTION_NAMES.slice(0, 3);
    const [bulkGrade, setBulkGrade] = useState("유물");
    const [bulkPoint, setBulkPoint] = useState(17);

    return <>
        <Heading title="아크그리드" detail="질서·혼돈 코어의 등급과 포인트, 젬 효과의 합산 레벨을 변경합니다."/>
        <div className={`${cardClass} mb-4 grid gap-4 sm:grid-cols-2`}>
            <div className="rounded-xl border border-default-200/80 bg-default-50/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="text-sm font-bold">코어 등급 일괄 적용</p>
                <p className="mt-1 text-xs text-default-400">6개 코어의 등급을 한 번에 변경합니다.</p>
                <div className="mt-3 grid grid-cols-[minmax(0,1fr)_64px] gap-2">
                    <select aria-label="일괄 코어 등급" className={`${controlClass} cursor-pointer`} value={bulkGrade} onChange={(e) => setBulkGrade(e.target.value)}>{CORE_GRADES.map((grade) => <option key={grade}>{grade}</option>)}</select>
                    <button className="h-9 cursor-pointer rounded-lg bg-primary text-sm font-bold text-primary-foreground transition hover:opacity-90" onClick={() => update((next) => { next.cores.slice(0, 6).forEach((core) => { core.grade = bulkGrade; core.point = clampCorePointForGrade(core.point, bulkGrade); }); })} type="button">적용</button>
                </div>
            </div>
            <div className="rounded-xl border border-default-200/80 bg-default-50/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="text-sm font-bold">코어 포인트 일괄 적용</p>
                <p className="mt-1 text-xs text-default-400">등급 최대치를 넘으면 가능한 최고 포인트로 보정합니다.</p>
                <div className="mt-3 grid grid-cols-[minmax(0,1fr)_64px] gap-2">
                    <select aria-label="일괄 코어 포인트" className={`${controlClass} cursor-pointer`} value={bulkPoint} onChange={(e) => setBulkPoint(Number(e.target.value))}>{CORE_POINTS.map((point) => <option key={point} value={point}>{point}p</option>)}</select>
                    <button className="h-9 cursor-pointer rounded-lg bg-primary text-sm font-bold text-primary-foreground transition hover:opacity-90" onClick={() => update((next) => { next.cores.slice(0, 6).forEach((core) => { core.point = clampCorePointForGrade(bulkPoint, core.grade); }); })} type="button">적용</button>
                </div>
            </div>
        </div>

        <div className="space-y-3">
            {state.cores.slice(0, 6).map((core, index) => {
                const equippedCore = info.arkgrid.cores.find((item) => item.index === index);
                const allowedPoints = getAllowedCorePoints(core.grade);
                const currentName = equippedCore?.name.split(":").at(-1)?.trim();
                return (
                    <div className={`${cardClass} p-3 sm:p-4`} key={index}>
                        <div className="grid gap-3 md:grid-cols-[64px_minmax(150px,1fr)_110px_100px_minmax(180px,1fr)] md:items-center">
                            <div className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border ${coreGradeStyles[equippedCore?.grade ?? core.grade] ?? "border-default-200 bg-default-100 text-default-400"}`}>
                                {equippedCore?.icon ? (
                                    <img alt={equippedCore.name} className="h-full w-full object-cover" src={equippedCore.icon}/>
                                ) : (
                                    <svg aria-label={`${labels[index]} 코어 없음`} className="h-7 w-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M7 7l10 10M17 7 7 17"/></svg>
                                )}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-black">{labels[index]}</p>
                                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${coreGradeStyles[core.grade]}`}>{core.grade}</span>
                                </div>
                                <p className="mt-1 truncate text-xs text-default-500">{currentName ? `${currentName} · 현재 ${equippedCore?.grade}` : "장착된 코어 없음"}</p>
                            </div>
                            <select aria-label={`${labels[index]} 등급`} className={`${controlClass} cursor-pointer`} value={core.grade} onChange={(e) => update((next) => { const changed = next.cores[index]; changed.grade = e.target.value; changed.point = clampCorePointForGrade(changed.point, e.target.value); })}>{CORE_GRADES.map((grade) => <option key={grade}>{grade}</option>)}</select>
                            <select aria-label={`${labels[index]} 포인트`} className={`${controlClass} cursor-pointer`} value={core.point} onChange={(e) => update((next) => { next.cores[index].point = Number(e.target.value); })}>{allowedPoints.map((point) => <option key={point} value={point}>{point}p</option>)}</select>
                            {index >= 3 ? (
                                <select aria-label={`${labels[index]} 코어 종류`} className={`${controlClass} min-w-0 cursor-pointer`} value={core.name} onChange={(e) => update((next) => { next.cores[index].name = e.target.value; if (e.target.value === "없음") next.cores[index].point = 0; })}>{getCoreChoices(index, support).map((name) => <option key={name}>{name}</option>)}</select>
                            ) : (
                                <span className="truncate rounded-lg bg-default-100 px-3 py-2 text-sm font-semibold text-default-500 dark:bg-white/[0.05]">{core.name}</span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>

        <div className={`${cardClass} mt-6`}>
            <div className="mb-4">
                <h3 className="text-lg font-black">젬 효과 합산</h3>
                <p className="mt-1 text-xs text-default-500">현재 장착 젬의 효과 레벨 합계를 조절합니다.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
                {visibleOptions.map((name) => (
                    <label className="rounded-xl border border-default-200/80 bg-default-50/70 p-3 text-sm font-bold dark:border-white/10 dark:bg-white/[0.03]" key={name}>
                        <span className="mb-2 block">{name}</span>
                        <input aria-label={`${name} 합산 레벨`} className={`${controlClass} w-full`} type="number" min={0} max={999} value={state.arkGridOptions[name] ?? 0} onChange={(e) => update((next) => { next.arkGridOptions[name] = clamp(Number(e.target.value), 999); })}/>
                    </label>
                ))}
            </div>
        </div>
    </>;
}

function ArkPassiveEditor({ state, update }: EditorProps) {
    const types = [
        { name: "진화", color: "text-amber-600 dark:text-amber-300", border: "border-amber-300/80 dark:border-amber-500/30", background: "from-amber-100/80 via-amber-50/40 to-content1 dark:from-amber-500/15 dark:via-amber-500/5", progress: "bg-amber-500" },
        { name: "깨달음", color: "text-blue-600 dark:text-blue-300", border: "border-blue-300/80 dark:border-blue-500/30", background: "from-blue-100/80 via-blue-50/40 to-content1 dark:from-blue-500/15 dark:via-blue-500/5", progress: "bg-blue-500" },
        { name: "도약", color: "text-emerald-600 dark:text-emerald-300", border: "border-emerald-300/80 dark:border-emerald-500/30", background: "from-emerald-100/80 via-emerald-50/40 to-content1 dark:from-emerald-500/15 dark:via-emerald-500/5", progress: "bg-emerald-500" },
    ];
    const totalLevel = types.reduce((sum, type) => sum + (state.karma[type.name] ?? 0), 0);

    return <>
        <Heading title="아크패시브" detail="노드와 랭크는 유지하고 카르마 레벨만 변경합니다."/>
        <div className={`${cardClass} mb-4 flex items-center justify-between gap-4`}>
            <div>
                <p className="text-sm font-bold">카르마 레벨 합계</p>
                <p className="mt-1 text-xs text-default-500">진화 · 깨달음 · 도약</p>
            </div>
            <p className="text-2xl font-black tabular-nums text-primary">{totalLevel}<span className="ml-1 text-sm text-default-400">/ 90</span></p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
            {types.map((type) => {
                const level = state.karma[type.name] ?? 0;
                const changeLevel = (value: number) => update((next) => { next.karma[type.name] = clamp(value, 30); });
                return (
                    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-sm ${type.border} ${type.background}`} key={type.name}>
                        <div className="flex items-center justify-between gap-3">
                            <h3 className={`text-lg font-black ${type.color}`}>{type.name}</h3>
                            <span className={`rounded-full border bg-content1/80 px-2.5 py-1 text-xs font-black tabular-nums ${type.border} ${type.color}`}>Lv. {level}</span>
                        </div>
                        <div className="mt-4 grid grid-cols-[36px_minmax(0,1fr)_36px] gap-2">
                            <button aria-label={`${type.name} 레벨 감소`} className="h-10 cursor-pointer rounded-xl border border-default-200 bg-content1 text-lg font-bold text-default-500 transition hover:bg-default-100 dark:border-white/10" onClick={() => changeLevel(level - 1)} type="button">−</button>
                            <input aria-label={`${type.name} 카르마 레벨`} className="h-10 min-w-0 rounded-xl border border-default-200 bg-content1 px-2 text-center text-base font-black outline-none focus:border-primary dark:border-white/10" max={30} min={0} type="number" value={level} onChange={(e) => changeLevel(Number(e.target.value))}/>
                            <button aria-label={`${type.name} 레벨 증가`} className="h-10 cursor-pointer rounded-xl border border-default-200 bg-content1 text-lg font-bold text-default-500 transition hover:bg-default-100 dark:border-white/10" onClick={() => changeLevel(level + 1)} type="button">+</button>
                        </div>
                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-default-200/80 dark:bg-white/10">
                            <div className={`h-full rounded-full transition-[width] ${type.progress}`} style={{ width: `${level / 30 * 100}%` }}/>
                        </div>
                    </div>
                );
            })}
        </div>
    </>;
}
