import { getBackgroundByGrade, getBackgroundRightByGrade, getColorTextByGrade, SetStateFn, useMobileQuery } from "@/utiils/utils";
import { 
    Accordion,
    AccordionItem,
    Button, 
    Card, CardBody, CardFooter, CardHeader, 
    Chip, 
    Divider, 
    Input, 
    Pagination,
    Popover, PopoverContent, PopoverTrigger, 
    Progress, 
    Tooltip 
} from "@heroui/react";
import { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Character } from "../../store/loginSlice";
import {  
    getAccessoryStatPercentColor,
    getAccessoryStatSummary,
    getBackgroundColorByStat, 
    getBorderByGrade, 
    getCardByIndex, 
    getCardGems, 
    getCardSetNames, 
    getColorByQuality, 
    getColorByType, 
    getColorProgressArkpassive, 
    getCountAtkGems, 
    getCountDekGems, 
    getEngravingSrcByName, 
    getGemSimpleTailName, 
    getObjectByArmorType, 
    getParsedText, 
    getProgressColorByHonor, 
    getProgressMaxByHonor, 
    getProgressValueByHonor, 
    renderArkPassiveDescription,
    getRemainHonor, 
    getSmallGradeByAccessory, 
    getSmallGradeByArm, 
    getSrcByGrade, 
    getStatByType, 
    getSumStat, 
    getTextByGrade, 
    getTextColorByGrade, 
    getTextColorByStat, 
    getTitleData, 
    getUrlGemInImage, 
    getWidthByStat, 
    handleSearch, 
    printEngravingLevel,
    getTextColorByQuality
} from "../lib/characterFeat";
import { printBonusInTooltip, printCountInTooltip, printHighUpgradeInTooltip, printInfoInTooltip } from "../lib/equipmentPrints";
import clsx from "clsx";
import { printDefaultInTooltip, printListInTooltip, printPointInTooltip, printUseInTooltip } from "../lib/accessoryPrints";
import { printArmPointInTooltip, printArmUseInTooltip, printBooleanInTooltip, printEffectInTooltip } from "../lib/armPrints";
import { printBonusStoneInTooltip, printDefaultStoneInTooltip, printStoneUseInTooltip } from "../lib/stonePrints";
import { CharacterHistory } from "../lib/history";
import '../css/effects.css';
import VegaIcon from "@/Icons/VegaIcon";
import AttackIcon from "@/Icons/AttackIcon";
import SupportorIcon from "@/Icons/SupportorIcon";
import { CardPiece, CharacterInfo, ExpeditionCharacterInfo } from "../model/types";
import { ItemLevelIcon } from "@/Icons/ItemLevelIcon";
import { useRouter } from "next/navigation";
import { getCore } from "../lib/arkGridPrints";
import data from "@/data/characters/data.json";
import JobEmblemIcon from "@/Icons/JobEmblemIcon";

// state 관리
export function useCharacterForm() {
    const [isLoading, setLoading] = useState(false);
    const [isSearched, setSearched] = useState(false);
    const [nickname, setNickname] = useState('');
    const [characterInfo, setCharacterInfo] = useState<CharacterInfo | null>(null);
    const [titles, setTitles] = useState<string[]>([]);
    const [isNothing, setNothing] = useState(false);
    const [isDisable, setDisable] = useState(false);
    const [isLoadingUpdate, setLoadingUpdate] = useState(false);
    const [expeditions, setExpeditions] = useState<ExpeditionCharacterInfo[]>([]);
    const [isBadge, setBadge] = useState(false);
    const [attackPieces, setAttackPieces] = useState<CardPiece[]>([]);
    const [supporterPieces, setSupporterPieces] = useState<CardPiece[]>([]);

    return {
        isLoading, setLoading,
        isSearched, setSearched,
        characterInfo, setCharacterInfo,
        titles, setTitles,
        nickname, setNickname,
        isNothing, setNothing,
        isDisable, setDisable,
        isLoadingUpdate, setLoadingUpdate,
        expeditions, setExpeditions,
        isBadge, setBadge,
        attackPieces, setAttackPieces,
        supporterPieces, setSupporterPieces
    }
}

// 초기 화면 - 검색하지 않은 상태
type SearchComponentProps = {
    setSearched: SetStateFn<boolean>,
    setLoading: SetStateFn<boolean>,
    setNickname: SetStateFn<string>
}
export function SearchComponent({ setSearched, setLoading, setNickname }: SearchComponentProps) {
    const [search, setSearch] = useState('');
    const router = useRouter();
    const isMobile = useMobileQuery();
    return (
        <section className="mx-auto w-full max-w-[820px] py-10 sm:py-14">
            <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Character Search</p>
                <h1 className="mt-2 text-3xl font-bold sm:text-4xl">전투 정보실</h1>
                <p className="mx-auto mt-3 max-w-[560px] text-sm leading-6 text-default-500 sm:text-base">캐릭터의 장비, 각인, 보석과 전투 정보를 한곳에서 확인하세요.</p>
            </div>
            <div className="mt-8 rounded-2xl border border-divider bg-content1 p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Input
                        size="lg"
                        radius="lg"
                        placeholder="캐릭터명을 입력하세요."
                        maxLength={12}
                        value={search}
                        onValueChange={setSearch}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch(search, setSearched, setLoading, setNickname);
                                const params = new URLSearchParams(window.location.search);
                                params.set("nickname", search);
                                const newUrl = `${window.location.pathname}?${params.toString()}`;
                                window.history.pushState({}, "", newUrl);
                            }
                        }}
                        className="w-full"
                        startContent={<span className="text-lg text-default-400">⌕</span>}/>
                    <Button
                        size="lg"
                        radius="lg"
                        color="primary"
                        className="w-full shrink-0 sm:w-[112px]"
                        onPress={() => handleSearch(search, setSearched, setLoading, setNickname)}>
                        검색
                    </Button>
                </div>
                <p className="mt-2 text-xs text-default-400">캐릭터명을 입력한 뒤 Enter 키를 눌러도 검색할 수 있습니다.</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button
                        fullWidth={isMobile}
                        size="sm"
                        radius="lg"
                        color="default"
                        variant="flat"
                        onPress={() => router.push('/character/characterlist')}>
                        원정대 모아보기
                    </Button>
                    <Button
                        fullWidth={isMobile}
                        size="sm"
                        radius="lg"
                        color="default"
                        variant="flat"
                        onPress={() => router.push('/character/compare')}>
                        캐릭터 비교
                    </Button>
                </div>
            </div>
        </section>
    )
}

function CharacterListRow({
    nickname,
    job,
    server,
    level,
    meta,
    onPress,
}: {
    nickname: string;
    job: string;
    server: string;
    level: number;
    meta: string;
    onPress: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onPress}
            className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition hover:border-primary/30 hover:bg-primary/5 sm:px-4"
        >
            <JobEmblemIcon job={job} size={40}/>
            <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-semibold">{nickname}</span>
                <span className="mt-0.5 block truncate text-xs text-default-500">{server} · {job} · {meta}</span>
            </span>
            <span className="shrink-0 text-right">
                <span className="block text-[10px] text-default-400">아이템 레벨</span>
                <span className="mt-0.5 block text-sm font-bold tabular-nums text-primary">{level}</span>
            </span>
        </button>
    );
}

function ListSectionHeader({ title, count, subtitle }: { title: string; count: number; subtitle: string }) {
    return (
        <div className="flex items-start justify-between gap-3">
            <div>
                <h2 className="text-lg font-bold sm:text-xl">{title}</h2>
                <p className="mt-1 text-xs text-default-500">{subtitle}</p>
            </div>
            <Chip size="sm" radius="full" variant="flat" color="primary">{count}명</Chip>
        </div>
    );
}

// 저장된 히스토리 가져오기
export function HistoryComponent({ setSearched, setLoading, setNickname }: SearchComponentProps) {
    const [historys, setHistorys] = useState<CharacterHistory[]>([]);
    
    useEffect(() => {
        const storedHistorys = localStorage.getItem('historys');
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7*24*60*60*1000);
        if (storedHistorys) {
            const parsed = JSON.parse(storedHistorys) as CharacterHistory[];
            const restored = parsed.map(item => ({
                ...item,
                date: new Date(item.date)
            }));
            let resultArray = restored.filter(item => item.date >= oneWeekAgo);
            resultArray = resultArray.reverse();
            setHistorys(resultArray);
        }
    }, [])

    return (
        <section className="w-full rounded-2xl border border-divider bg-content1 p-4 sm:p-5">
            <ListSectionHeader title="최근 기록" count={historys.length} subtitle="최근 7일 동안 검색한 캐릭터" />
            <div className="mt-4 max-h-[460px] space-y-1 overflow-y-auto pr-1">
                {historys.length ? historys.map((character, index) => (
                    <CharacterListRow
                        key={`${character.nickname}-${index}`}
                        nickname={character.nickname}
                        job={character.job}
                        server={`@${character.server}`}
                        level={character.level}
                        meta={`${character.date.getMonth() + 1}/${character.date.getDate()} 검색`}
                        onPress={() => handleSearch(character.nickname, setSearched, setLoading, setNickname)}
                    />
                )) : (
                    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-divider px-4 text-center">
                        <span className="text-2xl text-default-400">⌕</span>
                        <p className="mt-2 text-sm text-default-500">최근에 검색한 캐릭터가 없습니다.</p>
                    </div>
                )}
            </div>
        </section>
    )
}

// 로그인된 원정대 목록 가져오기
export function ExpeditionComponent({ setSearched, setLoading, setNickname }: SearchComponentProps) {
    const expedition: Character[] = useSelector((state: RootState) => state.login.user.expedition);
    return (
        <section className="w-full rounded-2xl border border-divider bg-content1 p-4 sm:p-5">
            <ListSectionHeader title="내 원정대 목록" count={expedition.length} subtitle="등록된 캐릭터를 빠르게 확인" />
            <div className="mt-4 max-h-[460px] space-y-1 overflow-y-auto pr-1">
                {expedition.length ? expedition.map((character, index) => (
                    <CharacterListRow
                        key={`${character.nickname}-${index}`}
                        nickname={character.nickname}
                        job={character.job}
                        server={character.server}
                        level={character.level}
                        meta="원정대 캐릭터"
                        onPress={() => handleSearch(character.nickname, setSearched, setLoading, setNickname)}
                    />
                )) : (
                    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-divider px-4 text-center">
                        <span className="text-2xl text-default-400">♙</span>
                        <p className="mt-2 text-sm text-default-500">로그인이 되어있지 않거나 등록된 원정대 캐릭터가 없습니다.</p>
                    </div>
                )}
            </div>
        </section>
    )
}

// 캐릭터 이미지 위로 올릴 직업 목록
const upperClass = ['도화가', '기상술사', '환수사'];

// 캐릭터 프로파일
type NewProfileComponentProps = {
    info: CharacterInfo,
    isBadge: boolean
}
export function ProfileComponent({ info, isBadge }: NewProfileComponentProps) {
    const isMobile = useMobileQuery();
    return (
        <div className="w-full h-[max-content] sm:h-[300px] border-b-1 border-[#dddddd] dark:border-[#333333] bg-[#F6F6F6] dark:bg-[#111111]">
            <div className="w-full h-full max-w-[1280px] mx-auto flex flex-col-reverse sm:flex-row relative">
                <div className="p-5 h-full hidden sm:flex flex-col">
                    <div className="flex gap-2">
                        <Chip color="secondary" variant="solid" radius="sm">{info.profile.server}</Chip>
                        <Chip color="warning" variant="solid" radius="sm">{info.profile.className}</Chip>
                        <Chip color="primary" variant="solid" radius="sm" className={clsx(info.profile.arkpassiveTitle ? 'flex' : 'hidden')}>{info.profile.arkpassiveTitle}</Chip>
                    </div>
                    <p className="mt-2">{info.profile.title ? getParsedText(info.profile.title) : '-'}{info.profile.guildName !== '-' ?` · ${info.profile.guildName} 길드` : ''}</p>
                    {isBadge ? (
                        <div className="flex gap-2 items-center">
                            <div className="tag-container">
                                <div className="flex">
                                    <span className="battletag">{info.nickname}</span>
                                    <div className="empty-box"></div>
                                </div>
                                <span className="tail-wrapper">
                                    <span className="tail-box"></span>
                                </span>
                            </div>
                            <Tooltip showArrow content="후원자 뱃지"><div className="w-12 h-12"><VegaIcon/></div></Tooltip>
                        </div>
                    ) : <p className="text-2xl font-bold">{info.nickname}</p>}
                    <div className="mt-2 w-fit flex items-center rounded-full bg-white dark:bg-[#18181b] shadow-md">
                        <p className="rounded-l-full h-full flex items-center bg-gradient-to-r from-orange-500 to-red-500 py-0.5 pl-2 pr-1.5 text-xs text-white">전투 레벨</p>
                        <p className="py-0.5 pl-2.5 pr-3 text-sm">{info.profile.characterLevel.toLocaleString()}</p>
                    </div>
                    <div className="mt-2 w-fit flex items-center rounded-full bg-white dark:bg-[#18181b] shadow-md">
                        <p className="rounded-l-full h-full flex items-center bg-gradient-to-r from-pink-500 to-purple-500 py-0.5 pl-2 pr-1.5 text-xs text-white">원정대 레벨</p>
                        <p className="py-0.5 pl-2.5 pr-3 text-sm">{info.profile.expeditionLevel}</p>
                    </div>
                    <div className="mt-2 w-fit flex items-center rounded-full bg-white dark:bg-[#18181b] shadow-md">
                        <p className="rounded-l-full h-full flex items-center bg-gradient-to-r from-sky-500 to-blue-500 py-0.5 pl-2 pr-1.5 text-xs text-white">영지</p>
                        <p className="py-0.5 pl-2.5 pr-3 text-sm">Lv.{info.profile.townLevel} {info.profile.townName}</p>
                    </div>
                    <div className="grow flex flex-row items-center gap-3 mt-5">
                        <Tooltip showArrow content="아이템 레벨">
                            <Card radius="sm" shadow="sm" isBlurred>
                                <CardBody className="px-3 py-1">
                                    <div className="flex items-center gap-1">
                                        <ItemLevelIcon size={34}/>
                                        <p className="text-3xl font-bold">{info.profile.itemLevel.toFixed(2)}</p>
                                    </div>
                                </CardBody>
                            </Card>
                        </Tooltip>
                        {info.profile.emblems.map((emblem, idx) => (
                            <img key={idx} src={emblem} alt={`emblem-${idx}`} className="w-[40px] h-[40px]"/>
                        ))}
                    </div>
                </div>
                <div className="flex sm:hidden p-5 flex-col z-1 h-[300px] bg-gradient-to-r from-[#15181d] via-[#15181d]/25 to-transparent">
                    <div className="flex gap-2">
                        <Chip color="secondary" variant="solid" radius="sm">{info.profile.server}</Chip>
                        <Chip color="warning" variant="solid" radius="sm">{info.profile.className}</Chip>
                    </div>
                    <Chip 
                        color="primary" 
                        variant="solid" 
                        radius="sm" 
                        className={clsx(
                            'mt-2',
                            info.profile.arkpassiveTitle ? 'flex' : 'hidden')
                        }>{info.profile.arkpassiveTitle}</Chip>
                    <p className="text-[#dddddd] text-sm mt-4">{getParsedText(info.profile.title)}{info.profile.guildName !== '-' ?` · ${info.profile.guildName} 길드` : ''}</p>
                    {isBadge ? (
                        <div className="flex gap-2 items-center">
                            <div className="tag-container-mobile mt-2">
                                <div className="flex">
                                    <span className="battletag">{info.nickname}</span>
                                    <div className="empty-box-mobile"></div>
                                </div>
                                <span className="tail-wrapper">
                                    <span className="tail-box-mobile"></span>
                                </span>
                            </div>
                            <Tooltip showArrow content="후원자 뱃지"><div className="w-12 h-12 text-white"><VegaIcon/></div></Tooltip>
                        </div>
                    ) : <p className="text-xl font-bold text-white">{info.nickname}</p>}
                    <div className="grow w-full flex items-end mt-5">
                        <div className="grow grid grid-cols-[75px_1fr] gap-y-1.5">
                            <p className="fadedtext text-sm">아이템 레벨</p>
                            <p className="text-sm text-white">{info.profile.itemLevel.toLocaleString()}</p>
                            <p className="fadedtext text-sm">전투 레벨</p>
                            <p className="text-sm text-white">{info.profile.characterLevel.toLocaleString()}</p>
                            <p className="fadedtext text-sm">원정대 레벨</p>
                            <p className="text-sm text-white">{info.profile.expeditionLevel.toLocaleString()}</p>
                            <p className="fadedtext text-sm">영지</p>
                            <p className="text-sm text-white">Lv.{info.profile.townLevel} {info.profile.townName}</p>
                        </div>
                        <div className="flex gap-1">
                            {info.profile.emblems.map((emblem, idx) => (
                                <img key={idx} src={emblem} alt={`emblem-${idx}`} className="w-[28px] h-[28px]"/>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="grow hidden sm:block"/>
                <div className="absolute sm:static top-0 left-0 z-0 bg-[#15181d] sm:bg-transparent w-[100vw] sm:w-[440px] h-full sm:h-[300px] overflow-hidden sm:[mask-image:linear-gradient(to_right,transparent,black,black,black)] lg1280:[mask-image:linear-gradient(to_right,transparent,black,black,transparent)]">
                    <img
                        src={info.profile.characterImageUrl}
                        alt="character-image"
                        className={clsx(
                            "w-[100vw] h-[500px] object-cover scale-130 origin-top",
                            isMobile ? "translate-x-[20%]" : "",
                            upperClass.includes(info.profile.className) ? "translate-y-[-28%]" : "translate-y-[-13%]"
                        )}/>
                </div>
            </div>
        </div>
    )
}

// 능력치 컴포넌트
const abilityCardClass = "border border-default-200/80 bg-content1/95 shadow-sm dark:border-white/10 dark:bg-[#18181b]";
const abilityPopoverClass = "border border-default-200 bg-white/95 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#18181b]/95";

function renderEffectValueText(text: string | null | undefined) {
    if (!text) return text;
    const parts = [];
    const pattern = /([+-]?\d+(?:\.\d+)?%?)(?=[^0-9\n]*(증가|감소))/g;
    let lastIndex = 0;

    for (const match of text.matchAll(pattern)) {
        const index = match.index ?? 0;
        if (index > lastIndex) parts.push(text.slice(lastIndex, index));
        parts.push(
            <span
                key={`${index}-${match[0]}`}
                className={match[2] === '증가' ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'font-semibold text-red-500 dark:text-red-400'}>
                {match[1]}
            </span>
        );
        lastIndex = index + match[0].length;
    }

    if (lastIndex === 0) return text;
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts;
}

function renderAccessoryRefinementLine(text: string, grade: string) {
    const parts = text.split(/([+-]?\d+(?:\.\d+)?%?)/g);
    return parts.map((part, index) =>
        /^[+-]?\d+(?:\.\d+)?%?$/.test(part) ? (
            <span key={index} className={clsx("font-semibold", getTextColorByGrade(grade))}>{part}</span>
        ) : part
    );
}

type AbilityComponentProps = {
    info: CharacterInfo, 
    titles: string[],
    attackPieces: CardPiece[],
    supportorPieces: CardPiece[]
}
export function AbilityComponent({ info, titles, attackPieces, supportorPieces }: AbilityComponentProps) {
    const isMobile = useMobileQuery();
    return (
        <div className="w-full grid grid-cols-1 items-start gap-5 md960:grid-cols-[minmax(0,5fr)_minmax(280px,2fr)] md960:gap-6">
            <div className="w-full min-w-0">
                {isMobile ? <CombatPowerComponent info={info}/> : null}
                <EquipmentComponent info={info}/>
                <GemComponent info={info}/>
                <ArkpassiveComponent info={info}/>
                <CardComponent info={info} attackPieces={attackPieces} supportorPieces={supportorPieces}/>
            </div>
            <div className="w-full min-w-0">
                {isMobile ? null : <CombatPowerComponent info={info}/>}
                <StatComponent info={info}/>
                <EngravingComponent info={info}/>
                <ArkGridSimple info={info}/>
                <TitleComponent titles={titles}/>
            </div>
        </div>
    )
}

// 희귀칭호 목록
function TitleComponent({titles}: { titles: string[] }) {
    const [page, setPage] = useState(1);
    const titlesPerPage = 7;
    const titleGradeOrder: Record<string, number> = {
        "에스더": 0,
        "고대": 1,
        "유물": 2,
        "전설": 3,
        "영웅": 4,
        "희귀": 5
    };
    const sortedTitles = titles
        .map((title, index) => ({
            title,
            index,
            grade: getTitleData(title)?.grade ?? ""
        }))
        .sort((a, b) => {
            const aOrder = titleGradeOrder[a.grade] ?? Number.MAX_SAFE_INTEGER;
            const bOrder = titleGradeOrder[b.grade] ?? Number.MAX_SAFE_INTEGER;

            if (aOrder !== bOrder) {
                return aOrder - bOrder;
            }

            return a.index - b.index;
        })
        .map(({ title }) => title);
    const totalPages = Math.max(1, Math.ceil(sortedTitles.length / titlesPerPage));
    const paginatedTitles = sortedTitles.slice((page - 1) * titlesPerPage, page * titlesPerPage);

    useEffect(() => {
        setPage(1);
    }, [titles]);

    return (
        <Card fullWidth radius="lg" className={clsx("mt-5", abilityCardClass)}>
            <CardHeader className="px-5 py-4">
                <div className="w-full flex items-center">
                    <h3 className="text-lg font-semibold">보유 칭호</h3>
                    <p className="fadedtext ml-auto text-sm">총 {titles.length}개</p>
                </div>
            </CardHeader>
            <Divider/>
            <CardBody className="px-5 pb-5 pt-4">
                {paginatedTitles.map((title, index) => (
                    <div key={index} className="mb-1 rounded-lg px-2 py-1.5 transition-colors hover:bg-default-100 dark:hover:bg-white/[0.05]">
                        <p className={clsx(
                            'text-sm',
                            getColorTextByGrade(getTitleData(title)?.grade ?? 'default')
                        )}>{title}</p>
                        <p className="fadedtext text-[9pt]">{getTitleData(title)?.condition ?? '-'}</p>
                    </div>
                ))}
                {totalPages > 1 ? (
                    <div className="mt-2 flex">
                        <Pagination
                            showControls 
                            page={page}
                            total={totalPages}
                            onChange={setPage}
                            size="sm"
                            radius="sm"
                        />
                    </div>
                ) : null}
            </CardBody>
        </Card>
    )
}

// 전투력 표시 요소
function CombatPowerComponent({ info }: { info: CharacterInfo }) {
    const isSupportor = info.profile.characterType === 'supportor';

    return (
        <Card fullWidth radius="lg" className={clsx("mb-5", abilityCardClass)}>
            <CardHeader className="px-5 py-4">
                <div className="w-full flex gap-1 items-center">
                    <p className="grow text-lg font-semibold">전투력</p>
                </div>
                <Chip
                    startContent={(
                        <div>
                            <div className={clsx(
                                isSupportor ? 'hidden' : 'block'
                            )}><AttackIcon size={14}/></div>
                            <div className={clsx(
                                isSupportor ? 'block' : 'hidden'
                            )}><SupportorIcon size={14}/></div>
                        </div>
                    )}
                    variant="flat"
                    size="sm"
                    className="pl-2"
                    color={isSupportor ? "success" : "danger"}>
                    {isSupportor ? '서포터' : '딜러'}
                </Chip>
            </CardHeader>
            <Divider/>
            <CardBody className="px-5 pb-5 pt-4">
                <div className={clsx(
                    "relative flex min-h-[112px] w-full flex-col justify-center overflow-hidden rounded-2xl border-0 px-5 py-4 outline-none",
                    isSupportor
                        ? "bg-gradient-to-br from-emerald-50 via-white to-emerald-100/60 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.28)] dark:from-emerald-950/60 dark:via-[#18181b] dark:to-emerald-950/20"
                        : "bg-gradient-to-br from-rose-50 via-white to-rose-100/60 shadow-[inset_0_0_0_1px_rgba(244,63,94,0.28)] dark:from-rose-950/60 dark:via-[#18181b] dark:to-rose-950/20"
                )}>
                    <p className="relative text-xs font-medium tracking-wide text-default-500">현재 전투력</p>
                    <div className="relative mt-1 flex items-end gap-2">
                        <p className={clsx(
                            "text-4xl font-black leading-none tracking-tight tabular-nums",
                            isSupportor ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"
                        )}>{info.profile.combatPower ?? '전투력 없음'}</p>
                        <span className={clsx(
                            "mb-0.5 text-xs font-semibold",
                            isSupportor ? "text-emerald-700/70 dark:text-emerald-300/70" : "text-rose-700/70 dark:text-rose-300/70"
                        )}>{isSupportor ? 'SUPPORT' : 'DEALER'}</span>
                    </div>
                </div>
                <div className="mt-4 rounded-xl bg-default-100/70 px-3 py-3 dark:bg-white/[0.04]">
                    <div className="flex w-full items-center gap-1">
                        <p className="grow text-sm text-default-500">명예 포인트</p>
                        <p className="font-semibold tabular-nums">{info.profile.honorPoint.toLocaleString()}</p>
                    </div>
                    <Progress
                        size="sm"
                        color={getProgressColorByHonor(info.profile.honorPoint)}
                        value={getProgressValueByHonor(info.profile.honorPoint)}
                        maxValue={getProgressMaxByHonor(info.profile.honorPoint)}
                        className="mt-2 w-full"/>
                    <p className={clsx(
                        "fadedtext mt-2 text-[8pt]",
                        info.profile.honorPoint >= 1000 ? 'hidden' : ''
                    )}>
                        다음 명예 등급까지 <span className="font-bold text-black dark:text-white">{getRemainHonor(info.profile.honorPoint)}</span> p 남음.
                    </p>
                    <p className={clsx(
                        "fadedtext mt-2 text-[8pt]",
                        info.profile.honorPoint >= 1000 ? '' : 'hidden'
                    )}>명예 등급이 최고 등급까지 달성하였습니다.</p>
                </div>
            </CardBody>
        </Card>
    )
}

// 장비 컴포넌트 - 능력치 컴포넌트 요소
export function EquipmentComponent({ info }: { info: CharacterInfo }) {
    const arm = info.equipment.arm;
    const stone = info.equipment.stone;
    const orb = info.equipment.orb;
    const averageUpgradeTargets = new Set(['무기', '투구', '어깨', '상의', '하의', '장갑']);
    const averageUpgradeEquipments = info.equipment.equipments.filter((equip) => averageUpgradeTargets.has(equip.type));
    const upgradeValues = averageUpgradeEquipments
        .map((equip) => Number(equip.name.match(/^\+(\d+)/)?.[1] ?? NaN))
        .filter((value) => !Number.isNaN(value));
    const averageUpgrade = upgradeValues.length > 0
        ? upgradeValues.reduce((sum, value) => sum + value, 0) / upgradeValues.length
        : null;
    const highUpgradeValues = averageUpgradeEquipments
        .map((equip) => equip.highUpgrade)
        .filter((value) => value > -1);
    const averageHighUpgrade = highUpgradeValues.length > 0
        ? highUpgradeValues.reduce((sum, value) => sum + value, 0) / highUpgradeValues.length
        : null;
    const qualityValues = averageUpgradeEquipments
        .map((equip) => equip.quality)
        .filter((value) => value >= 0);
    const averageQuality = qualityValues.length > 0
        ? qualityValues.reduce((sum, value) => sum + value, 0) / qualityValues.length
        : null;
    const accessoryQualityValues = info.equipment.accessories
        .map((equip) => equip.quality)
        .filter((value) => value >= 0);
    const averageAccessoryQuality = accessoryQualityValues.length > 0
        ? accessoryQualityValues.reduce((sum, value) => sum + value, 0) / accessoryQualityValues.length
        : null;
    const accessoryPercentValues = info.equipment.accessories
        .map((equip) => {
            try {
                const parsedEquipment = JSON.parse(equip.tooltip);
                const defaultEffectText = printDefaultInTooltip(parsedEquipment);
                return getAccessoryStatSummary(equip, defaultEffectText)?.percentValue ?? null;
            } catch (err) {
                console.error("Tooltip JSON 파싱 오류:", err);
                return null;
            }
        })
        .filter((value): value is number => value !== null);
    const averageAccessoryStatPercent = accessoryPercentValues.length > 0
        ? accessoryPercentValues.reduce((sum, value) => sum + value, 0) / accessoryPercentValues.length
        : null;
    const effectedAccessoryNames =
        data.effectedAccessoriesInCharacters[
            info.profile.characterType as keyof typeof data.effectedAccessoriesInCharacters
        ] ?? [];
    const equipmentSummary = [
        { label: '강화 평균', value: averageUpgrade !== null ? averageUpgrade.toFixed(1) : '-', valueClass: averageUpgrade !== null ? 'font-semibold' : 'fadedtext' },
        { label: '상급 재련 평균', value: averageHighUpgrade !== null ? averageHighUpgrade.toFixed(1) : '-', valueClass: averageHighUpgrade !== null ? 'font-semibold' : 'fadedtext' },
        { label: '장비 품질 평균', value: averageQuality !== null ? averageQuality.toFixed(1) : '-', valueClass: clsx(averageQuality !== null ? 'font-semibold' : 'fadedtext', getTextColorByQuality(averageQuality ?? 0)) },
        { label: '악세 품질 평균', value: averageAccessoryQuality !== null ? averageAccessoryQuality.toFixed(1) : '-', valueClass: clsx(averageAccessoryQuality !== null ? 'font-semibold' : 'fadedtext', getTextColorByQuality(averageAccessoryQuality ?? 0)) },
        { label: '악세 힘민지 평균', value: averageAccessoryStatPercent !== null ? `${averageAccessoryStatPercent.toFixed(2)}%` : '-', valueClass: clsx(averageAccessoryStatPercent !== null ? 'font-semibold' : 'fadedtext', getAccessoryStatPercentColor(averageAccessoryStatPercent ?? null)) },
    ];

    return (
        <div className="flex w-full flex-col gap-4">
            <div className="grid w-full items-stretch gap-4 md960:grid-cols-2">
                <Card fullWidth radius="lg" className={clsx(abilityCardClass, "h-full")}>
                    <CardHeader className="flex items-center justify-between px-4 py-3.5 sm:px-5">
                        <div>
                            <p className="font-semibold">장비</p>
                            <p className="mt-0.5 text-[11px] text-default-500">품질과 재련 상태</p>
                        </div>
                        <span className="rounded-full bg-default-100 px-2.5 py-1 text-xs font-semibold text-default-500 dark:bg-white/[0.06]">{info.equipment.equipments.length}부위</span>
                    </CardHeader>
                    <Divider/>
                    <CardBody className="p-3 sm:p-4">
                        <div className="flex w-full flex-col gap-2">
                            {info.equipment.equipments.map((equip, index) => {
                                let parsedEquipment;
                                try {
                                    parsedEquipment = JSON.parse(getObjectByArmorType(info.equipment.equipments, equip.type).tooltip)
                                } catch (err) {
                                    console.error("Tooltip JSON 파싱 오류:", err);
                                    return null;
                                }
                                return (
                                    <Popover key={index} showArrow disableAnimation>
                                        <PopoverTrigger>
                                            <div className="group flex min-h-[68px] cursor-pointer items-center gap-3 rounded-xl border border-default-200/80 bg-default-50/70 p-2.5 transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/[0.035] hover:shadow-sm dark:border-white/10 dark:bg-white/[0.025] dark:hover:border-primary/40 dark:hover:bg-primary/[0.07]">
                                                <div className={`h-[50px] w-[50px] shrink-0 rounded-lg p-[4px] shadow-sm ${getBackgroundByGrade(equip.grade)}`}>
                                                    <img
                                                        src={equip.icon}
                                                        alt="equip-icon"
                                                        className="h-[42px] w-[42px]"/>
                                                </div>
                                                <div className="min-w-0 grow">
                                                    <div className="flex items-center gap-1">
                                                        <p className={`${getColorTextByGrade(equip.grade)} truncate font-medium`}>{equip.name}</p>
                                                    </div>
                                                    <div className="mt-1 flex items-center gap-1.5">
                                                        <Chip size="sm" radius="sm" variant="flat">{equip.type}</Chip>
                                                        {equip.highUpgrade > 0 ? <Tooltip showArrow content={`상급 재련 +${equip.highUpgrade}`}>
                                                            <Chip size="sm" radius="sm" variant="flat" color="warning">
                                                                <p>+{equip.highUpgrade}</p>
                                                            </Chip>
                                                        </Tooltip> : <></>}
                                                    </div>
                                                </div>
                                                {equip.quality >= 0 ? (
                                                    <div className={clsx("flex h-11 min-w-11 shrink-0 flex-col items-center justify-center rounded-xl px-2 text-white shadow-sm", getColorByQuality(equip.quality))}>
                                                        <span className="text-[9px] leading-none opacity-80">품질</span>
                                                        <span className="mt-1 text-sm font-bold leading-none tabular-nums">{equip.quality}</span>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent className={abilityPopoverClass}>
                                            <div className="max-h-[600px] w-[340px] max-w-[calc(100vw-32px)] overflow-y-auto p-4 scrollbar-hide">
                                                <h3 className={`w-full text-center text-lg font-bold ${getColorTextByGrade(equip.grade)}`}>{equip.name}</h3>
                                                <div className="w-full flex gap-2 mt-3">
                                                    <div className={`w-[55px] h-[55px] p-[5px] aspect-square rounded-md ${getBackgroundByGrade(equip.grade)}`}>
                                                        <img
                                                            src={equip.icon}
                                                            alt="w-[45px] h-[45px] detail-equip-icon"/>
                                                    </div>
                                                    <div className="grow">
                                                        <div className="flex gap-2">
                                                            <p className={`grow ${getColorTextByGrade(equip.grade)}`}>{getParsedText(parsedEquipment.Element_001.value.leftStr0)}</p>
                                                            <p className="fadedtext grow text-right">Lv.{getParsedText(parsedEquipment.Element_001.value.leftStr2).replaceAll('아이템 레벨 ', '')}</p>
                                                        </div>
                                                        <Progress
                                                            value={equip.quality}
                                                            maxValue={100}
                                                            size="sm"
                                                            color="primary"
                                                            label={`${getParsedText(parsedEquipment.Element_001.value.leftStr1)} : ${equip.quality}`}
                                                            className="w-full fadedtext"/>
                                                    </div>
                                                </div>
                                                <div className="w-full flex gap-2 fadedtext mt-2">
                                                    <p className="grow">{getParsedText(parsedEquipment.Element_002.value)}</p>
                                                    <p className="grow text-right">{getParsedText(parsedEquipment.Element_003.value)}</p>
                                                </div>
                                                {equip.highUpgrade > 0 ? (<div className="mt-2">
                                                    {printHighUpgradeInTooltip(parsedEquipment).split(/\r?\n/).map((line, i) => (
                                                        <p key={i} className={i === 0 ? 'font-bold' : 'text-[9pt]'}>{line}</p>
                                                    ))}
                                                </div>) : <></>}
                                                {printInfoInTooltip(parsedEquipment) ? (
                                                    <div className="mt-2">
                                                        <p className="fadedtext">{printInfoInTooltip(parsedEquipment)?.title}</p>
                                                        <p className="whitespace-pre-line">{printInfoInTooltip(parsedEquipment)?.content}</p>
                                                    </div>
                                                ) : <></>}
                                                {printBonusInTooltip(parsedEquipment) ? (
                                                    <div className="mt-2">
                                                        <p className="fadedtext">{printBonusInTooltip(parsedEquipment)?.title}</p>
                                                        <p className="whitespace-pre-line">{printBonusInTooltip(parsedEquipment)?.content}</p>
                                                    </div>
                                                ) : <></>}
                                                {printCountInTooltip(parsedEquipment) ? (
                                                    <p className="mt-2">{printCountInTooltip(parsedEquipment)?.replaceAll('|', '')}</p>
                                                ) : <></>}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                )
                            })}
                        </div>
                    </CardBody>
                </Card>

                <Card fullWidth radius="lg" className={clsx(abilityCardClass, "h-full")}>
                        <CardHeader className="flex items-center justify-between px-4 py-3.5 sm:px-5">
                            <div>
                                <p className="font-semibold">악세서리</p>
                                <p className="mt-0.5 text-[11px] text-default-500">연마 효과와 전투 특성</p>
                            </div>
                            <span className="rounded-full bg-default-100 px-2.5 py-1 text-xs font-semibold text-default-500 dark:bg-white/[0.06]">{info.equipment.accessories.length}부위</span>
                        </CardHeader>
                        <Divider/>
                        <CardBody className="p-3 sm:p-4">
                            <div className="flex w-full flex-col gap-2">
                        {info.equipment.accessories.map((equip, index) => {
                            let parsedEquipment;
                            try {
                                parsedEquipment = JSON.parse(equip.tooltip);
                            } catch (err) {
                                console.error("Tooltip JSON 파싱 오류:", err);
                                return null;
                            }
                            const defaultEffectText = printDefaultInTooltip(parsedEquipment);
                            const accessoryStatSummary = getAccessoryStatSummary(equip, defaultEffectText);
                            return (
                                <Popover key={index} disableAnimation>
                                        <PopoverTrigger>
                                            <div className="group flex cursor-pointer items-center gap-2.5 rounded-xl border border-default-200/80 bg-default-50/70 p-2.5 transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/[0.035] hover:shadow-sm dark:border-white/10 dark:bg-white/[0.025] dark:hover:border-primary/40 dark:hover:bg-primary/[0.07]">
                                                <div className="min-w-0 grow">
                                                    <div className="flex gap-2 items-center">
                                                        <div className={`h-[48px] w-[48px] shrink-0 rounded-lg p-[3px] shadow-sm ${getBackgroundByGrade(equip.grade)}`}>
                                                            <img
                                                                src={equip.icon}
                                                                alt="accessories-icon"
                                                                className="h-[42px] w-[42px]"/>
                                                        </div>
                                                        <div className="min-w-0 grow">
                                                            <div className="flex gap-1 items-center">
                                                                <p className={`${getColorTextByGrade(equip.grade)} grow truncate font-medium`}>{equip.grade} {equip.type}</p>
                                                            </div>
                                                            <div className="mt-1 flex items-center gap-1.5">
                                                                {equip.quality >= 0 ? <Chip size="sm" radius="sm" className={`${getColorByQuality(equip.quality)} text-white`}>{equip.quality}</Chip> : <></>}
                                                                {equip.point > 0 ? <Chip size="sm" radius="sm" variant="flat" color="primary">+{equip.point}</Chip> : <></>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 flex w-full items-center gap-1 text-xs text-default-600 dark:text-default-500">
                                                        <p>힘민지 +{accessoryStatSummary?.statValue.toLocaleString() ?? '-'}</p>
                                                        <div className="grow border-b border-dotted border-default-300" />
                                                        <p className={clsx(
                                                            "font-semibold",
                                                            getAccessoryStatPercentColor(accessoryStatSummary?.percentValue ?? null)
                                                        )}>{accessoryStatSummary?.percentText ? accessoryStatSummary.percentText : ''}</p>
                                                    </div>
                                                </div>
                                                {equip.items.length > 0 ? (
                                                    <div className="flex w-[112px] shrink-0 flex-col items-start gap-1">
                                                        {equip.items.map((item: any, idx: number) => {
                                                            const accessoryGrade = getSmallGradeByAccessory(equip.type, item);
                                                            const isEffectedAccessory = effectedAccessoryNames.includes(accessoryGrade.name);

                                                            return (
                                                                <div key={idx} className={clsx(
                                                                    "flex h-7 w-full min-w-0 items-center gap-1 rounded-lg border bg-content1/90 px-2 py-1 text-[11px] shadow-sm transition-colors",
                                                                    isEffectedAccessory ? clsx(getBorderByGrade(accessoryGrade.grade), "dark:bg-white/[0.045]") : "border-[#aaaaaa]/70 bg-default-100/70 dark:border-[#555555] dark:bg-white/[0.035]"
                                                                )}>
                                                                    <img
                                                                        src={getSrcByGrade(accessoryGrade.grade)}
                                                                        alt={`effect-${idx}`}
                                                                        className={clsx(
                                                                            "h-3.5 w-3.5 shrink-0",
                                                                            !isEffectedAccessory && "opacity-40 grayscale brightness-75"
                                                                        )}/>
                                                                    <p className={clsx(
                                                                        "shrink-0 text-[10px] font-semibold",
                                                                        getTextColorByGrade(accessoryGrade.grade),
                                                                        !isEffectedAccessory && "opacity-40"
                                                                    )}>{getTextByGrade(accessoryGrade.grade)}</p>
                                                                    <p className={clsx(
                                                                        "min-w-0 truncate",
                                                                        accessoryGrade.grade === 'none' ? 'fadedtext' : '',
                                                                        !isEffectedAccessory && "opacity-40"
                                                                    )}>{accessoryGrade.name}</p>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : <></>}
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent className={abilityPopoverClass}>
                                            <div className="max-h-[600px] w-[340px] max-w-[calc(100vw-32px)] overflow-y-auto p-4 scrollbar-hide">
                                                <h3 className={`w-full text-center text-lg font-bold ${getColorTextByGrade(equip.grade)}`}>{equip.name}</h3>
                                                <div className="w-full flex gap-2 mt-3">
                                                    <div className={`w-[55px] h-[55px] p-[5px] aspect-square rounded-md ${getBackgroundByGrade(equip.grade)}`}>
                                                        <img
                                                            src={equip.icon}
                                                            alt="detail-accessories-icon"
                                                            className="w-[45px] h-[45px]"/>
                                                    </div>
                                                    <div className="grow">
                                                        <div className="flex gap-2">
                                                            <p className={`grow ${getColorTextByGrade(equip.grade)}`}>{getParsedText(parsedEquipment.Element_001.value.leftStr0)}</p>
                                                            <p className="fadedtext grow text-right">{getParsedText(parsedEquipment.Element_001.value.leftStr2).replaceAll('아이템 레벨 ', '')}</p>
                                                        </div>
                                                        <Progress
                                                            value={equip.quality}
                                                            maxValue={100}
                                                            size="sm"
                                                            color="primary"
                                                            label={`${getParsedText(parsedEquipment.Element_001.value.leftStr1)} : ${equip.quality}`}
                                                            className="w-full fadedtext"/>
                                                    </div>
                                                </div>
                                                <div className="w-full flex gap-2 mt-2 text-[9pt] fadedtext">
                                                    <p className="grow whitespace-pre-line">{getParsedText(parsedEquipment.Element_002.value.replaceAll("<BR>", '\r\n'))}</p>
                                                    <p className="grow text-right whitespace-pre-line">{getParsedText(parsedEquipment.Element_003.value.replaceAll("|", ''))}</p>
                                                </div>
                                                <div className="mt-2">
                                                    <p className="fadedtext">기본 효과</p>
                                                    <p className="whitespace-pre-line">{defaultEffectText}</p>
                                                </div>
                                                <div className="mt-3 rounded-xl bg-default-100/80 p-3 dark:bg-white/[0.05]">
                                                    <p className="mb-2 text-xs font-semibold text-default-500">연마 효과</p>
                                                    <ul className="flex flex-col gap-1.5">
                                                        {printListInTooltip(parsedEquipment).split(/\r?\n/).filter(Boolean).map((line, idx) => {
                                                            const refinementGrade = getSmallGradeByAccessory(equip.type, equip.items[idx] ?? line).grade;
                                                            return (
                                                                <li key={idx} className="flex items-center gap-2 text-sm">
                                                                    <span className={clsx("h-1.5 w-1.5 shrink-0 rounded-full", refinementGrade === 'lg' ? 'bg-[#f7890c]' : refinementGrade === 'md' ? 'bg-[#ae30e9]' : refinementGrade === 'sm' ? 'bg-[#1f88dd]' : 'bg-default-400')} />
                                                                    <span>{renderAccessoryRefinementLine(line, refinementGrade)}</span>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </div>
                                                <div className="mt-2">
                                                    <p className="fadedtext">아크 패시브 포인트 효과</p>
                                                    <p className="whitespace-pre-line">{printPointInTooltip(parsedEquipment)}</p>
                                                </div>
                                                <p className="whitespace-pre-line mt-2 text-[9pt] text-blue-400 dark:text-blue-600">{printUseInTooltip(parsedEquipment)}</p>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                )
                            })}
                            </div>
                        </CardBody>
                </Card>

                <Card fullWidth radius="lg" className={clsx(abilityCardClass, "h-full")}>
                        <CardHeader className="flex items-center justify-between px-4 py-3.5 sm:px-5">
                            <div>
                                <p className="font-semibold">특수장비</p>
                                <p className="mt-0.5 text-[11px] text-default-500">팔찌 · 어빌리티 스톤 · 보주</p>
                            </div>
                            <span className="rounded-full bg-default-100 px-2.5 py-1 text-xs font-semibold text-default-500 dark:bg-white/[0.06]">특수 효과</span>
                        </CardHeader>
                        <Divider/>
                        <CardBody className="p-3 sm:p-4">
                            <div className="flex w-full flex-col gap-2">
                            {arm ? (
                                <Popover showArrow disableAnimation>
                                    <PopoverTrigger>
                                        <div className="group flex cursor-pointer items-center gap-2.5 rounded-xl border border-default-200/80 bg-default-50/70 p-2.5 transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/[0.035] hover:shadow-sm dark:border-white/10 dark:bg-white/[0.025] dark:hover:border-primary/40 dark:hover:bg-primary/[0.07]">
                                            <div className={`h-[48px] w-[48px] shrink-0 rounded-lg p-[3px] shadow-sm ${getBackgroundByGrade(arm.grade)}`}>
                                                <img
                                                    src={arm.icon}
                                                    alt="arm-icon"
                                                    className="h-[42px] w-[42px]"/>
                                            </div>
                                            <div className="min-w-0 grow">
                                                <div className="flex gap-1 items-center">
                                                    <p className={`${getColorTextByGrade(arm.grade)} grow truncate font-medium`}>{arm.grade} {arm.type}</p>
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    {arm.point > 0 ? <Chip size="sm" radius="sm" variant="flat" color="success">+{arm.point}</Chip> : <></>}
                                                </div>
                                            </div>
                                            {printEffectInTooltip(arm.tooltip).length > 0 ? (
                                                <div className="flex h-full w-[136px] shrink-0 flex-col items-start gap-1">
                                                    {printEffectInTooltip(arm.tooltip).map((item: string, idx) => (
                                                        <div key={idx} className={clsx(
                                                            "flex h-7 w-full min-w-0 items-center gap-1 rounded-lg border bg-content1/90 px-2 py-1 text-[11px] shadow-sm transition-colors",
                                                            getSmallGradeByArm(item).name !== 'null' ? 'block' : 'hidden',
                                                                clsx(getBorderByGrade(getSmallGradeByArm(item).grade), "dark:bg-white/[0.045]")
                                                        )}>
                                                            <img
                                                                src={getSrcByGrade(getSmallGradeByArm(item).grade)}
                                                                alt={`arm-effect-${idx}`}
                                                                className="h-3.5 w-3.5 shrink-0"/>
                                                            <p className={clsx("shrink-0 text-[10px] font-semibold", getTextColorByGrade(getSmallGradeByArm(item).grade))}>{getTextByGrade(getSmallGradeByArm(item).grade)}</p>
                                                            <p className={clsx(
                                                                "min-w-0 truncate",
                                                                getSmallGradeByArm(item).grade === 'none' ? 'fadedtext' : ''
                                                            )}>{getSmallGradeByArm(item).name}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : <></>}
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className={abilityPopoverClass}>
                                        <div className="max-h-[600px] w-[340px] max-w-[calc(100vw-32px)] overflow-y-auto p-4 scrollbar-hide">
                                            <h3 className={`w-full text-center text-lg font-bold ${getColorTextByGrade(arm.grade)}`}>{arm.name}</h3>
                                            <div className="w-full flex gap-2 mt-3">
                                                <div className={`w-[55px] h-[55px] p-[5px] aspect-square rounded-md ${getBackgroundByGrade(arm.grade)}`}>
                                                    <img
                                                        src={arm.icon}
                                                        alt="detail-arm-icon"
                                                        className="w-[45px] h-[45px]"/>
                                                </div>
                                                <div className="grow">
                                                    <div className="flex gap-2">
                                                        <p className={`grow ${getColorTextByGrade(arm.grade)}`}>{getParsedText(arm.tooltip.Element_001.value.leftStr0)}</p>
                                                        <p className="fadedtext grow text-right">{getParsedText(arm.tooltip.Element_001.value.leftStr2).replaceAll('아이템 레벨 ', '')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-full flex gap-2 mt-2 text-[9pt] fadedtext">
                                                <p className="grow whitespace-pre-line">{getParsedText(arm.tooltip.Element_002.value.replaceAll("<BR>", '\r\n'))}</p>
                                                <p className="grow text-right whitespace-pre-line">{getParsedText(arm.tooltip.Element_003.value.replaceAll("|", ''))}</p>
                                            </div>
                                            {printEffectInTooltip(arm.tooltip).length > 0 ? (
                                                <div className="mt-2">
                                                    <p className="fadedtext">팔찌 효과</p>
                                                    <ul className="list-disc pl-4">
                                                        {printEffectInTooltip(arm.tooltip).map((line, idx) => {
                                                            const effectGrade = getSmallGradeByArm(line).grade;
                                                            return (
                                                                <li key={idx} className="whitespace-pre-line text-black dark:text-white">
                                                                    {line.split(/(\+?\d+(?:\.\d+)?%?)/g).map((part, partIndex) => (
                                                                        /^\+?\d+(?:\.\d+)?%?$/.test(part) ? (
                                                                            <span key={partIndex} className={getTextColorByGrade(effectGrade)}>{part}</span>
                                                                        ) : (
                                                                            <span key={partIndex}>{part}</span>
                                                                        )
                                                                    ))}
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </div>
                                            ) : <></>}
                                            {printBooleanInTooltip(arm.tooltip) !== '' ? (
                                                <p className="mt-2 fadedtext">{printBooleanInTooltip(arm.tooltip)}</p>
                                            ) : <></>}
                                            {printArmPointInTooltip(arm.tooltip) !== '' ? (
                                                <div className="mt-2">
                                                    <p className="fadedtext">아크 패시브 포인트 효과</p>
                                                    <p className="whitespace-pre-line">{printArmPointInTooltip(arm.tooltip)}</p>
                                                </div>
                                            ) : <></>}
                                            {printArmUseInTooltip(arm.tooltip) !== '' ? (
                                                <p className="whitespace-pre-line mt-2 text-[9pt] text-blue-400 dark:text-blue-600">{printArmUseInTooltip(arm.tooltip)}</p>
                                            ) : <></>}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            ) : <></>}
                            {stone ? (
                                <Popover showArrow disableAnimation>
                                    <PopoverTrigger>
                                        <div className="group flex cursor-pointer items-center gap-2.5 rounded-xl border border-default-200/80 bg-default-50/70 p-2.5 transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/[0.035] hover:shadow-sm dark:border-white/10 dark:bg-white/[0.025] dark:hover:border-primary/40 dark:hover:bg-primary/[0.07]">
                                            <div className={`h-[48px] w-[48px] shrink-0 rounded-lg p-[3px] shadow-sm ${getBackgroundByGrade(stone.grade)}`}>
                                                <img
                                                    src={stone.icon}
                                                    alt="stone-icon"
                                                    className="h-[42px] w-[42px]"/>
                                            </div>
                                            <div className="min-w-0 grow">
                                                <div className="flex gap-1 items-center">
                                                    <p className={`${getColorTextByGrade(stone.grade)} grow truncate font-medium`}>{stone.grade} 스톤</p>
                                                </div>
                                            </div>
                                            {stone.effects.length > 0 ? (
                                                <div className="flex w-[146px] shrink-0 flex-col gap-1">
                                                    {stone.effects.filter(effect => effect.level > 0).map((effect, idx) => (
                                                        <div key={idx} className={clsx(
                                                            "flex h-7 min-w-0 items-center gap-1.5 rounded-lg border px-2 text-[11px] shadow-sm",
                                                            idx === 2
                                                                ? "border-danger/35 bg-danger/5 dark:bg-danger/[0.08]"
                                                                : "border-primary/35 bg-primary/5 dark:bg-primary/[0.08]"
                                                        )}>
                                                            <span className={clsx(
                                                                "h-1.5 w-1.5 shrink-0 rounded-full",
                                                                idx === 2 ? "bg-danger" : "bg-primary"
                                                            )}/>
                                                            <p className="min-w-0 grow truncate text-default-700 dark:text-default-300">{effect.name}</p>
                                                            <span className="shrink-0 font-semibold tabular-nums text-default-900 dark:text-white">Lv.{effect.level}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : <></>}
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className={abilityPopoverClass}>
                                        <div className="max-h-[600px] w-[340px] max-w-[calc(100vw-32px)] overflow-y-auto p-4 scrollbar-hide">
                                            <h3 className={`w-full text-center text-lg font-bold ${getColorTextByGrade(stone.grade)}`}>{stone.name}</h3>
                                            <div className="w-full flex gap-2 mt-3">
                                                <div className={`w-[55px] h-[55px] p-[5px] aspect-square rounded-md ${getBackgroundByGrade(stone.grade)}`}>
                                                    <img
                                                        src={stone.icon}
                                                        alt="detail-stone-icon"
                                                        className="w-[45px] h-[45px]"/>
                                                </div>
                                                <div className="grow">
                                                    <div className="flex gap-2">
                                                        <p className={`grow ${getColorTextByGrade(stone.grade)}`}>{getParsedText(stone.tooltip.Element_001.value.leftStr0)}</p>
                                                        <p className="fadedtext grow text-right">{getParsedText(stone.tooltip.Element_001.value.leftStr2).replaceAll('아이템 레벨 ', '')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-full flex gap-2 mt-2 text-[9pt] fadedtext">
                                                <p className="grow whitespace-pre-line">{getParsedText(stone.tooltip.Element_002.value.replaceAll("<BR>", '\r\n'))}</p>
                                                <p className="grow text-right whitespace-pre-line">{getParsedText(stone.tooltip.Element_003.value.replaceAll("|", ''))}</p>
                                            </div>
                                            {printDefaultStoneInTooltip(stone.tooltip) !== '' ? (
                                                <div className="mt-2">
                                                    <p className="fadedtext">기본 효과</p>
                                                    <p>{printDefaultStoneInTooltip(stone.tooltip)}</p>
                                                </div>
                                            ) : <></>}
                                            {printBonusStoneInTooltip(stone.tooltip) !== '' ? (
                                                <div className="mt-2">
                                                    <p className="fadedtext">기본 효과</p>
                                                    <p>{printBonusStoneInTooltip(stone.tooltip)}</p>
                                                </div>
                                            ) : <></>}
                                            {stone.effects.length > 0 ? (
                                                <div className="mt-2">
                                                    <p className="fadedtext">무작위 각인 효과</p>
                                                    <ul className="list-disc pl-4">
                                                        {stone.effects.map((effect, idx) => (
                                                            <li key={idx}>[{effect.name}] Lv.{effect.level}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : <></>}
                                            {printStoneUseInTooltip(stone.tooltip) !== '' ? (
                                                <p className="whitespace-pre-line mt-2 text-[9pt] text-blue-400 dark:text-blue-600">{printArmUseInTooltip(stone.tooltip)}</p>
                                            ) : <></>}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            ) : <></>}
                            {orb ? (
                                <div className="flex items-center gap-2.5 rounded-xl border border-default-200/80 bg-default-50/70 p-2.5 dark:border-white/10 dark:bg-white/[0.025]">
                                    <div className={`h-[48px] w-[48px] shrink-0 rounded-lg p-[3px] shadow-sm ${getBackgroundByGrade(orb.grade)}`}>
                                        <img
                                            src={orb.icon}
                                            alt="stone-icon"
                                            className="h-[42px] w-[42px]"/>
                                    </div>
                                    <div className="min-w-0 grow">
                                        <p className={`${getColorTextByGrade(orb.grade)} grow truncate font-medium`}>{orb.name}</p>
                                        <div className="text-[9pt] flex gap-1">
                                            <p className="fadedtext">{orb.grade} {orb.type}</p>
                                            <Divider orientation="vertical" className="self-stretch min-h-4 bg-black/20 dark:bg-white/20"/>
                                            <p>낙원력 : <span className="font-semibold">{orb.score.toLocaleString()}</span></p>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                            </div>
                        </CardBody>
                </Card>

                <Card fullWidth radius="lg" className={clsx(abilityCardClass, "h-full")}>
                    <CardHeader className="flex items-center justify-between px-4 py-3.5 sm:px-5">
                        <div>
                            <p className="font-semibold">장비 요약</p>
                            <p className="mt-0.5 text-[11px] text-default-500">현재 장비의 핵심 평균 지표</p>
                        </div>
                        <Chip size="sm" radius="sm" variant="flat" color="primary">한눈에 보기</Chip>
                    </CardHeader>
                    <Divider/>
                    <CardBody className="p-3 sm:p-4">
                        <div className="flex h-full flex-col justify-center gap-1.5">
                            {equipmentSummary.map((item, index) => (
                                <div key={item.label} className={clsx(
                                    "flex min-h-[39px] items-center gap-2 rounded-lg border border-default-200/70 bg-default-50/75 px-2.5 py-1.5 dark:border-white/10 dark:bg-white/[0.045]",
                                    index === 0 ? "before:bg-primary" : index === 1 ? "before:bg-warning" : index === 2 ? "before:bg-secondary" : index === 3 ? "before:bg-blue-500" : "before:bg-orange-500",
                                    "before:h-2 before:w-2 before:shrink-0 before:rounded-full before:content-['']"
                                )}>
                                    <p className="shrink-0 truncate text-xs font-medium text-default-600 dark:text-default-400" title={item.label}>{item.label}</p>
                                    <div className="grow border-b border-dotted border-default-300 dark:border-white/15" />
                                    <p className={clsx('shrink-0 text-sm font-semibold tabular-nums', item.valueClass)}>{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    )
}

// 보석 컴포넌트
function GemComponent({ info }: { info: CharacterInfo }) {
    const [attack, setAttack] = useState(0);
    const gems = info.gems;

    useEffect(() => {
        let sum = 0;
        info.gems.forEach(gem => sum += gem.attack);
        setAttack(sum);
    }, [info]);

    const attackLength = gems.filter(item => item.skillStr.includes('피해') || item.skillStr.includes('지원 효과')).length;
    const cooldownLength = gems.filter(item => item.skillStr.includes('재사용 대기시간')).length;
    const attackGems = gems
        .filter(item => item.skillStr.includes('피해') || item.skillStr.includes('지원 효과'))
        .sort((a, b) => b.level - a.level);
    const cooldownGems = gems
        .filter(item => item.skillStr.includes('재사용 대기시간'))
        .sort((a, b) => b.level - a.level);
    const emptySlotCount = Math.max(0, 11 - gems.length);
    const averageGemLevel = gems.length > 0
        ? gems.reduce((sum, gem) => sum + gem.level, 0) / gems.length
        : null;
    const renderGem = (gem: (typeof gems)[number], index: number, type: 'attack' | 'cooldown') => (
        <Popover key={`${type}-${gem.name}-${index}`} showArrow disableAnimation>
            <PopoverTrigger>
                <div className={clsx(
                    "group flex w-[58px] cursor-pointer flex-col items-center overflow-hidden rounded-xl border bg-content1 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:bg-[#18181b]",
                    type === 'attack'
                        ? "border-danger/25 hover:border-danger/55"
                        : "border-success/25 hover:border-success/55"
                )}>
                    <div className={`h-[56px] w-full overflow-hidden ${getBackgroundByGrade(gem.grade)}`}>
                        <img
                            src={gem.icon}
                            alt="detail-gem-icon"
                            className="h-full w-full object-cover"/>
                    </div>
                    <div className={clsx(
                        "flex w-full items-center justify-center px-1 py-1 text-[10px] font-semibold",
                        type === 'attack'
                            ? "bg-danger/10 text-danger-700 dark:text-danger-300"
                            : "bg-success/10 text-success-700 dark:text-success-300"
                    )}>
                        <span className="truncate">{gem.level} {getGemSimpleTailName(gem)}</span>
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent className={abilityPopoverClass}>
                <div className="max-w-[500px] p-2">
                    <p className={`w-full text-center text-lg ${getColorTextByGrade(gem.grade)}`}>{gem.name}</p>
                    <p className="mt-1 fadedtext">효과</p>
                    <p>{gem.skillStr}</p>
                    <p className="mt-2 fadedtext">추가 효과</p>
                    <p>기본 공격력 {gem.attack.toFixed(1)}%</p>
                </div>
            </PopoverContent>
        </Popover>
    );

    return (
        <Card radius="lg" className={clsx("mt-5", abilityCardClass)}>
            <CardHeader className="flex flex-col items-stretch gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
                <div className="min-w-0 grow">
                    <p className="text-lg font-semibold">보석</p>
                    <p className="mt-0.5 text-[11px] text-default-500">겁화와 작열 보석의 장착 현황</p>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                    <div className="min-w-[72px] rounded-xl bg-default-100/80 px-2.5 py-2 text-center dark:bg-white/[0.05]">
                        <p className="text-[10px] text-default-500">평균 레벨</p>
                        <p className="mt-0.5 text-sm font-semibold tabular-nums">{averageGemLevel !== null ? averageGemLevel.toFixed(1) : '-'}</p>
                    </div>
                    <div className="min-w-[72px] rounded-xl bg-default-100/80 px-2.5 py-2 text-center dark:bg-white/[0.05]">
                        <p className="text-[10px] text-default-500">보석 구성</p>
                        <p className="mt-0.5 text-sm font-semibold"><span className="text-danger">{getCountAtkGems(gems)}겁</span> <span className="text-success">{getCountDekGems(gems)}작</span></p>
                    </div>
                    <Tooltip showArrow content="기본 공격력">
                        <div className="min-w-[72px] rounded-xl bg-default-100/80 px-2.5 py-2 text-center dark:bg-white/[0.05]">
                            <p className="text-[10px] text-default-500">공격력 증가</p>
                            <p className="mt-0.5 flex items-center justify-center gap-1 text-sm font-semibold tabular-nums">
                                <AttackIcon size={11} color="currentColor" />
                                <span>{attack.toFixed(1)}%</span>
                            </p>
                        </div>
                    </Tooltip>
                </div>
            </CardHeader>
            <Divider/>
            <CardBody className="px-3 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
                <div className="overflow-x-auto pb-1 scrollbar-hide">
                    <div className="grid min-w-[760px] grid-cols-11 gap-2">
                        {attackLength > 0 ? (
                            <div
                                className="min-w-0 rounded-2xl border border-danger/25 bg-danger/[0.025] p-2.5 dark:bg-danger/[0.045]"
                                style={{ gridColumn: `span ${attackLength} / span ${attackLength}` }}>
                                <div className="mb-2 flex items-center gap-1.5">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-danger/10 text-[10px] font-bold text-danger">겁</span>
                                    <p className="text-xs font-semibold">겁화 계열</p>
                                    <span className="ml-auto rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-semibold text-danger">{attackLength}겁</span>
                                </div>
                                <div
                                    className="grid justify-items-center gap-1.5"
                                    style={{ gridTemplateColumns: `repeat(${attackLength}, minmax(0, 1fr))` }}>
                                    {attackGems.map((gem, index) => renderGem(gem, index, 'attack'))}
                                </div>
                            </div>
                        ) : null}

                        {cooldownLength > 0 ? (
                            <div
                                className="min-w-0 rounded-2xl border border-success/25 bg-success/[0.025] p-2.5 dark:bg-success/[0.045]"
                                style={{ gridColumn: `span ${cooldownLength} / span ${cooldownLength}` }}>
                                <div className="mb-2 flex items-center gap-1.5">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-success/10 text-[10px] font-bold text-success">작</span>
                                    <p className="text-xs font-semibold">작열 계열</p>
                                    <span className="ml-auto rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">{cooldownLength}작</span>
                                </div>
                                <div
                                    className="grid justify-items-center gap-1.5"
                                    style={{ gridTemplateColumns: `repeat(${cooldownLength}, minmax(0, 1fr))` }}>
                                    {cooldownGems.map((gem, index) => renderGem(gem, index, 'cooldown'))}
                                </div>
                            </div>
                        ) : null}

                        {emptySlotCount > 0 ? (
                            <div
                                className="min-w-0 rounded-2xl border border-dashed border-default-300 bg-default-50/60 p-2.5 dark:border-white/15 dark:bg-white/[0.025]"
                                style={{ gridColumn: `span ${emptySlotCount} / span ${emptySlotCount}` }}>
                                <p className="mb-2 text-[10px] font-medium text-default-500">빈 슬롯 {emptySlotCount}개</p>
                                <div
                                    className="grid justify-items-center gap-1.5"
                                    style={{ gridTemplateColumns: `repeat(${emptySlotCount}, minmax(0, 1fr))` }}>
                                    {Array.from({ length: emptySlotCount }).map((_, index) => (
                                        <div key={index} className="flex h-[76px] w-[58px] items-center justify-center rounded-xl border border-default-200 bg-default-100 text-sm text-default-400 dark:border-white/10 dark:bg-white/[0.04]">+</div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}

// 카드 컴포넌트
type CardComponentProps = {
    info: CharacterInfo,
    attackPieces: CardPiece[],
    supportorPieces: CardPiece[]
}
function CardComponent({ info, attackPieces, supportorPieces }: CardComponentProps) {
    const cards = info.card.cards;
    const cardSet = info.card.sets;
    const pieces = info.profile.characterType === 'attack' ? attackPieces : supportorPieces;

    return (
        <Card radius="lg" className={clsx("mt-5", abilityCardClass)}>
            <CardHeader className="px-5 py-4">
                <div className="w-full flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <p className="text-lg font-semibold">카드</p>
                    <div className="sm:ml-auto w-full sm:w-fit flex items-center justify-between sm:justify-start sm:gap-2 px-1.5 sm:px-0">
                        {pieces.map((piece, index) => (
                            <Fragment key={index}>
                                <div className="flex flex-col items-center">
                                    <p className="fadedtext text-[8pt]">{piece.name}</p>
                                    <p className={clsx(
                                        "text-md",
                                        piece.pieces >= 30 ? 'text-orange-700 dark:text-orange-400' : '',
                                        piece.pieces === 0 ? 'fadedtext' : ''
                                    )}>{piece.pieces > 0 ? piece.pieces : '-'}</p>
                                </div>
                                {index < pieces.length - 1 ? (
                                    <Divider orientation="vertical" className="h-8"/>
                                ) : null}
                            </Fragment>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <Divider/>
            <CardBody className="px-5 pb-5 pt-4">
                <div className="w-[800px] sm:w-full p-2 grid gap-2 grid-cols-6 overflow-x-auto sm:overflow-x-hidden scrollbar-hide">
                    {Array.from({ length: 6 }).map((_, index) => {
                        const gradeCard = getCardByIndex(cards, index) ? getColorTextByGrade(getCardByIndex(cards, index)!.grade) : '';
                        return (
                            <div key={index} className="flex flex-col justify-center items-center">
                                <div className="relative w-[110px] h-[180px]">
                                    {getCardByIndex(cards, index) ? <>
                                        <img
                                            src={getCardByIndex(cards, index)?.icon}
                                            alt="outside"
                                            className="w-full h-full absolute top-0 left-0 object-cover z-[1] [clip-path:inset(3%_0_1%_0)]"/>
                                        <img
                                            src={getUrlGemInImage(getCardByIndex(cards, index)!.count)}
                                            alt="gem"
                                            className="w-[80%] h-[20%] absolute left-1/2 bottom-[10%] -translate-x-1/2 z-[3]"/>
                                    </>: <></>}
                                    <img
                                        src={'/character/card/cardout.png'}
                                        alt="outside"
                                        className="w-full h-full absolute top-0 left-0 pointer-events-none z-[2]"/>
                                </div>
                                <Chip
                                    radius="sm"
                                    variant="flat"
                                    size="sm"
                                    className="mt-2">
                                    <p className={`${gradeCard}`}>{getCardByIndex(cards, index) ? getCardByIndex(cards, index)!.name : '-'}</p>
                                </Chip>
                            </div>
                        )
                    })}
                </div>
            </CardBody>
            <Divider/>
            <CardFooter>
                <div className="w-full max-w-full">
                    <Accordion fullWidth itemClasses={{
                        trigger: 'cursor-pointer'
                    }}>
                        <AccordionItem key={1} title={
                            <p className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full sm:max-w-[600px]">
                                {getCardSetNames(cardSet, cards)}
                            </p>}>
                            <div className="w-full">
                                <Divider className="mb-2"/>
                                {cardSet.map((sets, index) => (
                                    <div key={index} className="max-w-full mt-4">
                                        <div className="flex w-full gap-2 items-center">
                                            <p className="grow text-lg text-[#fe6e0e]">{sets.name}</p>
                                            <p>총 {getCardGems(sets, cards)}각성</p>
                                        </div>
                                        <ul className="list-disc pl-4 mt-2">
                                            {sets.items.map((item, idx) => (
                                                <li key={idx} className="w-full mb-2">
                                                    <div className="flex gap-0.5 flex-col sm:flex-row w-full sm:items-center">
                                                        <p className={clsx(
                                                            "w-full sm:w-[max-content]",
                                                            item.isEnable && item.enableCount <= getCardGems(sets, cards) ? '' : 'text-[#aaaaaa] dark:text-[#444444]'
                                                        )}>{item.name}</p>
                                                        <p className="sm:grow sm:truncate fadedtext text-left sm:text-right text-sm">{item.description}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </AccordionItem>
                    </Accordion>
                </div>
            </CardFooter>
        </Card>
    )
}

// 스택 컴포넌트
function StatComponent({ info }: { info: CharacterInfo }) {
    const stat = info.stats;
    const isMobile = useMobileQuery();
    const combatStats = [...stat]
        .filter(item => item.type !== '최대 생명력' && item.type !== '공격력')
        .sort((a, b) => b.value - a.value);
    const distributionStats = [...combatStats].reverse();

    return (
        <Card radius="lg" className={abilityCardClass}>
            <CardHeader className="flex items-center justify-between px-5 py-4">
                <div>
                    <p className="text-lg font-semibold">특성</p>
                    <p className="mt-0.5 text-[11px] text-default-500">기본 능력치와 전투 특성</p>
                </div>
            </CardHeader>
            <Divider/>
            <CardBody className="px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
                <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <Tooltip
                        showArrow
                        placement={isMobile ? 'top' : 'left'}
                        content={<div className="w-[340px] p-2">
                            <ul className="list-disc pl-4">
                                {getStatByType(stat, '공격력') ? getStatByType(stat, '공격력')?.tooltip.map((line: string, idx: number) => (
                                    <li key={idx}>{renderEffectValueText(line)}</li>
                                )) : <></>}
                            </ul>
                        </div>}>
                        <div className="relative flex min-h-[70px] w-full cursor-help items-center justify-between overflow-hidden rounded-2xl border border-rose-200/70 bg-gradient-to-br from-rose-50/90 to-white px-4 py-3 dark:border-rose-900/50 dark:from-rose-950/35 dark:to-[#18181b]">
                            <span className="absolute inset-y-0 left-0 w-1 bg-rose-500"/>
                            <div>
                                <p className="whitespace-nowrap text-[11px] font-medium text-default-500">기본 공격력</p>
                                <p className="mt-1 text-lg font-bold tabular-nums text-rose-700 dark:text-rose-300">{getStatByType(stat, '공격력') ? getStatByType(stat, '공격력')?.value.toLocaleString() : 0}</p>
                            </div>
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-300">
                                <AttackIcon size={17} color="currentColor"/>
                            </span>
                        </div>
                    </Tooltip>
                    <Tooltip
                        showArrow
                        placement={isMobile ? 'top' : 'left'}
                        content={<div className="w-[340px] p-2">
                            <ul className="list-disc pl-4">
                                {getStatByType(stat, '최대 생명력') ? getStatByType(stat, '최대 생명력')?.tooltip.map((line, idx) => (
                                    <li key={idx}>{renderEffectValueText(line)}</li>
                                )) : <></>}
                            </ul>
                        </div>}>
                        <div className="flex w-full gap-2 items-center">
                            <div className="relative flex min-h-[70px] w-full cursor-help items-center justify-between overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/90 to-white px-4 py-3 dark:border-emerald-900/50 dark:from-emerald-950/35 dark:to-[#18181b]">
                                <span className="absolute inset-y-0 left-0 w-1 bg-emerald-500"/>
                                <div>
                                    <p className="whitespace-nowrap text-[11px] font-medium text-default-500">최대 생명력</p>
                                    <p className="mt-1 text-lg font-bold tabular-nums text-emerald-700 dark:text-emerald-300">{getStatByType(stat, '최대 생명력') ? getStatByType(stat, '최대 생명력')?.value.toLocaleString() : 0}</p>
                                </div>
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-lg text-emerald-600 dark:text-emerald-300">♥</span>
                            </div>
                        </div>
                    </Tooltip>
                </div>
                <div className="mb-2 mt-4 flex items-center justify-between">
                    <p className="text-xs font-semibold text-default-600 dark:text-default-400">전투 특성</p>
                    <p className="text-[10px] text-default-400">항목을 올리면 상세 효과를 확인할 수 있습니다.</p>
                </div>
                <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
                    {combatStats.map((item, index) => (
                        <Tooltip 
                            key={index} 
                            showArrow
                            placement={isMobile ? 'top' : 'left'}
                            content={<div className="w-[340px] p-2">
                                <ul className="list-disc pl-4">
                                    {item.tooltip.map((line, idx) => (
                                        <li key={idx}>{renderEffectValueText(line)}</li>
                                    ))}
                                </ul>
                            </div>}>
                            <div className="group relative flex min-h-[46px] w-full cursor-help items-center justify-between gap-2 overflow-hidden rounded-xl border border-default-200/80 bg-default-50/70 px-3 py-2 transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.035] dark:hover:bg-white/[0.06]">
                                <div className={clsx("absolute inset-y-0 left-0 w-1", getBackgroundColorByStat(item.type))}/>
                                <div className={clsx("ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-opacity-10", getBackgroundColorByStat(item.type))}>
                                    <span className="h-2 w-2 rounded-full bg-white/90 shadow-sm"/>
                                </div>
                                <p className="min-w-0 flex-1 whitespace-nowrap text-xs font-medium text-default-600 dark:text-default-400">{item.type}</p>
                                <p className={clsx(
                                    "shrink-0 text-base font-bold tabular-nums",
                                    item.value >= 300 ? getTextColorByStat(item.type) : ""
                                )}>{item.value.toLocaleString()}</p>
                            </div>
                        </Tooltip>
                    ))}
                </div>
                <div className="mt-3 rounded-xl border border-default-200/70 bg-default-50/60 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.025]">
                    <div className="mb-2 flex items-center justify-between text-[10px] text-default-500">
                        <span>특성 분포</span>
                        <span className="tabular-nums">합계 {getSumStat(stat).toLocaleString()}</span>
                    </div>
                    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-default-200 dark:bg-white/10">
                        {distributionStats.map((item, idx) => (
                            <div key={idx} className={clsx(
                                "absolute left-0 top-0 h-full",
                                getBackgroundColorByStat(item.type)
                            )} style={{ width: `${Math.round(getWidthByStat(distributionStats, idx) / getSumStat(stat) * 1000) / 10}%` }}></div>
                        ))}
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}

// 각인 컴포넌트
function EngravingComponent({ info }: { info: CharacterInfo }) {
    const engravings = info.engravings;
    const isMobile = useMobileQuery();

    return (
        <Card radius="lg" className={clsx("mt-5", abilityCardClass)}>
            <CardHeader className="px-5 py-4">
                <div className="w-full flex gap-1 item-centers">
                    <p className="grow text-lg font-semibold">각인</p>
                    <div className="flex">
                        {engravings.sort((a, b) => b.level - a.level).map((engraving, index) => (
                            <p key={index} className={getColorTextByGrade(engraving.grade)}>{engraving.level}</p>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <Divider/>
            <CardBody className="px-3 pb-4 pt-3">
                <div>
                    {engravings.sort((a, b) => b.level - a.level).map((engraving, index) => (
                        <Tooltip 
                            key={index} 
                            showArrow
                            placement={isMobile ? 'top' : 'left'}
                            content={<div className="p-2">
                                <p className="max-w-[320px] leading-6">{renderEffectValueText(engraving.description)}</p>
                            </div>}>
                            <div className={clsx(
                                "mb-1 flex cursor-help items-center gap-2 rounded-xl px-3 py-2 transition-colors hover:bg-default-100 dark:hover:bg-white/[0.05]",
                                engraving.level >= 4 ? `${getBackgroundRightByGrade(engraving.grade)}` : ""
                            )}>
                                <img
                                    src={getEngravingSrcByName(engraving.name)}
                                    alt={engraving.name}
                                    className="w-6 h-6 rounded-md"/>
                                <p className={`grow ${getColorTextByGrade(engraving.grade)}`}>{engraving.name}</p>
                                {engraving.stoneLevel > 0 ? (
                                    <Chip size="sm" radius="sm" variant="faded" color="primary" className="min-w-[48px]">
                                        <p className="w-full text-center font-semibold">Lv.{engraving.stoneLevel}</p>
                                    </Chip>
                                ) : <></>}
                                <p className={`${getColorTextByGrade(engraving.grade)}`}>{printEngravingLevel(engraving.level)}</p>
                            </div>
                        </Tooltip>
                    ))}
                </div>
            </CardBody>
        </Card>
    )
}

// 아크 그리드
function ArkGridSimple({ info }: { info: CharacterInfo }) {
    const cores = info.arkgrid.cores;

    return (
        <Card radius="lg" shadow="sm" className={clsx("mt-5", abilityCardClass)}>
            <CardHeader className="px-5 py-4 text-lg font-semibold">아크그리드</CardHeader>
            <Divider/>
            <CardBody className="px-5 pb-5 pt-4">
                <div className="w-full flex flex-col gap-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-default-100 dark:hover:bg-white/[0.05]">
                            <div className={`w-[36px] h-[36px] p-[2px] aspect-square rounded-md ${getBackgroundByGrade(getCore(cores, index)?.grade ?? '')}`}>
                                {getCore(cores, index) ? (
                                    <img
                                        src={getCore(cores, index)?.icon ?? ''}
                                        alt="equip-icon"
                                        className="w-8 h-8"/>
                                ) : null}
                            </div>
                            <div className="grow">
                                <h3 className={`${getColorTextByGrade(getCore(cores, index)?.grade ?? '')} text-md`}>{getCore(cores, index)?.name ?? '-'}</h3>
                                <p className="fadedtext text-xs">{getCore(cores, index)?.grade ?? '-'} {getCore(cores, index) ? '아크 그리드 코어' : ''}</p>
                            </div>
                            <p className="text-md font-semibold text-orange-600 dark:text-orange-400">
                                {getCore(cores, index)?.point ?? 0}P
                            </p>
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    )
}

// 아크패시브 컴포넌트
function ArkpassiveComponent({ info }: { info: CharacterInfo }) {
    const points = info.arkpassive.points;
    const evolution = info.arkpassive.evolution;
    const enlightenment = info.arkpassive.enlightenment;
    const jump = info.arkpassive.jump;
    const isMobile = useMobileQuery();

    return (
        <Card radius="lg" shadow="sm" className={clsx("mt-5", abilityCardClass)}>
            <CardHeader className="px-5 py-4">
                <div className="w-full flex gap-3 items-center">
                    <p className="grow text-lg font-semibold">아크패시브</p>
                    {isMobile ? null : points.map((point, index) => (
                        <Progress
                            key={index}
                            label={
                                <div className="w-[178px] flex gap-1.5 items-center">
                                    <Chip 
                                        size="sm" 
                                        radius="sm" 
                                        color={getColorProgressArkpassive(point.type)}
                                        variant="flat">
                                        {point.type}
                                    </Chip>
                                    <p className={clsx(
                                        "truncate",
                                        point.description ? '' : 'fadedtext'
                                    )}>{renderArkPassiveDescription(point.description)}</p>
                                    <p className={`ml-auto font-bold ${getColorByType(point.type)}`}>{point.point}</p>
                                </div>
                            }
                            size="sm"
                            color={getColorProgressArkpassive(point.type)}
                            value={point.point}
                            maxValue={point.max}
                            className="w-[180px]"/>
                    ))}
                </div>
            </CardHeader>
            <Divider/>
            <CardBody className="px-5 pb-5 pt-4">
                {isMobile ? (
                    <div className="w-full grid grid-cols-3 gap-2 mb-2">
                        {points.map((point, index) => (
                            <div key={index} className="flex w-full flex-col items-center justify-center rounded-xl bg-default-100/70 p-2 dark:bg-white/[0.05] sm:flex-row sm:gap-4">
                                <div className="flex flex-col items-center">
                                    <p className="fadedtext text-sm">{point.type}</p>
                                    <p className={`${getColorByType(point.type)} text-2xl font-bold`}>{point.point}</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <Chip size="sm" variant="flat" className="mt-1">{point.description ? point.description : '미개방'}</Chip>
                                    <Progress
                                        size="sm"
                                        color={getColorProgressArkpassive(point.type)}
                                        value={point.point}
                                        maxValue={point.max}
                                        className="w-[70px] mt-2"/>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : null}
                <div className="w-full grid sm:grid-cols-[1fr_1px_1fr_1px_1fr] gap-2 mt-1">
                    <div className="min-w-0">
                        {evolution.length > 0 ? (
                            <Chip
                                color="warning"
                                size="md"
                                radius="sm"
                                variant="flat"
                                 className="min-w-full text-center mb-2">
                                진화
                            </Chip>
                        ) : null}
                        {evolution.map((item, index) => (
                            <Tooltip 
                                key={index} 
                                placement={isMobile ? 'bottom' : 'right'} 
                                showArrow 
                                content={<div className="p-2">
                                    <p className="max-w-[320px] leading-6">{renderEffectValueText(item.description)}</p>
                                </div>}>
                                <div className="mb-0.5 flex cursor-help items-center gap-2 rounded-xl px-2 py-1 transition-colors hover:bg-default-100 dark:hover:bg-white/[0.05]">
                                    <img
                                        src={item.icon}
                                        alt="arkpassvie-icon"
                                        className="w-6 h-6 rounded-md"/>
                                    <Chip size="sm" radius="sm" variant="flat">{item.tier}티어</Chip>
                                    <p className="text-sm shrink-0">{item.name}</p>
                                    <div className="grow border-b border-dotted border-default-300" />
                                    <p className="text-sm ml-auto font-semibold shrink-0">Lv.{item.level}</p>
                                </div>
                            </Tooltip>
                        ))}
                    </div>
                    {isMobile ? null : <Divider orientation="horizontal" className="h-full"/>}
                    <div className="min-w-0">
                        {enlightenment.length > 0 ? (
                            <Chip
                                color="primary"
                                size="md"
                                radius="sm"
                                variant="flat"
                                 className="min-w-full text-center mb-2">
                                깨달음
                            </Chip>
                        ) : null}
                        {enlightenment.map((item, index) => (
                            <Tooltip 
                                key={index} 
                                placement={isMobile ? 'bottom' : 'right'} 
                                showArrow 
                                content={<div className="p-2">
                                    <p className="max-w-[320px] leading-6">{renderEffectValueText(item.description)}</p>
                                </div>}>
                                <div className="mb-0.5 flex cursor-help items-center gap-2 rounded-xl px-2 py-1 transition-colors hover:bg-default-100 dark:hover:bg-white/[0.05]">
                                    <img
                                        src={item.icon}
                                        alt="arkpassvie-icon"
                                        className="w-6 h-6 rounded-md"/>
                                    <Chip size="sm" radius="sm" variant="flat">{item.tier}티어</Chip>
                                    <p className="text-sm shrink-0">{item.name}</p>
                                    <div className="grow border-b border-dotted border-default-300" />
                                    <p className="text-sm ml-auto font-semibold shrink-0">Lv.{item.level}</p>
                                </div>
                            </Tooltip>
                        ))}
                    </div>
                    {isMobile ? null : <Divider orientation="horizontal" className="h-full"/>}
                    <div className="min-w-0">
                        {jump.length > 0 ? (
                            <Chip
                                color="success"
                                size="md"
                                radius="sm"
                                variant="flat"
                                 className="min-w-full text-center mb-2">
                                도약
                            </Chip>
                        ) : null}
                        {jump.map((item, index) => (
                            <Tooltip 
                                key={index} 
                                placement={isMobile ? 'bottom' : 'right'} 
                                showArrow 
                                content={<div className="p-2">
                                    <p className="max-w-[320px] leading-6">{renderEffectValueText(item.description)}</p>
                                </div>}>
                                <div className="mb-0.5 flex cursor-help items-center gap-2 rounded-xl px-2 py-1 transition-colors hover:bg-default-100 dark:hover:bg-white/[0.05]">
                                    <img
                                        src={item.icon}
                                        alt="arkpassvie-icon"
                                        className="w-6 h-6 rounded-md"/>
                                    <Chip size="sm" radius="sm" variant="flat">{item.tier}티어</Chip>
                                    <p className="text-sm shrink-0">{item.name}</p>
                                    <div className="grow border-b border-dotted border-default-300" />
                                    <p className="text-sm ml-auto font-semibold shrink-0">Lv.{item.level}</p>
                                </div>
                            </Tooltip>
                        ))}
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}

// 겁색 결과가 없을 경우 표현할 컴포넌트
type NotFoundComponentProps = {
    nickname: string,
    setSearched: SetStateFn<boolean>,
    setLoading: SetStateFn<boolean>,
    setNickname: SetStateFn<string>
}
export function NotFoundComponent({ nickname, setSearched, setLoading, setNickname }: NotFoundComponentProps) {
    const [search, setSearch] = useState('');
    return (
        <div className="w-full min-h-[calc(100vh-65px)] flex justify-center items-center p-4 flex-col">
            <p className="text-4xl text-red-400">캐릭터 검색 결과 없음</p>
            <p className="text-xl mt-2 fadedtext">"{nickname}" 캐릭터 조회를 실패하였습니다.</p>
            <p className="text-md mt-5">존재하지 않는 캐릭터이거나 캐릭터 검색이 불가능한 캐릭터입니다.</p>
            <p className="text-md">캐릭터가 존재함에도 검색이 되지 않는다면 게임 내에서 한번 접속 후 다시 시도해주세요.</p>
            <div className="w-full sm:w-[400px] flex flex-col sm:flex-row gap-5 sm:gap-2 items-center mt-10">
                <Input
                    size="lg"
                    radius="sm"
                    placeholder="캐릭터명을 입력하세요."
                    maxLength={12}
                    value={search}
                    onValueChange={setSearch}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch(search, setSearched, setLoading, setNickname);
                            const params = new URLSearchParams(window.location.search);
                            params.set("nickname", search);
                            const newUrl = `${window.location.pathname}?${params.toString()}`;
                            window.history.pushState({}, "", newUrl);
                        }
                    }}
                    className="grow"/>
                <Button
                    size="lg"
                    radius="sm"
                    color="primary"
                    className="w-full sm:w-[max-content]"
                    onPress={() => handleSearch(search, setSearched, setLoading, setNickname)}>
                    검색
                </Button>
            </div>
        </div>
    )
}

// 전투 정보실 설명 컴포넌트
export function InfomationComponent() {
    return (
        <Card radius="sm" className="border-2 border-[#e7a65c] dark:border-[#946c3f] bg-[#f1e8d4] dark:bg-[#1d150b] mt-8">
            <CardBody>
                <div>
                    <h3 className="text-xl">전투 정보실은 캐릭터의 전투 정보를 검색하고 확인할 수 있습니다.</h3>
                    <ul className="list-disc pl-4 mt-2">
                        <li>검색한 캐릭터들의 장비, 특성, 전투력 등 캐릭터 정보를 확인할 수 있습니다.</li>
                        <li>로그인 하시면 내 원정대 캐릭터 정보를 바로 확인할 수 있도록 목록을 확인할 수 있습니다.</li>
                        <li>최근에 기록된 캐릭터들을 7일간 기록하여 최근에 기록한 캐릭터 정보를 다시 확인할 수 있습니다.</li>
                    </ul>
                </div>
            </CardBody>
        </Card>
    )
}
