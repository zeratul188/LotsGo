import { getBackgroundByGrade, getColorTextByGrade, SetStateFn, useMobileQuery } from "@/utiils/utils";
import { Button, Card, CardBody, CardHeader, Chip, Divider, Image, Input, Popover, PopoverContent, PopoverTrigger, Progress, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip } from "@heroui/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { Character } from "../store/loginSlice";
import { Accessory, applyAccessories, applyArmData, applyColorElixir, applyEquipment, applyStoneData, Arm, CharacterFile, Equipment, Gem, getAllElixir, getAllPower, getBgColorByGrade, getColorByQuality, getCountAtkGems, getCountDekGems, getGemByIndex, getGemSimpleTailName, getObjectByArmorType, getParsedText, getSmallGradeByAccessory, getTextByGrade, getTextColorByGrade, handleSearch, loadGems, Stone } from "./characterFeat";
import PowerIcon from "@/Icons/PowerIcon";
import { printAllElixirInTooltip, printBonusInTooltip, printCountInTooltip, printElixirInTooltip, printHighUpgradeInTooltip, printInfoInTooltip, printPowerInTooltip } from "./equipmentPrints";
import clsx from "clsx";
import { printDefaultInTooltip, printListInTooltip, printPointInTooltip, printUseInTooltip } from "./accessoryPrints";
import { printArmPointInTooltip, printArmUseInTooltip, printBooleanInTooltip, printEffectInTooltip } from "./armPrints";
import { printBonusStoneInTooltip, printDefaultStoneInTooltip, printStoneUseInTooltip } from "./stonePrints";
import PotionIcon from "@/Icons/PosionIcon";

// state 관리
export function useCharacterForm() {
    const [isLoading, setLoading] = useState(false);
    const [isSearched, setSearched] = useState(false);
    const [nickname, setNickname] = useState('');
    const [file, setFile] = useState<CharacterFile>({
        profile: null,
        equipment: null,
        gem: null
    })

    return {
        isLoading, setLoading,
        isSearched, setSearched,
        nickname, setNickname,
        file, setFile
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

// 로그인된 원정대 목록 가져오기
export function ExpeditionComponent({ setSearched, setLoading, setNickname }: SearchComponentProps) {
    const expedition: Character[] = useSelector((state: RootState) => state.login.user.expedition);
    return (
        <div className="w-full md960:w-[960px] mx-auto mt-10">
            <p className="mb-4 text-2xl">내 원정대 목록</p>
            <div className="hidden sm:block">
                <Table removeWrapper selectionMode="single">
                    <TableHeader>
                        <TableColumn>캐릭터명</TableColumn>
                        <TableColumn>아이템 레벨</TableColumn>
                        <TableColumn>서버</TableColumn>
                        <TableColumn>클래스</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="로그인이 되어있지 않거나 등록된 원정대 캐릭터가 없습니다.">
                        {expedition.map((character, index) => (
                            <TableRow 
                                key={index}
                                className="cursor-pointer"
                                onClick={() => handleSearch(character.nickname, setSearched, setLoading, setNickname)}>
                                <TableCell>{character.nickname}</TableCell>
                                <TableCell>{character.level}</TableCell>
                                <TableCell>{character.server}</TableCell>
                                <TableCell>{character.job}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="block sm:hidden">
                <Table removeWrapper selectionMode="single">
                    <TableHeader>
                        <TableColumn>캐릭터명</TableColumn>
                        <TableColumn>아이템 레벨</TableColumn>
                        <TableColumn>클래스</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="로그인이 되어있지 않거나 등록된 원정대 캐릭터가 없습니다.">
                        {expedition.map((character, index) => (
                            <TableRow 
                                key={index}
                                className="cursor-pointer"
                                onClick={() => handleSearch(character.nickname, setSearched, setLoading, setNickname)}>
                                <TableCell>{character.nickname}</TableCell>
                                <TableCell>{character.level}</TableCell>
                                <TableCell>{character.job}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

// 캐릭터 프로파일
type ProfileComponentProps = {
    file: CharacterFile
}
export function ProfileComponent({ file }: ProfileComponentProps) {
    const profile = file.profile;
    return (
        <div className="w-full block sm:fixed top-[65px] left-0 h-[max-content] sm:h-[300px] border-b-1 border-[#dddddd] dark:border-[#333333] bg-[#F6F6F6] dark:bg-[#111111] z-9999">
            <div className="w-full max-w-[1280px] mx-auto h-full flex flex-col-reverse sm:flex-row">
                <div className="p-5 h-full relative flex flex-col">
                    <div className="flex gap-2">
                        <Chip color="secondary" variant="solid" radius="sm">{profile.ServerName}</Chip>
                        <Chip color="warning" variant="solid" radius="sm">{profile.CharacterClassName}</Chip>
                    </div>
                    <p className="fadedtext mt-4">{profile.Title ? profile.Title : '-'}{profile.GuildName ?` · ${profile.GuildName} 길드` : ''}</p>
                    <p className="text-2xl font-bold">{profile.CharacterName}</p>
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
                <div className="grow"/>
                <div className="w-[100vw] sm:w-[440px] h-[280px] sm:h-[100%] overflow-hidden [mask-image:linear-gradient(to_bottom,black,black,black,transparent)] sm:[mask-image:linear-gradient(to_right,transparent,black,black,black)] lg1280:[mask-image:linear-gradient(to_right,transparent,black,black,transparent)]">
                    <img
                        src={file.profile.CharacterImage}
                        alt="character-image"
                        className="w-[100vw] h-[500px] object-cover scale-130 origin-top translate-y-[-13%]"/>
                </div>
            </div>
        </div>
    )
}

// 능력치 컴포넌트
export function AbilityComponent({ file }: ProfileComponentProps) {
    return (
        <div className="w-full grid grid-cols-1 md960:grid-cols-[2fr_1fr] gap-2">
            <div className="w-full">
                <EquipmentComponent file={file}/>
                <GemComponent file={file}/>
            </div>
            <div className="w-full">

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
                                <Popover key={index}>
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
                                    <PopoverContent>
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
                        <div className="flex gap-2 mt-4">
                            {getAllPower(equipments) > 0 ? (
                                <div className="grow flex gap-3 items-center">
                                    <div className="w-8 h-8"><PowerIcon/></div>
                                    <div>
                                        <p className="fadedtext text-[9pt]">초월 총합</p>
                                        <p className="text-lg font-bold">{getAllPower(equipments)}</p>
                                    </div>
                                </div>
                            ) : <></>}
                            {getAllElixir(equipments) > 0 ? (
                                <div className="grow flex gap-3 items-center">
                                    <div className="w-8 h-8"><PotionIcon/></div>
                                    <div>
                                        <p className="fadedtext text-[9pt]">엘릭서 총합</p>
                                        <p className="text-lg font-bold">Lv.{getAllElixir(equipments)}</p>
                                    </div>
                                </div>
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
                                <Popover key={index}>
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
                                    <PopoverContent>
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
                            <Popover>
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
                                <PopoverContent>
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
                            <Popover>
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
                                <PopoverContent>
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
function GemComponent({ file }: ProfileComponentProps) {
    const [attack, setAttack] = useState(0);
    const [gems, setGems] = useState<Gem[]>([]);

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
                    {Array.from({ length: 11 }).map((_, index) => (
                        <Popover key={index} showArrow>
                            <PopoverTrigger>
                                <div className="w-full flex items-center justify-center flex-col">
                                    <div className={`w-[46px] h-[46px] p-[1px] aspect-square rounded-md ${getBackgroundByGrade(getGemByIndex(gems, index) ? getGemByIndex(gems, index)!.grade : "")}`}>
                                        {getGemByIndex(gems, index) ? (
                                            <Image
                                                src={getGemByIndex(gems, index)!.icon}
                                                width={44}
                                                height={44}/>
                                        ) : <></>}
                                    </div>
                                    <Chip
                                        size="sm"
                                        radius="sm"
                                        variant="flat"
                                        className="mt-2">
                                        {getGemByIndex(gems, index) ? `${getGemByIndex(gems, index)!.level} ${getGemSimpleTailName(getGemByIndex(gems, index))}` : '-'}
                                    </Chip>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent>
                                {getGemByIndex(gems, index) ? (
                                    <div className="max-w-[500px] p-2">
                                        <p className={`w-full text-center text-lg ${getColorTextByGrade(getGemByIndex(gems, index)!.grade)}`}>{getGemByIndex(gems, index)!.name}</p>
                                        <p className="mt-1 fadedtext">효과</p>
                                        <p>{getGemByIndex(gems, index)?.skillStr}</p>
                                        <p className="mt-2 fadedtext">추가 효과</p>
                                        <p>기본 공격력 {getGemByIndex(gems, index)?.attack.toFixed(1)}%</p>
                                    </div>
                                ) : <div></div>}
                            </PopoverContent>
                        </Popover>
                    ))}
                </div>
            </CardBody>
        </Card>
    )
}