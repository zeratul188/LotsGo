const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// 별도 테스트 런타임 없이 순수 TypeScript 집계 함수와 실제 부수입 정규화를 실행합니다.
const cache = new Map();
function load(sourcePath) {
    const filename = path.resolve(__dirname, '..', sourcePath);
    if (cache.has(filename)) return cache.get(filename);
    const module = { exports: {} };
    cache.set(filename, module.exports);
    const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
    }).outputText;
    new Function('require', 'module', 'exports', source)(specifier => {
        const target = specifier.startsWith('@/')
            ? path.join('src', specifier.slice(2))
            : path.relative(path.resolve(__dirname, '..'), path.resolve(path.dirname(filename), specifier));
        return load(`${target}.ts`);
    }, module, module.exports);
    return module.exports;
}
const { buildGoldAnalysis, goldAnalysisPercent, getGoldCompositionLanes } = load('src/app/checklist/lib/goldAnalysisFeat.ts');
const difficulty = (name, stage, gold, boundGold, bonus = 0, level = 1700) => ({
    difficulty: name, stage, gold, boundGold, bonus, level
});
const boss = (name, difficulties) => ({ id: name, name, difficulty: difficulties });
const gate = (difficulty, stage, overrides = {}) => ({ difficulty, stage, isCheck: true, isDisable: false, isBonus: false, ...overrides });
const content = (name, items, overrides = {}) => ({ name, items, isGold: true, busGold: 999999, ...overrides });
const character = (nickname, checklist, overrides = {}) => ({ nickname, server: '카단', position: 0, account: '본계정', isGold: true, otherGold: 0, checklist, ...overrides });

test('구성 안내는 떨어져 있으면 같은 높이, 겹치면 위쪽 줄로 배치', () => {
    assert.deepEqual(getGoldCompositionLanes([10, 50, 90], [true, true, true], 1000), [0, 0, 0]);
    assert.deepEqual(getGoldCompositionLanes([10, 75, 80], [true, true, true], 1000), [0, 1, 0]);
    assert.deepEqual(getGoldCompositionLanes([80, 90, 100], [true, true, true], 300), [2, 1, 0]);
    assert.deepEqual(getGoldCompositionLanes([80, 90, 100], [false, false, true], 300), [0, 0, 0]);
});

test('혼합 난이도 관문별 귀속 우선 차감 및 버스 제외', () => {
    const bosses = [boss('벨가르딘', [difficulty('나이트메어', 1, 5000, 2000, 3000), difficulty('하드', 2, 6000, 4000, 1000)])];
    const data = buildGoldAnalysis(bosses, [character('첫째', [content('벨가르딘', [gate('나이트메어', 1, { isBonus: true }), gate('하드', 2, { isBonus: true })])])], false);
    assert.deepEqual(data.gold, { shared: 10000, bound: 3000, other: 0, total: 13000 });
    assert.equal(data.contents[0].difficulties.nightmare.total, 4000);
    assert.equal(data.contents[0].difficulties.hard.total, 9000);
});

test('미완료 포함 전환, 비활성 관문 제외, 부수입 기록 우선', () => {
    const bosses = [boss('레이드', [difficulty('노말', 1, 1000, 500), difficulty('노말', 2, 2000, 500)])];
    const checklist = [character('첫째', [content('레이드', [gate('노말', 1, { isCheck: false }), gate('노말', 2, { isDisable: true })])], {
        otherGold: 9000, otherGoldRecords: [{ gold: 300 }, { gold: -100 }]
    })];
    assert.equal(buildGoldAnalysis(bosses, checklist, false).gold.total, 200);
    assert.equal(buildGoldAnalysis(bosses, checklist, true).gold.total, 1700);
});

test('단계 매핑, 최대 레벨 정렬, position 정렬, 계정·콘텐츠 합계 일치', () => {
    const bosses = [boss('성당', [difficulty('1단계', 1, 100, 200, 0, 1600), difficulty('3단계', 2, 300, 400, 0, 1800)]), boss('레이드', [difficulty('매칭', 1, 500, 0, 0, 1700), difficulty('2단계', 2, 0, 600)])];
    const checklist = [character('둘째', [content('레이드', [gate('매칭', 1), gate('2단계', 2)])], { position: 2, otherGold: 200 }), character('첫째', [content('성당', [gate('1단계', 1), gate('3단계', 2)])], { position: 1 })];
    const before = JSON.stringify(checklist);
    const data = buildGoldAnalysis(bosses, checklist, false);
    assert.deepEqual(data.characters.map(row => row.character.nickname), ['첫째', '둘째']);
    assert.deepEqual(data.contents.map(row => row.name), ['성당', '레이드']);
    assert.equal(data.contents[0].difficulties.normal.total, 300);
    assert.equal(data.contents[0].difficulties.nightmare.total, 700);
    assert.equal(data.contents[1].difficulties.single.total, 500);
    assert.equal(data.contents[1].difficulties.hard.total, 600);
    assert.equal(data.accounts.get('본계정').total, data.gold.total);
    assert.equal(data.contents.reduce((sum, row) => sum + row.gold.total, 0) + data.gold.other, data.gold.total);
    assert.equal(JSON.stringify(checklist), before);
});

test('골드 미지정 보상 제외, 지정 캐릭터의 미지정 콘텐츠 더보기 비용 반영', () => {
    const bosses = [boss('레이드', [difficulty('하드', 1, 5000, 2000, 1000)])];
    const data = buildGoldAnalysis(bosses, [character('첫째', [content('레이드', [gate('하드', 1, { isBonus: true })], { isGold: false })]), character('둘째', [content('레이드', [gate('하드', 1, { isBonus: true })])], { isGold: false, otherGold: 200 })], false);
    assert.deepEqual(data.gold, { shared: -1000, bound: 0, other: 200, total: -800 });
});

test('빈 데이터와 과거 누락 필드에서 안전한 0 및 비율', () => {
    assert.equal(buildGoldAnalysis([], [], false).gold.total, 0);
    assert.equal(buildGoldAnalysis([], [character('첫째', [content('삭제된 콘텐츠', [])])], false).gold.total, 0);
    assert.equal(goldAnalysisPercent(0, 0), 0);
    assert.equal(goldAnalysisPercent(120000, 600000), 20);
});
