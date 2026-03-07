import { CharacterFile, getCharacterType, getListByArmorType, getParsedText, getStoneEffectInTooltip } from "./characterFeat";
import { Accessory, ArkGridGem, ArkGridInfo, ArkGridOption, ArkpassiveInfo, ArkpassiveItem, ArkpassivePoint, Arm, Avatar, CardData, CardDetailSet, CardInfo, CardSet, CharacterInfo, Collect, CollectEquipment, CollectionInfo, CollectItem, Core, Engraving, EquipInfo, Equipment, Gem, GemInfo, Hobby, Orb, Profile, Rune, Skill, SkillInfo, Stat, Stone, Tripod } from "../model/types";
import characterJsonData from "@/data/characters/data.json";

export function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;

  // 숫자면 그대로
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  // 문자열이면 콤마 제거 후 변환
  if (typeof value === "string") {
    const n = Number(value.replaceAll(",", ""));
    return Number.isNaN(n) ? 0 : n;
  }

  // 그 외 타입이면 0
  return 0;
}

// 캐릭터 정보 정리하기
export function getCharacterInfoByFile(
    file: CharacterFile, 
    maxCombatPower: number
): CharacterInfo {
    const info: CharacterInfo = {
        nickname: file.profile.CharacterName,
        profile: getProfile(file, maxCombatPower),
        equipment: getEquipment(file),
        gems: getGems(file.gem),
        card: getCards(file.cards),
        stats: getStats(file.stats),
        engravings: getEngraving(file.engraving),
        arkpassive: getArkpassiveInfo(file.arkpassive),
        skill: getSkillInfo(file, getGems(file.gem)),
        arkgrid: getArkGrid(file.arkGrid),
        collection: getCollections(file),
        avatars: getAvatars(file.avatars)
    }
    return info;
}

// 프로필 데이터
function getProfile(file: CharacterFile, maxCombatPower: number): Profile {
    return {
        server: file.profile.ServerName || '-',
        className: file.profile.CharacterClassName || '-',
        title: file.profile.Title || '-',
        guildName: file.profile.GuildName || '-',
        characterImageUrl: file.profile.CharacterImage || '-',
        arkpassiveTitle: file.arkpassive.Title || '-',
        itemLevel: toNumber(file.profile.ItemAvgLevel),
        characterLevel: toNumber(file.profile.CharacterLevel),
        expeditionLevel: toNumber(file.profile.ExpeditionLevel),
        townLevel: toNumber(file.profile.TownLevel),
        townName: file.profile.TownName || '-',
        combatPower: toNumber(file.profile.CombatPower),
        characterType: getCharacterType(file.arkpassive),
        honorPoint: toNumber(file.profile.HonorPoint),
        maxCombatPower: maxCombatPower < toNumber(file.profile.CombatPower) ? toNumber(file.profile.CombatPower) : maxCombatPower,
        emblems: file.profile.Decorations.Emblems || []
    }
}

// 장비 데이터
function getEquipment(file: CharacterFile): EquipInfo {
    return {
        equipments: getEquipmentData(file.equipment),
        accessories: getAccessories(file.equipment),
        arm: getArmData(file.equipment),
        stone: getStoneData(file.equipment),
        orb: getOrbData(file.equipment)
    }
}

// 장비 데이터 불러오기
function getEquipmentData(data: any): Equipment[] {
    const attackType = ['무기', '투구', '어깨', '상의', '하의', '장갑'];
    const newEquipments: Equipment[] = [];
    for (const type of attackType) {
        const obj = getObjectByArmorType(data, type);
        if (!obj) continue;
        const parsedTooltip = JSON.parse(obj.Tooltip);
        
        const newEquipment: Equipment = {
            icon: obj.Icon,
            type: type,
            name: obj.Name,
            grade: obj.Grade,
            quality: Number(parsedTooltip.Element_001.value.qualityValue),
            highUpgrade: findHighUpgradeInTooltip(obj.Tooltip),
            tooltip: obj.Tooltip
        }
        newEquipments.push(newEquipment);
    }
    return newEquipments;
}

// 장비 종류에 따른 값 반환 함수
function getObjectByArmorType(list: any[], type: string): any {
    const obj = list.find((item) => item.Type === type);
    return obj;
}

// 숫자인지 아닌지 여부 파악 함수
function isNumeric(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

// "상급 재련"이 들어간 객체 가져오기
type TooltipBoject = Record<string, any>;
function findHighUpgradeInTooltip(tooltip: any): number {
    let parsed: TooltipBoject;
    try {
        parsed = JSON.parse(tooltip);
    } catch (err) {
        console.error("Tooltip JSON 파싱 오류:", err);
        return -1;
    }

    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        if (typeof value === 'string' && value.includes('상급')) {
            let text = getParsedText(value.split('<img')[0].replaceAll('[상급 재련] ', '').replaceAll('단계', ''));
            text = text.replaceAll('[상급 재련] ', '');
            return isNumeric(text) ? Number(text) : -1;
        }
    }

    return -1;
}

// 악세 데이터 불러오기
function getAccessories(data: any): Accessory[] {
    const accessoryType = ['목걸이', '귀걸이', '반지'];
    const newAccessories: Accessory[] = [];
    for (const type of accessoryType) {
        const objs = getListByArmorType(data, type);
        for (const obj of objs) {
            const parsedTooltip = JSON.parse(obj.Tooltip);

            const newAccessory: Accessory = {
                icon: obj.Icon,
                name: obj.Name,
                type: type,
                grade: obj.Grade,
                quality: Number(parsedTooltip.Element_001.value.qualityValue),
                items: findItemInTooltip(obj.Tooltip),
                point: findPointInTooltip(obj.Tooltip),
                tooltip: obj.Tooltip
            }
            newAccessories.push(newAccessory);
        }
    }
    return newAccessories;
}

// 악세에서 연마 효과 가져오기기
function findItemInTooltip(tooltip: any): string[] {
    let parsed: TooltipBoject;
    let items: string[] = [];
    try {
        parsed = JSON.parse(tooltip);
    } catch (err) {
        console.error("Tooltip JSON 파싱 오류:", err);
        return [];
    }

    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        const element000 = value?.Element_000;
        const element001 = value?.Element_001;
        if (typeof element000 === "string" && typeof element001 === "string" && element000.includes("연마 효과")) {
            const text = getParsedText(element001.replaceAll('<br>', '|').replaceAll('<BR>', '|'));
            items = text.split('|');
            return items;
        }
    }
    return [];
}

// 악세에서 깨달음 가져오기
function findPointInTooltip(tooltip: any): number {
    let parsed: TooltipBoject;
    try {
        parsed = JSON.parse(tooltip);
    } catch (err) {
        console.error("Tooltip JSON 파싱 오류:", err);
        return -1;
    }

    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        const element000 = value?.Element_000;
        const element001 = value?.Element_001;
        if (typeof element000 === "string" && typeof element001 === "string" && element000.includes("아크 패시브 포인트 효과")) {
            const text = getParsedText(element001);
            return Number(text.split('+')[1])
        }
    }
    return -1;
}

// 팔찌 데이터 가져오기
function getArmData(data: any): Arm | null {
    const objs = getListByArmorType(data, '팔찌');
    if (objs.length > 0) {
        const obj = objs[0];
        const parsedTooltip = JSON.parse(obj.Tooltip);
        const newArm: Arm = {
            icon: obj.Icon,
            type: '팔찌',
            name: obj.Name,
            grade: obj.Grade,
            point: findPointInTooltip(obj.Tooltip),
            tooltip: parsedTooltip
        }
        return newArm;
    }
    return null;
}

// 어빌리티 스톤 가져오기
function getStoneData(data: any): Stone | null {
    const objs = getListByArmorType(data, '어빌리티 스톤');
    if (objs.length > 0) {
        const obj = objs[0];
        const parsedTooltip = JSON.parse(obj.Tooltip);
        const newStone: Stone = {
            icon: obj.Icon,
            type: '어빌리티 스톤',
            name: obj.Name,
            grade: obj.Grade,
            tooltip: parsedTooltip,
            effects: getStoneEffectInTooltip(parsedTooltip)
        }
        return newStone;
    }
    return null;
}

// 보주 가져오기
function getOrbData(data: any): Orb | null {
    const objs = getListByArmorType(data, '보주');
    if (objs.length > 0) {
        const obj = objs[0];
        const newOrb: Orb = {
            icon: obj.Icon,
            type: '보주',
            name: obj.Name,
            grade: obj.Grade,
            score: findOrbScoreInTooltip(obj.Tooltip)
        }
        return newOrb;
    }
    return null;
}

// 보석 데이터 가져오기
function findOrbScoreInTooltip(tooltip: any): number {
    if (typeof tooltip !== "string") return 0;

    let parsed: TooltipBoject;
    try {
        parsed = JSON.parse(tooltip);
    } catch (err) {
        console.error("Tooltip JSON parse error:", err);
        return 0;
    }

    const scoreRegex = /:\s*([\d,]+)\s*$/;
    const getScoreFromText = (text: string): number => {
        const lines = getParsedText(text).split(/\r?\n/);
        for (const line of lines) {
            const match = line.match(scoreRegex);
            if (match?.[1]) return toNumber(match[1]);
        }
        return 0;
    };

    const specialEffectText = parsed?.Element_004?.value?.Element_001;
    if (typeof specialEffectText === "string") {
        const score = getScoreFromText(specialEffectText);
        if (score > 0) return score;
    }

    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        if (typeof value === "string") {
            const score = getScoreFromText(value);
            if (score > 0) return score;
        } else if (typeof value === "object" && value !== null) {
            for (const valueKey in value) {
                const innerValue = value[valueKey];
                if (typeof innerValue !== "string") continue;
                const score = getScoreFromText(innerValue);
                if (score > 0) return score;
            }
        }
    }

    return 0;
}

function getGems(datas: any): Gem[] {
    let gems: Gem[] = [];
    if (datas) {
        for (const data of datas) {
            const parsedTooltip = JSON.parse(data.Tooltip);
            const gemInfo: GemInfo | null = findGemInfoInTooltip(parsedTooltip);
            const newGem: Gem = {
                slot: Number(data.Slot),
                name: getParsedText(data.Name),
                icon: data.Icon,
                level: Number(data.Level),
                grade: data.Grade,
                skillStr: gemInfo ? gemInfo.skillStr : '',
                attack: gemInfo ? gemInfo.attack : 0
            }
            gems.push(newGem);
        }
    }
    gems = gems.sort((a, b) => b.level - a.level);
    return gems;
}

// 스킬 또는 기본 공격력 가져오기
function findGemInfoInTooltip(parsed: any): GemInfo | null {
    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        const element000 = value?.Element_000;
        const element001 = value?.Element_001;
        if (typeof element000 === 'string' && typeof element001 === 'string' && element000.includes('효과')) {
            const text = getParsedText(element001.replaceAll('<BR>', '\r\n'));
            const skillStr = text.split(/\r?\n/)[0];
            let attack = 0;
            if (text.includes('기본 공격력')) {
                attack = Number(text.split('기본 공격력 ')[1].replaceAll(' 증가', '').replaceAll('%', ''));
            }
            return {
                skillStr: skillStr,
                attack: attack
            }
        }
    }
    return null;
}

// 카드 데이터 가져오기
function getCards(data: any): CardInfo {
    const cards: CardData[] = [];
    const sets: CardSet[] = [];
    if (data) {
        const datas = data.Cards;
        for (const item of datas) {
            const newCard: CardData = {
                slot: Number(item.Slot),
                name: item.Name,
                icon: item.Icon,
                count: Number(item.AwakeCount),
                total: Number(item.AwakeTotal),
                grade: item.Grade
            }   
            cards.push(newCard);
        }
        const setDatas = data.Effects;
        for (const cardSet of setDatas) {
            const items: CardDetailSet[] = [];
            const cardCount = cardSet.CardSlots.length;
            for (const item of cardSet.Items) {
                let enableCount = 0, cardAllCount = 0;
                const cardText = item.Name;
                if (cardText.includes('각성합계')) {
                    const match = cardText.match(/(\d+)각성합계/);
                    enableCount = match ? parseInt(match[1], 10) : 0;
                }
                if (cardText.includes('세트')) {
                    const match = cardText.match(/(\d+)세트/);
                    cardAllCount = match ? parseInt(match[1], 10) : 0;
                }
                const newItem: CardDetailSet = {
                    name: item.Name,
                    description: item.Description,
                    isEnable: cardCount >= cardAllCount,
                    enableCount: enableCount
                }
                items.push(newItem);
            }
            const newSet: CardSet = {
                name: items[0].name.replace(/\s*\d+세트.*$/, ""),
                slots: cardSet.CardSlots,
                items: items
            }
            sets.push(newSet);
        }
    }
    return { cards, sets };
}

// 스택 데이터 가져오기
function getStats(datas: any[] | null): Stat[] {
    const stat: Stat[] = [];
    if (datas) {
        for (const data of datas) {
            const tooltips: string[] = [];
            for (const tip of data.Tooltip) {
                tooltips.push(getParsedText(tip));
            }
            const newStat: Stat = {
                type: data.Type,
                value: Number(data.Value),
                tooltip: tooltips
            }
            stat.push(newStat);
        }
    }
    return stat;
}

// 각인 데이터 가져오기
function getEngraving(datas: any[] | null): Engraving[] {
    const engravings: Engraving[] = [];
    if (datas) {
        for (const data of datas) {
            const newEngraving: Engraving = {
                name: data.Name,
                description: getParsedText(data.Description),
                grade: data.Grade,
                level: Number(data.Level),
                stoneLevel: Number(data.AbilityStoneLevel ? data.AbilityStoneLevel : 0)
            }
            engravings.push(newEngraving);
        }
    }
    return engravings;
}

//아크패시브 데이터 가져오기
function getArkpassiveInfo(data: any | null): ArkpassiveInfo {
    const points: ArkpassivePoint[] = [];
    const evolution: ArkpassiveItem[] = [];
    const enlightenment: ArkpassiveItem[] = [];
    const jump: ArkpassiveItem[] = [];
    if (data) {
        const dataPoints = data.Points;
        for (const point of dataPoints) {
            const newPoint: ArkpassivePoint = {
                type: point.Name,
                point: Number(point.Value),
                max: maxPoint(point.Name),
                description: point.Description
            }
            points.push(newPoint);
        }
        const dataEffects = data.Effects;
        for (const effect of dataEffects) {
            const parsedTooltip = JSON.parse(effect.ToolTip);
            const tip = getParsedText(parsedTooltip.Element_002?.value).replaceAll('|', '');
            const description = getParsedText(effect.Description);
            const tier = description.split('티어 ')[0].replaceAll(effect.Name, '');
            const name = description.split('티어 ')[1].split(' Lv.')[0];
            const level = description.split(' Lv.')[1];
            const newItem: ArkpassiveItem = {
                tier: Number(tier),
                name: name,
                level: Number(level),
                icon: effect.Icon,
                description: tip
            }
            switch(effect.Name) {
                case '진화':
                    evolution.push(newItem);
                    break;
                case '깨달음':
                    enlightenment.push(newItem);
                    break;
                case '도약':
                    jump.push(newItem);
                    break;
            }
        }
    }
    return { points, evolution, enlightenment, jump };
}

// 아크패시브 별 최대값 가져오기
function maxPoint(type: string): number {
    switch(type) {
        case '진화': return characterJsonData.arkpassivePoints.evolution;
        case '깨달음': return characterJsonData.arkpassivePoints.enlightenment;
        case '도약': return characterJsonData.arkpassivePoints.jump;
    }
    return 0;
}

// 스킬 데이터 가져오기
export function getSkillInfo( file: CharacterFile, gems: Gem[]): SkillInfo {
    const datas = file.skills;
    let skills: Skill[] = [];
    if (datas) {
        for (const item of datas) {
            if (Number(item.Level) > 1) {
                const parsedTooltip = JSON.parse(item.Tooltip);
                const info = findSkillInfoInTooltip(parsedTooltip);
                const tripods: Tripod[] = [];
                for (const tripod of item.Tripods) {
                    if (Boolean(tripod.IsSelected)) {
                        const newTripod: Tripod = {
                            tier: Number(tripod.Tier),
                            slot: Number(tripod.Slot),
                            name: tripod.Name,
                            icon: tripod.Icon,
                            level: Number(tripod.Level)
                        }
                        tripods.push(newTripod);
                    }
                }
                let rune: Rune | null = null;
                if (item.Rune) {
                    const parsedRuneTooltip = JSON.parse(item.Tooltip);
                    const runeDescription = findRuneInTooltip(parsedRuneTooltip);
                    rune = {
                        name: item.Rune.Name,
                        icon: item.Rune.Icon,
                        grade: item.Rune.Grade,
                        description: runeDescription
                    }
                }
                let attackGem: Gem | null = null;
                let timeGem: Gem | null = null;
                for (const gem of gems) {
                    if (gem.skillStr.includes(item.Name)) {
                        if (gem.skillStr.includes('피해') || gem.skillStr.includes('지원')) {
                            attackGem = gem;
                        } else if (gem.skillStr.includes('재사용 대기시간')) {
                            timeGem = gem;
                        }
                    }
                }
                const newSkill: Skill = {
                    name: item.Name,
                    icon: item.Icon,
                    level: Number(item.Level),
                    type: item.Type,
                    isCounter: info.isCounter,
                    power: info.power,
                    destroy: info.destroy,
                    tripods: tripods,
                    rune: rune,
                    attackGem: attackGem,
                    timeGem: timeGem
                }
                skills.push(newSkill);
            }
        }
    }
    skills = skills.sort((a, b) => b.level - a.level);
    return {
        skills,
        skillPoint: Number(file.profile.UsingSkillPoint) || 0,
        maxPoint: Number(file.profile.TotalSkillPoint) || 0
    }
}

// 파괴, 카운터, 무력 수치, 설명 내용 가져오기
type SkillDetail = {
    power: string,
    destroy: number,
    isCounter: boolean
}
function findSkillInfoInTooltip(parsed: any): SkillDetail {
    const info: SkillDetail = {
        power: '',
        destroy: 0,
        isCounter: false
    }
    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        if (typeof value === 'string') {
            if (value.includes('카운터 : 가능')) {
                info.isCounter = true;
            }
            if (value.includes('무력화')) {
                const text = getParsedText(value);
                const match = text.match(/무력화\s*:\s*(하|중|중상|상|최상)/);
                const power = match ? match[1] : ''
                info.power = power;
            }
            if (value.includes('부위 파괴 : ')) {
                const text = getParsedText(value);
                const match = text.match(/부위\s*파괴\s*:\s*레벨\s*(\d+)/);
                const destroy = match ? Number(match[1]) : 0
                info.destroy = destroy;
            }
        }
    }
    return info;
}

// 룬 설명 가져오기
function findRuneInTooltip(parsed: any): string {
    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        const element000 = value?.Element_000;
        const element001 = value?.Element_001;
        if (typeof element000 === 'string' && typeof element001 === 'string' && element000.includes('스킬 룬 효과')) {
            return element001;
        }
    }
    return "";
}

// 아크 그리드 데이터 불러오기
function getArkGrid(data: any): ArkGridInfo {
    const cores: Core[] = [];
    const options: ArkGridOption[] = [];
    if (data) {
        const slots: any[] | null = data.Slots;
        if (slots) {
            for (const item of slots) {
                const gems: ArkGridGem[] = [];
                if (item.Gems) {
                    for (const gem of item.Gems) {
                        gems.push(getDataGem(gem));
                    }
                }
                const core: Core = {
                    index: Number(item.Index),
                    icon: item.Icon,
                    name: item.Name,
                    point: Number(item.Point),
                    grade: item.Grade,
                    gems: gems
                }
                cores.push(core);
            }
        }
        const effects = data.Effects;
        if (effects) {
            for (const item of effects) {
                const eff: ArkGridOption = {
                    name: item.Name,
                    level: Number(item.Level),
                    description: getParsedText(item.Tooltip)
                }
                options.push(eff);
            }
        }
    }
    return { cores, options };
}

// 아크 그리드 젬 데이터 가져오기
function getDataGem(data: any): ArkGridGem {
    let name = '';
    const options: string[] = [];
    const parsedTooltip = JSON.parse(data.Tooltip);
    for (const key in parsedTooltip) {
        const element = parsedTooltip[key];
        const type = element?.type;
        const value = element?.value;

        if (typeof type === 'string' && type === 'NameTagBox') {
            name = getParsedText(value);
        }

        const element000 = value?.Element_000;
        const element001 = value?.Element_001;
        if (typeof element000 === 'string' && typeof element001 === 'string' && element000.includes('젬 효과')) {
            const strs = element001?.split('<br>');
            for (const str of strs) {
                options.push(getParsedText(str));
            }
        }
    }
    const gem: ArkGridGem = {
        index: Number(data.Index),
        icon: data.Icon,
        isActive: data.IsActive,
        grade: data.Grade,
        name: name,
        options: options
    }
    return gem;
}

// 수집품 포인트 데이터 가져오기
function getCollections(file: any): CollectionInfo {
    const collects: Collect[] = [];
    const hobbys: Hobby[] = [];
    const collectEquipments: CollectEquipment[] = [];
    if (file.collects) {
        let iconIndex = 1;
        for (const item of file.collects) {
            const items: CollectItem[] = [];
            for (const collectItem of item.CollectiblePoints) {
                const newItem: CollectItem = {
                    name: collectItem.PointName,
                    point: Number(collectItem.Point),
                    maxPoint: Number(collectItem.MaxPoint)
                }
                items.push(newItem);
            }
            const newCollect: Collect = {
                type: item.Type,
                icon: `/point/point${iconIndex}.png`,
                bgIcon: item.Icon,
                point: Number(item.Point),
                maxPoint: Number(item.MaxPoint),
                items: items
            }
            collects.push(newCollect);
            iconIndex++;
        }
    }
    if (file.profile) {
        const datas: any[] = file.profile.Tendencies;
        for (const item of datas) {
            const hobby: Hobby = {
                type: item.Type,
                point: Number(item.Point),
                maxPoint: Number(item.MaxPoint)
            }
            hobbys.push(hobby);
        }
    }
    if (file.equipment) {
        for (const item of file.equipment) {
            if (item.Type === '나침반' || item.Type === '부적') {
                const parsedTooltip = JSON.parse(item.Tooltip);
                const descriptions: string[] = findDescriptionInTooltip(parsedTooltip);
                const collectItem: CollectEquipment = {
                    type: item.Type,
                    icon: item.Icon,
                    grade: item.Grade,
                    descriptions: descriptions
                }
                collectEquipments.push(collectItem);
            }
        }
    }
    return { collects, hobbys, collectEquipments };
}

// 나침판, 부적 설명 가져오기
function findDescriptionInTooltip(parsed: any): string[] {
    for (const key in parsed) {
        const element = parsed[key];
        const value = element?.value;

        const element000 = value?.Element_000;
        const element001 = value?.Element_001;
        if (typeof element000 === 'string' && typeof element001 === 'string' && element000.includes('추가 효과')) {
            const strs: string[] = element001.split('<BR>');
            return strs;
        }
    }
    return [];
}

// 아바타 데이터 가져오기
function getAvatars(datas: any[] | null): Avatar[] {
    let avatars: Avatar[] = [];
    if (datas) {
        for (const item of datas) {
            const newAvatar: Avatar = {
                type: item.Type,
                name: item.Name,
                icon: item.Icon,
                grade: item.Grade,
                isInner: Boolean(item.IsInner)
            }
            avatars.push(newAvatar);
        }
    }
    const typeOrder = ["무기 아바타", "머리 아바타", "상의 아바타", "하의 아바타", "얼굴1 아바타", "얼굴2 아바타", "악기 아바타", "이동 효과"];
    avatars = avatars.sort((a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type));
    return avatars;
}
