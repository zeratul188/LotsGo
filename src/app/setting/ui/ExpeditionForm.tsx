import { Button, Card, CardBody, Chip, Link, Switch, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { useEffect, useState } from "react";
import { Character } from "../../store/loginSlice";
import { ExpeditionCharacter, handleSelectCharacter, initialData, useClickUpdate } from "../lib/expeditionFeat";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import clsx from "clsx";
import JobEmblemIcon from "@/Icons/JobEmblemIcon";

export function ExpeditionsComponent() {
    const [expedition, setExpedition] = useState<ExpeditionCharacter[]>([]);
    const [isLoading, setLoading] = useState(false);
    const [isDisable, setDisable] = useState(true);
    const [remainingTime, setRemainingTime] = useState(0);
    const storeExpedition: Character[] = useSelector((state: RootState) => state.login.user.expedition);
    const character: string = useSelector((state: RootState) => state.login.user.character);
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
            <Card radius="lg" shadow="none" className="border border-default-200/80 bg-content1 dark:border-white/10 dark:bg-[#18181b]">
                <CardBody className="p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold">내 원정대</h1>
                                <Chip size="sm" radius="full" variant="flat" color="primary">{expedition.length}명</Chip>
                            </div>
                            <p className="mt-1 text-xs text-default-500">등록된 캐릭터와 대표 캐릭터를 관리할 수 있습니다.</p>
                        </div>
                        <Button
                            color="primary"
                            radius="lg"
                            className="font-semibold"
                            isDisabled={isDisable}
                            isLoading={isLoading}
                            onPress={onClickUpdate}>
                            원정대 갱신
                        </Button>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        <div className="rounded-xl bg-default-50 px-3 py-3 dark:bg-white/[0.04]">
                            <p className="text-xs text-default-500">등록 캐릭터</p>
                            <p className="mt-1 text-lg font-bold tabular-nums">{expedition.length}<span className="ml-1 text-xs font-medium text-default-500">명</span></p>
                        </div>
                        <div className="rounded-xl bg-primary-50 px-3 py-3 dark:bg-primary-500/10">
                            <p className="text-xs text-primary-700 dark:text-primary-400">대표 캐릭터</p>
                            <p className="mt-1 truncate text-sm font-bold text-primary-700 dark:text-primary-400">{character || '미지정'}</p>
                        </div>
                        <div className="col-span-2 rounded-xl bg-default-50 px-3 py-3 dark:bg-white/[0.04] sm:col-span-1">
                            <p className="text-xs text-default-500">대표 서버</p>
                            <p className="mt-1 text-sm font-bold">{expedition.find((item) => item.nickname === character)?.server ?? '확인 중'}</p>
                        </div>
                    </div>
                </CardBody>
            </Card>
            <Card radius="lg" shadow="none" className="mt-4 border border-default-200/80 bg-content1 dark:border-white/10 dark:bg-[#18181b]">
                <CardBody className="p-0">
                    <div className="flex items-center justify-between border-b border-default-200/80 px-4 py-3 dark:border-white/10 sm:px-5">
                        <div>
                            <h2 className="font-semibold">캐릭터 목록</h2>
                            <p className="mt-0.5 text-xs text-default-500">대표 캐릭터는 한 명만 선택할 수 있습니다.</p>
                        </div>
                        <span className="text-xs text-default-400">{expedition.length}명</span>
                    </div>
                    <div className="hidden md:block">
                        <Table
                            fullWidth
                            aria-label="table-expeditions"
                            removeWrapper
                            classNames={{
                                th: "h-10 bg-default-50 text-xs font-semibold text-default-500 dark:bg-white/[0.04]",
                                td: "border-b border-default-100 py-3 last:border-b-0 dark:border-white/[0.06]",
                                tr: "transition-colors hover:bg-default-50/70 dark:hover:bg-white/[0.03]"
                            }}>
                            <TableHeader>
                                <TableColumn>캐릭터</TableColumn>
                                <TableColumn>아이템 레벨</TableColumn>
                                <TableColumn>대표 설정</TableColumn>
                                <TableColumn>전투정보실</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {expedition.map((character, index) => (
                                    <TableRow key={character.nickname}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <JobEmblemIcon job={character.job} size={42}/>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold">{character.nickname}</p>
                                                    <p className="mt-0.5 truncate text-xs text-default-500">{character.job} · {character.server}</p>
                                                </div>
                                                {character.isCharacter && <Chip size="sm" radius="full" variant="flat" color="primary">대표</Chip>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-semibold tabular-nums">Lv. {character.level}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                size="sm"
                                                aria-label={`${character.nickname} 대표 캐릭터 설정`}
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
                                                radius="lg"
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
                    <div className="divide-y divide-default-100 md:hidden dark:divide-white/[0.06]">
                        {expedition.map((character, index) => (
                            <article key={character.nickname} className={clsx(
                                "px-4 py-4 transition-colors",
                                character.isCharacter && "bg-primary-50/50 dark:bg-primary-500/5"
                            )}>
                                <div className="flex items-start gap-3">
                                    <JobEmblemIcon job={character.job} size={42}/>
                                    <div className="min-w-0 grow">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate font-semibold">{character.nickname}</p>
                                            {character.isCharacter && <Chip size="sm" radius="full" variant="flat" color="primary">대표</Chip>}
                                        </div>
                                        <p className="mt-1 truncate text-xs text-default-500">{character.job} · {character.server}</p>
                                        <p className="mt-1 text-sm font-semibold tabular-nums">Lv. {character.level}</p>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center justify-between gap-2 border-t border-default-100 pt-3 dark:border-white/[0.06]">
                                    <Switch
                                        size="sm"
                                        aria-label={`${character.nickname} 대표 캐릭터 설정`}
                                        isSelected={character.isCharacter}
                                        onValueChange={async () => {
                                            await handleSelectCharacter(index, expedition, setExpedition, dispatch);
                                        }}>
                                        대표 캐릭터
                                    </Switch>
                                    <Button
                                        showAnchorIcon
                                        as={Link}
                                        size="sm"
                                        color="primary"
                                        radius="lg"
                                        href={`/character?nickname=${character.nickname}`}
                                        variant="flat">
                                        전투정보실
                                    </Button>
                                </div>
                            </article>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}
