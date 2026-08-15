'use client'

import { useEffect, useMemo, useState } from "react";
import { CharacterInfo } from "../model/types";
import {
    ARK_GRID_OPTION_NAMES,
    AVATAR_SLOTS,
    braceletRawOptions,
    braceletSpecialOptions,
    calculateExpectedCombatPower,
    CORE_GRADES,
    CORE_POINTS,
    createInitialState,
    clampWristGuardLevelForGrade,
    ENGRAVING_NAMES,
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

const sectionLabels: Array<[SimulatorSection, string]> = [
    ["equipment", "장비"], ["avatar", "아바타"], ["bracelet", "팔찌"], ["gem", "보석"],
    ["engraving", "각인"], ["arkgrid", "아크그리드"], ["arkpassive", "아크패시브"],
];
const gradeLabels: Record<OptionGrade, string> = { none: "없음", sm: "하", md: "중", lg: "상" };
const controlClass = "h-9 rounded-lg border border-default-300 bg-content1 px-2 text-sm outline-none focus:border-primary dark:border-white/15";
const cardClass = "rounded-2xl border border-default-200/80 bg-content1 p-4 shadow-sm dark:border-white/10";

function clamp(value: number, max: number, min = 0) {
    return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
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
    const update = (recipe: (next: SimulatorState) => void) => setState((previous) => {
        const next = structuredClone(previous);
        recipe(next);
        return next;
    });

    return (
        <div className="grid w-full gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
            <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
                <div className={cardClass}>
                    <p className="text-xs font-semibold text-default-500">예상 전투력 · {support ? "서포터" : "딜러"}</p>
                    <p className="mt-2 text-3xl font-black text-primary">{expected.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-default-500">현재 {info.profile.combatPower.toLocaleString()}</span>
                        <span className={difference >= 0 ? "font-semibold text-emerald-500" : "font-semibold text-danger"}>
                            {difference >= 0 ? "+" : ""}{difference.toFixed(2)} ({change >= 0 ? "+" : ""}{change.toFixed(2)}%)
                        </span>
                    </div>
                    <button className="mt-4 h-9 w-full rounded-lg border border-default-300 text-sm font-semibold hover:bg-default-100" onClick={() => setState(structuredClone(initial))}>전체 초기화</button>
                    <p className="mt-3 text-[11px] leading-4 text-default-400">현재 전투력을 기준으로 변경 항목의 증감률을 합산한 근사치입니다.</p>
                </div>
                <nav className={`${cardClass} grid grid-cols-2 gap-2 p-2 lg:grid-cols-1`}>
                    {sectionLabels.map(([key, label]) => (
                        <button key={key} onClick={() => setSection(key)} className={`rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${section === key ? "bg-primary text-primary-foreground" : "hover:bg-default-100"}`}>{label}</button>
                    ))}
                </nav>
            </aside>

            <main className="min-w-0">
                {section === "equipment" && <EquipmentEditor info={info} support={support} state={state} update={update}/>} 
                {section === "avatar" && <AvatarEditor state={state} update={update}/>} 
                {section === "bracelet" && <BraceletEditor support={support} state={state} update={update}/>} 
                {section === "gem" && <GemEditor state={state} update={update}/>} 
                {section === "engraving" && <EngravingEditor state={state} update={update}/>} 
                {section === "arkgrid" && <ArkGridEditor support={support} state={state} update={update}/>} 
                {section === "arkpassive" && <ArkPassiveEditor state={state} update={update}/>} 
            </main>
        </div>
    );
}

type EditorProps = { state: SimulatorState; update: (recipe: (next: SimulatorState) => void) => void };

function Heading({ title, detail }: { title: string; detail: string }) {
    return <div className="mb-4"><h2 className="text-xl font-bold">{title}</h2><p className="mt-1 text-sm text-default-500">{detail}</p></div>;
}

function EquipmentEditor({ info, support, state, update }: EditorProps & { info: CharacterInfo; support: boolean }) {
    const [bulk, setBulk] = useState(20);
    const equipmentBySlot = Object.fromEntries(info.equipment.equipments.map((item) => [normalizeEquipmentSlot(item.type), item]));
    const hasEstherEquipment = info.equipment.equipments.some((item) => item.grade === "에스더");
    const applyBulk = () => update((next) => {
        for (const slot of EQUIPMENT_SLOTS) {
            const item = equipmentBySlot[slot];
            if (!item || item.grade === "에스더") continue;
            const range = getHoningRange(getEquipmentSet(item.name), slot, item.name);
            if (range.length) {
                const level = Math.min(bulk, Math.max(...range));
                next.equipment.levels[slot] = level;
                if (slot === "완갑") next.equipment.grades[slot] = getWristGuardGradeForLevel(level, next.equipment.grades[slot]);
            }
        }
    });
    return <>
        <Heading title="장비" detail={`일반·상급 재련과 ${support ? "방어구 품질" : "무기 품질"}, 장신구 기본 효과 및 연마 옵션을 변경합니다.${hasEstherEquipment ? " 에스더 장비는 시뮬레이션에서 제외됩니다." : ""}`}/>
        <div className={`${cardClass} mb-4 flex flex-wrap items-center gap-2`}>
            <span className="mr-auto text-sm font-semibold">일괄 재련</span>
            <select className={controlClass} value={bulk} onChange={(event) => setBulk(Number(event.target.value))}>{Array.from({ length: 16 }, (_, i) => i + 10).map((level) => <option key={level} value={level}>+{level}</option>)}</select>
            <button className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground" onClick={applyBulk}>적용</button>
        </div>
        <div className="grid gap-3 xl:grid-cols-2">
            {EQUIPMENT_SLOTS.map((slot) => {
                const item = equipmentBySlot[slot];
                if (!item || item.grade === "에스더") return null;
                const set = getEquipmentSet(item.name);
                const range = getHoningRange(set, slot, item.name);
                return <div className={cardClass} key={slot}>
                    <div className="mb-3"><p className="font-semibold">{slot} · {set}</p><p className="truncate text-xs text-default-500">{item.name}</p></div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        <label className="grid gap-1 text-xs text-default-500">재련<select className={controlClass} value={state.equipment.levels[slot] ?? 0} onChange={(e) => update((next) => { const level = Number(e.target.value); next.equipment.levels[slot] = level; if (slot === "완갑") next.equipment.grades[slot] = getWristGuardGradeForLevel(level, next.equipment.grades[slot]); })}>{range.map((level) => <option value={level} key={level}>+{level}</option>)}</select></label>
                        {set === "에기르" ? <label className="grid gap-1 text-xs text-default-500">상급 재련<select className={controlClass} value={state.equipment.advancedLevels[slot] ?? 0} onChange={(e) => update((next) => { next.equipment.advancedLevels[slot] = Number(e.target.value); })}>{Array.from({ length: 41 }, (_, i) => <option value={i} key={i}>{i}단계</option>)}</select></label> : null}
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
                const options = getAccessoryOptions(accessory.type);
                const maxMain = getAccessoryMaxMainStat(accessory);
                return <div className={cardClass} key={accessory.key}>
                    <div className="mb-3"><p className="font-semibold">{accessory.type}</p><p className="truncate text-xs text-default-500">{accessory.name}</p></div>
                    <div className="mb-3 grid grid-cols-2 gap-2">
                        <label className="grid gap-1 text-xs text-default-500">주스탯 · 최대 {maxMain.toLocaleString()}<input className={controlClass} type="number" min={0} max={maxMain} value={accessory.mainStat} onChange={(e) => update((next) => { next.accessories[index].mainStat = clamp(Number(e.target.value), maxMain); })}/></label>
                        <label className="grid gap-1 text-xs text-default-500">체력<input className={controlClass} type="number" min={0} max={999999} value={accessory.vitality} onChange={(e) => update((next) => { next.accessories[index].vitality = clamp(Number(e.target.value), 999999); })}/></label>
                    </div>
                    <div className="space-y-2">{accessory.options.map((option, optionIndex) => <div className="grid grid-cols-[minmax(0,1fr)_82px] gap-2" key={optionIndex}>
                        <select className={controlClass} value={option.name} onChange={(e) => update((next) => { next.accessories[index].options[optionIndex].name = e.target.value; if (e.target.value === "없음") next.accessories[index].options[optionIndex].grade = "none"; })}>{options.map((item, i) => <option key={`${item.small}-${i}`} value={item.small}>{item.small.endsWith("%") ? `${item.name}%` : item.name}</option>)}</select>
                        <select className={controlClass} disabled={option.name === "없음"} value={option.grade} onChange={(e) => update((next) => { next.accessories[index].options[optionIndex].grade = e.target.value as OptionGrade; })}>{Object.entries(gradeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
                    </div>)}</div>
                </div>;
            })}
        </div>
    </>;
}

function AvatarEditor({ state, update }: EditorProps) {
    return <><Heading title="아바타" detail="덧입기는 제외하며 영웅은 +1%, 전설은 +2%의 주스탯 효과를 적용합니다."/><div className="grid gap-3 sm:grid-cols-2">{AVATAR_SLOTS.map((slot) => <div className={cardClass} key={slot}><p className="mb-3 font-semibold">{slot}</p><select className={`${controlClass} w-full`} value={state.avatars[slot]} onChange={(e) => update((next) => { next.avatars[slot] = e.target.value; })}><option>없음</option><option>영웅</option><option>전설</option></select></div>)}</div></>;
}

function BraceletEditor({ support, state, update }: EditorProps & { support: boolean }) {
    const selected = new Set(state.bracelet.map((item) => item.type).filter((type) => type !== "없음"));
    return <><Heading title="팔찌" detail="최대 5개 효과를 설정합니다. 같은 효과는 중복 선택할 수 없습니다."/><div className="grid gap-3 xl:grid-cols-2">{Array.from({ length: 5 }, (_, index) => {
        const item = state.bracelet[index];
        const raw = braceletRawOptions.some((option) => option.name === item.type);
        return <div className={cardClass} key={index}><p className="mb-3 text-sm font-semibold">효과 {index + 1}</p><div className="grid grid-cols-[minmax(0,1fr)_110px] gap-2">
            <select className={controlClass} value={item.type} onChange={(e) => update((next) => { next.bracelet[index] = { type: e.target.value, value: 0, grade: "none" }; })}><option value="없음">없음</option><optgroup label="수치 효과">{braceletRawOptions.map((option) => <option key={option.name} value={option.name} disabled={selected.has(option.name) && option.name !== item.type}>{option.label}</option>)}</optgroup><optgroup label="특수 효과">{braceletSpecialOptions.map((option) => <option key={option.name} value={option.name} disabled={selected.has(option.name) && option.name !== item.type}>{option.label}</option>)}</optgroup></select>
            {raw ? <input aria-label="효과 수치" className={controlClass} type="number" min={0} max={getBraceletInputMax(item.type)} value={item.value} onChange={(e) => update((next) => { next.bracelet[index].value = clamp(Number(e.target.value), getBraceletInputMax(item.type)); })}/> : <select aria-label="효과 등급" className={controlClass} value={item.grade} disabled={item.type === "없음"} onChange={(e) => update((next) => { next.bracelet[index].grade = e.target.value as OptionGrade; })}>{Object.entries(gradeLabels).filter(([key]) => key !== "none").map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>}
        </div></div>;
    })}</div><p className="mt-4 text-xs text-default-500">{support ? "서포터는 특화·신속과 최대 생명력을 반영하며 치명은 제외합니다." : "치명·특화·신속 합계에는 포인트당 0.03%를 적용합니다."} 제압·인내·숙련{support ? "" : "과 최대 생명력"}은 현재 전투력 계산에서 제외됩니다.</p></>;
}

function GemEditor({ state, update }: EditorProps) {
    const gems = Array.from({ length: 11 }, (_, index) => state.gems[index] ?? 1);
    return <><Heading title="보석" detail="현재 장착 보석 11개를 기준으로 각 보석의 티어 4 레벨을 변경합니다."/><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{gems.map((level, index) => <div className={`${cardClass} flex items-center gap-3`} key={index}><span className="grow text-sm font-semibold">보석 {index + 1}</span><select className={controlClass} value={level} onChange={(e) => update((next) => { next.gems[index] = Number(e.target.value); })}>{Array.from({ length: 10 }, (_, i) => i + 1).map((value) => <option key={value} value={value}>{value}레벨</option>)}</select></div>)}</div></>;
}

function EngravingEditor({ state, update }: EditorProps) {
    const names = ENGRAVING_NAMES;
    return <><Heading title="각인" detail="현재 각인의 유물 각인서 단계와 어빌리티 스톤 레벨을 변경합니다."/><div className="grid gap-3 sm:grid-cols-2">{state.engravings.map((engraving, index) => <div className={`${cardClass} flex items-center gap-3`} key={`${engraving.name}-${index}`}><span className="min-w-0 grow truncate font-semibold">{engraving.name}</span><select className={controlClass} value={engraving.level} onChange={(e) => update((next) => { next.engravings[index].level = Number(e.target.value); })}>{Array.from({ length: 5 }, (_, i) => <option key={i} value={i}>유물 {i}단계</option>)}</select></div>)}</div>
        <h3 className="mb-3 mt-6 text-lg font-bold">어빌리티 스톤</h3><div className="grid gap-3 sm:grid-cols-2">{Array.from({ length: 2 }, (_, index) => { const stone = state.stones[index] ?? { name: names[index] ?? names[0] ?? "", level: 0 }; return <div className={`${cardClass} grid grid-cols-[minmax(0,1fr)_110px] gap-2`} key={index}><select className={controlClass} value={stone.name} onChange={(e) => update((next) => { next.stones[index] = { ...stone, name: e.target.value }; })}>{names.map((name) => <option key={name}>{name}</option>)}</select><select className={controlClass} value={stone.level} onChange={(e) => update((next) => { next.stones[index] = { ...stone, level: Number(e.target.value) }; })}>{Array.from({ length: 5 }, (_, i) => <option key={i} value={i}>{i}레벨</option>)}</select></div>; })}<label className={`${cardClass} grid gap-2 text-sm font-semibold`}>세공 보너스 체력<select aria-label="세공 보너스 체력" className={controlClass} value={state.stoneHealthBonus} onChange={(e) => update((next) => { next.stoneHealthBonus = Number(e.target.value); })}>{STONE_HEALTH_BONUSES.map((value) => <option key={value} value={value}>{value.toLocaleString()}</option>)}</select></label></div>
    </>;
}

function ArkGridEditor({ support, state, update }: EditorProps & { support: boolean }) {
    const labels = ["질서 해", "질서 달", "질서 별", "혼돈 해", "혼돈 달", "혼돈 별"];
    const visibleOptions = support ? ARK_GRID_OPTION_NAMES.slice(3) : ARK_GRID_OPTION_NAMES.slice(0, 3);
    return <><Heading title="아크그리드" detail="질서·혼돈 코어의 등급과 포인트, 젬 효과의 합산 레벨을 변경합니다."/><div className="space-y-3">{state.cores.slice(0, 6).map((core, index) => {
        const allowedPoints = core.grade === "영웅" ? [0, 10] : core.grade === "전설" ? [0, 10, 14] : CORE_POINTS;
        return <div className={`${cardClass} grid gap-3 md:grid-cols-[100px_110px_100px_minmax(0,1fr)] md:items-center`} key={index}><p className="font-semibold">{labels[index]}</p><select className={controlClass} value={core.grade} onChange={(e) => update((next) => { const changed = next.cores[index]; changed.grade = e.target.value; const max = e.target.value === "영웅" ? 10 : e.target.value === "전설" ? 14 : 20; changed.point = Math.min(changed.point, max); })}>{CORE_GRADES.map((grade) => <option key={grade}>{grade}</option>)}</select><select className={controlClass} value={core.point} onChange={(e) => update((next) => { next.cores[index].point = Number(e.target.value); })}>{allowedPoints.map((point) => <option key={point} value={point}>{point}p</option>)}</select>{index >= 3 ? <select className={controlClass} value={core.name} onChange={(e) => update((next) => { next.cores[index].name = e.target.value; if (e.target.value === "없음") next.cores[index].point = 0; })}>{getCoreChoices(index, support).map((name) => <option key={name}>{name}</option>)}</select> : <span className="truncate text-sm text-default-500">{core.name}</span>}</div>;
    })}</div><h3 className="mb-3 mt-6 text-lg font-bold">젬 효과 합산</h3><div className="grid gap-3 sm:grid-cols-3">{visibleOptions.map((name) => <label className={`${cardClass} grid gap-2 text-sm font-semibold`} key={name}>{name}<input className={controlClass} type="number" min={0} max={999} value={state.arkGridOptions[name] ?? 0} onChange={(e) => update((next) => { next.arkGridOptions[name] = clamp(Number(e.target.value), 999); })}/></label>)}</div></>;
}

function ArkPassiveEditor({ state, update }: EditorProps) {
    return <><Heading title="아크패시브" detail="노드와 랭크는 유지하고 카르마 레벨만 변경합니다."/><div className="grid gap-3 sm:grid-cols-3">{["진화", "깨달음", "도약"].map((type) => <div className={cardClass} key={type}><p className={`font-bold ${type === "진화" ? "text-warning" : type === "깨달음" ? "text-primary" : "text-success"}`}>{type}</p><label className="mt-4 grid gap-1 text-xs text-default-500">레벨 · 최대 30<input className={controlClass} type="number" min={0} max={30} value={state.karma[type] ?? 0} onChange={(e) => update((next) => { next.karma[type] = clamp(Number(e.target.value), 30); })}/></label></div>)}</div></>;
}
