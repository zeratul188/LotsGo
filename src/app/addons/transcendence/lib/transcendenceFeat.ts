import {
    DEFAULT_SPIRITS,
    Equipment,
    GameState,
    MYSTERY_SPIRITS,
    Position,
    PreviewCell,
    SpecialTile,
    SpiritCard,
    SpiritElement,
    SpiritLevel,
    SpiritName,
    StagePreset,
    Tile,
} from "../model/types";

export const SPIRIT_WEIGHTS = [115, 105, 90, 150, 150, 95, 70, 55, 70, 100];
export const SPECIAL_TILES: SpecialTile[] = ["추가", "재배치", "축복", "신비", "강화", "복제"];
export const SPECIAL_WEIGHTS = [235, 170, 115, 160, 160, 160];

let cardSequence = 0;
const makeCard = (name: SpiritName, level: SpiritLevel = 1): SpiritCard => ({
    name,
    level,
    id: `${name}-${Date.now()}-${cardSequence++}`,
});

const weightedPick = <T,>(items: readonly T[], weights: number[]): T => {
    const value = Math.random() * weights.reduce((sum, weight) => sum + weight, 0);
    let cursor = 0;
    for (let index = 0; index < items.length; index++) {
        cursor += weights[index];
        if (value < cursor) return items[index];
    }
    return items[items.length - 1];
};

export const drawDefaultCard = () => makeCard(weightedPick(DEFAULT_SPIRITS, SPIRIT_WEIGHTS));
export const drawMysteryCard = () => makeCard(MYSTERY_SPIRITS[Math.random() < 0.5 ? 0 : 1]);

export const getSpiritElement = (name: SpiritName): SpiritElement => {
    if (["지진", "충격파"].includes(name)) return "earth";
    if (["용오름", "분출", "해일", "폭풍우"].includes(name)) return "water";
    if (["대폭발", "업화"].includes(name)) return "fire";
    if (["벼락", "낙뢰"].includes(name)) return "lightning";
    if (["정화", "세계수의 공명"].includes(name)) return "light";
    return "default";
};

export const getBoardSize = (stage: number): 6 | 7 | 8 => stage <= 3 ? 6 : stage <= 5 ? 7 : 8;

export const createBoard = (preset: StagePreset): (Tile | null)[][] =>
    preset.blocks.map((row) => row.map((value) => {
        if (value === 1) return { base: "normal" };
        if (value === 2) return { base: "distorted" };
        return null;
    }));

const positions = (board: unknown[][]): Position[] =>
    board.flatMap((row, rowIndex) => row.map((_, colIndex) => ({ row: rowIndex, col: colIndex })));

const shuffle = <T,>(values: T[]): T[] => {
    const result = [...values];
    for (let index = result.length - 1; index > 0; index--) {
        const target = Math.floor(Math.random() * (index + 1));
        [result[index], result[target]] = [result[target], result[index]];
    }
    return result;
};

const isPlayable = (preset: StagePreset, position: Position) =>
    preset.blocks[position.row]?.[position.col] === 1 || preset.blocks[position.row]?.[position.col] === 2;

const spawnNormalTiles = (board: (Tile | null)[][], preset: StagePreset, count: number) => {
    const candidates = shuffle(positions(board).filter((position) =>
        isPlayable(preset, position) && board[position.row][position.col] === null,
    ));
    const destinations = candidates.slice(0, count);
    destinations.forEach(({ row, col }) => {
        board[row][col] = { base: "normal" };
    });
    return destinations.length;
};

const distanceChance = (distance: number) => Math.max(10, 100 - 15 * distance);

const getOffsets = (
    name: SpiritName,
    size: number,
    level: SpiritLevel,
): { row: number; col: number; distance: number }[] => {
    const offsets: { row: number; col: number; distance: number }[] = [];
    const add = (row: number, col: number, distance = Math.max(Math.abs(row), Math.abs(col))) =>
        offsets.push({ row, col, distance });

    add(0, 0, 0);
    if (name === "분출" || name === "벼락") return offsets;

    if (name === "업화") {
        for (let row = -2; row <= 2; row++) for (let col = -2; col <= 2; col++) {
            if ((row || col) && Math.abs(row) + Math.abs(col) <= 2) add(row, col);
        }
    } else if (name === "대폭발") {
        for (let distance = 1; distance < size; distance++) {
            add(distance, distance, distance); add(distance, -distance, distance);
            add(-distance, distance, distance); add(-distance, -distance, distance);
        }
    } else if (name === "낙뢰") {
        [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([row, col]) => add(row, col));
    } else if (name === "용오름") {
        [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([row, col]) => add(row, col));
    } else if (name === "충격파") {
        for (let row = -1; row <= 1; row++) for (let col = -1; col <= 1; col++) if (row || col) add(row, col);
    } else if (name === "지진") {
        for (let distance = 1; distance < size; distance++) {
            add(0, distance, distance); add(0, -distance, distance);
        }
    } else if (name === "정화") {
        add(0, 1, 1); add(0, -1, 1);
        if (level === 3) {
            add(1, 0, 1); add(-1, 0, 1);
        }
    } else if (name === "해일") {
        for (let distance = 1; distance < size; distance++) {
            add(0, distance, distance); add(0, -distance, distance);
            add(distance, 0, distance); add(-distance, 0, distance);
        }
    } else if (name === "세계수의 공명") {
        for (let distance = 1; distance <= 2; distance++) {
            add(0, distance, distance); add(0, -distance, distance);
            add(distance, 0, distance); add(-distance, 0, distance);
        }
    } else if (name === "폭풍우") {
        for (let distance = 1; distance < size; distance++) {
            add(distance, 0, distance); add(-distance, 0, distance);
        }
    }
    return offsets;
};

const baseChance = (name: SpiritName, distance: number) => {
    if (distance === 0 || name === "세계수의 공명") return 100;
    if (["대폭발", "지진", "해일", "폭풍우"].includes(name)) return distanceChance(distance);
    if (name === "충격파") return 75;
    return 50;
};

export const canTargetDistorted = (name: SpiritName) =>
    name === "정화" || name === "세계수의 공명";

export const getPreview = (
    board: (Tile | null)[][],
    card: SpiritCard,
    target: Position,
): PreviewCell[] => {
    const targetTile = board[target.row]?.[target.col];
    if (!targetTile || targetTile.base === "distorted" && !canTargetDistorted(card.name)) return [];
    if (card.name === "벼락") {
        return [{ ...target, chance: 100, distorted: false }];
    }
    return getOffsets(card.name, board.length, card.level)
        .map((offset) => ({ row: target.row + offset.row, col: target.col + offset.col, distance: offset.distance }))
        .filter(({ row, col }) => Boolean(board[row]?.[col]))
        .map(({ row, col, distance }) => {
            const tile = board[row][col];
            const avoidsDistortion = tile?.base === "distorted"
                && card.level === 3
                && card.name !== "정화"
                && card.name !== "세계수의 공명";
            const chance = avoidsDistortion ? 0 : card.level >= 2 ? 100 : baseChance(card.name, distance);
            return { row, col, chance, distorted: tile?.base === "distorted" };
        });
};

const rearrange = (board: (Tile | null)[][], preset: StagePreset) => {
    const remaining = positions(board)
        .map(({ row, col }) => board[row][col])
        .filter((tile): tile is Tile => tile !== null)
        .map((tile) => ({ ...tile, special: undefined }));
    positions(board).forEach(({ row, col }) => { board[row][col] = null; });
    const destinations = shuffle(positions(board).filter((position) => isPlayable(preset, position)));
    remaining.forEach((tile, index) => {
        const destination = destinations[index];
        board[destination.row][destination.col] = tile;
    });
};

const applySpecial = (
    special: SpecialTile,
    board: (Tile | null)[][],
    preset: StagePreset,
    cards: [SpiritCard, SpiritCard],
    usedIndex: 0 | 1,
    remainingChanges: number,
) => {
    const otherIndex = usedIndex === 0 ? 1 : 0;
    let freeTurn = false;
    let upgraded = false;
    let description = "특수 석판 효과가 적용되었습니다.";
    if (special === "추가") remainingChanges++;
    if (special === "재배치") rearrange(board, preset);
    if (special === "축복") freeTurn = true;
    if (special === "신비") cards[otherIndex] = drawMysteryCard();
    if (special === "복제") cards[otherIndex] = { ...cards[usedIndex], id: `${cards[usedIndex].id}-copy-${Date.now()}` };
    if (special === "강화" && !MYSTERY_SPIRITS.includes(cards[otherIndex].name as never) && cards[otherIndex].level < 3) {
        cards[otherIndex] = { ...cards[otherIndex], level: (cards[otherIndex].level + 1) as SpiritLevel };
        upgraded = true;
    }
    if (special === "추가") description = "정령 교체 가능 횟수가 1회 증가했습니다.";
    if (special === "재배치") description = "남아 있는 일반·왜곡 석판이 무작위로 재배치되었습니다.";
    if (special === "축복") description = "이번 정령 사용은 초월 사용 횟수에 포함되지 않습니다.";
    if (special === "신비") description = `반대편 카드가 ${cards[otherIndex].name}(으)로 변경되었습니다.`;
    if (special === "복제") description = `반대편 카드가 ${cards[usedIndex].name} ${cards[usedIndex].level}단계로 복제되었습니다.`;
    if (special === "강화") {
        const card = cards[otherIndex];
        description = upgraded
            ? `반대편 ${card.name} 카드가 ${card.level}단계로 강화되었습니다.`
            : `${card.name}은(는) 더 강화할 수 없어 효과가 적용되지 않았습니다.`;
    }
    return { remainingChanges, freeTurn, description };
};

export type TurnNotice = {
    kind: "special" | "spawn" | "lightning";
    title: string;
    description: string;
};

export type TurnResult = {
    game: GameState;
    notices: TurnNotice[];
    destroyedPositions: { position: Position; element: SpiritElement }[];
};

const mergeCards = (cards: SpiritCard[], upcoming: SpiritCard[]) => {
    while (cards.length < 2) cards.push(upcoming.shift() ?? drawDefaultCard());
    while (cards[0].name === cards[1].name) {
        const lower = Math.min(cards[0].level, cards[1].level) as SpiritLevel;
        const higher = Math.max(cards[0].level, cards[1].level) as SpiritLevel;
        if (lower !== 1 || higher >= 3) break;
        cards.splice(0, 2, makeCard(cards[0].name, (higher + 1) as SpiritLevel));
        while (cards.length < 2) cards.push(upcoming.shift() ?? drawDefaultCard());
    }
    while (upcoming.length < 3) upcoming.push(drawDefaultCard());
};

const placeNextSpecial = (board: (Tile | null)[][]): Position | null => {
    positions(board).forEach(({ row, col }) => {
        const tile = board[row][col];
        if (tile?.special) board[row][col] = { base: tile.base };
    });
    const candidates = positions(board).filter(({ row, col }) => board[row][col]?.base === "normal");
    if (!candidates.length) return null;
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    board[chosen.row][chosen.col] = {
        ...board[chosen.row][chosen.col]!,
        special: weightedPick(SPECIAL_TILES, SPECIAL_WEIGHTS),
    };
    return chosen;
};

const gradeFor = (tryLimit: number, usedTurns: number): 0 | 1 | 2 | 3 => {
    const overtime = usedTurns - tryLimit;
    if (overtime <= 0) return 3;
    if (overtime === 1) return 2;
    if (overtime <= 3) return 1;
    return 0;
};

export const createGame = (equipment: Equipment, stage: number, preset: StagePreset): GameState => {
    const board = createBoard(preset);
    const cards: [SpiritCard, SpiritCard] = [drawDefaultCard(), drawDefaultCard()];
    const upcoming = [drawDefaultCard(), drawDefaultCard(), drawDefaultCard()];
    mergeCards(cards, upcoming);
    return {
        equipment, stage, preset, board, cards, upcoming,
        usedTurns: 0,
        remainingChanges: preset.change,
        selectedCardIndex: null,
        specialPosition: null,
        completedGrade: null,
    };
};

export const executeTurn = (state: GameState, target: Position): TurnResult => {
    if (state.selectedCardIndex === null || state.completedGrade !== null) {
        return { game: state, notices: [], destroyedPositions: [] };
    }
    const usedIndex = state.selectedCardIndex;
    const next = structuredClone(state);
    const card = next.cards[usedIndex];
    const targetTile = next.board[target.row]?.[target.col];
    if (!targetTile || targetTile.base === "distorted" && !canTargetDistorted(card.name)) {
        return { game: state, notices: [], destroyedPositions: [] };
    }

    let specials: SpecialTile[] = [];
    const notices: TurnNotice[] = [];
    const destroyedPositions: { position: Position; element: SpiritElement }[] = [];
    const destroyTile = (row: number, col: number) => {
        if (!next.board[row][col]) return;
        destroyedPositions.push({
            position: { row, col },
            element: getSpiritElement(card.name),
        });
        next.board[row][col] = null;
    };
    if (card.name === "벼락") {
        const max = card.level === 1 ? 3 : card.level === 2 ? 5 : 7;
        const count = Math.floor(Math.random() * (max + 1));
        if (count === 0) {
            if (targetTile.special) specials.push(targetTile.special);
            destroyTile(target.row, target.col);
            const spawnedCount = spawnNormalTiles(next.board, next.preset, 1);
            if (spawnedCount > 0) notices.push({
                kind: "spawn",
                title: "벼락 효과",
                description: `일반 석판 ${spawnedCount}개가 추가되었습니다.`,
            });
        } else {
            const normalPositions = shuffle(positions(next.board).filter(({ row, col }) => next.board[row][col]?.base === "normal"));
            const ordered = [target, ...normalPositions.filter(({ row, col }) => row !== target.row || col !== target.col)];
            const targets = ordered.slice(0, count);
            targets.forEach(({ row, col }) => {
                const tile = next.board[row][col];
                if (tile?.special) specials.push(tile.special);
                destroyTile(row, col);
            });
            notices.push({
                kind: "lightning",
                title: "벼락 타격 결과",
                description: `석판 ${targets.length}개를 타격했습니다.`,
            });
        }
    } else {
        let distortedHits = 0;
        getPreview(next.board, card, target).forEach(({ row, col, chance }) => {
            const tile = next.board[row][col];
            if (!tile || Math.random() * 100 >= chance) return;
            if (tile.base === "distorted") {
                if (card.name === "정화" || card.name === "세계수의 공명") destroyTile(row, col);
                else if (card.level < 3) distortedHits++;
                return;
            }
            if (tile.special) specials.push(tile.special);
            destroyTile(row, col);
        });
        const spawnedCount = spawnNormalTiles(next.board, next.preset, distortedHits * 3);
        if (spawnedCount > 0) notices.push({
            kind: "spawn",
            title: "왜곡 석판 페널티",
            description: `일반 석판 ${spawnedCount}개가 추가되었습니다.`,
        });
    }

    let freeTurn = false;
    specials.slice(0, 1).forEach((special) => {
        const result = applySpecial(special, next.board, next.preset, next.cards, usedIndex, next.remainingChanges);
        next.remainingChanges = result.remainingChanges;
        freeTurn ||= result.freeTurn;
        notices.unshift({
            kind: "special",
            title: `${special} 석판 타격`,
            description: result.description,
        });
    });

    next.cards[usedIndex] = next.upcoming.shift() ?? drawDefaultCard();
    mergeCards(next.cards, next.upcoming);
    if (!freeTurn) next.usedTurns++;
    next.selectedCardIndex = null;
    const normalCount = positions(next.board).filter(({ row, col }) => next.board[row][col]?.base === "normal").length;
    if (normalCount === 0) next.completedGrade = gradeFor(next.preset.try, next.usedTurns);
    else next.specialPosition = placeNextSpecial(next.board);
    return { game: next, notices, destroyedPositions };
};

export const exchangeCard = (state: GameState, index: 0 | 1): GameState => {
    if (state.remainingChanges <= 0 || state.completedGrade !== null) return state;
    const next = structuredClone(state);
    next.cards[index] = next.upcoming.shift() ?? drawDefaultCard();
    next.remainingChanges--;
    next.selectedCardIndex = null;
    mergeCards(next.cards, next.upcoming);
    return next;
};

export const getCompletionGuide = (state: GameState): { turnsLeft: number; grade: 0 | 1 | 2 | 3 } => {
    const nextCompletionTurn = state.usedTurns + 1;
    const grade = gradeFor(state.preset.try, nextCompletionTurn);
    if (grade === 0) return { turnsLeft: 0, grade };

    const gradeTurnLimit = grade === 3
        ? state.preset.try
        : grade === 2
        ? state.preset.try + 1
        : state.preset.try + 3;
    return { turnsLeft: gradeTurnLimit - state.usedTurns, grade };
};
