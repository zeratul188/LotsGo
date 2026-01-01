'use client'
import { 
    Tabs, Tab, 
    Card, CardBody, CardFooter, 
    Button,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
    Divider,
    Input,
    NumberInput,
    Switch,
    CardHeader,
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell
 } from "@heroui/react";
import { ReactNode, useEffect, useState } from "react";
import { EmptyComponent, LoadingComponent } from "../UtilsCompnents";
import type { Difficulty, Boss } from "../api/checklist/boss/route";
import { 
    useClearData, 
    useInputHandlers, 
    useOnAddData, 
    useOnAddInput, 
    onClickEdit, 
    useOnRemoveDifficulty, 
    onClickRemove, 
    loadBoss
} from "./bossFeat";
import { Cube } from "../api/checklist/cube/route";
import { handleRemoveCube, loadCubes, useOnAddCube } from "./CubeFeat";

type TabMenu = {
    key: string,
    title: string,
    component: ReactNode
}

// 숙제 관리 - 큐브 관리 컴포넌트
function CubeComponent() {
    const [cubes, setCubes] = useState<Cube[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [inputName, setInputName] = useState('');
    const [inputLevel, setInputLevel] = useState(0);
    const [inputTier, setInputTier] = useState(0);
    const [inputReward, setInputReward] = useState(0);

    const onClickAddCube = useOnAddCube(inputName, inputLevel, inputTier, inputReward, cubes, setCubes, setInputName, setInputLevel, setInputTier, setInputReward);

    useEffect(() => {
        const fetchCube = async () => {
            await loadCubes(setCubes, setLoading);
        }
        fetchCube();
    }, []);

    return (
        <div className="w-full">
            {isLoading ? <LoadingComponent heightStyle={'h-[calc(100vh-105px)]'}/> : (
                <div className="w-full min-h-[calc(100vh-105px)]">
                    <div className="w-full flex gap-3 flex-col sm:flex-row items-center">
                        <Input
                            isRequired
                            label="큐브 명"
                            placeholder="ex) 제 1 해금"
                            value={inputName}
                            onValueChange={setInputName}
                            className="grow"/>
                        <NumberInput
                            isRequired
                            label="권장 아이템 레벨"
                            placeholder="0 ~ 9999"
                            minValue={0}
                            maxValue={9999}
                            step={5}
                            value={inputLevel}
                            onValueChange={setInputLevel}
                            className="grow"/>
                        <NumberInput
                            isRequired
                            label="티어"
                            placeholder="1 ~ 4"
                            minValue={0}
                            maxValue={9}
                            step={1}
                            value={inputTier}
                            onValueChange={setInputTier}
                            className="grow"/>
                        <NumberInput
                            isRequired
                            label="보상 (1레벨 보석 기준)"
                            placeholder="0 ~ 9999"
                            minValue={0}
                            maxValue={9999}
                            step={1}
                            value={inputReward}
                            onValueChange={setInputReward}
                            className ="grow"/>
                        <Button
                            color="primary"
                            size="lg"
                            className="w-full sm:w-[200px]"
                            onPress={onClickAddCube}>추가</Button>
                    </div>
                    <Table removeWrapper className="mt-6">
                        <TableHeader>
                            <TableColumn>큐브명</TableColumn>
                            <TableColumn>권장 아이템 레벨</TableColumn>
                            <TableColumn>티어</TableColumn>
                            <TableColumn>보상 (1레벨 보석)</TableColumn>
                            <TableColumn>관리</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent={"데이터가 존재하지 않습니다."}>
                            {cubes.map((cube, index) => (
                                <TableRow key={index}>
                                    <TableCell>{cube.name}</TableCell>
                                    <TableCell>{cube.level}</TableCell>
                                    <TableCell>{cube.tier}</TableCell>
                                    <TableCell>{cube.reward}</TableCell>
                                    <TableCell>
                                        <button 
                                            className="underline redbutton"
                                            onClick={async () => { 
                                                await handleRemoveCube(index, cubes, setCubes)
                                            }}>삭제</button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}

// 숙제 관리 - 콘텐츠 관리 컴포넌트
function BossComponent() {
    const [isLoading, setLoading] = useState(true);
    const [boss, setBoss] = useState<Boss[]>([]);
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [inputName, setInputName] = useState('');
    const [inputSimple, setInputSimple] = useState('');
    const [inputMax, setInputMax] = useState(0);
    const [inputs, setInputs] = useState<Difficulty[]>([]);
    const [isEditMode, setEditMode] = useState(false);
    const [editIndex, setEditIndex] = useState(-1);

    const onAddInput = useOnAddInput(setInputs);
    const {
        onValueChangeDifficulty,
        onValueChangeLevel,
        onValueChangeGold,
        onValueChangeBiweekly,
        onValueChangeBoundGold,
        onValueChangeStage,
        onValueChangeBonus,
        onValueChangeOnce
    } = useInputHandlers(inputs, setInputs);
    const onCloseModal = useClearData(setInputName, setInputSimple, setInputs, setEditMode, setEditIndex, setInputMax);

    useEffect(() => {
        const fetchBoss = async () => {
            await loadBoss(setLoading, setBoss);
        }
        fetchBoss();
    }, []);

    return (
        <>
            <div className="w-full">
                {isLoading ? <LoadingComponent heightStyle={'h-[calc(100vh-105px)]'}/> : (
                    <div className="w-full min-h-[calc(100vh-105px)]">
                        <div className="flex flex-col sm:flex-row gap-2 items-center mb-5">
                            <span className="grow-1 text-lg text-left w-full">추가한 콘텐츠 수 : {boss.length}개</span>
                            <Button 
                                color="primary"
                                size="lg"
                                className="w-full sm:w-40"
                                onPress={onOpen}>추가</Button>
                        </div>
                        {boss.length !== 0 ? boss.sort((a, b) => {
                            const bDiff = boss.find(d => d.name === b.name);
                            const aDiff = boss.find(d => d.name === a.name);
                            let bValue = 0, aValue = 0;
                            if (bDiff){
                                bValue = Math.min(...bDiff.difficulty.map(diff => diff.level));
                            }
                            if (aDiff) {
                                aValue = Math.min(...aDiff.difficulty.map(diff => diff.level));
                            }
                            return bValue - aValue;
                        }).map((item: Boss, index: number) => (
                            <Card key={index} radius="sm" className="mb-6">
                                <CardHeader>
                                    <div className="w-full flex gap-2 items-center">
                                        <h2 className="grow text-xl font-bold">{item.name}</h2>
                                        <p className="fadedtext text-sm">{item.max}인 | {item.simple}</p>
                                    </div>
                                </CardHeader>
                                <Divider/>
                                <CardBody>
                                    <div className="w-full overflow-x-auto scrollbar-hide">
                                        <Table 
                                            removeWrapper 
                                            aria-label="difficulty table" 
                                            className="w-[500px] sm:w-full">
                                            <TableHeader>
                                                <TableColumn>난이도</TableColumn>
                                                <TableColumn>관문</TableColumn>
                                                <TableColumn>입장 가능 레벨</TableColumn>
                                                <TableColumn>획득 골드</TableColumn>
                                                <TableColumn>귀속 골드</TableColumn>
                                                <TableColumn>더보기 골드</TableColumn>
                                                <TableColumn>격주 콘텐츠</TableColumn>
                                                <TableColumn>원정대 1회</TableColumn>
                                            </TableHeader>
                                            <TableBody>
                                                {item.difficulty.map((difficulty: Difficulty, idx: number) => (
                                                    <TableRow key={idx}>
                                                        <TableCell>{difficulty.difficulty}</TableCell>
                                                        <TableCell>{difficulty.stage}</TableCell>
                                                        <TableCell>{difficulty.level.toLocaleString()}</TableCell>
                                                        <TableCell>{difficulty.gold.toLocaleString()}</TableCell>
                                                        <TableCell>{difficulty.boundGold.toLocaleString()}</TableCell>
                                                        <TableCell>{difficulty.bonus.toLocaleString()}</TableCell>
                                                        <TableCell>{difficulty.isBiweekly ? '○' : '✕'}</TableCell>
                                                        <TableCell>{difficulty.isOnce ? '○' : '✕'}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardBody>
                                <Divider/>
                                <CardFooter>
                                    <div className="w-full flex gap-4">
                                        <div className="grow-1"/>
                                        <Button color="danger" onPress={async () => await onClickRemove(index, boss, setBoss)}>삭제</Button>
                                        <Button color="primary" onPress={() => onClickEdit(index, setEditMode, setEditIndex, onOpen, boss[index], setInputName, setInputSimple, setInputMax, setInputs)}>수정</Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        )) : <EmptyComponent heightStyle={'h-[calc(100vh-200px)]'}/>}
                    </div>
                )}
            </div>
            <Modal 
                isOpen={isOpen} 
                isDismissable={false} 
                scrollBehavior="inside"
                backdrop="blur"
                size="4xl"
                onOpenChange={onOpenChange}
                onClose={onCloseModal}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>데이터 추가</ModalHeader>
                            <ModalBody>
                                <Input
                                    label="콘텐츠 명"
                                    labelPlacement="outside"
                                    placeholder="군단장 레이드 - 카멘"
                                    value={inputName}
                                    onValueChange={setInputName}/>
                                <div className="w-full grid sm:grid-cols-[2fr_1fr] gap-2">
                                    <Input
                                        label="간단 콘텐츠 명"
                                        labelPlacement="outside"
                                        placeholder="카멘"
                                        value={inputSimple}
                                        onValueChange={setInputSimple}/>
                                    <NumberInput
                                        label="최대 인원"
                                        labelPlacement="outside"
                                        placeholder="0 ~ 99"
                                        minValue={0}
                                        maxValue={99}
                                        step={1}
                                        value={inputMax}
                                        onValueChange={setInputMax}/>
                                </div>
                                <div className="max-h-[500px] overflow-y-auto">
                                    {inputs.map((input: Difficulty, index: number) => (
                                        <div key={index} className="mt-4">
                                            <div className="flex gap-2">
                                                <span className="text-md font-bold grow-1">{index+1}번 항목</span>
                                                <span 
                                                    className="text-red-500 underline hover:text-red-800 cursor-pointer"
                                                    onClick={() => useOnRemoveDifficulty(index, inputs, setInputs)}>삭제하기</span>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 items-center mt-2">
                                                <Input
                                                    label="난이도"
                                                    labelPlacement="outside"
                                                    placeholder="하드 1-3관"
                                                    value={input.difficulty}
                                                    onValueChange={(value: string) => onValueChangeDifficulty(value, index)}/>
                                                <NumberInput
                                                    label="입장 레벨"
                                                    labelPlacement="outside"
                                                    placeholder="0 ~ 9999"
                                                    minValue={0}
                                                    maxValue={9999}
                                                    step={5}
                                                    value={input.level}
                                                    onValueChange={(value: number) => onValueChangeLevel(value, index)}/>
                                                <NumberInput
                                                    label="관문"
                                                    labelPlacement="outside"
                                                    placeholder="0 ~ 9999999"
                                                    minValue={0}
                                                    maxValue={9999999}
                                                    step={1}
                                                    value={input.stage}
                                                    onValueChange={(value: number) => onValueChangeStage(value, index)}/>
                                                <NumberInput
                                                    label="지급 골드"
                                                    labelPlacement="outside"
                                                    placeholder="0 ~ 9999999"
                                                    minValue={0}
                                                    maxValue={9999999}
                                                    step={5}
                                                    value={input.gold}
                                                    onValueChange={(value: number) => onValueChangeGold(value, index)}/>
                                                <NumberInput
                                                    label="귀속 골드"
                                                    labelPlacement="outside"
                                                    placeholder="0 ~ 9999999"
                                                    minValue={0}
                                                    maxValue={9999999}
                                                    step={5}
                                                    value={input.boundGold}
                                                    onValueChange={(value: number) => onValueChangeBoundGold(value, index)}/>
                                                <NumberInput
                                                    label="더보기"
                                                    labelPlacement="outside"
                                                    placeholder="0 ~ 9999999"
                                                    minValue={0}
                                                    maxValue={9999999}
                                                    step={5}
                                                    value={input.bonus}
                                                    onValueChange={(value: number) => onValueChangeBonus(value, index)}/>
                                                <Switch 
                                                    isSelected={input.isBiweekly} 
                                                    onValueChange={(isSelected: boolean) => onValueChangeBiweekly(isSelected, index)}>격주 콘텐츠</Switch>
                                                <Switch 
                                                    isSelected={input.isOnce} 
                                                    onValueChange={(isSelected: boolean) => onValueChangeOnce(isSelected, index)}>원정대 1회</Switch>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    fullWidth
                                    color="primary"
                                    variant="flat"
                                    className="mb-4"
                                    onPress={onAddInput}>난이도 추가</Button>
                            </ModalBody>
                            <Divider/>
                            <ModalFooter>
                                <Button color="default" variant="light" onPress={onClose}>취소</Button>
                                <Button color="primary" onPress={async () => await useOnAddData(inputName, inputSimple, inputMax, inputs, onClose, boss, setBoss, isEditMode, editIndex)}>{isEditMode ? '수정' : '추가'}</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

// 숙제 관리 컴포넌트
export default function Checklist() {
    const menus: Array<TabMenu> = [
        {
            key: 'boss',
            title: '콘텐츠 관리',
            component: <BossComponent/>
        },
        {
            key: 'cube',
            title: '큐브 관리',
            component: <CubeComponent/>
        }
    ]

    return (
        <div className="w-full">
            <Tabs 
                variant="underlined" 
                color="primary"
                aria-label="Checklist Options" 
                radius="sm">
                {menus.map((menu: TabMenu) => (
                    <Tab key={menu.key} title={menu.title}>
                        {menu.component}
                    </Tab>
                ))}
            </Tabs>
        </div>
    )
}