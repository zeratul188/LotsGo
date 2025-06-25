import { getBackgroundByGrade, getBackgroundRightByGrade, getColorTextByGrade, SetStateFn, useMobileQuery } from "@/utiils/utils";
import { 
    Accordion,
    AccordionItem,
    Avatar,
    Button, 
    Card, CardBody, CardFooter, CardHeader, 
    Chip, 
    Divider, 
    Image, 
    Input, 
    Popover, PopoverContent, PopoverTrigger, 
    Progress, 
    Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, 
    Tooltip 
} from "@heroui/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { Character } from "../store/loginSlice";
import { 
    Accessory, 
    applyAccessories, 
    applyArmData, 
    applyColorElixir, 
    applyEquipment, 
    applyStoneData, 
    ArkpassiveItem, 
    ArkpassivePoint, 
    Arm, 
    CardData, 
    CardSet, 
    CharacterFile, 
    CharacterInfo, 
    Engraving, 
    Equipment, 
    Gem, 
    getAllElixir, 
    getAllPower, 
    getBgColorByGrade, 
    getCardByIndex, 
    getCardGems, 
    getCardSetNames, 
    getColorByQuality, 
    getColorByType, 
    getColorProgressArkpassive, 
    getCountAtkGems, 
    getCountDekGems, 
    getGemByIndex, 
    getGemSimpleTailName, 
    getHighStats, 
    getLowStats, 
    getObjectByArmorType, 
    getParsedText, 
    getSmallGradeByAccessory, 
    getStatByType, 
    getSumStat, 
    getTextByGrade, 
    getTextColorByGrade, 
    getUrlGemInImage, 
    handleSearch, 
    loadArkpassive, 
    loadCards, 
    loadEngraving, 
    loadGems, 
    loadStats, 
    Stat, 
    Stone 
} from "./characterFeat";
import PowerIcon from "@/Icons/PowerIcon";
import { printAllElixirInTooltip, printBonusInTooltip, printCountInTooltip, printElixirInTooltip, printHighUpgradeInTooltip, printInfoInTooltip, printPowerInTooltip } from "./equipmentPrints";
import clsx from "clsx";
import { printDefaultInTooltip, printListInTooltip, printPointInTooltip, printUseInTooltip } from "./accessoryPrints";
import { printArmPointInTooltip, printArmUseInTooltip, printBooleanInTooltip, printEffectInTooltip } from "./armPrints";
import { printBonusStoneInTooltip, printDefaultStoneInTooltip, printStoneUseInTooltip } from "./stonePrints";
import PotionIcon from "@/Icons/PosionIcon";
import { getImgByJob } from "./expeditionFeat";
import { CharacterHistory } from "./history";
import './effects.css';
import VegaIcon from "@/Icons/VegaIcon";

// state 관리
export function useCharacterForm() {
    const [isLoading, setLoading] = useState(false);
    const [isSearched, setSearched] = useState(false);
    const [nickname, setNickname] = useState('');
    const [file, setFile] = useState<CharacterFile>({
        profile: null,
        equipment: null,
        gem: null,
        cards: null,
        stats: null,
        engraving: null,
        arkpassive: null,
        skills: null,
        collects: null,
        avatars: null
    });
    const [isNothing, setNothing] = useState(false);
    const [gems, setGems] = useState<Gem[]>([]);
    const [isDisable, setDisable] = useState(false);
    const [isLoadingUpdate, setLoadingUpdate] = useState(false);
    const [expeditions, setExpeditions] = useState<CharacterInfo[]>([]);
    const [isBadge, setBadge] = useState(false);

    return {
        isLoading, setLoading,
        isSearched, setSearched,
        nickname, setNickname,
        file, setFile,
        isNothing, setNothing,
        gems, setGems,
        isDisable, setDisable,
        isLoadingUpdate, setLoadingUpdate,
        expeditions, setExpeditions,
        isBadge, setBadge
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
    return (
        <div className="w-full h-[300px] flex justify-center items-center flex-col">
            <h1 className="text-4xl sm:text-5xl font-bold">전투 정보실</h1>
            <h2 className="text-xl sm:text-2xl mt-4">캐릭터명을 입력 후 검색해주세요.</h2>
            <div className="w-full sm:w-[500px] flex gap-3 mt-8 flex-col sm:flex-row">
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
            <p className="mb-4 text-2xl">내 원정대 목록</p>
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
type ProfileComponentProps = {
    file: CharacterFile
}
type NewProfileComponentProps = {
    file: CharacterFile,
    isBadge: boolean
}
export function ProfileComponent({ file, isBadge }: NewProfileComponentProps) {
    const profile = file.profile;
    const isMobile = useMobileQuery();
    return (
        <div className="w-full h-[max-content] sm:h-[300px] border-b-1 border-[#dddddd] dark:border-[#333333] bg-[#F6F6F6] dark:bg-[#111111]">
            <div className="w-full max-w-[1280px] mx-auto flex flex-col-reverse sm:flex-row relative">
                <div className="p-5 h-full hidden sm:flex flex-col">
                    <div className="flex gap-2">
                        <Chip color="secondary" variant="solid" radius="sm">{profile.ServerName}</Chip>
                        <Chip color="warning" variant="solid" radius="sm">{profile.CharacterClassName}</Chip>
                    </div>
                    <p className="fadedtext mt-4">{profile.Title ? profile.Title : '-'}{profile.GuildName ?` · ${profile.GuildName} 길드` : ''}</p>
                    {isBadge ? (
                        <div className="flex gap-2 items-center">
                            <div className="tag-container">
                                <div className="flex">
                                    <span className="battletag">{profile.CharacterName}</span>
                                    <div className="empty-box"></div>
                                </div>
                                <span className="tail-wrapper">
                                    <span className="tail-box"></span>
                                </span>
                            </div>
                            <Tooltip showArrow content="후원자 뱃지"><div className="w-8 h-8"><VegaIcon/></div></Tooltip>
                        </div>
                    ) : <p className="text-2xl font-bold">{profile.CharacterName}</p>}
                    <div className="grow flex flex-col sm:flex-row items-end gap-2 mt-4">
                        <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div>
                                <p className="fadedtext text-sm">아이템 레벨</p>
                                <p className="text-lg">{profile.ItemAvgLevel}</p>
                            </div>
                            <div>
                                <p className="fadedtext text-sm">전투 레벨</p>
                                <p className="text-lg">{profile.CharacterLevel}</p>
                            </div>
                            <div>
                                <p className="fadedtext text-sm">원정대 레벨</p>
                                <p className="text-lg">{profile.ExpeditionLevel}</p>
                            </div>
                            <div>
                                <p className="fadedtext text-sm">PvP</p>
                                <p className="text-lg">{profile.PvpGradeName}</p>
                            </div>
                            <div className="col-span-1 sm:col-span-2">
                                <p className="fadedtext text-sm">영지</p>
                                <p className="text-lg">Lv.{profile.TownLevel} {profile.TownName}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex sm:hidden p-5 flex-col z-1 h-[300px] bg-gradient-to-r from-[#15181d] via-[#15181d]/25 to-transparent">
                    <div className="flex gap-2">
                        <Chip color="secondary" variant="solid" radius="sm">{profile.ServerName}</Chip>
                        <Chip color="warning" variant="solid" radius="sm">{profile.CharacterClassName}</Chip>
                    </div>
                    <p className="text-[#dddddd] text-sm mt-4">{profile.Title ? profile.Title : '-'}{profile.GuildName ?` · ${profile.GuildName} 길드` : ''}</p>
                    {isBadge ? (
                        <div className="flex gap-2 items-center">
                            <div className="tag-container-mobile mt-2">
                                <div className="flex">
                                    <span className="battletag">{profile.CharacterName}</span>
                                    <div className="empty-box-mobile"></div>
                                </div>
                                <span className="tail-wrapper">
                                    <span className="tail-box-mobile"></span>
                                </span>
                            </div>
                            <Tooltip showArrow content="후원자 뱃지"><div className="w-6 h-6"><VegaIcon/></div></Tooltip>
                        </div>
                    ) : <p className="text-xl font-bold text-white">{profile.CharacterName}</p>}
                    <div className="grow grid grid-cols-[75px_1fr] mt-5">
                        <p className="fadedtext text-sm">아이템 레벨</p>
                        <p className="text-sm text-white">{profile.ItemAvgLevel}</p>
                        <p className="fadedtext text-sm">전투 레벨</p>
                        <p className="text-sm text-white">{profile.CharacterLevel}</p>
                        <p className="fadedtext text-sm">원정대 레벨</p>
                        <p className="text-sm text-white">{profile.ExpeditionLevel}</p>
                        <p className="fadedtext text-sm">PvP</p>
                        <p className="text-sm text-white">{profile.PvpGradeName}</p>
                        <p className="fadedtext text-sm">영지</p>
                        <p className="text-sm text-white">Lv.{profile.TownLevel} {profile.TownName}</p>
                    </div>
                </div>
                <div className="grow hidden sm:block"/>
                <div className="absolute sm:static top-0 left-0 z-0 bg-[#15181d] sm:bg-transparent w-[100vw] sm:w-[440px] h-full sm:h-[300px] overflow-hidden sm:[mask-image:linear-gradient(to_right,transparent,black,black,black)] lg1280:[mask-image:linear-gradient(to_right,transparent,black,black,transparent)]">
                    <img
                        src={file.profile.CharacterImage}
                        alt="character-image"
                        className={clsx(
                            "w-[100vw] h-[500px] object-cover scale-130 origin-top",
                            isMobile ? "translate-x-[20%]" : "",
                            upperClass.includes(profile.CharacterClassName) ? "translate-y-[-28%]" : "translate-y-[-13%]"
                        )}/>
                </div>
            </div>
        </div>
    )
}

// 능력치 컴포넌트
type AbilityComponentProps = {
    file: CharacterFile,
    gems: Gem[],
    setGems: SetStateFn<Gem[]>
}
export function AbilityComponent({ file, gems, setGems }: AbilityComponentProps) {
    return (
        <div className="w-full grid grid-cols-1 md960:grid-cols-[5fr_2fr] gap-8">
            <div className="w-full">
                <EquipmentComponent file={file}/>
                <GemComponent file={file} gems={gems} setGems={setGems}/>
                <CardComponent file={file}/>
            </div>
            <div className="w-full">
                <StatComponent file={file}/>
                <EngravingComponent file={file}/>
                <ArkpassiveComponent file={file}/>
            </div>
        </div>
    )
}

// 장비 컴포넌트 - 능력치 컴포넌트 요소
export function EquipmentComponent({ file }: ProfileComponentProps) {
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [accessories, setAccessories] = useState<Accessory[]>([]);
    const [arm, setArm] = useState<Arm | null>(null);
    const [stone, setStone] = useState<Stone | null>(null);
    const equipment = file.equipment;
    const isMobile = useMobileQuery();

    useEffect(() => {
        applyEquipment(equipment, setEquipments);
        applyAccessories(equipment, setAccessories);
        applyArmData(equipment, setArm);
        applyStoneData(equipment, setStone);
    }, []);

    return (
        <Card fullWidth radius="sm">
            <CardHeader>장비</CardHeader>
            <Divider/>
            <CardBody>
                <div className="w-full grid grid-cols-1 sm:grid-cols-[3fr_1px_2fr] gap-2">
                    <div>
                        {equipments.map((equip, index) => {
                            let parsedEquipment;
                            try {
                                parsedEquipment = JSON.parse(getObjectByArmorType(equipment, equip.type).Tooltip)
                            } catch (err) {
                                console.error("Tooltip JSON 파싱 오류:", err);
                                return null;
                            }
                            return (
                                <Popover key={index} showArrow disableAnimation>
                                    <PopoverTrigger>
                                        <div className="flex gap-2 mb-4 items-center cursor-pointer">
                                            <div className={`w-[46px] h-[46px] p-[3px] aspect-square rounded-md ${getBackgroundByGrade(equip.grade)}`}>
                                                <Image
                                                    src={equip.icon}
                                                    width={40}
                                                    height={40}/>
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
                                                    {equip.power > 0 ? <Chip size="sm" radius="sm" variant="flat" startContent={<div className="w-[16px] h-[16px]"><PowerIcon/></div>}>
                                                        {equip.power}
                                                    </Chip> : <></>}
                                                </div>
                                            </div>
                                            {equip.elixirs ? <div className="w-[110px] sm:w-[140px] flex flex-col gap-1 h-full items-start">
                                                {equip.elixirs.map((elixir, index) => (
                                                    <Tooltip key={index} showArrow content={<p className="max-w-[280px] whitespace-pre-line">{elixir.tooltip}</p>}>
                                                        <Chip size="sm" variant="flat" radius="sm" color={applyColorElixir(elixir.level)}>
                                                            Lv.{elixir.level} {elixir.name}
                                                        </Chip>
                                                    </Tooltip>
                                                ))}
                                            </div> : <></>}
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="backdrop-blur-lg bg-white/70 dark:bg-[#141414]/70">
                                        <div className="w-[300px] p-3 max-h-[600px] overflow-y-auto scrollbar-hide">
                                            <h3 className={`w-full text-center text-lg font-bold ${getColorTextByGrade(equip.grade)}`}>{equip.name}</h3>
                                            <div className="w-full flex gap-2 mt-3">
                                                <div className={`w-[55px] h-[55px] p-[5px] aspect-square rounded-md ${getBackgroundByGrade(equip.grade)}`}>
                                                    <Image
                                                        src={equip.icon}
                                                        width={45}
                                                        height={45}/>
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
                                            {equip.power > 0 && printPowerInTooltip(parsedEquipment) ? (<div className="mt-2">
                                                <div className="flex gap-1">
                                                    <div className="w-4 h-4"><PowerIcon/></div>
                                                    <p className="font-bold text-[#bb662d] dark:text-[#ee9d67]">{printPowerInTooltip(parsedEquipment)?.topStr}</p>
                                                </div>
                                                <p>{printPowerInTooltip(parsedEquipment)?.stat}</p>
                                                <div className="mt-1">
                                                    <div className="inline">
                                                        <p className={clsx(
                                                            equip.power >= 5 ? '' : 'text-[#bbbbbb] dark:text-[#444444]'
                                                        )}>
                                                            <span className="w-[14px] h-[14px] inline-block mr-1"><PowerIcon/></span>
                                                            {printPowerInTooltip(parsedEquipment)?.line1}
                                                        </p>
                                                    </div>
                                                    <div className="inline">
                                                        <p className={clsx(
                                                            equip.power >= 10 ? '' : 'text-[#bbbbbb] dark:text-[#444444]'
                                                        )}>
                                                            <span className="w-[14px] h-[14px] inline-block mr-1"><PowerIcon/></span>
                                                            {printPowerInTooltip(parsedEquipment)?.line2}
                                                        </p>
                                                    </div>
                                                    <div className="inline">
                                                        <p className={clsx(
                                                            equip.power >= 15 ? '' : 'text-[#bbbbbb] dark:text-[#444444]'
                                                        )}>
                                                            <span className="w-[14px] h-[14px] inline-block mr-1"><PowerIcon/></span>
                                                            {printPowerInTooltip(parsedEquipment)?.line3}
                                                        </p>
                                                    </div>
                                                    <div className="inline">
                                                        <p className={clsx(
                                                            equip.power >= 20 ? '' : 'text-[#bbbbbb] dark:text-[#444444]'
                                                        )}>
                                                            <span className="w-[14px] h-[14px] inline-block mr-1"><PowerIcon/></span>
                                                            {printPowerInTooltip(parsedEquipment)?.line4}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>) : <></>}
                                            {printElixirInTooltip(parsedEquipment) ? (
                                                <div className="mt-2">
                                                    <p className="font-bold">{printElixirInTooltip(parsedEquipment)?.topStr.replaceAll('[엘릭서]', '[엘릭서] ')}</p>
                                                    <ul className="list-disc pl-3">
                                                        <li className="whitespace-pre-line">
                                                            {printElixirInTooltip(parsedEquipment)?.line1.split(/\r?\n/).map((line, i) => (
                                                                <p key={i} className={i === 0 ? '' : 'fadedtext'}>{line}</p>
                                                            ))}
                                                        </li>
                                                        <li className="whitespace-pre-line">
                                                            {printElixirInTooltip(parsedEquipment)?.line2.split(/\r?\n/).map((line, i) => (
                                                                <p key={i} className={i === 0 ? '' : 'fadedtext'}>{line}</p>
                                                            ))}
                                                        </li>
                                                    </ul>
                                                </div>
                                            ) : <></>}
                                            {printAllElixirInTooltip(parsedEquipment) ? (
                                                <div className="mt-2">
                                                    <p className="font-bold">{printAllElixirInTooltip(parsedEquipment)?.topStr.replaceAll('연성 추가 효과', '연성 추가 효과 - ')}</p>
                                                    <ul className="list-disc pl-3">
                                                        <li className="whitespace-pre-line">
                                                            {printAllElixirInTooltip(parsedEquipment)?.line1.split(/\r?\n/).map((line, i) => (
                                                                <p key={i} className={i === 0 ? '' : 'fadedtext'}>{line}</p>
                                                            ))}
                                                        </li>
                                                        <li className="whitespace-pre-line">
                                                            {printAllElixirInTooltip(parsedEquipment)?.line2.split(/\r?\n/).map((line, i) => (
                                                                <p key={i} className={i === 0 ? '' : 'fadedtext'}>{line}</p>
                                                            ))}
                                                        </li>
                                                    </ul>
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
                        <div className="grid grid-cols-[1fr_2fr] sm:grid-cols-2 gap-2 mt-4">
                            {getAllPower(equipments) > 0 ? (
                                <Card radius="sm" className="grow">
                                    <CardBody className="pl-2 pr-2 pt-1 pb-1">
                                        <div className="w-full flex gap-3 items-center">
                                            <div className="w-8 h-8"><PowerIcon/></div>
                                            <div>
                                                <p className="fadedtext text-[9pt]">초월 총합</p>
                                                <p className="text-lg font-bold">{getAllPower(equipments)}</p>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            ) : <></>}
                            {getAllElixir(equipments) > 0 ? (
                                <Card radius="sm" className="grow">
                                    <CardBody className="pl-2 pr-2 pt-1 pb-1">
                                        <div className="w-full flex gap-3 items-center">
                                            <div className="w-8 h-8"><PotionIcon/></div>
                                            <div className="grow">
                                                <p className="fadedtext text-[9pt]">엘릭서 총합</p>
                                                <p className="text-lg font-bold">Lv.{getAllElixir(equipments)}</p>
                                            </div>
                                            <Popover showArrow disableAnimation>
                                                <PopoverTrigger>
                                                    <Button size="sm" variant="flat">자세히 보기</Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="backdrop-blur-lg bg-white/70 dark:bg-[#141414]/70">
                                                    <div className="w-[320px] p-2">
                                                        <p className="text-lg">엘릭서 정보</p>
                                                        <Divider className="mt-1 mb-2"/>
                                                        {equipments.filter(equipment => equipment.elixirs ? equipment.elixirs.length > 0 : false).map((equipment, index) => (
                                                            <div key={index} className="mb-2 grid grid-cols-[max-content_1fr_1fr] gap-3 items-center">
                                                                <Chip size="sm" variant="flat" radius="sm">{equipment.type}</Chip>
                                                                {equipment.elixirs?.map((elixir, idx) => (
                                                                    <p key={idx}>Lv.{elixir.level} {elixir.name}</p>
                                                                ))}
                                                            </div>
                                                        ))}
                                                        <Divider className="mt-1 mb-2"/>
                                                        {printAllElixirInTooltip(JSON.parse(getObjectByArmorType(equipment, "투구").Tooltip)) ? (
                                                            <div className="mt-2">
                                                                <p className="font-bold text-[#fe6e0e]">{printAllElixirInTooltip(JSON.parse(getObjectByArmorType(equipment, "투구").Tooltip))?.topStr.replaceAll('연성 추가 효과', '연성 추가 효과 - ')}</p>
                                                                <ul className="list-disc pl-4">
                                                                    <li className="whitespace-pre-line">
                                                                        {printAllElixirInTooltip(JSON.parse(getObjectByArmorType(equipment, "투구").Tooltip))?.line1.split(/\r?\n/).map((line, i) => (
                                                                            <p key={i} className={i === 0 ? '' : 'fadedtext'}>{line}</p>
                                                                        ))}
                                                                    </li>
                                                                    <li className="whitespace-pre-line">
                                                                        {printAllElixirInTooltip(JSON.parse(getObjectByArmorType(equipment, "투구").Tooltip))?.line2.split(/\r?\n/).map((line, i) => (
                                                                            <p key={i} className={i === 0 ? '' : 'fadedtext'}>{line}</p>
                                                                        ))}
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        ) : <></>}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </CardBody>
                                </Card>
                            ) : <></>}
                        </div>
                    </div>
                    <Divider orientation={isMobile ? 'horizontal' : 'vertical'}/>
                    <div>
                        {accessories.map((equip, index) => {
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
                                                <Image
                                                    src={equip.icon}
                                                    width={40}
                                                    height={40}/>
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
                                                <div className="w-[100px] flex flex-col gap-[1px] h-full items-start">
                                                    {equip.items.map((item, idx) => (
                                                        <div key={idx} className="flex gap-1 text-[9pt] items-center">
                                                            <div className={`${getBgColorByGrade(getSmallGradeByAccessory(equip.type, item).grade)} w-2 h-2 rounded-full`}/>
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
                                                    <Image
                                                        src={equip.icon}
                                                        width={45}
                                                        height={45}/>
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
                                            <Image
                                                src={arm.icon}
                                                width={40}
                                                height={40}/>
                                        </div>
                                        <div className="grow">
                                            <div className="flex gap-1 items-center">
                                                <p className={`${getColorTextByGrade(arm.grade)} grow truncate`}>{arm.grade} {arm.type}</p>
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                {arm.point > 0 ? <Chip size="sm" radius="sm" variant="flat" color="success">+{arm.point}</Chip> : <></>}
                                            </div>
                                        </div>
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="backdrop-blur-lg bg-white/70 dark:bg-[#141414]/70">
                                    <div className="w-[300px] p-3 max-h-[600px] overflow-y-auto scrollbar-hide">
                                        <h3 className={`w-full text-center text-lg font-bold ${getColorTextByGrade(arm.grade)}`}>{arm.name}</h3>
                                        <div className="w-full flex gap-2 mt-3">
                                            <div className={`w-[55px] h-[55px] p-[5px] aspect-square rounded-md ${getBackgroundByGrade(arm.grade)}`}>
                                                <Image
                                                    src={arm.icon}
                                                    width={45}
                                                    height={45}/>
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
                                                        <li key={idx}>{line}</li>
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
                                            <Image
                                                src={stone.icon}
                                                width={40}
                                                height={40}/>
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
                                                <Image
                                                    src={stone.icon}
                                                    width={45}
                                                    height={45}/>
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
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}

// 보석 컴포넌트
function GemComponent({ file, gems, setGems }: AbilityComponentProps) {
    const [attack, setAttack] = useState(0);

    useEffect(() => {
        if (file.gem) {
            loadGems(file.gem, setGems, setAttack);
        }
    }, [file.gem]);

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
                <div className="w-full grid grid-cols-6 sm:grid-cols-11 gap-2 pt-2 pb-2">
                    {gems.filter(item => item.skillStr.includes('피해') || item.skillStr.includes('지원 효과')).sort((a, b) => b.level - a.level).map((gem, index) => (
                        <Popover key={index} showArrow disableAnimation>
                            <PopoverTrigger>
                                <div className="w-full flex items-center justify-center flex-col cursor-pointer">
                                    <div className={`w-[46px] h-[46px] p-[1px] aspect-square rounded-md ${getBackgroundByGrade(gem.grade)}`}>
                                        <Image
                                            src={gem.icon}
                                            width={44}
                                            height={44}/>
                                    </div>
                                    <Chip
                                        size="sm"
                                        radius="sm"
                                        variant="flat"
                                        className="mt-2">
                                        {gem.level} {getGemSimpleTailName(gem)}
                                    </Chip>
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
                                <div className="w-full flex items-center justify-center flex-col cursor-pointer">
                                    <div className={`w-[46px] h-[46px] p-[1px] aspect-square rounded-md ${getBackgroundByGrade(gem.grade)}`}>
                                        <Image
                                            src={gem.icon}
                                            width={44}
                                            height={44}/>
                                    </div>
                                    <Chip
                                        size="sm"
                                        radius="sm"
                                        variant="flat"
                                        className="mt-2">
                                        {gem.level} {getGemSimpleTailName(gem)}
                                    </Chip>
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
                        <div key={index} className="w-full flex items-center justify-center flex-col cursor-pointer">
                            <div className={`w-[46px] h-[46px] p-[1px] aspect-square rounded-md ${getBackgroundByGrade("")}`}>
                                <></>
                            </div>
                            <Chip
                                size="sm"
                                radius="sm"
                                variant="flat"
                                className="mt-2">
                                -
                            </Chip>
                        </div>
                    ))}
                    <Chip 
                        radius="sm"
                        color="danger"
                        variant="flat"
                        className={clsx(
                            `min-w-full text-center`,
                            gems.filter(item => item.skillStr.includes('피해') || item.skillStr.includes('지원 효과')).length !== 0 ? 'hidden sm:flex' : 'hidden',
                            {
                                'col-span-1': gems.filter(item => item.skillStr.includes('피해') || item.skillStr.includes('지원 효과')).length === 1,
                                'col-span-2': gems.filter(item => item.skillStr.includes('피해') || item.skillStr.includes('지원 효과')).length === 2,
                                'col-span-3': gems.filter(item => item.skillStr.includes('피해') || item.skillStr.includes('지원 효과')).length === 3,
                                'col-span-4': gems.filter(item => item.skillStr.includes('피해') || item.skillStr.includes('지원 효과')).length === 4,
                                'col-span-5': gems.filter(item => item.skillStr.includes('피해') || item.skillStr.includes('지원 효과')).length === 5,
                                'col-span-6': gems.filter(item => item.skillStr.includes('피해') || item.skillStr.includes('지원 효과')).length === 6,
                                'col-span-7': gems.filter(item => item.skillStr.includes('피해') || item.skillStr.includes('지원 효과')).length === 7,
                                'col-span-8': gems.filter(item => item.skillStr.includes('피해') || item.skillStr.includes('지원 효과')).length === 8,
                                'col-span-9': gems.filter(item => item.skillStr.includes('피해') || item.skillStr.includes('지원 효과')).length === 9,
                                'col-span-10': gems.filter(item => item.skillStr.includes('피해') || item.skillStr.includes('지원 효과')).length === 10,
                                'col-span-11': gems.filter(item => item.skillStr.includes('피해') || item.skillStr.includes('지원 효과')).length === 11
                            }
                        )}>
                        겁화
                    </Chip>
                    <Chip 
                        radius="sm"
                        color="success"
                        variant="flat"
                        className={clsx(
                            `min-w-full text-center`,
                            gems.filter(item => item.skillStr.includes('재사용 대기시간')).length !== 0 ? 'hidden sm:flex' : 'hidden',
                            {
                                'col-span-1': gems.filter(item => item.skillStr.includes('재사용 대기시간')).length === 1,
                                'col-span-2': gems.filter(item => item.skillStr.includes('재사용 대기시간')).length === 2,
                                'col-span-3': gems.filter(item => item.skillStr.includes('재사용 대기시간')).length === 3,
                                'col-span-4': gems.filter(item => item.skillStr.includes('재사용 대기시간')).length === 4,
                                'col-span-5': gems.filter(item => item.skillStr.includes('재사용 대기시간')).length === 5,
                                'col-span-6': gems.filter(item => item.skillStr.includes('재사용 대기시간')).length === 6,
                                'col-span-7': gems.filter(item => item.skillStr.includes('재사용 대기시간')).length === 7,
                                'col-span-8': gems.filter(item => item.skillStr.includes('재사용 대기시간')).length === 8,
                                'col-span-9': gems.filter(item => item.skillStr.includes('재사용 대기시간')).length === 9,
                                'col-span-10': gems.filter(item => item.skillStr.includes('재사용 대기시간')).length === 10,
                                'col-span-11': gems.filter(item => item.skillStr.includes('재사용 대기시간')).length === 11
                            }
                        )}>
                        작열
                    </Chip>
                </div>
            </CardBody>
        </Card>
    )
}

// 카드 컴포넌트
function CardComponent({ file }: ProfileComponentProps) {
    const [cards, setCards] = useState<CardData[]>([]);
    const [cardSet, setCardSet] = useState<CardSet[]>([]);

    useEffect(() => {
        loadCards(file.cards, setCards, setCardSet);
    }, [file.cards]);

    return (
        <Card radius="sm" className="mt-8">
            <CardHeader><p className="text-lg">카드</p></CardHeader>
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
function StatComponent({ file }: ProfileComponentProps) {
    const [stat, setStat] = useState<Stat[]>([]);
    const isMobile = useMobileQuery();

    useEffect(() => {
        loadStats(file.stats, setStat);
    }, [file.stats]);

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
                                {getStatByType(stat, '공격력') ? getStatByType(stat, '공격력')?.tooltip.map((line, idx) => (
                                    <li key={idx}>{line}</li>
                                )) : <></>}
                            </ul>
                        </div>}>
                        <div className="w-full flex gap-2 items-center">
                            <p className="fadedtext text-sm">공격력</p>
                            <p>{getStatByType(stat, '공격력') ? getStatByType(stat, '공격력')?.value : 0}</p>
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
                                <p>{getStatByType(stat, '최대 생명력') ? getStatByType(stat, '최대 생명력')?.value : 0}</p>
                            </div>
                        </div>
                    </Tooltip>
                </div>
                <Divider className="mt-3 mb-3"/>
                <div>
                    {getHighStats(stat).map((item, index) => (
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
                            <Progress
                                showValueLabel
                                label={`${item.type} : ${item.value}`}
                                value={item.value}
                                maxValue={getSumStat(stat)}
                                size="sm"
                                className="mb-2"/>
                        </Tooltip>
                    ))}
                    <div className="grid grid-cols-4 gap-2">
                        {getLowStats(stat).map((item, index) => (
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
                                <div className="w-full flex gap-2 items-center">
                                    <p className="fadedtext text-sm">{item.type}</p>
                                    <p>{item.value}</p>
                                </div>
                            </Tooltip>
                        ))}
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}

// 각인 컴포넌트
function EngravingComponent({ file }: ProfileComponentProps) {
    const [engravings, setEngravings] = useState<Engraving[]>([]);
    const isMobile = useMobileQuery();

    useEffect(() => {
        loadEngraving(file.engraving, setEngravings);
    }, [file.profile])

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
                                "flex gap-3 mb-2 rounded-md pt-1 pb-1 pl-2 pr-2",
                                engraving.level >= 4 ? `${getBackgroundRightByGrade(engraving.grade)}` : ""
                            )}>
                                <p className={`grow ${getColorTextByGrade(engraving.grade)}`}>{engraving.name}</p>
                                {engraving.stoneLevel > 0 ? (
                                    <div className="flex gap-1 items-center fadedtext">
                                        <Image
                                            src={'/icons/stoneicon.png'}
                                            width={12}
                                            height={20}/>
                                        <p>X {engraving.stoneLevel}</p>
                                    </div>
                                ) : <></>}
                                <p className={`${getColorTextByGrade(engraving.grade)}`}>◆ X {engraving.level}</p>
                            </div>
                        </Tooltip>
                    ))}
                </div>
            </CardBody>
        </Card>
    )
}

// 아크패시브 컴포넌트
function ArkpassiveComponent({ file }: ProfileComponentProps) {
    const [points, setPoints] = useState<ArkpassivePoint[]>([]);
    const [evolution, setEvolution] = useState<ArkpassiveItem[]>([]);
    const [enlightenment, setEnlightenment] = useState<ArkpassiveItem[]>([]);
    const [jump, setJump] = useState<ArkpassiveItem[]>([]);
    const isMobile = useMobileQuery();

    useEffect(() => {
        loadArkpassive(file.arkpassive, setPoints, setEvolution, setEnlightenment, setJump);
    }, [file.arkpassive]);

    return (
        <Card radius="sm" className="mt-8">
            <CardHeader><p className="text-lg">아크패시브</p></CardHeader>
            <Divider/>
            <CardBody>
                <div className="w-full flex flex-col gap-2">
                    {points.map((point, index) => (
                        <div key={index}>
                            <div className="w-full flex gap-1 items-center">
                                <p className="grow fadedtext text-sm">{point.type}</p>
                                <p className={getColorByType(point.type)}>{point.point}</p>
                            </div>
                            <Progress
                                size="sm"
                                color={getColorProgressArkpassive(point.type)}
                                value={point.point}
                                maxValue={point.max}/>
                        </div>
                    ))}
                </div>
                <Chip
                    color="warning"
                    size="md"
                    radius="sm"
                    variant="flat"
                    className={clsx(
                        "min-w-full text-center mt-4 mb-4",
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
                            <Image
                                src={item.icon}
                                width={24}
                                height={24}
                                radius="sm"/>
                            <p className="fadedtext text-sm">{item.tier}티어</p>
                            <p className="text-sm">Lv.{item.level}</p>
                            <p className="grow text-sm">{item.name}</p>
                        </div>
                    </Tooltip>
                ))}
                <Chip
                    color="primary"
                    size="md"
                    radius="sm"
                    variant="flat"
                    className={clsx(
                        "min-w-full text-center mt-2 mb-4",
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
                            <Image
                                src={item.icon}
                                width={24}
                                height={24}
                                radius="sm"/>
                            <p className="fadedtext text-sm">{item.tier}티어</p>
                            <p className="text-sm">Lv.{item.level}</p>
                            <p className="grow text-sm">{item.name}</p>
                        </div>
                    </Tooltip>
                ))}
                <Chip
                    color="success"
                    size="md"
                    radius="sm"
                    variant="flat"
                    className={clsx(
                        "min-w-full text-center mt-2 mb-4",
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
                            <Image
                                src={item.icon}
                                width={24}
                                height={24}
                                radius="sm"/>
                            <p className="fadedtext text-sm">{item.tier}티어</p>
                            <p className="text-sm">Lv.{item.level}</p>
                            <p className="grow text-sm">{item.name}</p>
                        </div>
                    </Tooltip>
                ))}
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