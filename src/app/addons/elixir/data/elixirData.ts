import { Advice, ElixirEffectDefinition, ElixirPart } from "../model/types";

const effects = (category: ElixirEffectDefinition["category"], weight: number, names: string[]) =>
    names.map((name) => ({ name, category, weight }));

export const ELIXIR_EFFECTS: ElixirEffectDefinition[] = [
    ...effects("공용", 0.062506, [
        "힘, 민첩, 지능", "공격력", "무기 공격력", "탈출의 달인", "회피의 달인", "마나",
        "생명의 축복", "자원의 축복", "방랑자", "무력화", "물약 중독", "폭발물 달인",
    ]),
    ...effects("투구 전용", 0.005551, [
        "행운 : 질서", "회심 : 질서", "달인 : 질서", "강맹 : 질서", "칼날 방패 : 질서",
        "선봉대 : 질서", "선각자 : 질서", "진군 : 질서", "신념 : 질서",
    ]),
    ...effects("어깨 전용", 0.012501, ["보스 피해", "각성기 피해", "보호막 강화", "회복 강화"]),
    ...effects("상의 전용", 0.012501, ["최대 생명력", "받는 피해 감소", "물리 방어력", "마법 방어력"]),
    ...effects("하의 전용", 0.012501, ["치명타 피해", "추가 피해", "아이덴티티 획득", "아군 강화"]),
    ...effects("장갑 전용", 0.005551, [
        "행운 : 혼돈", "회심 : 혼돈", "달인 : 혼돈", "강맹 : 혼돈", "칼날 방패 : 혼돈",
        "선봉대 : 혼돈", "선각자 : 혼돈", "진군 : 혼돈", "신념 : 혼돈",
    ]),
];

let adviceSequence = 0;
const advice = (data: Omit<Advice, "id">): Advice => ({ ...data, id: `advice-${adviceSequence++}` });
const targets = [0, 1, 2, 3, 4] as const;

const targeted = (
    text: (target: string) => string,
    kind: Advice["kind"],
    fixedWeight: number,
    selectedWeight: number,
    fixedConditions: number[],
    selectedConditions: number[],
    rest: Partial<Advice> = {},
) => [
    ...targets.map((target) => advice({
        text: text(`{${target}}`), kind, target, weight: fixedWeight, conditions: fixedConditions, ...rest,
    })),
    advice({ text: text("선택한"), kind, target: "selected", weight: selectedWeight, conditions: selectedConditions, ...rest }),
];

const addGroups = (entries: Advice[], prefix: string) => entries.map((entry) => ({
    ...entry,
    group: `${prefix}-${entry.target}`,
}));

export const NORMAL_ADVICES: Advice[] = [
    ...targeted((target) => `이번 연성에서 ${target} 효과의 연성 확률 50% 상승`, "probability", 0.007998, 0.00301, [1, 2, 4, 5], [5], { amount: 50 }),
    ...addGroups([
        ...targeted((target) => `남은 모든 연성에서 ${target} 효과의 연성 확률 10% 상승`, "probability", 0.011197, 0.004214, [1, 2, 4, 5], [5], { amount: 10, persistent: true }),
        ...targeted((target) => `남은 모든 연성에서 ${target} 효과의 연성 확률 20% 상승`, "probability", 0.004799, 0.001806, [1, 2, 4, 5], [5], { amount: 20, persistent: true }),
    ], "prob-up"),
    ...addGroups([
        ...targeted((target) => `남은 모든 연성에서 ${target} 효과의 연성 확률 10% 하락`, "probability", 0.011197, 0.004214, [1, 3, 4, 5], [5], { amount: -10, persistent: true }),
        ...targeted((target) => `남은 모든 연성에서 ${target} 효과의 연성 확률 20% 하락`, "probability", 0.004799, 0.001806, [1, 3, 4, 5], [5], { amount: -20, persistent: true }),
    ], "prob-down"),
    ...addGroups([
        ...targeted((target) => `남은 모든 연성에서 ${target} 효과의 연성 대성공 확률 15% 상승`, "greatSuccess", 0.013043, 0.004909, [1, 3, 4, 8], [9], { amount: 15, persistent: true }),
        ...targeted((target) => `남은 모든 연성에서 ${target} 효과의 연성 대성공 확률 30% 상승`, "greatSuccess", 0.00913, 0.003436, [1, 3, 4, 8], [9], { amount: 30, persistent: true }),
        ...targeted((target) => `남은 모든 연성에서 ${target} 효과의 연성 대성공 확률 45% 상승`, "greatSuccess", 0.003913, 0.001473, [1, 3, 4, 8], [9], { amount: 45, persistent: true }),
    ], "great-target"),
    ...[10, 20, 30].map((amount, index) => advice({
        text: `남은 모든 연성에서 모든 효과의 연성 대성공 확률 ${amount}% 상승`,
        kind: "greatSuccess", weight: [0.012375, 0.008663, 0.003713][index], conditions: [9], amount,
        persistent: true, group: "great-all",
    })),
    ...addGroups([
        ...targeted((target) => `이번 연성에서 ${target} 효과 연성`, "forgeFixed", 0.009114, 0.00343, [1, 2, 4], [], { amount: 1 }),
        ...targeted((target) => `이번 연성에서 ${target} 효과 2단계 연성`, "forgeFixed", 0.003906, 0.00147, [1, 2, 4], [], { amount: 2 }),
    ], "force"),
    advice({ text: "이번 연성에서 기회를 소모하지 않고 연성", kind: "freeTurn", weight: 0.006 }),
    ...[2, 3, 4].flatMap((maximum, index) => addGroups(targeted(
        (target) => `${target} 효과의 단계 [0~+${maximum}]만큼 상승`, "stageRange",
        [0.006975, 0.004883, 0.002093][index], [0.002625, 0.001838, 0.0007875][index],
        [1, 4], [], { amount: maximum },
    ), "stage-range")),
    ...[[25, 3, 0.009791, 0.003685], [25, 4, 0.004196, 0.001579], [50, 2, 0.007037, 0.002648],
        [50, 3, 0.003016, 0.001135], [75, 1, 0.007037, 0.002648], [75, 2, 0.003016, 0.001135]]
        .flatMap(([chance, amount, fixedWeight, selectedWeight]) => addGroups(targeted(
            (target) => `${target} 효과의 단계 ${chance}% 확률로 ${amount} 상승`, "stageChance",
            fixedWeight, selectedWeight, [1, 4], [], { amount, chance },
        ), `stage-${chance}`)),
    ...[1, 2, 3].map((amount, index) => advice({
        text: `임의의 효과 1개의 단계 ${amount} 상승`, kind: "stageRandom",
        weight: [0.0094, 0.00658, 0.00282][index], amount, group: "random-stage",
    })),
    ...[1, 2, 3].map((amount, index) => advice({
        text: `최하 단계 효과 1개의 단계 ${amount} 상승`, kind: "stageLowest",
        weight: [0.0094, 0.00658, 0.00282][index], conditions: [11], amount, group: "lowest-stage",
    })),
    ...[1, 2, 3].map((amount, index) => advice({
        text: `최고 단계 효과 1개의 단계 ${amount} 상승`, kind: "stageHighest",
        weight: [0.00705, 0.004935, 0.002115][index], conditions: [11, 13], amount, group: "highest-stage",
    })),
    advice({ text: "모든 효과의 단계 뒤섞기", kind: "shuffle", weight: 0.01, conditions: [11] }),
    advice({ text: "모든 효과의 단계 재분배", kind: "redistribute", weight: 0.012, conditions: [15] }),
    advice({ text: "모든 효과의 단계를 위로 1 슬롯 씩 이동", kind: "rotateUp", weight: 0.01, conditions: [11] }),
    advice({ text: "모든 효과의 단계를 아래로 1 슬롯 씩 이동", kind: "rotateDown", weight: 0.01, conditions: [11] }),
    ...targets.flatMap((target, index) => targets.slice(index + 1).map((otherTarget) => advice({
        text: `{${target}} 효과와 {${otherTarget}} 효과의 단계 교환`, kind: "swap", target, otherTarget,
        weight: 0.008, conditions: [10, 12],
    }))),
    ...[2, 3, 4].map((amount, index) => advice({
        text: `이번에 연성되는 효과는 ${amount}단계 상승`, kind: "forgeAmount",
        weight: [0.0085, 0.00595, 0.00255][index], amount, group: "forge-amount",
    })),
    ...[2, 3, 4].map((amount, index) => advice({
        text: `이번 연성에 한해 ${amount}개의 효과 동시에 연성`, kind: "simultaneous",
        weight: [0.0085, 0.00595, 0.00255][index], conditions: [amount + 3], amount, group: "simultaneous",
    })),
    ...[1, 2].map((amount, index) => advice({
        text: `다른 조언 보기 횟수 ${amount}회 증가`, kind: "refresh",
        weight: [0.014, 0.006][index], amount, group: "refresh",
    })),
    advice({ text: "이번 연성에 한해 비용 100% 감소", kind: "cost", weight: 0.0406, conditions: [14], amount: 100 }),
    advice({ text: "이후 모든 연성에서 비용 50% 감소", kind: "cost", weight: 0.0174, conditions: [14], amount: 50, persistent: true }),
];

export const SEAL_ADVICES: Advice[] = [
    ...targets.map((target) => advice({
        text: `{${target}} 효과 봉인`, kind: "sealFixed", target, weight: 0.186, conditions: [1],
    })),
    advice({ text: "선택한 효과 봉인 후, 이번 연성에 한해 2개의 효과 동시 연성", kind: "sealSelected", target: "selected", weight: 0.023333, conditions: [5], amount: 2 }),
    advice({ text: "선택한 효과 봉인 후, 다른 효과 1개의 단계를 1 상승", kind: "sealSelected", target: "selected", weight: 0.023333, amount: 1 }),
    advice({ text: "선택한 효과 봉인 후, 최하 단계 효과 1개의 단계를 1 상승", kind: "sealSelected", target: "selected", weight: 0.023333, amount: -1 }),
];

export const ORDER_ADVICES: Advice[] = [
    advice({ text: "남은 모든 연성에서 선택한 효과의 연성 확률 15% 상승", kind: "probability", target: "selected", weight: 0.085, amount: 15, persistent: true }),
    advice({ text: "남은 모든 연성에서 선택한 효과의 연성 확률 20% 하락", kind: "probability", target: "selected", weight: 0.085, amount: -20, persistent: true }),
    advice({ text: "남은 모든 연성에서 선택한 효과의 연성 대성공 확률 25% 상승", kind: "greatSuccess", target: "selected", weight: 0.06, amount: 25, persistent: true }),
    advice({ text: "남은 모든 연성에서 모든 효과의 연성 대성공 확률 15% 상승", kind: "greatSuccess", weight: 0.021, amount: 15, persistent: true }),
    advice({ text: "남은 모든 연성에서 1, 3, 5번 효과의 연성 대성공 확률 15% 상승", kind: "greatSuccess", weight: 0.042, amount: 15, target: 135, persistent: true }),
    advice({ text: "남은 모든 연성에서 2, 4번 효과의 연성 대성공 확률 15% 상승", kind: "greatSuccess", weight: 0.077, amount: 15, target: 24, persistent: true }),
    advice({ text: "이번 연성에서 선택한 효과 2단계 연성", kind: "forgeSelected", target: "selected", weight: 0.05, amount: 2 }),
    advice({ text: "이번 연성에서 기회를 소모하지 않고 연성", kind: "freeTurn", weight: 0.05 }),
    advice({ text: "선택한 효과의 단계를 1 상승", kind: "stageRange", target: "selected", weight: 0.072, amount: 1 }),
    advice({ text: "선택한 효과의 단계를 2 상승", kind: "stageRange", target: "selected", weight: 0.013, amount: 2 }),
    advice({ text: "최고 단계 효과의 단계를 2 상승", kind: "stageHighest", weight: 0.015, amount: 2 }),
    advice({ text: "이번에 연성되는 효과에 한해 3단계 상승", kind: "forgeAmount", weight: 0.01, amount: 3 }),
    advice({ text: "이번 연성에서 3개의 효과 동시 연성", kind: "simultaneous", weight: 0.01, amount: 3 }),
    advice({ text: "이번 모든 연성에서 비용 100% 감소", kind: "cost", weight: 0.2, amount: 100 }),
    advice({ text: "선택한 효과 봉인", kind: "sealSelected", target: "selected", weight: 0.01 }),
    advice({ text: "다른 조언 보기 횟수 2회 증가", kind: "refresh", weight: 0.06, amount: 2 }),
    advice({ text: "다른 조언 보기 횟수 1회 증가", kind: "refresh", weight: 0.14, amount: 1 }),
];

export const CHAOS_ADVICES: Advice[] = [
    advice({ text: "임의의 효과 1개의 봉인 해제. 대신 다른 효과 1개를 봉인", kind: "unsealAndSeal", weight: 0.102564, conditions: [35] }),
    advice({ text: "모든 효과의 단계 뒤섞기", kind: "shuffle", weight: 0.128205, conditions: [11] }),
    advice({ text: "모든 효과의 단계 재분배", kind: "redistribute", weight: 0.128205, conditions: [36] }),
    advice({ text: "임의의 효과 1개의 단계 2 상승", kind: "stageRandom", weight: 0.051282, amount: 2 }),
    advice({ text: "엘릭서의 효과와 단계 초기화", kind: "reset", weight: 0.102564 }),
    advice({ text: "선택한 슬롯의 효과 변경", kind: "changeEffect", target: "selected", weight: 0.102564 }),
    advice({ text: "현자의 힘을 모두 소진하는 대신, 선택한 효과의 단계 상승", kind: "exhaustSage", target: "selected", weight: 0.153846, conditions: [37] }),
    advice({ text: "모든 효과의 단계를 위로 1 슬롯 씩 이동 (첫번째 효과의 단계는 마지막 효과로 이동)", kind: "rotateUp", weight: 0.064103, conditions: [11] }),
    advice({ text: "모든 효과의 단계를 아래로 1 슬롯 씩 이동 (마지막 효과의 단계는 첫번째 효과로 이동)", kind: "rotateDown", weight: 0.064103, conditions: [11] }),
    advice({ text: "선택한 효과의 단계를 전부 다른 효과에 분배", kind: "distributeSelected", target: "selected", weight: 0.020513, amount: -1, conditions: [5, 36] }),
    advice({ text: "최하 단계 효과 1개의 단계를 전부 다른 효과에 분배", kind: "distributeLowest", weight: 0.041026, conditions: [5, 38] }),
    advice({ text: "최고 단계 효과 1개의 단계를 전부 다른 효과에 분배", kind: "distributeHighest", weight: 0.041026, conditions: [5, 36] }),
];

export const ORDER_SEAL_ADVICES: Advice[] = [
    advice({ text: "선택한 효과 봉인 후, 이번 연성에 한해 기회를 소모하지 않고 진행", kind: "sealSelected", target: "selected", weight: 0.3333333322, sealFirst: true }),
    advice({ text: "선택한 효과 봉인 후, 이번에 연성되는 효과에 한해 2단계 상승", kind: "sealSelected", target: "selected", weight: 0.3333333322, amount: 2, sealFirst: true }),
    advice({ text: "선택한 효과 봉인 후, 이번 연성에 한해 2개의 효과 동시 연성", kind: "sealSelected", target: "selected", weight: 0.3333333322, conditions: [5], amount: 3, sealFirst: true }),
    advice({ text: "선택한 효과 봉인", kind: "sealSelected", target: "selected", weight: 0.0000000033, sealFirst: true }),
];

export const CHAOS_SEAL_ADVICES: Advice[] = [
    advice({ text: "선택한 효과 봉인 후, 다른 효과 1개의 단계를 1 상승", kind: "sealSelected", target: "selected", weight: 0.2499999994, amount: 1, sealFirst: true }),
    advice({ text: "선택한 효과 봉인 후, 최하 단계 효과 1개의 단계를 1 상승", kind: "sealSelected", target: "selected", weight: 0.2499999994, amount: -1, sealFirst: true }),
    advice({ text: "선택한 효과 봉인 후, 모든 효과의 단계를 임의로 재분배", kind: "sealSelected", target: "selected", weight: 0.2499999994, amount: -2, sealFirst: true }),
    advice({ text: "선택한 효과 봉인 후, 모든 효과의 단계를 임의로 뒤섞기", kind: "sealSelected", target: "selected", weight: 0.2499999994, amount: -3, sealFirst: true }),
    advice({ text: "선택한 효과 봉인", kind: "sealSelected", target: "selected", weight: 0.0000000025, sealFirst: true }),
];

export const partForCategory = (category: ElixirEffectDefinition["category"]): ElixirPart | null =>
    category === "공용" ? null : category.replace(" 전용", "") as ElixirPart;
