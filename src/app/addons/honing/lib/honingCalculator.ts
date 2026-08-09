import { HONING_MATERIALS } from '../model/types';
import { findHoningRate } from '../data/honingRates';
import type { HoningRate } from '../data/honingRates';
import type { HoningCalculation, HoningCalculationInput, HoningAttempt, HoningMode, HoningSimulationOptions, MaterialAmount, OwnedMaterialKey, OwnedMaterials } from '../model/calculatorTypes';

const ALL_OWNED_KEYS = [...HONING_MATERIALS.filter((item) => item.key !== 'destiny-shard-pouch-large').map((item) => item.key), 'destiny-shard'] as OwnedMaterialKey[];
const DISPLAY_NAMES: Record<OwnedMaterialKey, string> = Object.fromEntries([
    ...HONING_MATERIALS.filter((item) => item.key !== 'destiny-shard-pouch-large').map((item) => [item.key, item.name]),
    ['destiny-shard', '운명의 파편']
]) as Record<OwnedMaterialKey, string>;

type Action = { book: 0 | 1; breath: number };
type StateResult = { attempts: number; cost: number; materials: Record<OwnedMaterialKey, number> };

function stoneKey(tier: HoningRate['tier'], part: HoningRate['part']): OwnedMaterialKey {
    if (tier === '세르카') return part === '무기' ? 'destiny-destruction-crystal' : 'destiny-guardian-crystal';
    return part === '무기' ? 'destiny-destruction-stone' : 'destiny-guardian-stone';
}

function bookKey(rate: HoningRate): OwnedMaterialKey | null {
    const prefix = rate.part === '무기' ? 'metallurgy' : 'tailoring';
    const suffix = rate.tier === '4티어' ? 'upheaval' : 'thrill';
    const ranges = rate.tier === '4티어' ? [[11, 14], [15, 18], [19, 20]] : [[12, 15], [16, 19]];
    const range = ranges.find(([from, to]) => rate.level >= from && rate.level <= to);
    return range ? `${prefix}-${suffix}-${range[0]}-${range[1]}` as OwnedMaterialKey : null;
}

function breathKey(part: HoningRate['part']): OwnedMaterialKey {
    return part === '무기' ? 'lava-breath' : 'glacier-breath';
}

function priceFor(key: OwnedMaterialKey, prices: HoningCalculationInput['prices']): number {
    if (key === 'destiny-shard') return prices.items['destiny-shard-pouch-large']?.unitPrice ?? 0;
    return prices.items[key]?.unitPrice ?? prices.items[key]?.price ?? 0;
}

function iconFor(key: OwnedMaterialKey, prices: HoningCalculationInput['prices']) {
    return key === 'destiny-shard' ? prices.items['destiny-shard-pouch-large']?.icon ?? null : prices.items[key]?.icon ?? null;
}

function addMaterial(target: Record<OwnedMaterialKey, number>, key: OwnedMaterialKey, amount: number) {
    target[key] = (target[key] ?? 0) + amount;
}

function createOwned(value: OwnedMaterials): OwnedMaterials {
    return Object.fromEntries(ALL_OWNED_KEYS.map((key) => [key, Math.max(0, Number(value[key]) || 0)])) as OwnedMaterials;
}

function consume(key: OwnedMaterialKey, amount: number, bound: OwnedMaterials, prices: HoningCalculationInput['prices']) {
    const free = Math.min(amount, bound[key] ?? 0);
    bound[key] = Math.max(0, (bound[key] ?? 0) - free);
    return { paid: amount - free, cost: (amount - free) * priceFor(key, prices) };
}

function actionMaterials(rate: HoningRate, action: Action, input: HoningCalculationInput) {
    const mandatory: Array<[OwnedMaterialKey, number]> = [
        [stoneKey(rate.tier, rate.part), rate.stone],
        [rate.tier === '세르카' ? 'great-destiny-leapstone' : 'destiny-leapstone', rate.leapstone],
        [rate.tier === '세르카' ? 'superior-abidos-fusion-material' : 'abidos-fusion-material', rate.fusion],
        ['destiny-shard', rate.shard]
    ];
    const optional: Array<[OwnedMaterialKey, number]> = [];
    if (action.breath > 0) optional.push([breathKey(rate.part), action.breath]);
    const key = bookKey(rate);
    if (action.book && key) optional.push([key, 1]);
    return [...mandatory, ...optional];
}

function chance(rate: HoningRate, failures: number, artisan: number, action: Action) {
    if (artisan >= 100) return 100;
    const pityBonus = rate.successRate * 0.1 * Math.min(failures, 10);
    const bookBonus = action.book ? rate.successRate : 0;
    return Math.min(100, rate.successRate + pityBonus + rate.research + bookBonus + action.breath * rate.breathRate);
}

function emptyMaterials() { return {} as Record<OwnedMaterialKey, number>; }
function combineMaterials(left: Record<OwnedMaterialKey, number>, right: Record<OwnedMaterialKey, number>, multiplier = 1) {
    const result = { ...left };
    for (const key of ALL_OWNED_KEYS) if (right[key]) addMaterial(result, key, right[key] * multiplier);
    return result;
}

function makeActionList(mode: HoningMode, rate: HoningRate): Action[] {
    const maxBreath = mode === 'no-breath' ? 0 : rate.breathCount;
    const hasBook = mode !== 'no-breath' && bookKey(rate) !== null;
    const actions: Action[] = [];
    const breathOptions = mode === 'full-breath' ? [maxBreath] : maxBreath > 0 ? [0, maxBreath] : [0];
    for (const breath of [...new Set(breathOptions)]) {
        if (mode === 'full-breath') {
            actions.push({ book: hasBook ? 1 : 0, breath });
        } else {
            actions.push({ book: 0, breath });
            if (hasBook) actions.push({ book: 1, breath });
        }
    }
    return actions;
}

export function getHoningAttempt(input: HoningCalculationInput, options: HoningSimulationOptions): HoningAttempt | null {
    const rate = findHoningRate(input.tier, input.part, input.level);
    if (!rate) return null;
    const action: Action = {
        book: options.useBook && bookKey(rate) ? 1 : 0,
        breath: options.useBreath ? rate.breathCount : 0
    };
    const finalChance = chance(rate, options.failures, options.artisan, action);
    const consumed = actionMaterials(rate, options.artisan >= 100 ? { book: 0, breath: 0 } : action, input);
    const materials: MaterialAmount[] = consumed.map(([key, amount]) => ({ key, amount, paid: amount, icon: iconFor(key, input.prices), name: DISPLAY_NAMES[key] }));
    const cost = rate.gold + consumed.reduce((total, [key, amount]) => total + amount * priceFor(key, input.prices), 0);
    const artisanAfter = finalChance >= 100 ? 100 : Math.min(100, options.artisan + finalChance * 0.465);
    return { attempt: options.attempt, baseChance: rate.successRate + rate.successRate * 0.1 * Math.min(options.failures, 10) + rate.research, artisanBefore: options.artisan, artisanAfter, book: options.artisan >= 100 ? 0 : action.book, breath: options.artisan >= 100 ? 0 : action.breath, finalChance, cost, materials };
}

export function calculateHoning(input: HoningCalculationInput): HoningCalculation | null {
    const rate = findHoningRate(input.tier, input.part, input.level);
    if (!rate) return null;
    const initialOwned = createOwned(input.owned);
    const actions = makeActionList(input.mode, rate);
    const policy = new Map<string, Action>();
    const memo = new Map<string, StateResult>();
    const getStateKey = (failures: number, artisan: number, bound: OwnedMaterials) => `${failures}|${Math.round(artisan * 1000)}|${ALL_OWNED_KEYS.map((key) => Math.floor(bound[key] ?? 0)).join(',')}`;

    const solve = (failures: number, artisan: number, bound: OwnedMaterials): StateResult => {
        const stateKey = getStateKey(failures, artisan, bound);
        const cached = memo.get(stateKey);
        if (cached) return cached;
        let best: StateResult | null = null;
        let bestAction: Action | null = null;
        const availableActions = artisan >= 100 ? [{ book: 0 as const, breath: 0 }] : actions;
        for (const action of availableActions) {
            const nextBound = { ...bound };
            const consumed = emptyMaterials();
            let cost = rate.gold;
            for (const [key, amount] of actionMaterials(rate, action, input)) {
                const purchase = consume(key, amount, nextBound, input.prices);
                cost += purchase.cost;
                addMaterial(consumed, key, amount);
            }
            const finalChance = chance(rate, failures, artisan, action);
            const failProbability = 1 - finalChance / 100;
            const nextArtisan = Math.min(100, artisan + finalChance * 0.465);
            const future = finalChance >= 100 ? { attempts: 0, cost: 0, materials: emptyMaterials() } : solve(failures + 1, nextArtisan, nextBound);
            const candidate = { attempts: 1 + failProbability * future.attempts, cost: cost + failProbability * future.cost, materials: combineMaterials(consumed, future.materials, failProbability) };
            if (!best || candidate.cost < best.cost) { best = candidate; bestAction = action; }
        }
        const result = best ?? { attempts: 0, cost: 0, materials: emptyMaterials() };
        memo.set(stateKey, result);
        if (bestAction) policy.set(stateKey, bestAction);
        return result;
    };

    const average = solve(0, 0, initialOwned);
    const pityAttempts: HoningAttempt[] = [];
    let failures = 0; let artisan = 0; let bound = { ...initialOwned }; let pityCost = 0; const pityMaterials = emptyMaterials();
    for (let attempt = 1; ; attempt += 1) {
        const stateKey = getStateKey(failures, artisan, bound);
        const action = artisan >= 100 ? { book: 0 as const, breath: 0 } : policy.get(stateKey) ?? actions[0];
        const before = artisan;
        const finalChance = chance(rate, failures, artisan, action);
        const consumed: MaterialAmount[] = [];
        let trialCost = rate.gold;
        for (const [key, amount] of actionMaterials(rate, action, input)) {
            const purchase = consume(key, amount, bound, input.prices);
            trialCost += purchase.cost; addMaterial(pityMaterials, key, amount);
            consumed.push({ key, amount, paid: purchase.paid, icon: iconFor(key, input.prices), name: DISPLAY_NAMES[key] });
        }
        pityCost += trialCost;
        artisan = finalChance >= 100 ? 100 : Math.min(100, artisan + finalChance * 0.465);
        pityAttempts.push({ attempt, baseChance: rate.successRate + rate.successRate * .1 * Math.min(failures, 10) + rate.research, artisanBefore: before, artisanAfter: artisan, book: action.book, breath: action.breath, finalChance, cost: trialCost, materials: consumed });
        if (finalChance >= 100) break;
        failures += 1;
    }
    const toAmounts = (materials: Record<OwnedMaterialKey, number>): MaterialAmount[] => ALL_OWNED_KEYS.filter((key) => materials[key] > 0).map((key) => ({ key, amount: materials[key], paid: materials[key], icon: iconFor(key, input.prices), name: DISPLAY_NAMES[key] }));
    const requiredKeys = actionMaterials(rate, { book: bookKey(rate) ? 1 : 0, breath: rate.breathCount }, input).map(([key]) => key);
    const missingPrices = requiredKeys.filter((key) => priceFor(key, input.prices) <= 0);
    return { averageAttempts: average.attempts, averageCost: average.cost, averageMaterials: toAmounts(average.materials), pityAttempts, pityCost, pityMaterials: toAmounts(pityMaterials), attempts: pityAttempts, bookKey: bookKey(rate), breathKey: breathKey(rate.part), missingPrices };
}
