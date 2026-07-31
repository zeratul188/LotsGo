'use client'

import { useEffect, useState } from "react";
import {
    Button,
    Chip,
    Radio,
    RadioGroup,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tabs
} from "@heroui/react";
import type { Cube } from "../../api/checklist/cube/route";
import type { CheckCharacter } from "../../store/checklistSlice";
import type { AppDispatch } from "../../store/store";
import {
    CubeStatue,
    getColumnsByCubeTiers,
    getCountCube,
    getCubeCountByCharacter,
    getCubeCountByChecklist,
    getCubeList,
    getCubeStatues,
    getGemCountByCharacter,
    getGemCountByChecklist,
    getIndexByNickname,
    handleControlCube
} from "../lib/checklistFeat";

type CubeCountComponentProps = {
    checklist: CheckCharacter[],
    character: CheckCharacter,
    cubes: Cube[],
    dispatch: AppDispatch,
    count: number
}

export function CubeCountComponent({ checklist, character, cubes, dispatch, count }: CubeCountComponentProps) {
    return (
        <Table removeWrapper>
            <TableHeader>
                <TableColumn>큐브명</TableColumn>
                <TableColumn>개수</TableColumn>
                <TableColumn className="w-[10px]">관리</TableColumn>
            </TableHeader>
            <TableBody>
                {getCubeList(character.level, cubes).map((cube, idx) => (
                    <TableRow key={idx}>
                        <TableCell>{cube.name}</TableCell>
                        <TableCell>{getCountCube(character.cubelist, cube.id).toLocaleString()}장</TableCell>
                        <TableCell>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="flat"
                                    color="danger"
                                    isDisabled={getCountCube(character.cubelist, cube.id) <= 0}
                                    className="w-8 h-8 min-w-0 min-h-0 p-0 text-sm"
                                    onPress={async () => {
                                        await handleControlCube(checklist, getIndexByNickname(checklist, character.nickname), cube.id, dispatch, false, count);
                                    }}>-</Button>
                                <Button
                                    size="sm"
                                    variant="flat"
                                    color="success"
                                    isDisabled={getCountCube(character.cubelist, cube.id) >= 9999}
                                    className="w-8 h-8 min-w-0 min-h-0 p-0 text-sm"
                                    onPress={async () => {
                                        await handleControlCube(checklist, getIndexByNickname(checklist, character.nickname), cube.id, dispatch, true, count);
                                    }}>+</Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

type CubeStatueComponentProps = {
    character: CheckCharacter,
    cubes: Cube[]
}

export function CubeStatueComponent({ character, cubes }: CubeStatueComponentProps) {
    const cells: any = (statue: CubeStatue) => {
        return [
            <TableCell key="level">Lv.{statue.level}</TableCell>,
            ...statue.cubeCount.map((count, idx) => (
            <TableCell key={idx}>{count.count}개</TableCell>
            )),
        ];
    }
    const columns: any = () => {
        return (
            <>
                <TableColumn>보석 레벨</TableColumn>
                {getColumnsByCubeTiers(cubes).map((tier: number, index: number) => (
                    <TableColumn key={index}>T{tier}</TableColumn>
                ))}
            </>
        )
    }
    return (
        <Table removeWrapper>
            <TableHeader>
                {columns()}
            </TableHeader>
            <TableBody>
                {getCubeStatues(character, cubes).map((statue, index) => (
                    <TableRow key={index}>
                        {cells(statue)}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

type CubeDetailComponentProps = {
    checklist: CheckCharacter[],
    cubes: Cube[]
}

export function CubeDetailComponent({ checklist, cubes }: CubeDetailComponentProps) {
    return (
        <section className="mt-4 w-full overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950/60">
            <div className="flex flex-col gap-1 border-b border-gray-200/80 px-4 py-4 sm:px-5 dark:border-gray-800">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">큐브 전체 현황</h2>
                    <Chip size="sm" variant="flat" color="primary">{checklist.length}명</Chip>
                </div>
                <p className="text-sm fadedtext">보유 입장권과 예상 보석 보상을 한 번에 확인하세요.</p>
            </div>
            <Tabs
                aria-label="cube-detail"
                color="primary"
                variant="underlined"
                classNames={{
                    base: "w-full px-4 pt-2 sm:px-5",
                    tabList: "gap-5",
                    panel: "px-4 pb-5 pt-3 sm:px-5",
                }}>
                <Tab key="setting" title="개수">
                    <div className="max-w-full w-full overflow-x-auto rounded-xl border border-gray-200/80 dark:border-gray-800">
                        <CubeDetailCount checklist={checklist} cubes={cubes}/>
                    </div>
                </Tab>
                <Tab key="statue" title="보상">
                    <div className="max-w-full w-full overflow-x-auto rounded-xl border border-gray-200/80 p-3 dark:border-gray-800">
                        <CubeDetailGems checklist={checklist} cubes={cubes}/>
                    </div>
                </Tab>
            </Tabs>
        </section>
    )
}

function CubeDetailGems({ checklist, cubes }: CubeDetailComponentProps) {
    const [tier, setTier] = useState(0);
    const [selected, setSelected] = useState('');

    useEffect(() => {
        if (getColumnsByCubeTiers(cubes).length > 0) {
            setTier(getColumnsByCubeTiers(cubes).reverse()[0]);
            setSelected(`${getColumnsByCubeTiers(cubes).reverse()[0]}`);
        }
    }, []);

    useEffect(() => {
        setTier(Number(selected));
    }, [selected])

    const columns: any = () => {
        return (
            <>
                <TableColumn>캐릭터 명</TableColumn>
                {[...Array(10)].map((_, index) => (
                    <TableColumn key={index}>{index+1}레벨 보석</TableColumn>
                ))}
            </>
        )
    }
    const cells: any = (character: CheckCharacter) => {
        return [
            <TableCell key="level">{character.nickname}</TableCell>,
            ...getGemCountByCharacter(character, cubes, tier).map((gem, idx) => (
                <TableCell key={idx}>
                    <Chip
                        size="sm"
                        color={gem > 0 ? 'primary' : 'default'}
                        variant="flat"
                        className="min-w-full text-center">
                        {gem}
                    </Chip>
                </TableCell>
            )),
        ];
    }
    const allCells: any = () => {
        return [
            <TableCell key="all">전체</TableCell>,
            ...getGemCountByChecklist(checklist, cubes, tier).map((gem, idx) => (
                <TableCell key={idx}>
                    <Chip
                        size="sm"
                        color={gem > 0 ? 'success' : 'default'}
                        variant="flat"
                        className="min-w-full text-center">
                        {gem}
                    </Chip>
                </TableCell>
            )),
        ];
    }
    return (
        <>
            <RadioGroup
                color="primary"
                label="보석 티어 선택"
                defaultValue={getColumnsByCubeTiers(cubes).reverse()[0].toString()}
                orientation="horizontal"
                value={selected}
                onValueChange={setSelected}>
                {getColumnsByCubeTiers(cubes).reverse().map((t, index) => (
                    <Radio key={index} value={`${t}`}>{t}티어</Radio>
                ))}
            </RadioGroup>
            <div className="max-w-full w-full overflow-x-auto mt-4">
                <Table
                    removeWrapper
                    className="min-w-full w-[1120px]">
                    <TableHeader>
                        {columns()}
                    </TableHeader>
                    <TableBody>
                        <>
                            {checklist.map((character, index) => (
                                <TableRow key={index}>
                                    {cells(character)}
                                </TableRow>
                            ))}
                            <TableRow key="all" className="border-t-1 border-[#dddddd] dark:border-[#333333]">
                                {allCells()}
                            </TableRow>
                        </>
                    </TableBody>
                </Table>
            </div>
        </>
    )
}

function CubeDetailCount({ checklist, cubes }: CubeDetailComponentProps) {
    const columns: any = () => {
        return (
            <>
                <TableColumn>캐릭터 명</TableColumn>
                {cubes.map((cube, index) => (
                    <TableColumn key={index}>{cube.name}</TableColumn>
                ))}
            </>
        )
    }
    const cells: any = (character: CheckCharacter) => {
        return [
            <TableCell key="level">{character.nickname}</TableCell>,
            ...cubes.map((cube, idx) => (
                <TableCell key={idx}>
                    <Chip
                        size="sm"
                        color={getCubeCountByCharacter(character, cube) > 0 ? 'primary' : 'default'}
                        variant="flat"
                        className="min-w-full text-center">
                        {getCubeCountByCharacter(character, cube)}
                    </Chip>
                </TableCell>
            )),
        ];
    }
    const allCells: any = () => {
        return [
            <TableCell key="all">전체</TableCell>,
            ...cubes.map((cube, idx) => (
                <TableCell key={idx}>
                    <Chip
                        size="sm"
                        color={getCubeCountByChecklist(checklist, cube) > 0 ? 'success' : 'default'}
                        variant="flat"
                        className="min-w-full text-center">
                        {getCubeCountByChecklist(checklist, cube)}
                    </Chip>
                </TableCell>
            )),
        ];
    }
    return (
        <Table
            removeWrapper
            className="min-w-full"
            style={{ width: `${(cubes.length+1) * 100}px` }}>
            <TableHeader>
                {columns()}
            </TableHeader>
            <TableBody>
                <>
                    {checklist.map((character, index) => (
                        <TableRow key={index}>
                            {cells(character)}
                        </TableRow>
                    ))}
                    <TableRow key="all" className="border-t-1 border-[#dddddd] dark:border-[#333333]">
                        {allCells()}
                    </TableRow>
                </>
            </TableBody>
        </Table>
    )
}
