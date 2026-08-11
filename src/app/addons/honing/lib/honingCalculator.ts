import { HONING_MATERIALS } from '../model/types';
import { findHoningRate } from '../data/honingRates';
import type { HoningRate } from '../data/honingRates';
import type { HoningCalculation, HoningCalculationInput, HoningAttempt, HoningBreathAmounts, HoningBreathKey, HoningMode, HoningRangeCalculation, HoningSimulationOptions, MaterialAmount, OwnedMaterialKey, OwnedMaterials } from '../model/calculatorTypes';

const ALL_OWNED_KEYS = [...HONING_MATERIALS.filter((item) => item.key !== 'destiny-shard-pouch-large').map((item) => item.key), 'destiny-shard'] as OwnedMaterialKey[];
const DISPLAY_NAMES: Record<OwnedMaterialKey, string> = Object.fromEntries([
    ...HONING_MATERIALS.filter((item) => item.key !== 'destiny-shard-pouch-large').map((item) => [item.key, item.name]),
    ['destiny-shard', '운명의 파편']
]) as Record<OwnedMaterialKey, string>;

type Action = { book: 0 | 1; breaths: HoningBreathAmounts };
type StateResult = { attempts: number; cost: number; materials: Record<OwnedMaterialKey, number>; boundMaterials: Record<OwnedMaterialKey, number> };

export function stoneRequirements(rate: HoningRate): Array<[OwnedMaterialKey, number]> {
    if (rate.part === '완갑') return [['destiny-destruction-crystal', rate.destructionStone ?? 0], ['destiny-guardian-crystal', rate.guardianStone ?? 0]];
    const key = rate.tier === '세르카'
        ? rate.part === '무기' ? 'destiny-destruction-crystal' : 'destiny-guardian-crystal'
        : rate.part === '무기' ? 'destiny-destruction-stone' : 'destiny-guardian-stone';
    return [[key, rate.stone]];
}

export function breathRequirements(rate: HoningRate): Array<{ key: HoningBreathKey; rate: number; max: number }> {
    if (rate.part === '완갑') return [
        { key: 'lava-breath', rate: rate.lavaBreathRate ?? 0, max: rate.lavaBreathCount ?? 0 },
        { key: 'glacier-breath', rate: rate.glacierBreathRate ?? 0, max: rate.glacierBreathCount ?? 0 }
    ];
    return [{ key: rate.part === '무기' ? 'lava-breath' : 'glacier-breath', rate: rate.breathRate, max: rate.breathCount }];
}

export function bookKey(rate: HoningRate): OwnedMaterialKey | null {
    if (rate.part === '완갑') return null;
    const prefix = rate.part === '무기' ? 'metallurgy' : 'tailoring';
    const suffix = rate.tier === '4티어' ? 'upheaval' : 'thrill';
    const ranges = rate.tier === '4티어' ? [[11, 14], [15, 18], [19, 20]] : [[12, 15], [16, 19]];
    const range = ranges.find(([from, to]) => rate.level >= from && rate.level <= to);
    return range ? `${prefix}-${suffix}-${range[0]}-${range[1]}` as OwnedMaterialKey : null;
}

function priceFor(key: OwnedMaterialKey, prices: HoningCalculationInput['prices']): number {
    if (key === 'destiny-shard') return prices.items['destiny-shard-pouch-large']?.unitPrice ?? 0;
    return prices.items[key]?.unitPrice ?? prices.items[key]?.price ?? 0;
}

function iconFor(key: OwnedMaterialKey, prices: HoningCalculationInput['prices']) {
    return key === 'destiny-shard' ? prices.items['destiny-shard-pouch-large']?.icon ?? null : prices.items[key]?.icon ?? null;
}

function addMaterial(target: Record<OwnedMaterialKey, number>, key: OwnedMaterialKey, amount: number) { target[key] = (target[key] ?? 0) + amount; }
function emptyMaterials() { return {} as Record<OwnedMaterialKey, number>; }
function createOwned(value: OwnedMaterials): OwnedMaterials { return Object.fromEntries(ALL_OWNED_KEYS.map((key) => [key, Math.max(0, Number(value[key]) || 0)])) as OwnedMaterials; }
function combineMaterials(left: Record<OwnedMaterialKey, number>, right: Record<OwnedMaterialKey, number>, multiplier = 1) { const result = { ...left }; for (const key of ALL_OWNED_KEYS) if (right[key]) addMaterial(result, key, right[key] * multiplier); return result; }

function consume(key: OwnedMaterialKey, amount: number, bound: OwnedMaterials, prices: HoningCalculationInput['prices']) {
    const free = Math.min(amount, bound[key] ?? 0);
    bound[key] = Math.max(0, (bound[key] ?? 0) - free);
    return { paid: amount - free, cost: (amount - free) * priceFor(key, prices) };
}

export function actionMaterials(rate: HoningRate, action: Action): Array<[OwnedMaterialKey, number]> {
    const mandatory: Array<[OwnedMaterialKey, number]> = [
        ...stoneRequirements(rate),
        [rate.tier === '세르카' ? 'great-destiny-leapstone' : 'destiny-leapstone', rate.leapstone],
        [rate.tier === '세르카' ? 'superior-abidos-fusion-material' : 'abidos-fusion-material', rate.fusion],
        ['destiny-shard', rate.shard]
    ];
    const optional: Array<[OwnedMaterialKey, number]> = Object.entries(action.breaths).filter(([, amount]) => Number(amount) > 0).map(([key, amount]) => [key as OwnedMaterialKey, Number(amount)]);
    const key = bookKey(rate);
    if (action.book && key) optional.push([key, 1]);
    return [...mandatory, ...optional];
}

function chance(rate: HoningRate, failures: number, artisan: number, action: Action) {
    if (artisan >= 100) return 100;
    const pityBonus = rate.successRate * 0.1 * Math.min(failures, 10);
    const bookBonus = action.book ? rate.successRate : 0;
    const breathBonus = breathRequirements(rate).reduce((sum, item) => sum + (action.breaths[item.key] ?? 0) * item.rate, 0);
    return Math.min(100, rate.successRate + pityBonus + rate.research + bookBonus + breathBonus);
}

function makeActionList(mode: HoningMode, rate: HoningRate, owned?: OwnedMaterials, onlyOwned = false): Action[] {
    const breathOptions = breathRequirements(rate).map((item) => {
        const max = mode === 'no-breath' ? 0 : item.max;
        const ownedAmount = onlyOwned ? Math.min(max, Math.floor(owned?.[item.key] ?? 0)) : max;
        return onlyOwned || mode === 'full-breath' ? [ownedAmount] : [0, max];
    });
    const actions: Action[] = [];
    const combinations = (index: number, breaths: HoningBreathAmounts) => {
        if (index === breathOptions.length) {
            const key = bookKey(rate);
            const hasBook = mode !== 'no-breath' && key !== null && (!onlyOwned || (owned?.[key] ?? 0) >= 1);
            actions.push({ book: 0, breaths: { ...breaths } });
            if (hasBook) actions.push({ book: 1, breaths: { ...breaths } });
            return;
        }
        const item = breathRequirements(rate)[index];
        for (const amount of [...new Set(breathOptions[index])]) combinations(index + 1, { ...breaths, [item.key]: amount });
    };
    combinations(0, {});
    return mode === 'full-breath' ? actions.filter((action) => action.book === (bookKey(rate) && (!onlyOwned || (owned?.[bookKey(rate) as OwnedMaterialKey] ?? 0) >= 1) ? 1 : 0)) : actions;
}

export function getHoningAttempt(input: HoningCalculationInput, options: HoningSimulationOptions): HoningAttempt | null {
    const rate = findHoningRate(input.tier, input.part, input.level);
    if (!rate) return null;
    const breaths = options.breathAmounts ?? {};
    const action: Action = { book: options.useBook && bookKey(rate) ? 1 : 0, breaths: Object.fromEntries(breathRequirements(rate).map((item) => [item.key, Math.max(0, Math.min(item.max, breaths[item.key] ?? 0))])) };
    const finalChance = chance(rate, options.failures, options.artisan, action);
    const consumed = actionMaterials(rate, options.artisan >= 100 ? { book: 0, breaths: {} } : action);
    const materials: MaterialAmount[] = consumed.map(([key, amount]) => ({ key, amount, paid: amount, icon: iconFor(key, input.prices), name: DISPLAY_NAMES[key] }));
    const cost = rate.gold + consumed.reduce((total, [key, amount]) => total + amount * priceFor(key, input.prices), 0);
    const artisanAfter = finalChance >= 100 ? 100 : Math.min(100, options.artisan + finalChance * 0.465);
    const totalBreath = Object.values(action.breaths).reduce((sum, amount) => sum + (amount ?? 0), 0);
    return { attempt: options.attempt, baseChance: rate.successRate + rate.successRate * 0.1 * Math.min(options.failures, 10) + rate.research, artisanBefore: options.artisan, artisanAfter, book: options.artisan >= 100 ? 0 : action.book, breath: options.artisan >= 100 ? 0 : totalBreath, finalChance, cost, materials };
}

export function calculateHoning(input: HoningCalculationInput): HoningCalculation | null {
    const rate = findHoningRate(input.tier, input.part, input.level);
    if (!rate) return null;
    const initialOwned = createOwned(input.owned);
    const onlyOwned = input.onlyOwned === true;
    const policy = new Map<string, Action>();
    const memo = new Map<string, StateResult>();
    const getStateKey = (failures: number, artisan: number, bound: OwnedMaterials) => `${failures}|${Math.round(artisan * 1000)}|${ALL_OWNED_KEYS.map((key) => Math.floor(bound[key] ?? 0)).join(',')}`;
    const solve = (failures: number, artisan: number, bound: OwnedMaterials): StateResult => {
        const stateKey = getStateKey(failures, artisan, bound);
        const cached = memo.get(stateKey);
        if (cached) return cached;
        let best: StateResult | null = null;
        let bestAction: Action | null = null;
        const availableActions = artisan >= 100 ? [{ book: 0 as const, breaths: {} }] : makeActionList(input.mode, rate, bound, onlyOwned).filter((action) => {
            if (onlyOwned) return actionMaterials(rate, action).every(([key, amount]) => (bound[key] ?? 0) >= amount);
            return actionMaterials(rate, action).filter(([key]) => key !== 'destiny-shard').every(([key]) => priceFor(key, input.prices) > 0);
        });
        for (const action of availableActions) {
            const nextBound = { ...bound };
            const consumed = emptyMaterials();
            const boundConsumed = emptyMaterials();
            let cost = rate.gold;
            for (const [key, amount] of actionMaterials(rate, action)) { const purchase = consume(key, amount, nextBound, input.prices); cost += purchase.cost; addMaterial(consumed, key, amount); addMaterial(boundConsumed, key, amount - purchase.paid); }
            const finalChance = chance(rate, failures, artisan, action);
            const failProbability = 1 - finalChance / 100;
            const nextArtisan = Math.min(100, artisan + finalChance * 0.465);
            const future = finalChance >= 100 ? { attempts: 0, cost: 0, materials: emptyMaterials(), boundMaterials: emptyMaterials() } : solve(failures + 1, nextArtisan, nextBound);
            const candidate = { attempts: 1 + failProbability * future.attempts, cost: cost + failProbability * future.cost, materials: combineMaterials(consumed, future.materials, failProbability), boundMaterials: combineMaterials(boundConsumed, future.boundMaterials, failProbability) };
            if (!best || candidate.cost < best.cost) { best = candidate; bestAction = action; }
        }
        const result = best ?? { attempts: 0, cost: 0, materials: emptyMaterials(), boundMaterials: emptyMaterials() };
        memo.set(stateKey, result);
        if (bestAction) policy.set(stateKey, bestAction);
        return result;
    };
    const average = solve(input.initialFailures ?? 0, input.initialArtisan ?? 0, initialOwned);
    const pityAttempts: HoningAttempt[] = [];
    let failures = input.initialFailures ?? 0; let artisan = input.initialArtisan ?? 0; let bound = { ...initialOwned }; let pityCost = 0; const pityMaterials = emptyMaterials(); const pityBoundMaterials = emptyMaterials();
    for (let attempt = 1; ; attempt += 1) {
        const stateKey = getStateKey(failures, artisan, bound);
        const action = artisan >= 100 ? { book: 0 as const, breaths: {} } : policy.get(stateKey) ?? makeActionList(input.mode, rate, bound, onlyOwned)[0];
        if (!action) break;
        const before = artisan; const finalChance = chance(rate, failures, artisan, action); const consumed: MaterialAmount[] = []; let trialCost = rate.gold;
        for (const [key, amount] of actionMaterials(rate, action)) { const purchase = consume(key, amount, bound, input.prices); trialCost += purchase.cost; addMaterial(pityMaterials, key, amount); addMaterial(pityBoundMaterials, key, amount - purchase.paid); consumed.push({ key, amount, paid: purchase.paid, icon: iconFor(key, input.prices), name: DISPLAY_NAMES[key] }); }
        pityCost += trialCost; artisan = finalChance >= 100 ? 100 : Math.min(100, artisan + finalChance * 0.465);
        pityAttempts.push({ attempt, baseChance: rate.successRate + rate.successRate * .1 * Math.min(failures, 10) + rate.research, artisanBefore: before, artisanAfter: artisan, book: action.book, breath: Object.values(action.breaths).reduce((sum, amount) => sum + (amount ?? 0), 0), finalChance, cost: trialCost, materials: consumed });
        if (finalChance >= 100) break;
        failures += 1;
    }
    const toAmounts = (materials: Record<OwnedMaterialKey, number>): MaterialAmount[] => ALL_OWNED_KEYS.filter((key) => materials[key] > 0).map((key) => ({ key, amount: materials[key], paid: materials[key], icon: iconFor(key, input.prices), name: DISPLAY_NAMES[key] }));
    const requiredKeys = actionMaterials(rate, { book: bookKey(rate) ? 1 : 0, breaths: Object.fromEntries(breathRequirements(rate).map((item) => [item.key, item.max])) }).map(([key]) => key);
    const missingPrices = requiredKeys.filter((key) => priceFor(key, input.prices) <= 0);
    return { averageAttempts: average.attempts, averageCost: average.cost, averageMaterials: toAmounts(average.materials), boundMaterials: toAmounts(average.boundMaterials), pityAttempts, pityCost, pityMaterials: toAmounts(pityMaterials), pityBoundMaterials: toAmounts(pityBoundMaterials), attempts: pityAttempts, bookKey: bookKey(rate), breathKeys: breathRequirements(rate).map((item) => item.key), missingPrices };
}

export function actionFromAttempt(attempt: HoningAttempt, rate: HoningRate): HoningSimulationOptions {
    const book = bookKey(rate);
    const breaths = Object.fromEntries(breathRequirements(rate).map((item) => [item.key, attempt.materials.find((material) => material.key === item.key)?.amount ?? 0])) as HoningBreathAmounts;
    return { attempt: attempt.attempt, failures: 0, artisan: attempt.artisanBefore, useBook: Boolean(book && attempt.materials.some((material) => material.key === book)), breathAmounts: breaths };
}

function subtractMaterials(owned: OwnedMaterials, materials: MaterialAmount[]) {
    for (const material of materials) owned[material.key] = Math.max(0, (owned[material.key] ?? 0) - material.amount);
}

function mergeMaterialAmounts(target: Map<OwnedMaterialKey, MaterialAmount>, materials: MaterialAmount[]) {
    for (const material of materials) {
        const current = target.get(material.key);
        target.set(material.key, current ? { ...current, amount: current.amount + material.amount, paid: current.paid + material.paid } : { ...material });
    }
}

export function calculateHoningRange(input: HoningCalculationInput, startLevel: number, targetLevel: number): HoningRangeCalculation | null {
    if (targetLevel <= startLevel) return null;
    const averageOwned = createOwned(input.owned);
    const pityOwned = createOwned(input.owned);
    const averageMaterials = new Map<OwnedMaterialKey, MaterialAmount>();
    const pityMaterials = new Map<OwnedMaterialKey, MaterialAmount>();
    const stages: HoningRangeCalculation['stages'] = [];
    const missingPrices = new Set<OwnedMaterialKey>();
    let averageAttempts = 0;
    let averageCost = 0;
    let pityAttempts = 0;
    let pityCost = 0;

    for (let level = startLevel + 1; level <= targetLevel; level += 1) {
        const average = calculateHoning({ ...input, level, owned: averageOwned, initialFailures: 0, initialArtisan: 0 });
        const pity = calculateHoning({ ...input, level, owned: pityOwned, initialFailures: 0, initialArtisan: 0 });
        if (!average || !pity) return null;
        averageAttempts += average.averageAttempts;
        averageCost += average.averageCost;
        pityAttempts += pity.pityAttempts.length;
        pityCost += pity.pityCost;
        mergeMaterialAmounts(averageMaterials, average.averageMaterials);
        mergeMaterialAmounts(pityMaterials, pity.pityMaterials);
        subtractMaterials(averageOwned, average.boundMaterials);
        subtractMaterials(pityOwned, pity.pityBoundMaterials);
        average.missingPrices.forEach((key) => missingPrices.add(key));
        pity.missingPrices.forEach((key) => missingPrices.add(key));
        stages.push({ level, averageAttempts: average.averageAttempts, averageCost: average.averageCost, pityAttempts: pity.pityAttempts.length, pityCost: pity.pityCost });
    }

    return { startLevel, targetLevel, averageAttempts, averageCost, averageMaterials: [...averageMaterials.values()], pityAttempts, pityCost, pityMaterials: [...pityMaterials.values()], stages, missingPrices: [...missingPrices] };
}
