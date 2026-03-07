import { getBackgroundByGrade, getBackgroundRightByGrade, getColorTextByGrade, SetStateFn, useMobileQuery } from "@/utiils/utils";
import { 
    Accordion,
    AccordionItem,
    Avatar,
    Button, 
    Card, CardBody, CardFooter, CardHeader, 
    Chip, 
    Divider, 
    Input, 
    Popover, PopoverContent, PopoverTrigger, 
    Progress, 
    Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, 
    Tooltip 
} from "@heroui/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Character } from "../../store/loginSlice";
import {  
    getBackgroundColorByStat, 
    getCardByIndex, 
    getCardGems, 
    getCardSetNames, 
    getColorByQuality, 
    getColorByType, 
    getColorProgressArkpassive, 
    getCountAtkGems, 
    getCountDekGems, 
    getEngravingSrcByName, 
    getGemByIndex, 
    getGemSimpleTailName, 
    getObjectByArmorType, 
    getParsedText, 
    getProgressColorByHonor, 
    getProgressMaxByHonor, 
    getProgressValueByHonor, 
    getRemainHonor, 
    getSmallGradeByAccessory, 
    getSmallGradeByArm, 
    getSrcByGrade, 
    getStatByType, 
    getSumStat, 
    getTextByGrade, 
    getTextColorByGrade, 
    getTitleData, 
    getUrlGemInImage, 
    getWidthByStat, 
    handleSearch, 
    printEngravingLevel
} from "../lib/characterFeat";
import { printBonusInTooltip, printCountInTooltip, printHighUpgradeInTooltip, printInfoInTooltip } from "../lib/equipmentPrints";
import clsx from "clsx";
import { printDefaultInTooltip, printListInTooltip, printPointInTooltip, printUseInTooltip } from "../lib/accessoryPrints";
import { printArmPointInTooltip, printArmUseInTooltip, printBooleanInTooltip, printEffectInTooltip } from "../lib/armPrints";
import { printBonusStoneInTooltip, printDefaultStoneInTooltip, printStoneUseInTooltip } from "../lib/stonePrints";
import { getImgByJob } from "../lib/expeditionFeat";
import { CharacterHistory } from "../lib/history";
import '../css/effects.css';
import VegaIcon from "@/Icons/VegaIcon";
import AttackIcon from "@/Icons/AttackIcon";
import SupportorIcon from "@/Icons/SupportorIcon";
import { CardPiece, CharacterInfo, ExpeditionCharacterInfo } from "../model/types";
import { ItemLevelIcon } from "@/Icons/ItemLevelIcon";
import { useRouter } from "next/navigation";

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
        <div className="w-full h-[300px] flex justify-center items-center flex-col">
            <h1 className="text-4xl sm:text-5xl font-bold">전투 정보실</h1>
            <h2 className="text-xl sm:text-xl mt-4">캐릭터 정보를 확인하기 위해서 캐릭터명을 입력 후 검색해주세요.</h2>
            <div className="w-full sm:w-fit flex gap-3 mt-8 flex-col sm:flex-row">
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
                    onPress={() => handleSearch(search, setSearched, setLoading, setNickname)}>
                    검색
                </Button>
                <Divider orientation={isMobile ? "horizontal" : "vertical"}/>
                <Button
                    size="lg"
                    radius="sm"
                    color="secondary"
                    className="sm:px-10"
                    variant="flat"
                    onPress={() => router.push('/character/characterlist')}>
                    원정대 모아보기
                </Button>
            </div>
        </div>
    )
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
        <div className="w-full">
            <p className="mb-4 text-2xl">최근 기록</p>
            <div className="hidden sm:block">
                <Table removeWrapper selectionMode="single" className="max-h-[700px] overflow-auto overflow-x-hidden">
                    <TableHeader>
                        <TableColumn>캐릭터명</TableColumn>
                        <TableColumn>아이템 레벨</TableColumn>
                        <TableColumn>날짜</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="최근에 검색한 캐릭터가 없습니다.">
                        {historys.map((character, index) => (
                            <TableRow 
                                key={index}
                                className="cursor-pointer"
                                onClick={() => handleSearch(character.nickname, setSearched, setLoading, setNickname)}>
                                <TableCell>
                                    <div className="w-full flex gap-4 items-center">
                                        <Avatar isBordered size="md" src={getImgByJob(character.job)}/>
                                        <div>
                                            <p className="text-lg">{character.nickname}</p>
                                            <p className="text-sm fadedtext">@{character.server} · {character.job}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{character.level}</TableCell>
                                <TableCell>{character.date.getFullYear()}-{(character.date.getMonth()+1).toString().padStart(2, '0')}-{character.date.getDate().toString().padStart(2, '0')} {character.date.getHours().toString().padStart(2, '0')}:{character.date.getMinutes().toString().padStart(2, '0')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="block sm:hidden">
                <Table removeWrapper selectionMode="single" className="max-h-[700px] overflow-auto overflow-x-hidden">
                    <TableHeader>
                        <TableColumn>캐릭터명</TableColumn>
                        <TableColumn>날짜</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="최근에 검색한 캐릭터가 없습니다.">
                        {historys.map((character, index) => (
                            <TableRow 
                                key={index}
                                className="cursor-pointer"
                                onClick={() => handleSearch(character.nickname, setSearched, setLoading, setNickname)}>
                                <TableCell>
                                    <div className="w-full flex gap-4 items-center">
                                        <Avatar isBordered size="md" src={getImgByJob(character.job)}/>
                                        <div>
                                            <p className="text-lg">{character.nickname}</p>
                                            <p className="text-sm fadedtext">@{character.server} · {character.job} · Lv.{character.level}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{character.date.getFullYear()}-{(character.date.getMonth()+1).toString().padStart(2, '0')}-{character.date.getDate().toString().padStart(2, '0')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

// 로그인된 원정대 목록 가져오기
export function ExpeditionComponent({ setSearched, setLoading, setNickname }: SearchComponentProps) {
    const expedition: Character[] = useSelector((state: RootState) => state.login.user.expedition);
    return (
        <div className="w-full">
            <p className="text-2xl mb-4">내 원정대 목록</p>
            <div className="hidden sm:block">
                <Table removeWrapper selectionMode="single" className="max-h-[700px] overflow-auto overflow-x-hidden">
                    <TableHeader>
                        <TableColumn>캐릭터명</TableColumn>
                        <TableColumn>아이템 레벨</TableColumn>
                        <TableColumn>서버</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="로그인이 되어있지 않거나 등록된 원정대 캐릭터가 없습니다.">
                        {expedition.map((character, index) => (
                            <TableRow 
                                key={index}
                                className="cursor-pointer"
                                onClick={() => handleSearch(character.nickname, setSearched, setLoading, setNickname)}>
                                <TableCell>
                                    <div className="w-full flex gap-4 items-center">
                                        <Avatar isBordered size="md" src={getImgByJob(character.job)}/>
                                        <div>
                                            <p className="text-lg">{character.nickname}</p>
                                            <p className="text-sm fadedtext">{character.job}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{character.level}</TableCell>
                                <TableCell>{character.server}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="block sm:hidden">
                <Table removeWrapper selectionMode="single" className="max-h-[700px] overflow-auto overflow-x-hidden">
                    <TableHeader>
                        <TableColumn>캐릭터명</TableColumn>
                        <TableColumn>아이템 레벨</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="로그인이 되어있지 않거나 등록된 원정대 캐릭터가 없습니다.">
                        {expedition.map((character, index) => (
                            <TableRow 
                                key={index}
                                className="cursor-pointer"
                                onClick={() => handleSearch(character.nickname, setSearched, setLoading, setNickname)}>
                                <TableCell>
                                    <div className="w-full flex gap-4 items-center">
                                        <Avatar isBordered size="md" src={getImgByJob(character.job)}/>
                                        <div>
                                            <p className="text-lg">{character.nickname}</p>
                                            <p className="text-sm fadedtext">@{character.server} · {character.job}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{character.level}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
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
                    <p className="fadedtext mt-4">{info.profile.title ? getParsedText(info.profile.title) : '-'}{info.profile.guildName !== '-' ?` · ${info.profile.guildName} 길드` : ''}</p>
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
                    <div className="flex items-center gap-2 mt-2">
                        <p className="fadedtext text-sm">전투 레벨</p>
                        <p className="text-md">{info.profile.characterLevel.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="fadedtext text-sm">원정대 레벨</p>
                        <p className="text-md">{info.profile.expeditionLevel}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="fadedtext text-sm">영지</p>
                        <p className="text-md">Lv.{info.profile.townLevel} {info.profile.townName}</p>
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
type AbilityComponentProps = {
    info: CharacterInfo, 
    titles: string[],
    attackPieces: CardPiece[],
    supportorPieces: CardPiece[]
}
export function AbilityComponent({ info, titles, attackPieces, supportorPieces }: AbilityComponentProps) {
    return (
        <div className="w-full grid grid-cols-1 md960:grid-cols-[5fr_2fr] gap-8">
            <div className="w-full">
                <div className="block sm:hidden">
                    <CombatPowerComponent info={info}/>
                </div>
                <EquipmentComponent info={info}/>
                <GemComponent info={info}/>
                <ArkpassiveComponent info={info}/>
                <CardComponent info={info} attackPieces={attackPieces} supportorPieces={supportorPieces}/>
            </div>
            <div className="w-full">
                <div className="hidden sm:block">
                    <CombatPowerComponent info={info}/>
                </div>
                <StatComponent info={info}/>
                <EngravingComponent info={info}/>
                <TitleComponent titles={titles}/>
            </div>
        </div>
    )
}

// 희귀칭호 목록
function TitleComponent({titles}: { titles: string[] }) {
    return (
        <Card fullWidth radius="sm" className="mt-8">
            <CardHeader>보유 칭호</CardHeader>
            <Divider/>
            <CardBody>
                {titles.map((title, index) => (
                    <div key={index} className="mb-2">
                        <p className={clsx(
                            'font-bold text-sm',
                            getColorTextByGrade(getTitleData(title)?.grade ?? 'default')
                        )}>{title}</p>
                        <p className="fadedtext text-[9pt]">{getTitleData(title)?.condition ?? '-'}</p>
                    </div>
                ))}
            </CardBody>
        </Card>
    )
}

// 전투력 표시 요소
function CombatPowerComponent({ info }: { info: CharacterInfo }) {
    return (
        <Card fullWidth radius="sm" className="mb-8">
            <CardHeader>
                <div className="w-full flex gap-1 items-center">
                    <p className="grow">전투력</p>
                </div>
                <Chip
                    startContent={(
                        <div>
                            <div className={clsx(
                                info.profile.characterType === 'supportor' ? 'hidden' : 'block'
                            )}><AttackIcon size={14}/></div>
                            <div className={clsx(
                                info.profile.characterType === 'supportor' ? 'block' : 'hidden'
                            )}><SupportorIcon size={14}/></div>
                        </div>
                    )}
                    variant="flat"
                    size="sm"
                    className="pl-2"
                    color={info.profile.characterType === 'supportor' ? "success" : "danger"}>
                    {info.profile.characterType === 'supportor' ? '서포터' : '딜러'}
                </Chip>
            </CardHeader>
            <Divider/>
            <CardBody>
                <div className={clsx(
                    "w-full h-[60px] relative flex flex-col items-center justify-center",
                    info.profile.characterType === 'supportor' ? "bg-radial from-[#65d87e] dark:from-[#2b6b39] via-transparent to-transparent" : "bg-radial from-[#ce8888] dark:from-[#a50e0e] via-transparent to-transparent"
                )}>
                    <p className={clsx(
                        "text-4xl font-bold",
                        info.profile.characterType === 'supportor' ? "text-[#065c1d] dark:text-[#87e09e]" : "text-[#750d0d] dark:text-[#e49e9e]"
                    )}>{info.profile.combatPower ?? '전투력 없음'}</p>
                </div>
                <Divider className="mt-2 mb-2"/>
                <div className="w-full flex gap-1 mt-2">
                    <p className="grow fadedtext">최고 전투력</p>
                    <p>{info.profile.maxCombatPower.toLocaleString()}</p>
                </div>
                <div className="w-full flex gap-1 mt-2">
                    <p className="grow fadedtext">명예 포인트</p>
                    <p>{info.profile.honorPoint.toLocaleString()}</p>
                </div>
                <Progress
                    size="sm"
                    color={getProgressColorByHonor(info.profile.honorPoint)}
                    value={getProgressValueByHonor(info.profile.honorPoint)}
                    maxValue={getProgressMaxByHonor(info.profile.honorPoint)}
                    className="w-full mt-2"/>
                <p className="fadedtext text-[8pt] mt-2">다음 명예 등급까지 <span className="text-black dark:text-white font-bold text-[9pt]">{getRemainHonor(info.profile.honorPoint)}</span> p 남음.</p>
            </CardBody>
        </Card>
    )
}

// 장비 컴포넌트 - 능력치 컴포넌트 요소
export function EquipmentComponent({ info }: { info: CharacterInfo }) {
    const isMobile = useMobileQuery();
    const arm = info.equipment.arm;
    const stone = info.equipment.stone;
    const orb = info.equipment.orb;

    return (
        <div className="w-full grid sm:grid-cols-2 gap-8">
            <Card fullWidth radius="sm">
                <CardHeader>장비</CardHeader>
                <Divider/>
                <CardBody>
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
                                    <div className="flex gap-2 mb-4 items-center cursor-pointer">
                                        <div className={`w-[46px] h-[46px] p-[3px] aspect-square rounded-md ${getBackgroundByGrade(equip.grade)}`}>
                                            <img
                                                src={equip.icon}
                                                alt="equip-icon"
                                                className="w-10 h-10"/>
                                        </div>
                                        <div className="grow truncate">
                                            <div className="flex gap-1 items-center">
                                                <p className="fadedtext text-[10pt] whitespace-nowrap w-[max-content]">{equip.type}</p>
                                                <p className={`${getColorTextByGrade(equip.grade)} grow`}>{equip.name}</p>
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                {equip.quality >= 0 ? <Chip size="sm" radius="sm" className={`${getColorByQuality(equip.quality)} text-white`}>{equip.quality}</Chip> : <></>}
                                                {equip.highUpgrade > 0 ? <Tooltip showArrow content={`상급 재련 +${equip.highUpgrade}`}>
                                                    <Chip size="sm" radius="sm" variant="flat">
                                                        <p>+{equip.highUpgrade}</p>
                                                    </Chip>
                                                </Tooltip> : <></>}
                                            </div>
                                        </div>
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="backdrop-blur-lg bg-white/70 dark:bg-[#141414]/70">
                                    <div className="w-[300px] p-3 max-h-[600px] overflow-y-auto scrollbar-hide">
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
                </CardBody>
            </Card>
            <Card fullWidth radius="sm">
                <CardHeader>악세</CardHeader>
                <Divider/>
                <CardBody>
                    <div>
                        {info.equipment.accessories.map((equip, index) => {
                            let parsedEquipment;
                            try {
                                parsedEquipment = JSON.parse(equip.tooltip);
                            } catch (err) {
                                console.error("Tooltip JSON 파싱 오류:", err);
                                return null;
                            }
                            return (
                                <Popover key={index} disableAnimation>
                                    <PopoverTrigger>
                                        <div className="flex gap-2 mb-2 items-center cursor-pointer">
                                            <div className={`w-[46px] h-[46px] p-[3px] aspect-square rounded-md ${getBackgroundByGrade(equip.grade)}`}>
                                                <img
                                                    src={equip.icon}
                                                    alt="accessories-icon"
                                                    className="w-10 h-10"/>
                                            </div>
                                            <div className="grow">
                                                <div className="flex gap-1 items-center">
                                                    <p className={`${getColorTextByGrade(equip.grade)} grow truncate`}>{equip.grade} {equip.type}</p>
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    {equip.quality >= 0 ? <Chip size="sm" radius="sm" className={`${getColorByQuality(equip.quality)} text-white`}>{equip.quality}</Chip> : <></>}
                                                    {equip.point > 0 ? <Chip size="sm" radius="sm" variant="flat" color="primary">+{equip.point}</Chip> : <></>}
                                                </div>
                                            </div>
                                            {equip.items.length > 0 ? (
                                                <div className="w-[130px] flex flex-col gap-[1px] h-full items-start">
                                                    {equip.items.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex gap-1 text-[9pt] items-center">
                                                            <img
                                                                src={getSrcByGrade(getSmallGradeByAccessory(equip.type, item).grade)}
                                                                alt={`effect-${idx}`}
                                                                className="w-4 h-4"/>
                                                            <p className={getTextColorByGrade(getSmallGradeByAccessory(equip.type, item).grade)}>{getTextByGrade(getSmallGradeByAccessory(equip.type, item).grade)}</p>
                                                            <p className={clsx(
                                                                getSmallGradeByAccessory(equip.type, item).grade === 'none' ? 'fadedtext' : ''
                                                            )}>{getSmallGradeByAccessory(equip.type, item).name}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : <></>}
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="backdrop-blur-lg bg-white/70 dark:bg-[#141414]/70">
                                        <div className="w-[300px] p-3 max-h-[600px] overflow-y-auto scrollbar-hide">
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
                                                <p className="whitespace-pre-line">{printDefaultInTooltip(parsedEquipment)}</p>
                                            </div>
                                            <div className="mt-2">
                                                <p className="fadedtext">연마 효과</p>
                                                <ul className="list-disc pl-4">
                                                    {printListInTooltip(parsedEquipment).split(/\r?\n/).map((line, idx) => (
                                                        <li key={idx}>{line}</li>
                                                    ))}
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
                        {arm ? (
                            <Popover showArrow disableAnimation>
                                <PopoverTrigger>
                                    <div className="flex gap-2 mb-2 items-center cursor-pointer">
                                        <div className={`w-[46px] h-[46px] p-[3px] aspect-square rounded-md ${getBackgroundByGrade(arm.grade)}`}>
                                            <img
                                                src={arm.icon}
                                                alt="arm-icon"
                                                className="w-10 h-10"/>
                                        </div>
                                        <div className="grow">
                                            <div className="flex gap-1 items-center">
                                                <p className={`${getColorTextByGrade(arm.grade)} grow truncate`}>{arm.grade} {arm.type}</p>
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                {arm.point > 0 ? <Chip size="sm" radius="sm" variant="flat" color="success">+{arm.point}</Chip> : <></>}
                                            </div>
                                        </div>
                                        {printEffectInTooltip(arm.tooltip).length > 0 ? (
                                            <div className="w-[130px] flex flex-col gap-[1px] h-full items-start">
                                                {printEffectInTooltip(arm.tooltip).map((item: string, idx) => (
                                                    <div key={idx} className={clsx(
                                                        "flex gap-1 text-[9pt] items-center",
                                                        getSmallGradeByArm(item).name !== 'null' ? 'block' : 'hidden'
                                                    )}>
                                                        <img
                                                            src={getSrcByGrade(getSmallGradeByArm(item).grade)}
                                                            alt={`arm-effect-${idx}`}
                                                            className="w-4 h-4"/>
                                                        <p className={getTextColorByGrade(getSmallGradeByArm(item).grade)}>{getTextByGrade(getSmallGradeByArm(item).grade)}</p>
                                                        <p className={clsx(
                                                            getSmallGradeByArm(item).grade === 'none' ? 'fadedtext' : ''
                                                        )}>{getSmallGradeByArm(item).name}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <></>}
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="backdrop-blur-lg bg-white/70 dark:bg-[#141414]/70">
                                    <div className="w-[300px] p-3 max-h-[600px] overflow-y-auto scrollbar-hide">
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
                                                    {printEffectInTooltip(arm.tooltip).map((line, idx) => (
                                                        <li key={idx} className="whitespace-pre-line">{line}</li>
                                                    ))}
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
                                    <div className="flex gap-2 mb-2 items-center cursor-pointer">
                                        <div className={`w-[46px] h-[46px] p-[3px] aspect-square rounded-md ${getBackgroundByGrade(stone.grade)}`}>
                                            <img
                                                src={stone.icon}
                                                alt="stone-icon"
                                                className="w-10 h-10"/>
                                        </div>
                                        <div className="grow">
                                            <div className="flex gap-1 items-center">
                                                <p className={`${getColorTextByGrade(stone.grade)} grow truncate`}>{stone.grade} {stone.type}</p>
                                            </div>
                                        </div>
                                        {stone.effects.length > 0 ? (
                                            <div className="flex gap-0.5 flex-col">
                                                {stone.effects.map((effect, idx) => (
                                                    <p key={idx} className={clsx(
                                                        "text-[9pt]",
                                                        idx === 2 ? 'text-red-700 dark:text-red-300' : ''
                                                    )}><strong>Lv.{effect.level}</strong> {effect.name}</p>
                                                ))}
                                            </div>
                                        ) : <></>}
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="backdrop-blur-lg bg-white/70 dark:bg-[#141414]/70">
                                    <div className="w-[300px] p-3 max-h-[600px] overflow-y-auto scrollbar-hide">
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
                            <div className="flex gap-2 mb-2 items-center">
                                <div className={`w-[46px] h-[46px] p-[3px] aspect-square rounded-md ${getBackgroundByGrade(orb.grade)}`}>
                                    <img
                                        src={orb.icon}
                                        alt="stone-icon"
                                        className="w-10 h-10"/>
                                </div>
                                <div className="grow">
                                    <p className={`${getColorTextByGrade(orb.grade)} grow truncate`}>{orb.name}</p>
                                    <p className="fadedtext text-[9pt]">{orb.grade} {orb.type}</p>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </CardBody>
            </Card>
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
    const leftSpan = Math.max(0, Math.min(11, attackLength));
    const rightSpan = Math.max(0, Math.min(11 - leftSpan, cooldownLength));

    return (
        <Card radius="sm" className="mt-8">
            <CardHeader>
                <div className="w-full flex gap-1 items-center">
                    <p className="grow text-lg">보석</p>
                    <div className="flex gap-2 items-center">
                        <p className="fadedtext text-md">{getCountAtkGems(gems)}겁 {getCountDekGems(gems)}작</p>
                        <Divider orientation="vertical" className="h-5"/>
                        <p className="fadedtext text-md">기본 공격력 : {attack.toFixed(1)}%</p>
                    </div>
                </div>
            </CardHeader>
            <Divider/>
            <CardBody>
                <div className="w-full grid grid-cols-6 sm:grid-cols-11 gap-2 pt-2">
                    {gems.filter(item => item.skillStr.includes('피해') || item.skillStr.includes('지원 효과')).sort((a, b) => b.level - a.level).map((gem, index) => (
                        <Popover key={index} showArrow disableAnimation>
                            <PopoverTrigger>
                                <div className="w-full flex justify-center">
                                    <div className="w-[46px] flex items-center justify-start flex-col cursor-pointer rounded-md bg-[#FAA0BF] dark:bg-[#610726]">
                                        <div className={`w-[46px] h-[46px] p-[1px] aspect-square rounded-md ${getBackgroundByGrade(gem.grade)}`}>
                                            <img
                                                src={gem.icon}
                                                alt="detail-gem-icon"
                                                className="w-11 h-11"/>
                                        </div>
                                        <p className="text-[8pt] py-0.5 text-[#610726] dark:text-[#F54180]">{gem.level} {getGemSimpleTailName(gem)}</p>
                                    </div>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="backdrop-blur-lg bg-white/70 dark:bg-[#141414]/70">
                                {getGemByIndex(gems, index) ? (
                                    <div className="max-w-[500px] p-2">
                                        <p className={`w-full text-center text-lg ${getColorTextByGrade(gem.grade)}`}>{gem.name}</p>
                                        <p className="mt-1 fadedtext">효과</p>
                                        <p>{gem.skillStr}</p>
                                        <p className="mt-2 fadedtext">추가 효과</p>
                                        <p>기본 공격력 {gem.attack.toFixed(1)}%</p>
                                    </div>
                                ) : <div></div>}
                            </PopoverContent>
                        </Popover>
                    ))}
                    {gems.filter(item => item.skillStr.includes('재사용 대기시간')).sort((a, b) => b.level - a.level).map((gem, index) => (
                        <Popover key={index} showArrow disableAnimation>
                            <PopoverTrigger>
                                <div className="w-full flex justify-center">
                                    <div className="w-[46px] flex items-center justify-start flex-col cursor-pointer rounded-md bg-[#A2E9C1] dark:bg-[#095028]">
                                        <div className={`w-[46px] h-[46px] p-[1px] aspect-square rounded-md ${getBackgroundByGrade(gem.grade)}`}>
                                            <img
                                                src={gem.icon}
                                                alt="detail-gem-icon"
                                                className="w-11 h-11"/>
                                        </div>
                                        <p className="text-[8pt] py-0.5 text-[#095028] dark:text-[#17C964]">{gem.level} {getGemSimpleTailName(gem)}</p>
                                    </div>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="backdrop-blur-lg bg-white/70 dark:bg-[#141414]/70">
                                {getGemByIndex(gems, index) ? (
                                    <div className="max-w-[500px] p-2">
                                        <p className={`w-full text-center text-lg ${getColorTextByGrade(gem.grade)}`}>{gem.name}</p>
                                        <p className="mt-1 fadedtext">효과</p>
                                        <p>{gem.skillStr}</p>
                                        <p className="mt-2 fadedtext">추가 효과</p>
                                        <p>기본 공격력 {gem.attack.toFixed(1)}%</p>
                                    </div>
                                ) : <div></div>}
                            </PopoverContent>
                        </Popover>
                    ))}
                    {Array.from({ length: 11-gems.length }).map((_, index) => (
                        <div key={index} className="w-full flex justify-center">
                            <div className="w-[46px] flex items-center justify-start flex-col cursor-pointer rounded-md bg-[#E4E4E7] dark:bg-[#202024]">
                            <div className={`w-[46px] h-[46px] p-[1px] aspect-square rounded-md ${getBackgroundByGrade("")}`}>
                                <></>
                            </div>
                                <p className="fadedtext text-[8pt] py-0.5">-</p>
                            </div>
                        </div>
                    ))}
                    {leftSpan > 0 ? (
                        <div 
                            className="flex items-center h-5 gap-2" 
                            style={{ gridColumn: `span ${leftSpan} / span ${leftSpan}` }}>
                            <div className="grow h-2.5 mb-2.5 border-b-1 border-l-1 border-black/25 dark:border-white/25"/>
                            <p className="fadedtext text-[10pt]">{leftSpan}겁</p>
                            <div className="grow h-2.5 mb-2.5 border-b-1 border-r-1 border-black/25 dark:border-white/25"/>
                        </div>
                    ) : null}
                    {rightSpan > 0 ? (
                        <div
                            className="flex items-center h-5 gap-1"
                            style={{ gridColumn: `span ${rightSpan} / span ${rightSpan}` }}>
                            <div className="grow h-2.5 mb-2.5 border-b-1 border-l-1 border-black/25 dark:border-white/25"/>
                            <p className="fadedtext text-[10pt]">{rightSpan}작</p>
                            <div className="grow h-2.5 mb-2.5 border-b-1 border-r-1 border-black/25 dark:border-white/25"/>
                        </div>
                    ) : null}
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
        <Card radius="sm" className="mt-8">
            <CardHeader>
                <div className="w-full flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <p className="text-lg">카드</p>
                    <div className="sm:ml-auto w-full sm:w-fit grid grid-cols-6 gap-4 items-center">
                        {pieces.map((piece, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <p className="fadedtext text-[8pt]">{piece.name}</p>
                                <p className="text-md">{piece.pieces}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <Divider/>
            <CardBody>
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
                    <Accordion fullWidth>
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

    return (
        <Card radius="sm">
            <CardHeader><p className="text-lg">특성</p></CardHeader>
            <Divider/>
            <CardBody>
                <div className="w-full grid grid-cols-2 gap-2">
                    <Tooltip
                        showArrow
                        placement={isMobile ? 'top' : 'left'}
                        content={<div className="w-[340px] p-2">
                            <ul className="list-disc pl-4">
                                {getStatByType(stat, '공격력') ? getStatByType(stat, '공격력')?.tooltip.map((line: string, idx: number) => (
                                    <li key={idx}>{line}</li>
                                )) : <></>}
                            </ul>
                        </div>}>
                        <div className="w-full flex gap-2 items-center">
                            <p className="fadedtext text-sm">공격력</p>
                            <p>{getStatByType(stat, '공격력') ? getStatByType(stat, '공격력')?.value.toLocaleString() : 0}</p>
                        </div>
                    </Tooltip>
                    <Tooltip
                        showArrow
                        placement={isMobile ? 'top' : 'left'}
                        content={<div className="w-[340px] p-2">
                            <ul className="list-disc pl-4">
                                {getStatByType(stat, '최대 생명력') ? getStatByType(stat, '최대 생명력')?.tooltip.map((line, idx) => (
                                    <li key={idx}>{line}</li>
                                )) : <></>}
                            </ul>
                        </div>}>
                        <div className="w-full flex gap-2 items-center">
                            <div className="w-full flex gap-2 items-center">
                                <p className="fadedtext text-sm">최대 생명력</p>
                                <p>{getStatByType(stat, '최대 생명력') ? getStatByType(stat, '최대 생명력')?.value.toLocaleString() : 0}</p>
                            </div>
                        </div>
                    </Tooltip>
                </div>
                <Divider className="mt-3 mb-3"/>
                <div className="w-full grid grid-cols-3 gap-1">
                    {stat.sort((a, b) => b.value - a.value).filter(item => item.type !== '최대 생명력' && item.type !== '공격력').map((item, index) => (
                        <Tooltip 
                            key={index} 
                            showArrow
                            placement={isMobile ? 'top' : 'left'}
                            content={<div className="w-[340px] p-2">
                                <ul className="list-disc pl-4">
                                    {item.tooltip.map((line, idx) => (
                                        <li key={idx}>{line}</li>
                                    ))}
                                </ul>
                            </div>}>
                            <div className="w-full flex gap-1 items-center">
                                <div className={clsx(
                                    "w-[9px] h-[9px] rounded-full",
                                    getBackgroundColorByStat(item.type)
                                )}/>
                                <p className="fadedtext text-sm mr-0.5">{item.type}</p>
                                <p className={clsx(
                                    item.value >= 300 ? 'font-bold' : ""
                                )}>{item.value}</p>
                            </div>
                        </Tooltip>
                    ))}
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full relative overflow-hidden mt-2">
                    {stat.sort((a, b) => b.value - a.value).filter(item => item.type !== '최대 생명력' && item.type !== '공격력').reverse().map((item, idx) => (
                        <div key={idx} className={clsx(
                            "absolute top-0 left-0 h-full",
                            getBackgroundColorByStat(item.type)
                        )} style={{ width: `${Math.round(getWidthByStat(stat.sort((a, b) => b.value - a.value).filter(item => item.type !== '최대 생명력' && item.type !== '공격력').reverse(), idx) / getSumStat(stat) * 1000) / 10}%` }}></div>
                    ))}
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
        <Card radius="sm" className="mt-8">
            <CardHeader>
                <div className="w-full flex gap-1 item-centers">
                    <p className="grow text-lg">각인</p>
                    <div className="flex">
                        {engravings.sort((a, b) => b.level - a.level).map((engraving, index) => (
                            <p key={index} className={getColorTextByGrade(engraving.grade)}>{engraving.level}</p>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <Divider/>
            <CardBody className="pl-1 pb-1 pr-1 pt-2">
                <div>
                    {engravings.sort((a, b) => b.level - a.level).map((engraving, index) => (
                        <Tooltip 
                            key={index} 
                            showArrow
                            placement={isMobile ? 'top' : 'left'}
                            content={<div className="p-2">
                                <p className="max-w-[320px]">{engraving.description}</p>
                            </div>}>
                            <div className={clsx(
                                "flex gap-2 mb-0.5 rounded-md pt-1 pb-1 pl-2 pr-2 items-center",
                                engraving.level >= 4 ? `${getBackgroundRightByGrade(engraving.grade)}` : ""
                            )}>
                                <img
                                    src={getEngravingSrcByName(engraving.name)}
                                    alt={engraving.name}
                                    className="w-6 h-6 rounded-md"/>
                                <p className={`grow ${getColorTextByGrade(engraving.grade)}`}>{engraving.name}</p>
                                {engraving.stoneLevel > 0 ? (
                                    <div className="flex gap-1 items-center fadedtext">
                                        <img
                                            src={'/icons/stoneicon.png'}
                                            alt="stone-icon"
                                            className="w-3 h-5"/>
                                        <p>X {engraving.stoneLevel}</p>
                                    </div>
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

// 아크패시브 컴포넌트
function ArkpassiveComponent({ info }: { info: CharacterInfo }) {
    const points = info.arkpassive.points;
    const evolution = info.arkpassive.evolution;
    const enlightenment = info.arkpassive.enlightenment;
    const jump = info.arkpassive.jump;
    const isMobile = useMobileQuery();

    return (
        <Card radius="sm" className="mt-8">
            <CardHeader>
                <div className="w-full flex gap-3">
                    <p className="grow text-lg">아크패시브</p>
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
                                    )}>{point.description ? point.description : '미개방'}</p>
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
            <CardBody>
                {isMobile ? (
                    <div className="w-full grid grid-cols-3 gap-2 mb-2">
                        {points.map((point, index) => (
                            <div key={index} className="w-full flex flex-col sm:flex-row sm:gap-4 items-center justify-center">
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
                <div className="w-full grid sm:grid-cols-[1fr_1px_1fr_1px_1fr] gap-3 mt-1">
                    <div>
                        <Chip
                            color="warning"
                            size="md"
                            radius="sm"
                            variant="flat"
                            className={clsx(
                                "min-w-full text-center mb-4",
                                evolution.length > 0 ? 'flex' : 'hidden'
                            )}>
                            진화
                        </Chip>
                        {evolution.map((item, index) => (
                            <Tooltip 
                                key={index} 
                                placement={isMobile ? 'bottom' : 'left'} 
                                showArrow 
                                content={<div className="p-2">
                                    <p className="max-w-[320px]">{item.description}</p>
                                </div>}>
                                <div className="flex gap-2 mb-2 items-center">
                                    <img
                                        src={item.icon}
                                        alt="arkpassvie-icon"
                                        className="w-6 h-6 rounded-md"/>
                                    <Chip size="sm" radius="sm" variant="flat">T{item.tier}</Chip>
                                    <p className="text-sm">Lv.{item.level}</p>
                                    <p className="grow text-sm">{item.name}</p>
                                </div>
                            </Tooltip>
                        ))}
                    </div>
                    {isMobile ? null : <Divider orientation="horizontal" className="h-full"/>}
                    <div>
                        <Chip
                            color="primary"
                            size="md"
                            radius="sm"
                            variant="flat"
                            className={clsx(
                                "min-w-full text-center mb-4",
                                enlightenment.length > 0 ? 'flex' : 'hidden'
                            )}>
                            깨달음
                        </Chip>
                        {enlightenment.map((item, index) => (
                            <Tooltip 
                                key={index} 
                                placement={isMobile ? 'bottom' : 'left'} 
                                showArrow 
                                content={<div className="p-2">
                                    <p className="max-w-[320px]">{item.description}</p>
                                </div>}>
                                <div className="flex gap-2 mb-2 items-center">
                                    <img
                                        src={item.icon}
                                        alt="arkpassvie-icon"
                                        className="w-6 h-6 rounded-md"/>
                                    <Chip size="sm" radius="sm" variant="flat">T{item.tier}</Chip>
                                    <p className="text-sm">Lv.{item.level}</p>
                                    <p className="grow text-sm">{item.name}</p>
                                </div>
                            </Tooltip>
                        ))}
                    </div>
                    {isMobile ? null : <Divider orientation="horizontal" className="h-full"/>}
                    <div>
                        <Chip
                            color="success"
                            size="md"
                            radius="sm"
                            variant="flat"
                            className={clsx(
                                "min-w-full text-center mb-4",
                                jump.length > 0 ? 'flex' : 'hidden'
                            )}>
                            도약
                        </Chip>
                        {jump.map((item, index) => (
                            <Tooltip 
                                key={index} 
                                placement={isMobile ? 'bottom' : 'left'} 
                                showArrow 
                                content={<div className="p-2">
                                    <p className="max-w-[320px]">{item.description}</p>
                                </div>}>
                                <div className="flex gap-2 mb-2 items-center">
                                    <img
                                        src={item.icon}
                                        alt="arkpassvie-icon"
                                        className="w-6 h-6 rounded-md"/>
                                    <Chip size="sm" radius="sm" variant="flat">T{item.tier}</Chip>
                                    <p className="text-sm">Lv.{item.level}</p>
                                    <p className="grow text-sm">{item.name}</p>
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
