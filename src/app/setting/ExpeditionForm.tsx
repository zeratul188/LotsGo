import { Avatar, Button, Link, Switch, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { useEffect, useState } from "react";
import { Character } from "../store/loginSlice";
import { ExpeditionCharacter, handleSelectCharacter, initialData, useClickUpdate } from "./expeditionFeat";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import clsx from "clsx";
import { useMobileQuery } from "@/utiils/utils";
import { getImgByJob } from "../character/expeditionFeat";

export function ExpeditionsComponent() {
    const [expedition, setExpedition] = useState<ExpeditionCharacter[]>([]);
    const [isLoading, setLoading] = useState(false);
    const [isDisable, setDisable] = useState(true);
    const [remainingTime, setRemainingTime] = useState(0);
    const storeExpedition: Character[] = useSelector((state: RootState) => state.login.user.expedition);
    const character: string = useSelector((state: RootState) => state.login.user.character);
    const isMobile = useMobileQuery();
    const dispatch = useDispatch();

    const onClickUpdate = useClickUpdate(character, setLoading, setDisable, setExpedition, dispatch);

    useEffect(() => {
        initialData(storeExpedition, setExpedition, character);
    }, []);

    useEffect(() => {
        if (!isDisable) return;

        const interval = setInterval(() => {
            const saved = localStorage.getItem("expedition_unlock_time");
            if (!saved) {
                setDisable(false);
                clearInterval(interval);
                return;
            }

            const lastTime = parseInt(saved);
            const diff = Date.now() - lastTime;
            const timeLeft = 60 * 1000 - diff;

            if (timeLeft <= 0) {
                setDisable(false);
                clearInterval(interval);
                localStorage.removeItem('expedition_unlock_time');
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isDisable]);

    useEffect(() => {
        if (remainingTime > 0) {
            localStorage.setItem("expedition_unlock_time", (remainingTime).toString());
        }
    }, [remainingTime]);

    return (
        <div className="w-full">
            <div className="w-full flex gap-1 mb-3 items-center">
                <p className="grow">원정대 캐릭터 수 : {expedition.length}개</p>
                <Button
                    color="primary"
                    radius="sm"
                    isDisabled={isDisable}
                    isLoading={isLoading}
                    onPress={onClickUpdate}>
                    갱신하기
                </Button>
            </div>
            <div className={clsx(
                'overflow-x-auto',
                isMobile ? 'max-w-[750px]' : 'w-full'
            )}>
                <Table 
                    fullWidth
                    aria-label="table-expeditions" 
                    removeWrapper className={clsx(
                        isMobile ? 'w-[750px]' : ''
                    )}>
                    <TableHeader>
                        <TableColumn>캐릭터명</TableColumn>
                        <TableColumn>아이템 레벨</TableColumn>
                        <TableColumn>서버</TableColumn>
                        <TableColumn>대표 캐릭터</TableColumn>
                        <TableColumn>전투정보실</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {expedition.map((character, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <div className="flex gap-4">
                                        <Avatar isBordered size="md" src={getImgByJob(character.job)}/>
                                        <div>
                                            <p className="truncate text-md overflow-hidden whitespace-nowrap">{character.nickname}</p>
                                            <p className="fadedtext truncate overflow-hidden whitespace-nowrap text-[10pt]">{character.job}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{character.level}</TableCell>
                                <TableCell>{character.server}</TableCell>
                                <TableCell>
                                    <Switch
                                        isSelected={character.isCharacter}
                                        onValueChange={async () => {
                                            await handleSelectCharacter(index, expedition, setExpedition, dispatch);
                                        }}/>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        showAnchorIcon
                                        as={Link}
                                        size="sm"
                                        color="primary"
                                        href={`/character?nickname=${character.nickname}`}
                                        variant="flat">
                                        전투정보실
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}