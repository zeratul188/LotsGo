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
    Textarea,
    CardHeader,
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell
 } from "@heroui/react";
import { ReactNode, useEffect, useState } from "react";
import { EmptyComponent, LoadingComponent } from "../../UtilsCompnents";
import type { Difficulty, Boss, Cube } from "../model/types";
import { 
    useClearData, 
    useInputHandlers, 
    useOnAddData, 
    useOnAddInput, 
    onClickEdit, 
    useOnRemoveDifficulty, 
    moveDifficulty,
    onClickRemove, 
    loadBoss
} from "../lib/bossFeat";
import { handleRemoveCube, loadCubes, useOnAddCube } from "../lib/CubeFeat";

type TabMenu = {
    key: string,
    title: string,
    component: ReactNode
}

const fieldClassNames = {
    inputWrapper: "border-default-200 bg-default-50 shadow-none data-[hover=true]:border-primary/50 dark:border-white/10 dark:bg-white/[0.04]",
    label: "font-medium text-default-600"
};

const modalClassNames = {
    backdrop: "bg-black/60 backdrop-blur-sm",
    base: "border border-default-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#171717]",
    header: "border-b border-default-200 px-5 py-4 dark:border-white/10",
    body: "gap-4 px-5 py-5",
    footer: "border-t border-default-200 px-5 py-4 dark:border-white/10"
};

const tableClassNames = {
    th: "bg-default-100 text-xs font-bold text-default-500 dark:bg-white/[0.06]",
    td: "border-b border-default-100 py-3 text-sm last:border-b-0 dark:border-white/[0.06]"
};

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
                <div className="w-full min-h-[calc(100vh-180px)]">
                    <section className="rounded-2xl border border-default-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#171717] sm:p-5">
                        <div className="mb-4">
                            <h2 className="text-lg font-bold">큐브 데이터 추가</h2>
                            <p className="mt-1 text-sm text-default-500">큐브 단계별 권장 레벨과 보상 정보를 등록합니다.</p>
                        </div>
                    <div className="grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_.7fr_1.2fr_auto] xl:items-end">
                        <Input
                            isRequired
                            label="큐브 명"
                            placeholder="ex) 제 1 해금"
                            value={inputName}
                            onValueChange={setInputName}
                            radius="lg"
                            variant="bordered"
                            classNames={fieldClassNames}/>
                        <NumberInput
                            isRequired
                            label="권장 아이템 레벨"
                            placeholder="0 ~ 9999"
                            minValue={0}
                            maxValue={9999}
                            step={5}
                            value={inputLevel}
                            onValueChange={setInputLevel}
                            radius="lg"
                            variant="bordered"
                            classNames={fieldClassNames}/>
                        <NumberInput
                            isRequired
                            label="티어"
                            placeholder="1 ~ 4"
                            minValue={0}
                            maxValue={9}
                            step={1}
                            value={inputTier}
                            onValueChange={setInputTier}
                            radius="lg"
                            variant="bordered"
                            classNames={fieldClassNames}/>
                        <NumberInput
                            isRequired
                            label="보상 (1레벨 보석 기준)"
                            placeholder="0 ~ 9999"
                            minValue={0}
                            maxValue={9999}
                            step={1}
                            value={inputReward}
                            onValueChange={setInputReward}
                            radius="lg"
                            variant="bordered"
                            classNames={fieldClassNames}/>
                        <Button
                            color="primary"
                            size="lg"
                            radius="lg"
                            className="h-14 w-full px-8 font-bold sm:col-span-2 xl:col-span-1"
                            onPress={onClickAddCube}>추가</Button>
                    </div>
                    </section>
                    <section className="mt-5 overflow-hidden rounded-2xl border border-default-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#171717] sm:p-5">
                    <Table removeWrapper aria-label="큐브 데이터 목록" classNames={tableClassNames}>
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
                                        <Button
                                            size="sm"
                                            color="danger"
                                            variant="flat"
                                            radius="lg"
                                            onClick={async () => { 
                                                await handleRemoveCube(index, cubes, setCubes)
                                            }}>삭제</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    </section>
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
    const [inputScreenNames, setInputScreenNames] = useState('');
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
    const onCloseModal = useClearData(setInputName, setInputSimple, setInputScreenNames, setInputs, setEditMode, setEditIndex, setInputMax);

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
                    <div className="w-full min-h-[calc(100vh-180px)]">
                        <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-default-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#171717] sm:flex-row sm:items-center">
                            <div className="grow">
                                <h2 className="text-xl font-bold">레이드 콘텐츠</h2>
                                <p className="mt-1 text-sm text-default-500">체크리스트에서 사용하는 난이도, 관문, 골드 보상을 관리합니다.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">총 {boss.length}개</span>
                            <Button 
                                color="primary"
                                radius="lg"
                                className="min-w-28 font-bold"
                                onPress={onOpen}>콘텐츠 추가</Button>
                            </div>
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
                            <Card key={index} radius="lg" className="mb-5 border border-default-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#171717]">
                                <CardHeader className="flex-col items-start gap-2 px-5 py-4 sm:flex-row sm:items-center">
                                    <div className="grow">
                                        <h2 className="text-lg font-bold sm:text-xl">{item.name}</h2>
                                        <p className="mt-1 text-sm text-default-500">
                                            화면 인식 이름: {(item.screenNames ?? []).length > 0 ? item.screenNames?.join(', ') : '등록되지 않음'}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                        <span className="rounded-full bg-default-100 px-3 py-1 text-xs font-semibold text-default-600 dark:bg-white/[0.06]">{item.max}인</span>
                                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{item.simple}</span>
                                    </div>
                                </CardHeader>
                                <Divider/>
                                <CardBody className="px-3 py-3 sm:px-5">
                                    <div className="w-full overflow-x-auto scrollbar-hide">
                                        <Table 
                                             removeWrapper
                                             aria-label="difficulty table"
                                             className="w-[720px] sm:w-full"
                                             classNames={tableClassNames}>
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
                                                        <TableCell><span className={difficulty.isBiweekly ? "font-bold text-success" : "text-default-300"}>{difficulty.isBiweekly ? '적용' : '—'}</span></TableCell>
                                                        <TableCell><span className={difficulty.isOnce ? "font-bold text-success" : "text-default-300"}>{difficulty.isOnce ? '적용' : '—'}</span></TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardBody>
                                <Divider/>
                                <CardFooter className="px-5 py-3">
                                    <div className="w-full flex gap-2">
                                        <div className="grow-1"/>
                                        <Button radius="lg" color="danger" variant="flat" onPress={async () => await onClickRemove(index, boss, setBoss)}>삭제</Button>
                                        <Button radius="lg" color="primary" variant="flat" onPress={() => onClickEdit(index, setEditMode, setEditIndex, onOpen, boss[index], setInputName, setInputSimple, setInputScreenNames, setInputMax, setInputs)}>수정</Button>
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
                radius="lg"
                classNames={modalClassNames}
                onOpenChange={onOpenChange}
                onClose={onCloseModal}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col items-start gap-1">
                                <h2 className="text-xl font-bold">{isEditMode ? '콘텐츠 수정' : '콘텐츠 추가'}</h2>
                                <p className="text-sm font-normal text-default-500">콘텐츠 기본 정보와 난이도별 보상을 입력하세요.</p>
                            </ModalHeader>
                            <ModalBody>
                                <section className="rounded-2xl border border-default-200 bg-default-50/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                                <h3 className="mb-4 text-sm font-bold text-default-700">기본 정보</h3>
                                <Input
                                    label="콘텐츠 명"
                                    labelPlacement="outside"
                                    placeholder="군단장 레이드 - 카멘"
                                    value={inputName}
                                    radius="lg"
                                    variant="bordered"
                                    classNames={fieldClassNames}
                                    onValueChange={setInputName}/>
                                <div className="mt-4 w-full grid sm:grid-cols-[2fr_1fr] gap-3">
                                    <Input
                                        label="간단 콘텐츠 명"
                                        labelPlacement="outside"
                                        placeholder="카멘"
                                        value={inputSimple}
                                        radius="lg"
                                        variant="bordered"
                                        classNames={fieldClassNames}
                                        onValueChange={setInputSimple}/>
                                    <NumberInput
                                        label="최대 인원"
                                        labelPlacement="outside"
                                        placeholder="0 ~ 99"
                                        minValue={0}
                                        maxValue={99}
                                        step={1}
                                        value={inputMax}
                                        radius="lg"
                                        variant="bordered"
                                        classNames={fieldClassNames}
                                        onValueChange={setInputMax}/>
                                </div>
                                <Textarea
                                    className="mt-4"
                                    label="게임 화면 표시 이름"
                                    labelPlacement="outside"
                                    description="게임 좌측 상단에 표시되는 이름을 줄바꿈 또는 쉼표로 구분해 입력하세요."
                                    placeholder={'어둠군단장 카멘\n또 다른 표시 이름'}
                                    value={inputScreenNames}
                                    radius="lg"
                                    variant="bordered"
                                    classNames={fieldClassNames}
                                    onValueChange={setInputScreenNames}/>
                                </section>
                                <div className="flex items-center justify-between pt-1">
                                    <div>
                                        <h3 className="font-bold">난이도 및 보상</h3>
                                        <p className="text-xs text-default-500">관문별 체크리스트와 골드 정보를 설정합니다.</p>
                                    </div>
                                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{inputs.length}개 항목</span>
                                </div>
                                <div className="space-y-3 pr-1">
                                    {inputs.map((input: Difficulty, index: number) => (
                                        <div key={index} className="rounded-2xl border border-default-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <div className="grow">
                                                    <span className="text-sm font-bold">난이도 {index+1}</span>
                                                    <span className="ml-2 text-xs text-default-400">저장 순서 {index+1}번째</span>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="flat"
                                                    radius="lg"
                                                    isDisabled={index === 0}
                                                    aria-label={`${index+1}번 난이도를 위로 이동`}
                                                    onPress={() => moveDifficulty(index, -1, inputs, setInputs)}>
                                                    ↑ 위로
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="flat"
                                                    radius="lg"
                                                    isDisabled={index === inputs.length - 1}
                                                    aria-label={`${index+1}번 난이도를 아래로 이동`}
                                                    onPress={() => moveDifficulty(index, 1, inputs, setInputs)}>
                                                    ↓ 아래로
                                                </Button>
                                                <Button size="sm" color="danger" variant="light" radius="lg" onPress={() => useOnRemoveDifficulty(index, inputs, setInputs)}>항목 삭제</Button>
                                            </div>
                                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 items-end mt-3">
                                                <Input
                                                    label="난이도"
                                                    labelPlacement="outside"
                                                     placeholder="하드 1-3관"
                                                     value={input.difficulty}
                                                     radius="lg"
                                                     variant="bordered"
                                                     classNames={fieldClassNames}
                                                     onValueChange={(value: string) => onValueChangeDifficulty(value, index)}/>
                                                <NumberInput
                                                    label="입장 레벨"
                                                    labelPlacement="outside"
                                                    placeholder="0 ~ 9999"
                                                    minValue={0}
                                                    maxValue={9999}
                                                     step={5}
                                                     value={input.level}
                                                     radius="lg"
                                                     variant="bordered"
                                                     classNames={fieldClassNames}
                                                     onValueChange={(value: number) => onValueChangeLevel(value, index)}/>
                                                <NumberInput
                                                    label="관문"
                                                    labelPlacement="outside"
                                                    placeholder="0 ~ 9999999"
                                                    minValue={0}
                                                    maxValue={9999999}
                                                     step={1}
                                                     value={input.stage}
                                                     radius="lg"
                                                     variant="bordered"
                                                     classNames={fieldClassNames}
                                                     onValueChange={(value: number) => onValueChangeStage(value, index)}/>
                                                <NumberInput
                                                    label="지급 골드"
                                                    labelPlacement="outside"
                                                    placeholder="0 ~ 9999999"
                                                    minValue={0}
                                                    maxValue={9999999}
                                                     step={5}
                                                     value={input.gold}
                                                     radius="lg"
                                                     variant="bordered"
                                                     classNames={fieldClassNames}
                                                     onValueChange={(value: number) => onValueChangeGold(value, index)}/>
                                                <NumberInput
                                                    label="귀속 골드"
                                                    labelPlacement="outside"
                                                    placeholder="0 ~ 9999999"
                                                    minValue={0}
                                                    maxValue={9999999}
                                                     step={5}
                                                     value={input.boundGold}
                                                     radius="lg"
                                                     variant="bordered"
                                                     classNames={fieldClassNames}
                                                     onValueChange={(value: number) => onValueChangeBoundGold(value, index)}/>
                                                <NumberInput
                                                    label="더보기"
                                                    labelPlacement="outside"
                                                    placeholder="0 ~ 9999999"
                                                    minValue={0}
                                                    maxValue={9999999}
                                                     step={5}
                                                     value={input.bonus}
                                                     radius="lg"
                                                     variant="bordered"
                                                     classNames={fieldClassNames}
                                                     onValueChange={(value: number) => onValueChangeBonus(value, index)}/>
                                                <div className="col-span-2 flex flex-wrap gap-5 rounded-xl bg-default-50 px-3 py-3 dark:bg-white/[0.04] lg:col-span-3">
                                                <Switch
                                                    size="sm"
                                                    color="primary"
                                                    isSelected={input.isBiweekly} 
                                                    onValueChange={(isSelected: boolean) => onValueChangeBiweekly(isSelected, index)}>격주 콘텐츠</Switch>
                                                <Switch
                                                    size="sm"
                                                    color="primary"
                                                    isSelected={input.isOnce} 
                                                    onValueChange={(isSelected: boolean) => onValueChangeOnce(isSelected, index)}>원정대 1회</Switch>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    fullWidth
                                    color="primary"
                                    variant="flat"
                                    radius="lg"
                                    className="mb-2 font-bold"
                                    onPress={onAddInput}>난이도 추가</Button>
                            </ModalBody>
                            <ModalFooter>
                                <Button radius="lg" color="default" variant="flat" onPress={onClose}>취소</Button>
                                <Button radius="lg" color="primary" className="min-w-24 font-bold" onPress={async () => await useOnAddData(inputName, inputSimple, inputScreenNames, inputMax, inputs, onClose, boss, setBoss, isEditMode, editIndex)}>{isEditMode ? '수정 저장' : '콘텐츠 추가'}</Button>
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
                variant="solid"
                color="primary"
                aria-label="Checklist Options" 
                radius="lg"
                classNames={{
                    base: "mb-4",
                    tabList: "gap-1 rounded-xl border border-default-200 bg-default-100 p-1 dark:border-white/10 dark:bg-white/[0.05]",
                    tab: "h-10 px-5",
                    cursor: "bg-white shadow-sm dark:bg-white/10",
                    tabContent: "font-bold text-default-500 group-data-[selected=true]:text-primary",
                    panel: "w-full p-0"
                }}>
                {menus.map((menu: TabMenu) => (
                    <Tab key={menu.key} title={menu.title}>
                        {menu.component}
                    </Tab>
                ))}
            </Tabs>
        </div>
    )
}
