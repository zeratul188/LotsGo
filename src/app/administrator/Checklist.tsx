'use client'
import { 
    Tabs, Tab, 
    addToast, 
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
    onClickRemove 
} from "./bossFeat";

type TabMenu = {
    key: string,
    title: string,
    component: ReactNode
}

// 숙제 관리 - 콘텐츠 관리 컴포넌트
function BossComponent() {
    const [isLoading, setLoading] = useState(true);
    const [boss, setBoss] = useState<Boss[]>([]);
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [inputName, setInputName] = useState('');
    const [inputs, setInputs] = useState<Difficulty[]>([]);
    const [isEditMode, setEditMode] = useState(false);
    const [editIndex, setEditIndex] = useState(-1);

    const onAddInput = useOnAddInput(setInputs);
    const {
        onValueChangeDifficulty,
        onValueChangeLevel,
        onValueChangeGold,
        onValueChangeBiweekly
    } = useInputHandlers(inputs, setInputs);
    const onCloseModal = useClearData(setInputName, setInputs, setEditMode, setEditIndex);

    useEffect(() => {
        const fetchBoss = async () => {
            const bossRes = await fetch(`/api/checklist/boss`);
            if (!bossRes.ok) {
                addToast({
                    title: "데이터 로딩 오류",
                    description: '알 수 없는 오류로 인해 데이터를 불러올 수 없습니다.',
                    color: "danger"
                });
            } else {
                const data: Boss[] = await bossRes.json();
                setBoss(data);
                setLoading(false);
            }
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
                        {boss.length !== 0 ? boss.map((item: Boss, index: number) => (
                            <Card key={index} radius="sm" className="mb-6">
                                <CardHeader>
                                    <h2 className="text-xl font-bold">{item.name}</h2>
                                </CardHeader>
                                <Divider/>
                                <CardBody>
                                    <Table removeWrapper aria-label="difficulty table">
                                        <TableHeader>
                                            <TableColumn>난이도</TableColumn>
                                            <TableColumn>입장 가능 레벨</TableColumn>
                                            <TableColumn>획득 골드</TableColumn>
                                            <TableColumn>격주 여부</TableColumn>
                                        </TableHeader>
                                        <TableBody>
                                            {item.difficulty.map((difficulty: Difficulty, idx: number) => (
                                                <TableRow key={idx}>
                                                    <TableCell>{difficulty.difficulty}</TableCell>
                                                    <TableCell>{difficulty.level.toLocaleString()}</TableCell>
                                                    <TableCell>{difficulty.gold.toLocaleString()}</TableCell>
                                                    <TableCell>{difficulty.isBiweekly ? '○' : '✕'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardBody>
                                <Divider/>
                                <CardFooter>
                                    <div className="w-full flex gap-4">
                                        <div className="grow-1"/>
                                        <Button color="danger" onPress={async () => await onClickRemove(index, boss, setBoss)}>삭제</Button>
                                        <Button color="primary" onPress={() => onClickEdit(index, setEditMode, setEditIndex, onOpen, boss[index], setInputName, setInputs)}>수정</Button>
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
                                <div className="max-h-[500px] overflow-y-auto">
                                    {inputs.map((input: Difficulty, index: number) => (
                                        <div key={index} className="mt-4">
                                            <div className="flex gap-2">
                                                <span className="text-md font-bold grow-1">{index+1}번 항목</span>
                                                <span 
                                                    className="text-red-500 underline hover:text-red-800 cursor-pointer"
                                                    onClick={() => useOnRemoveDifficulty(index, inputs, setInputs)}>삭제하기</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 items-center mt-2">
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
                                                    label="지급 골드"
                                                    labelPlacement="outside"
                                                    placeholder="0 ~ 9999999"
                                                    minValue={0}
                                                    maxValue={9999999}
                                                    step={10}
                                                    value={input.gold}
                                                    onValueChange={(value: number) => onValueChangeGold(value, index)}/>
                                                <Switch 
                                                    isSelected={input.isBiweekly} 
                                                    onValueChange={(isSelected: boolean) => onValueChangeBiweekly(isSelected, index)}>격주 여부</Switch>
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
                                <Button color="primary" onPress={async () => await useOnAddData(inputName, inputs, onClose, boss, setBoss, isEditMode, editIndex)}>{isEditMode ? '수정' : '추가'}</Button>
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
            key: 'gold',
            title: '골드 관리',
            component: null
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