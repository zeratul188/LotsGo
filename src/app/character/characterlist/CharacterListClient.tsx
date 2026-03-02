'use client'

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { ExpeditionCharacter } from "./model/types";
import { loadCharacterList } from "./lib/characterListFeat";
import { addToast, Avatar, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import SupportorIcon from "@/Icons/SupportorIcon";
import AttackIcon from "@/Icons/AttackIcon";
import clsx from "clsx";
import { LoadingComponent } from "@/app/UtilsCompnents";
import { getImgByJob } from "../lib/expeditionFeat";
import { getParsedText, getTitleData } from "../lib/characterFeat";
import { LoginUser } from "@/app/store/loginSlice";
import { useRouter } from "next/navigation";
import { AccessoriesComponent, ArkgridComponent, ArkpassiveComponent, CardComponent, EngravingComponent, EquipmentComponent, GemComponent, StatComponent } from "./ui/CharacterForm";
import { getColorTextByGrade } from "@/utiils/utils";

export default function CharacterListClient() {
    const characterName: string = useSelector((state: RootState) => state.login.user.character);
    const [expeditionCharacters, setExpeditionCharacters] = useState<ExpeditionCharacter[]>([]);
    const [isLoading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const userStr = sessionStorage.getItem('user');
        const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
        if (!storedUser) {
            addToast({
                title: "이용 불가",
                description: `로그인을 해야만 이용 가능합니다.`,
                color: "danger"
            });
            router.push('/login');
        }
    })

    useEffect(() => {
        if (!characterName) return;
        loadCharacterList(characterName, setExpeditionCharacters, setLoading);
    }, [characterName]);

    if (isLoading) {
        return <LoadingComponent heightStyle="min-h-[calc(100vh-65px)]"/>;
    }

    return (
        <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto">
            <h1 className="text-3xl font-bold">원정대 모아보기</h1>
            <div className="mt-2 mb-4">
                <p className="text-sm fadedtext">원정대 캐릭터의 핵심 스펙을 한눈에 간략하게 확인할 수 있는 페이지입니다.</p>
                <p className="text-xs fadedtext">전투정보실에서 최소 1회 이상 조회한 캐릭터만 표시되며, 전투정보실 조회 시점에 저장된 데이터만 노출됩니다.</p>
            </div>
            <div className="w-full grid min-[812px]:grid-cols-2 min-[1224px]:grid-cols-3 gap-3">
                {expeditionCharacters.map((character) => (
                    <Card key={character.id} fullWidth radius="sm">
                        <CardHeader>
                            <div className="w-full flex gap-4 items-center">
                                <Avatar
                                    isBordered
                                    src={getImgByJob(character.profile.className)}/>
                                <div>
                                    <p className="fadedtext text-[9pt]">{character.profile.className} · Lv.{character.profile.itemLevel}</p>
                                    <p>{character.nickname}</p>
                                </div>
                                <div className="ml-auto flex flex-col">
                                    <p className="text-[9pt] text-right text-orange-700 dark:text-orange-300">{character.profile.arkpassiveTitle}</p>
                                    <div className="flex items-center justify-end">
                                        {character.profile.characterType === 'supportor' ? <SupportorIcon size={18}/> : <AttackIcon size={16}/>}
                                        <p className={clsx(
                                            "font-bold",
                                            character.profile.characterType === 'supportor' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300 ml-0.5'
                                        )}>{character.profile.combatPower}</p>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <Divider/>
                        <CardBody>
                            <div className="w-full flex flex-col gap-2">
                                <EquipmentComponent character={character}/>
                                <Divider/>
                                <AccessoriesComponent character={character}/>
                                <Divider/>
                                <StatComponent character={character}/>
                                <Divider/>
                                <ArkpassiveComponent character={character}/>
                                <Divider/>
                                <EngravingComponent character={character}/>
                                <Divider/>
                                <GemComponent character={character}/>
                                <Divider/>
                                <ArkgridComponent character={character}/>
                                <Divider/>
                                <CardComponent character={character}/>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    )
}
