import {
    CHAOS_ADVICES,
    CHAOS_SEAL_ADVICES,
    ELIXIR_EFFECTS,
    NORMAL_ADVICES,
    ORDER_ADVICES,
    ORDER_SEAL_ADVICES,
    SEAL_ADVICES,
    partForCategory,
} from "../data/elixirData";
import {
    Advice,
    AdviceOffer,
    EffectCategory,
    ElixirEffectDefinition,
    ElixirGame,
    ElixirPart,
    ElixirSlot,
    ElixirStorage,
    SageState,
    StoredElixir,
    ELIXIR_TOTAL_TURNS,
    elixirLevel,
} from "../model/types";

const clone = <T,>(value: T): T => structuredClone(value);
const randomItem = <T,>(values: T[]): T => values[Math.floor(Math.random() * values.length)];

const weightedPick = <T extends { weight: number }>(values: T[]): T => {
    const total = values.reduce((sum, value) => sum + value.weight, 0);
    let cursor = Math.random() * total;
    for (const value of values) {
        cursor -= value.weight;
        if (cursor < 0) return value;
    }
    return values[values.length - 1];
};

const normalizeProbabilities = (slots: ElixirSlot[]) => {
    slots.forEach((slot) => {
        if (!Number.isFinite(slot.probabilityWeight)) slot.probabilityWeight = Math.max(0, slot.probability);
    });
    const active = slots.map((slot, index) => ({ slot, index }))
        .filter(({ slot }) => !slot.sealed && slot.points < 10);
    slots.forEach((slot) => {
        if (slot.sealed || slot.points >= 10) slot.probability = 0;
    });
    if (!active.length) return;
    const current = active.reduce((sum, { slot }) => sum + Math.max(0, slot.probabilityWeight), 0);
    if (current <= 0) {
        active.forEach(({ slot }) => { slot.probability = 100 / active.length; });
        return;
    }
    active.forEach(({ slot }) => { slot.probability = Math.max(0, slot.probabilityWeight) / current * 100; });
};

const adjustProbability = (slots: ElixirSlot[], target: number, requestedDelta: number) => {
    normalizeProbabilities(slots);
    const active = slots.map((slot, index) => ({ slot, index }))
        .filter(({ slot }) => !slot.sealed && slot.points < 10);
    const targetEntry = active.find((entry) => entry.index === target);
    if (!targetEntry || active.length <= 1) return;
    const activeWeight = active.reduce((sum, { slot }) => sum + Math.max(0, slot.probabilityWeight), 0);
    const delta = Math.max(-targetEntry.slot.probability, Math.min(100 - targetEntry.slot.probability, requestedDelta));
    targetEntry.slot.probability += delta;
    const others = active.filter((entry) => entry.index !== target);
    let remainder = delta;
    for (let pass = 0; pass < 5 && Math.abs(remainder) > 0.0001; pass++) {
        const eligible = others.filter(({ slot }) => delta > 0 ? slot.probability > 0 : slot.probability < 100);
        if (!eligible.length) break;
        const share = remainder / eligible.length;
        let applied = 0;
        eligible.forEach(({ slot }) => {
            const before = slot.probability;
            slot.probability = Math.max(0, Math.min(100, slot.probability - share));
            applied += before - slot.probability;
        });
        remainder -= applied;
    }
    if (activeWeight > 0) {
        active.forEach(({ slot }) => { slot.probabilityWeight = slot.probability / 100 * activeWeight; });
    }
    normalizeProbabilities(slots);
};

const availableEffectOptions = (selected: ElixirEffectDefinition[]) => {
    const selectedNames = new Set(selected.map((effect) => effect.name));
    const lockedCategories = new Set(selected.filter((effect) => effect.category !== "공용").map((effect) => effect.category));
    return ELIXIR_EFFECTS.filter((effect) => !selectedNames.has(effect.name) && !lockedCategories.has(effect.category));
};

const drawEffectOptions = (selected: ElixirEffectDefinition[]) => {
    const result: ElixirEffectDefinition[] = [];
    while (result.length < 3) {
        const usedExclusive = new Set(result.filter((effect) => effect.category !== "공용").map((effect) => effect.category));
        const pool = availableEffectOptions(selected).filter((effect) =>
            !result.some((drawn) => drawn.name === effect.name)
            && (effect.category === "공용" || !usedExclusive.has(effect.category)),
        );
        result.push(clone(weightedPick(pool)));
    }
    return result;
};

const drawFinalEffectOptions = (selected: ElixirEffectDefinition[]) =>
    availableEffectOptions(selected).map(clone);

const createSages = (): [SageState, SageState, SageState] => [
    { alignment: null, stack: 0, exhausted: false },
    { alignment: null, stack: 0, exhausted: false },
    { alignment: null, stack: 0, exhausted: false },
];

export const createElixirGame = (): ElixirGame => ({
    phase: "effects",
    selectedEffects: [],
    effectOptions: drawEffectOptions([]),
    slots: [],
    turnsRemaining: ELIXIR_TOTAL_TURNS,
    refreshes: 2,
    sages: createSages(),
    advices: [],
    selectedAdvice: null,
    turnPlan: null,
    previousAdviceIds: [],
    costReduction: 0,
    forceNormalAdvice: false,
    notice: "다섯 가지 효과를 차례대로 선택하세요.",
    resultMessages: [],
    lastChanges: [],
    greatSuccessSlots: [],
    animationId: 0,
});

const unsealed = (game: ElixirGame) => game.slots.map((slot, index) => ({ slot, index })).filter(({ slot }) => !slot.sealed);
const forgeable = (game: ElixirGame) => unsealed(game).filter(({ slot }) => slot.points < 10);

const conditionMatches = (game: ElixirGame, advice: Advice, condition: number) => {
    const target = typeof advice.target === "number" && advice.target >= 0 && advice.target <= 4
        ? advice.target
        : null;
    const targetSlot = target === null ? null : game.slots[target];
    if (condition === 1) return Boolean(targetSlot?.sealed);
    if (condition === 2) return Boolean(targetSlot && targetSlot.probability >= 99.999);
    if (condition === 3) return Boolean(targetSlot && targetSlot.probability <= 0.001);
    if (condition === 4) return Boolean(targetSlot && targetSlot.points >= 10);
    if (condition === 5) return forgeable(game).length <= 1;
    if (condition === 6) return forgeable(game).length <= 2;
    if (condition === 7) return forgeable(game).length <= 3;
    if (condition === 8) return Boolean(targetSlot && targetSlot.greatSuccess >= 99.999);
    if (condition === 9) return unsealed(game).every(({ slot }) => slot.greatSuccess >= 99.999);
    if (condition === 10) return Boolean(targetSlot?.sealed || game.slots[advice.otherTarget ?? -1]?.sealed);
    if (condition === 11) return new Set(unsealed(game).map(({ slot }) => slot.points)).size <= 1;
    if (condition === 12) return Boolean(targetSlot && targetSlot.points === game.slots[advice.otherTarget ?? -1]?.points);
    if (condition === 13) return Math.max(...unsealed(game).map(({ slot }) => slot.points)) >= 10;
    if (condition === 14) return game.costReduction >= 100;
    if (condition === 15) return new Set(unsealed(game).map(({ slot }) => slot.points)).size <= 1;
    if (condition === 35) return !game.slots.some((slot) => slot.sealed);
    if (condition === 36) return unsealed(game).reduce((sum, { slot }) => sum + slot.points, 0) === 0;
    if (condition === 37) return false;
    if (condition === 38) return Math.min(...unsealed(game).map(({ slot }) => slot.points)) === 0;
    return false;
};

const isAdviceEligible = (game: ElixirGame, advice: Advice) =>
    !(advice.conditions ?? []).some((condition) => conditionMatches(game, advice, condition));

const poolForSage = (game: ElixirGame, sage: SageState) => {
    const sealing = game.turnsRemaining <= 3 && !game.forceNormalAdvice;
    if (sage.alignment === "order" && sage.stack >= 3) return sealing ? ORDER_SEAL_ADVICES : ORDER_ADVICES;
    if (sage.alignment === "chaos" && sage.stack >= 6) return sealing ? CHAOS_SEAL_ADVICES : CHAOS_ADVICES;
    return sealing ? SEAL_ADVICES : NORMAL_ADVICES;
};

const sageExhaustionRange = (sageIndex: number): [number, number] => {
    if (sageIndex === 0) return [2, 3];
    if (sageIndex === 1) return [-4, 5];
    return [0, 4];
};

const signedRangeValue = (value: number) => value > 0 ? `+${value}` : `${value}`;

const resolveSageAdvice = (entry: Advice, sageIndex: number): Advice => {
    if (entry.kind !== "exhaustSage") return entry;
    const [minimum, maximum] = sageExhaustionRange(sageIndex);
    return {
        ...entry,
        text: `현자의 힘을 모두 소진하는 대신, 선택한 효과의 단계 [${signedRangeValue(minimum)}~${signedRangeValue(maximum)}] 중 하나만큼 상승`,
    };
};

const drawAdvices = (game: ElixirGame, refresh = false): AdviceOffer[] => {
    const result: AdviceOffer[] = [];
    const sealing = game.turnsRemaining <= 3 && !game.forceNormalAdvice;
    for (let sageIndex = 0; sageIndex < 3; sageIndex++) {
        const sage = game.sages[sageIndex];
        if (sage.exhausted) {
            result.push({
                id: `exhausted-${sageIndex}`,
                text: "현자의 힘을 모두 소진했습니다.",
                kind: "exhausted",
                weight: 0,
                sageIndex,
                special: null,
                disabled: true,
            });
            continue;
        }
        const pool = poolForSage(game, sage);
        const previousText = refresh
            ? game.advices.find((offer) => offer.sageIndex === sageIndex)?.text
            : undefined;
        const rubedoPrevious = refresh && sageIndex === 2 ? new Set(game.advices.map((offer) => offer.text)) : null;
        const candidates = pool.filter((entry) =>
            isAdviceEligible(game, entry)
            && entry.text !== previousText
            && !rubedoPrevious?.has(entry.text)
            && !result.some((drawn) => drawn.text === entry.text || Boolean(entry.group && drawn.group === entry.group)),
        );
        const fallback = pool.filter((entry) => isAdviceEligible(game, entry)
            && !result.some((drawn) => drawn.text === entry.text));
        const chosen = resolveSageAdvice(clone(weightedPick(candidates.length ? candidates : fallback)), sageIndex);
        result.push({
            ...chosen,
            sageIndex,
            special: sage.alignment && sage.stack >= (sage.alignment === "order" ? 3 : 6)
                ? sage.alignment
                : sealing ? "seal" : null,
        });
    }
    return result;
};

export const selectEffect = (state: ElixirGame, optionIndex: number): ElixirGame => {
    if (state.phase !== "effects" || !state.effectOptions[optionIndex]) return state;
    const next = clone(state);
    next.selectedEffects.push(next.effectOptions[optionIndex]);
    if (next.selectedEffects.length < 5) {
        next.effectOptions = next.selectedEffects.length === 4
            ? drawFinalEffectOptions(next.selectedEffects)
            : drawEffectOptions(next.selectedEffects);
        next.notice = next.selectedEffects.length === 4
            ? "마지막 효과는 원하는 효과를 선택하세요. 이미 선택한 효과와 부위 전용 효과는 제외됩니다."
            : `${next.selectedEffects.length}/5 효과를 선택했습니다.`;
        return next;
    }
    next.phase = "forging";
    next.slots = next.selectedEffects.map((effect) => ({
        effect, points: 0, probability: 20, probabilityWeight: 20, greatSuccess: 10, sealed: false,
    }));
    next.effectOptions = [];
    next.advices = drawAdvices(next);
    next.notice = "현자의 조언을 선택해 첫 연성을 시작하세요.";
    return next;
};

export const refreshOptions = (state: ElixirGame): ElixirGame => {
    if (state.refreshes <= 0 || state.phase === "complete" || state.selectedAdvice) return state;
    const next = clone(state);
    next.refreshes--;
    if (next.phase === "effects") {
        next.effectOptions = next.selectedEffects.length === 4
            ? drawFinalEffectOptions(next.selectedEffects)
            : drawEffectOptions(next.selectedEffects);
    }
    else next.advices = drawAdvices(next, true);
    next.notice = `다른 조언을 확인했습니다. 남은 횟수 ${next.refreshes}회`;
    return next;
};

const addPoints = (slot: ElixirSlot, amount: number) => {
    if (slot.sealed) return;
    slot.points = Math.max(0, Math.min(10, slot.points + amount));
};

const shufflePoints = (slots: ElixirSlot[]) => {
    const available = slots.filter((slot) => !slot.sealed);
    const values = available.map((slot) => slot.points);
    for (let index = values.length - 1; index > 0; index--) {
        const target = Math.floor(Math.random() * (index + 1));
        [values[index], values[target]] = [values[target], values[index]];
    }
    available.forEach((slot, index) => { slot.points = values[index]; });
};

const redistributePoints = (slots: ElixirSlot[]) => {
    const available = slots.filter((slot) => !slot.sealed);
    let total = available.reduce((sum, slot) => sum + slot.points, 0);
    available.forEach((slot) => { slot.points = 0; });
    while (total > 0 && available.some((slot) => slot.points < 10)) {
        const candidates = available.filter((slot) => slot.points < 10);
        randomItem(candidates).points++;
        total--;
    }
};

const rotatePoints = (slots: ElixirSlot[], direction: "up" | "down") => {
    const available = slots.filter((slot) => !slot.sealed);
    if (available.length <= 1) return;
    const values = available.map((slot) => slot.points);
    if (direction === "up") values.push(values.shift()!);
    else values.unshift(values.pop()!);
    available.forEach((slot, index) => { slot.points = values[index]; });
};

const distributeFrom = (slots: ElixirSlot[], sourceIndex: number) => {
    if (!slots[sourceIndex] || slots[sourceIndex].sealed) return;
    let total = slots[sourceIndex].points;
    slots[sourceIndex].points = 0;
    while (total > 0) {
        const targets = slots.map((slot, index) => ({ slot, index }))
            .filter(({ slot, index }) => index !== sourceIndex && !slot.sealed && slot.points < 10);
        if (!targets.length) break;
        randomItem(targets).slot.points++;
        total--;
    }
};

const candidatesForTarget = (game: ElixirGame, _advice: Advice) =>
    unsealed(game).map(({ index }) => index);

export const getAdviceTargets = (game: ElixirGame, advice: Advice): number[] =>
    advice.target === "selected" ? candidatesForTarget(game, advice) : [];

export const formatAdviceText = (advice: Advice, slots: ElixirSlot[]) =>
    advice.text.replace(/\{([0-4])\}/g, (_, value: string) => slots[Number(value)]?.effect.name ?? `${Number(value) + 1}번`);

export const getAdvicePreview = (game: ElixirGame, advice: Advice, selectedTarget?: number) => {
    const slots = clone(game.slots);
    if (advice.target === "selected" && selectedTarget === undefined) {
        return slots.map((slot) => ({ points: slot.points, probability: slot.probability, greatSuccess: slot.greatSuccess }));
    }
    const target = advice.target === "selected"
        ? selectedTarget ?? null
        : typeof advice.target === "number" ? advice.target : null;
    if (advice.kind === "probability" && target !== null && target <= 4) {
        adjustProbability(slots, target, advice.amount ?? 0);
    }
    if (advice.kind === "greatSuccess") {
        const indexes = target === 135 ? [0, 2, 4] : target === 24 ? [1, 3]
            : target !== null && target <= 4 ? [target] : [0, 1, 2, 3, 4];
        indexes.forEach((index) => {
            if (!slots[index].sealed) slots[index].greatSuccess = Math.min(100, slots[index].greatSuccess + (advice.amount ?? 0));
        });
    }
    if (advice.kind === "rotateUp") {
        rotatePoints(slots, "up");
    }
    if (advice.kind === "rotateDown") {
        rotatePoints(slots, "down");
    }
    return slots.map((slot) => ({ points: slot.points, probability: slot.probability, greatSuccess: slot.greatSuccess }));
};

const sealSlot = (slots: ElixirSlot[], index: number) => {
    if (!slots[index]) return;
    slots[index].sealed = true;
    slots[index].probability = 0;
    normalizeProbabilities(slots);
};

const replaceEffect = (game: ElixirGame, target: number) => {
    if (!game.slots[target] || game.slots[target].sealed) return;
    const others = game.slots.filter((_, index) => index !== target).map((slot) => slot.effect);
    const choices = drawEffectOptions(others);
    game.slots[target].effect = clone(randomItem(choices));
};

const updateSages = (sages: [SageState, SageState, SageState], selected: number) => {
    const activeSages = sages.filter((sage) => !sage.exhausted);
    const first = activeSages.every((sage) => sage.alignment === null);
    sages.forEach((sage, index) => {
        if (sage.exhausted) return;
        if (index === selected) {
            if (!first && sage.alignment === "order" && sage.stack < 3) sage.stack++;
            else {
                sage.alignment = "order";
                sage.stack = 1;
            }
            return;
        }
        if (!first && sage.alignment === "chaos" && sage.stack < 6) sage.stack++;
        else {
            sage.alignment = "chaos";
            sage.stack = 1;
        }
    });
};

const pickForgeTargets = (slots: ElixirSlot[], probabilities: number[], count: number) => {
    const result: number[] = [];
    while (result.length < count) {
        const candidates = slots.map((slot, index) => ({ slot, index, weight: probabilities[index] }))
            .filter(({ slot, index, weight }) => !slot.sealed && slot.points < 10 && !result.includes(index) && weight > 0);
        if (!candidates.length) break;
        result.push(weightedPick(candidates).index);
    }
    return result;
};

const performForge = (game: ElixirGame, probabilities: number[], forcedTarget: number | null, count: number, amount: number) => {
    const targets = forcedTarget === null
        ? pickForgeTargets(game.slots, probabilities, count)
        : [forcedTarget];
    const results: { index: number; gained: number; great: boolean }[] = [];
    targets.forEach((index) => {
        const slot = game.slots[index];
        if (!slot || slot.sealed || slot.points >= 10) return;
        const great = Math.random() * 100 < slot.greatSuccess;
        const gained = amount + (great ? 1 : 0);
        addPoints(slot, gained);
        results.push({ index, gained, great });
    });
    return results;
};

const slotChanges = (before: ElixirSlot[], after: ElixirSlot[]) => after.map((slot, index) => ({
    index,
    pointsDelta: slot.points - before[index].points,
    probabilityDelta: slot.probability - before[index].probability,
    greatSuccessDelta: slot.greatSuccess - before[index].greatSuccess,
    sealChanged: slot.sealed !== before[index].sealed,
})).filter((change) => change.pointsDelta !== 0
    || Math.abs(change.probabilityDelta) > 0.001
    || Math.abs(change.greatSuccessDelta) > 0.001
    || change.sealChanged);

const signed = (value: number, suffix = "") => `${value > 0 ? "+" : ""}${Number.isInteger(value) ? value : value.toFixed(1)}${suffix}`;

const describeChanges = (before: ElixirSlot[], after: ElixirSlot[], temporaryProbabilities?: number[]) => {
    const displayAfter = clone(after);
    if (temporaryProbabilities) displayAfter.forEach((slot, index) => { slot.probability = temporaryProbabilities[index]; });
    return slotChanges(before, displayAfter).map((change) => {
        const parts: string[] = [];
        if (change.pointsDelta) parts.push(`연성 단계 ${signed(change.pointsDelta)}`);
        if (Math.abs(change.probabilityDelta) > 0.001) parts.push(`연성 확률 ${signed(change.probabilityDelta, "%p")}`);
        if (Math.abs(change.greatSuccessDelta) > 0.001) parts.push(`대성공 확률 ${signed(change.greatSuccessDelta, "%p")}`);
        if (change.sealChanged) parts.push(displayAfter[change.index].sealed ? "봉인" : "봉인 해제");
        return `${change.index + 1}번 ${displayAfter[change.index].effect.name}: ${parts.join(" · ")}`;
    });
};

export const chooseAdvice = (state: ElixirGame, sageIndex: number, selectedTarget?: number): ElixirGame => {
    if (state.phase !== "forging" || state.selectedAdvice) return state;
    const sourceAdvice = state.advices.find((offer) => offer.sageIndex === sageIndex);
    if (!sourceAdvice || sourceAdvice.disabled || state.sages[sageIndex]?.exhausted) return state;
    if (sourceAdvice.target === "selected" && (selectedTarget === undefined || !getAdviceTargets(state, sourceAdvice).includes(selectedTarget))) {
        return state;
    }

    if (sourceAdvice.kind === "reset") {
        const resetGame = createElixirGame();
        resetGame.notice = "엘릭서를 초기화했습니다. 다섯 가지 효과를 처음부터 다시 선택하세요.";
        return resetGame;
    }

    const next = clone(state);
    const beforeSlots = clone(state.slots);
    const advice = next.advices.find((offer) => offer.sageIndex === sageIndex)!;
    const target = advice.target === "selected" ? selectedTarget! : typeof advice.target === "number" ? advice.target : null;
    const turnSlots = clone(next.slots);
    let forcedTarget: number | null = null;
    let forgeCount = 1;
    let forgeAmount = 1;
    let freeTurn = false;
    let forceNormalNext = false;

    if (advice.kind === "probability" && target !== null && target <= 4) {
        adjustProbability(advice.persistent ? next.slots : turnSlots, target, advice.amount ?? 0);
    }
    if (advice.kind === "greatSuccess") {
        const indexes = target === 135 ? [0, 2, 4] : target === 24 ? [1, 3]
            : target !== null && target <= 4 ? [target] : [0, 1, 2, 3, 4];
        indexes.forEach((index) => {
            if (!next.slots[index].sealed) next.slots[index].greatSuccess = Math.min(100, next.slots[index].greatSuccess + (advice.amount ?? 0));
        });
    }
    if (advice.kind === "forgeFixed" || advice.kind === "forgeSelected") {
        forcedTarget = target;
        forgeAmount = advice.amount ?? 1;
    }
    if (advice.kind === "freeTurn") freeTurn = true;
    if (advice.kind === "stageRange" && target !== null) addPoints(next.slots[target], advice.amount === 1
        ? 1 : Math.floor(Math.random() * ((advice.amount ?? 0) + 1)));
    if (advice.kind === "stageChance" && target !== null && Math.random() * 100 < (advice.chance ?? 0)) addPoints(next.slots[target], advice.amount ?? 0);
    if (advice.kind === "stageRandom") {
        const choices = forgeable(next);
        if (choices.length) addPoints(randomItem(choices).slot, advice.amount ?? 1);
    }
    if (advice.kind === "stageLowest" || advice.kind === "stageHighest") {
        const choices = forgeable(next);
        if (choices.length) {
            const boundary = advice.kind === "stageLowest"
                ? Math.min(...choices.map(({ slot }) => slot.points))
                : Math.max(...choices.map(({ slot }) => slot.points));
            addPoints(randomItem(choices.filter(({ slot }) => slot.points === boundary)).slot, advice.amount ?? 1);
        }
    }
    if (advice.kind === "shuffle") shufflePoints(next.slots);
    if (advice.kind === "redistribute") redistributePoints(next.slots);
    if (advice.kind === "rotateUp") {
        rotatePoints(next.slots, "up");
    }
    if (advice.kind === "rotateDown") {
        rotatePoints(next.slots, "down");
    }
    if (advice.kind === "swap" && target !== null && advice.otherTarget !== undefined
        && !next.slots[target]?.sealed && !next.slots[advice.otherTarget]?.sealed) {
        [next.slots[target].points, next.slots[advice.otherTarget].points] = [next.slots[advice.otherTarget].points, next.slots[target].points];
    }
    if (advice.kind === "forgeAmount") forgeAmount = advice.amount ?? 1;
    if (advice.kind === "simultaneous") forgeCount = advice.amount ?? 1;
    if (advice.kind === "refresh") next.refreshes += advice.amount ?? 1;
    if (advice.kind === "cost" && advice.persistent) next.costReduction = Math.min(100, next.costReduction + (advice.amount ?? 0));
    if (advice.kind === "sealFixed" && target !== null) sealSlot(next.slots, target);
    if (advice.kind === "sealSelected" && target !== null) {
        sealSlot(next.slots, target);
        if (advice.text.includes("기회를 소모하지")) {
            freeTurn = true;
            forceNormalNext = advice.special === "order";
        }
        if (advice.text.includes("2단계 상승")) forgeAmount = 2;
        if (advice.text.includes("2개의 효과 동시")) forgeCount = 2;
        if (advice.text.includes("다른 효과 1개")) {
            const choices = forgeable(next).filter(({ index }) => index !== target);
            if (choices.length) addPoints(randomItem(choices).slot, 1);
        }
        if (advice.text.includes("최하 단계")) {
            const choices = forgeable(next);
            if (choices.length) {
                const minimum = Math.min(...choices.map(({ slot }) => slot.points));
                addPoints(randomItem(choices.filter(({ slot }) => slot.points === minimum)).slot, 1);
            }
        }
        if (advice.text.includes("재분배")) redistributePoints(next.slots);
        if (advice.text.includes("뒤섞기")) shufflePoints(next.slots);
    }
    if (advice.kind === "unsealAndSeal") {
        const sealed = next.slots.map((slot, index) => ({ slot, index })).filter(({ slot }) => slot.sealed);
        if (sealed.length) {
            const restored = randomItem(sealed);
            restored.slot.sealed = false;
            normalizeProbabilities(next.slots);
            const sealCandidates = unsealed(next).filter(({ index }) => index !== restored.index);
            if (sealCandidates.length) sealSlot(next.slots, randomItem(sealCandidates).index);
        }
    }
    if (advice.kind === "changeEffect" && target !== null) replaceEffect(next, target);
    if (advice.kind === "distributeSelected" && target !== null) {
        distributeFrom(next.slots, target);
    }
    if (advice.kind === "exhaustSage" && target !== null) {
        const [minimum, maximum] = sageExhaustionRange(sageIndex);
        addPoints(next.slots[target], minimum + Math.floor(Math.random() * (maximum - minimum + 1)));
        next.sages[sageIndex].exhausted = true;
    }
    if (advice.kind === "distributeLowest" || advice.kind === "distributeHighest") {
        const choices = unsealed(next);
        const boundary = advice.kind === "distributeLowest"
            ? Math.min(...choices.map(({ slot }) => slot.points))
            : Math.max(...choices.map(({ slot }) => slot.points));
        distributeFrom(next.slots, randomItem(choices.filter(({ slot }) => slot.points === boundary)).index);
    }

    normalizeProbabilities(next.slots);

    const forgeProbabilities = advice.kind === "probability" && !advice.persistent
        ? turnSlots.map((slot) => slot.probability)
        : next.slots.map((slot) => slot.probability);
    const adviceText = formatAdviceText(advice, state.slots);
    const changes = describeChanges(beforeSlots, next.slots, forgeProbabilities);
    next.selectedAdvice = advice;
    next.turnPlan = { sageIndex, probabilities: forgeProbabilities, forcedTarget, forgeCount, forgeAmount, freeTurn, forceNormalNext };
    next.lastChanges = slotChanges(beforeSlots, next.slots);
    next.greatSuccessSlots = [];
    next.animationId = (next.animationId ?? 0) + 1;
    next.resultMessages = changes.length ? changes : [`이번 연성에 적용: ${adviceText}`];
    if (advice.kind === "exhaustSage") next.resultMessages.push("이 현자는 힘을 모두 소진하여 이후 조언을 제시하지 않습니다.");
    if (freeTurn) next.resultMessages.push("이번 연성은 남은 연성 횟수를 소모하지 않습니다.");
    if (forgeCount > 1) next.resultMessages.push(`이번 연성에서 ${forgeCount}개의 효과를 동시에 연성합니다.`);
    if (forgeAmount > 1) next.resultMessages.push(`이번 연성의 기본 상승량이 ${forgeAmount}칸으로 변경됩니다.`);
    next.notice = `${adviceText} 조언을 적용했습니다. 연성하기를 눌러주세요.`;
    return next;
};

export const forgeElixir = (state: ElixirGame): ElixirGame => {
    if (state.phase !== "forging" || !state.selectedAdvice || !state.turnPlan) return state;
    const next = clone(state);
    const beforeSlots = clone(next.slots);
    const plan = next.turnPlan!;
    const results = performForge(next, plan.probabilities, plan.forcedTarget, plan.forgeCount, plan.forgeAmount);
    normalizeProbabilities(next.slots);
    updateSages(next.sages, plan.sageIndex);
    if (!plan.freeTurn) next.turnsRemaining = Math.max(0, next.turnsRemaining - 1);
    next.forceNormalAdvice = plan.forceNormalNext;
    next.previousAdviceIds = next.advices.map((offer) => offer.id);
    next.lastChanges = slotChanges(beforeSlots, next.slots);
    next.greatSuccessSlots = results.filter((result) => result.great).map((result) => result.index);
    next.animationId = (next.animationId ?? 0) + 1;
    next.resultMessages = results.length
        ? results.map((result) => `${result.index + 1}번 ${next.slots[result.index].effect.name}: 연성 단계 +${result.gained}${result.great ? " · 대성공!" : ""}`)
        : ["연성 가능한 효과가 없어 단계가 오르지 않았습니다."];
    next.selectedAdvice = null;
    next.turnPlan = null;
    next.notice = next.resultMessages.join(" · ");

    const continuesAfterFinalSeal = plan.freeTurn && plan.forceNormalNext && next.turnsRemaining > 0;
    if ((!continuesAfterFinalSeal && unsealed(next).length <= 2) || next.turnsRemaining <= 0) {
        next.phase = "finalizing";
        next.advices = [];
        next.notice = `${next.notice} · 잠시 후 완성된 엘릭서를 확인합니다.`;
    } else {
        next.advices = drawAdvices(next);
    }
    return next;
};

export const finishElixir = (state: ElixirGame): ElixirGame => {
    if (state.phase !== "finalizing") return state;
    const next = clone(state);
    next.phase = "complete";
    next.notice = "연성이 완료되었습니다. 봉인되지 않은 두 효과를 저장할 수 있습니다.";
    return next;
};

export const completedElixir = (game: ElixirGame): StoredElixir | null => {
    const effects = unsealed(game).slice(0, 2).map(({ slot }) => ({
        name: slot.effect.name,
        category: slot.effect.category,
        points: slot.points,
        level: elixirLevel(slot.points),
    }));
    if (effects.length !== 2) return null;
    return { id: `elixir-${Date.now()}`, createdAt: Date.now(), effects: [effects[0], effects[1]] };
};

export type AppliedEffect = {
    name: string;
    level: number;
    sources: { part: ElixirPart; level: number }[];
};

export const getAppliedEffects = (storage: ElixirStorage) => {
    const active: AppliedEffect[] = [];
    const inactive: { part: ElixirPart; name: string; level: number; requiredPart: ElixirPart }[] = [];
    Object.entries(storage).forEach(([partName, data]) => {
        const part = partName as ElixirPart;
        const elixir = data.selected === null ? null : data.slots[data.selected];
        elixir?.effects.forEach((effect) => {
            const requiredPart = partForCategory(effect.category);
            if (requiredPart && requiredPart !== part) {
                inactive.push({ part, name: effect.name, level: effect.level, requiredPart });
                return;
            }
            const found = active.find((entry) => entry.name === effect.name);
            if (found) {
                found.level += effect.level;
                found.sources.push({ part, level: effect.level });
            } else {
                active.push({ name: effect.name, level: effect.level, sources: [{ part, level: effect.level }] });
            }
        });
    });
    return {
        active: active.sort((a, b) => b.level - a.level || a.name.localeCompare(b.name, "ko")),
        inactive,
        totalLevel: active.reduce((sum, effect) => sum + effect.level, 0),
    };
};

export const categoryMatchesPart = (category: EffectCategory, part: ElixirPart) =>
    category === "공용" || partForCategory(category) === part;
