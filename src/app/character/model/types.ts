// 전체 캐릭터 정보 묶음
export type CharacterInfo = {
    nickname: string, // 캐릭터 이름
    profile: Profile, // 캐릭터 정보
    equipment: EquipInfo, // 장비 관련 정보
    gems: Gem[], // 보석
    card: CardInfo, // 카드
    stats: Stat[], // 특성 스탯
    engravings: Engraving[], // 각인
    arkpassive: ArkpassiveInfo, // 아크패시브
    skill: SkillInfo, // 스킬
    arkgrid: ArkGridInfo, // 아크그리드
    collection: CollectionInfo, // 수집품 포인트
    avatars: Avatar[], // 아바타
}

// 장비 영역
export type EquipInfo = {
    equipments: Equipment[],
    accessories: Accessory[],
    arm: Arm | null,
    stone: Stone | null,
    orb: Orb | null
}

// 캐릭터 Profile 정보
export type Profile = {
    server: string,
    className: string,
    title: string,
    guildName: string,
    characterImageUrl: string,
    arkpassiveTitle: string,
    itemLevel: number,
    characterLevel: number,
    expeditionLevel: number,
    townLevel: number,
    townName: string,
    combatPower: number,
    characterType: string,
    honorPoint: number,
    maxCombatPower: number, // 최고 전투력
    emblems: string[]
}

// 장비 정보
export type Equipment = {
    icon: string, // 장비 이미지
    type: string, // 장비 종류 (무기, 방어구)
    name: string, // 장비 이름 (강화 수치 포함)
    grade: string, // 장비 등급
    quality: number, // 장비 품질
    highUpgrade: number, // 장비 상급 재련
    tooltip: string
}

// 악세
export type Accessory = {
    icon: string, // 악세 이미지
    name: string, // 악세 이름
    type: string, // 악세 종류
    grade: string, // 악세 등급
    quality: number, // 악세 품질
    items: string[], // 악세 연마
    point: number, // 깨달음 포인트
    tooltip: string // Tooltip
}

// 팔찌
export type Arm = {
    icon: string,
    type: string,
    name: string,
    grade: string,
    point: number,
    tooltip: any
}

// 어빌리티 스톤
export type Stone = {
    icon: string,
    type: string,
    name: string,
    grade: string,
    tooltip: any,
    effects: StoneEffect[]
}
export type StoneEffect = {
    name: string,
    level: number
}

// 오브
export type Orb = {
    icon: string,
    type: string,
    name: string,
    grade: string,
    score: number
}

// 보석 정보
export type Gem = {
    slot: number,
    name: string,
    icon: string,
    level: number,
    grade: string,
    skillStr: string,
    attack: number
}

// 카드 데이터
export type CardInfo = {
    cards: CardData[],
    sets: CardSet[]
}
export type CardData = {
    slot: number,
    name: string,
    icon: string,
    count: number,
    total: number,
    grade: string
}
export type CardSet = {
    name: string,
    slots: number[],
    items: CardDetailSet[]
}
export type CardDetailSet = {
    name: string,
    description: string,
    isEnable: boolean,
    enableCount: number
}

// 스탯
export type Stat = {
    type: string,
    value: number,
    tooltip: string[]
}

// 각인
export type Engraving = {
    name: string,
    description: string,
    grade: string,
    level: number,
    stoneLevel : number
}

// 아크패시브
export type ArkpassiveInfo = {
    points: ArkpassivePoint[],
    evolution: ArkpassiveItem[],
    enlightenment: ArkpassiveItem[],
    jump: ArkpassiveItem[]
}
export type ArkpassivePoint = {
    type: string,
    point: number,
    max: number,
    description: string
}
export type ArkpassiveItem = {
    tier: number,
    name: string,
    level: number,
    icon: string,
    description: string | null
}

// 스킬
export type SkillInfo = {
    skills: Skill[],
    skillPoint: number,
    maxPoint: number
}
export type Skill = {
    name: string,
    icon: string,
    level: number,
    type: string,
    isCounter: boolean, // 카운터 여부
    power: string, // 무력 수치
    destroy: number, // 파괴 수치
    tripods: Tripod[],
    rune: Rune | null,
    attackGem: Gem | null,
    timeGem: Gem | null
}
export type Tripod = {
    tier: number,
    slot: number,
    name: string,
    icon: string,
    level: number
}
export type Rune = {
    name: string,
    icon: string,
    grade: string,
    description: string
}

// 아크그리드
export type ArkGridInfo = {
    cores: Core[],
    options: ArkGridOption[]
}
export type Core = {
    index: number,
    icon: string,
    name: string,
    point: number,
    grade: string,
    gems: ArkGridGem[]
}
export type ArkGridGem = {
    index: number,
    icon: string,
    isActive: boolean,
    grade: string,
    name: string,
    options: string[]
}
export type ArkGridOption = {
    name: string,
    level: number,
    description: string
}

// 수집품 포인트
export type CollectionInfo = {
    collects: Collect[],
    hobbys: Hobby[],
    collectEquipments: CollectEquipment[]
}
export type Collect = {
    type: string,
    icon: string,
    bgIcon: string,
    point: number,
    maxPoint: number,
    items: CollectItem[]
}
export type CollectItem = {
    name: string,
    point: number,
    maxPoint: number
}
export type Hobby = {
    type: string,
    point: number,
    maxPoint: number
}
export type CollectEquipment = {
    type: string,
    icon: string,
    grade: string,
    descriptions: string[]
}

// 아바타
export type Avatar = {
    type: string,
    name: string,
    icon: string,
    grade: string,
    isInner: boolean
}

// 원정대 캐릭터 정보
export type ExpeditionCharacterInfo = {
    nickname: string,
    job: string,
    server: string,
    level: number,
    combatPower: number,
    type: string
}

// 보석 정보
export type GemInfo = {
    skillStr: string,
    attack: number
}

// 칭호 정보
export type Title = {
    title: string,
    grade: string,
    condition: string
}

// 카드 세트
export type CardPiece = {
    name: string,
    pieces: number
}
