import { useEffect, useState } from "react";
import { CharacterFile } from "./characterFeat"
import { Avatar, loadAvatars, loadImage } from "./avatarFeat";
import { Card, CardBody, CardHeader, Divider, Image as HeroUIImage } from "@heroui/react";
import { getBackgroundByGrade, getColorTextByGrade } from "@/utiils/utils";
import Image from 'next/image';

// 아바타 컴포넌트
type AvatarComponentProps = {
    file: CharacterFile
}
export function AvatarComponent({ file }: AvatarComponentProps) {
    const [characterImage, setCharacterImage] = useState<string | null>(null);
    const [avatars, setAvatars] = useState<Avatar[]>([]);

    useEffect(() => {
        loadAvatars(file.avatars, setAvatars);
        loadImage(file.profile, setCharacterImage);
    }, [file.avatars]);

    return (
        <div className="w-full">
            <Card fullWidth radius="sm">
                <CardHeader><p className="text-lg">아바타</p></CardHeader>
                <Divider/>
                <CardBody className="p-0">
                    <div className="w-full flex flex-col md960:flex-row">
                        <div className="grow h-[max-content] md960:h-[800px] flex justify-center items-center bg-[#15181d] relative overflow-hidden">
                            {characterImage ? (
                                <HeroUIImage 
                                    alt="character-img"
                                    src={characterImage}
                                    className="w-auto h-full object-contain"/>
                            ) : <></>}
                            
                        </div>
                        <div className="w-full md960:w-[300px] h-[500px] md960:h-[800px] overflow-y-auto scrollbar-hide border-l-0 md960:border-l-1 border-t-1 md960:border-t-0 border-[#eeeeee] dark:border-[#333333]">
                            {avatars.map((avatar, index) => (
                                <div key={index} className="w-full p-3 flex gap-3">
                                    <div className={`w-[42px] h-[42px] p-[3px] aspect-square rounded-md ${getBackgroundByGrade(avatar.grade)}`}>
                                        <Image
                                            src={avatar.icon}
                                            width={36}
                                            height={36}
                                            alt="avatar-icon"/>
                                    </div>
                                    <div>
                                        <p className={`w-full text-[11pt] truncate ${getColorTextByGrade(avatar.grade)}`}>{avatar.name}</p>
                                        <div className="flex gap-2">
                                            <p className="fadedtext text-[9pt]">{avatar.type}{avatar.isInner ? " | 덧입기" : ''}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}