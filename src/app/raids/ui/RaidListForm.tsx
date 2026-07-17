import { 
    Button, 
    Card, CardBody, 
    Input, 
    Modal, 
    ModalBody, 
    ModalContent, 
    ModalFooter,
    ModalHeader, 
    useDisclosure,
    Tooltip,
    Tabs,
    Tab,
    Pagination,
    Chip
} from "@heroui/react";
import { Raid } from "../model/types";
import { useEffect, useState } from "react";
import { SetStateFn, useMobileQuery } from "@/utiils/utils";
import clsx from "clsx";
import { handleAddRaid, handleJoinParty, handleJoinPrivateParty, isInvitedParty, joinPublicParty } from "../lib/raidListFeat";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/store";
import { LoadingComponent } from "@/app/UtilsCompnents";
import { Character } from "@/app/store/loginSlice";
import LeaderIcon from "@/Icons/LeaderIcon";
import LockerIcon from "@/Icons/LockerIcon";
import dynamic from "next/dynamic";
const FixedLineAd = dynamic(() => import("@/app/ad/FixedLineAd"), { ssr: false });

// 파티 찾기 컴포넌트
type FindComponentProps = {
    joinRaids: Raid[],
    isLoadingData: boolean,
    dispatch: AppDispatch
}
export function FindComponent({ joinRaids, isLoadingData, dispatch }: FindComponentProps) {
    const [results, setResults] = useState<Raid[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const isMobile = useMobileQuery();
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [page, setPage] = useState(1);
    const [isOpenJoin, setOpenJoin] = useState(false);
    const [isOpenPrivate, setOpenPrivate] = useState(false);
    const [selectedRaid, setSelectedRaid] = useState<Raid | null>(null);
    const [isLoadingJoin, setLoadingJoin] = useState<{ [id: string]: boolean }>({});
    const rowsPerPage = 30;
    const raids = useSelector((state: RootState) => state.party.raids);
    const userId = useSelector((state: RootState) => state.party.userId);

    useEffect(() => {
        const searchRaids: Raid[] = [];
        for (const raid of raids) {
            if (raid.isOpen && (raid.name.includes(searchValue) || raid.managerNickname.includes(searchValue))) {
                searchRaids.push(raid);
            }
        }
        for (let i = searchRaids.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); // 0..i
            [searchRaids[i], searchRaids[j]] = [searchRaids[j], searchRaids[i]];
        }
        setResults(searchRaids);
        setPage(1);
    }, [raids, searchValue]);

    return (
        <div>
            <Card radius="lg" className="border border-default-200/80 bg-content1 shadow-sm dark:border-white/10 dark:bg-[#18181b]">
                <CardBody className="p-4 sm:p-5">
                    <div className="mb-4 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold">공개 파티 찾기</h1>
                            <Chip size="sm" radius="full" variant="flat" color="primary">{results.length}개</Chip>
                        </div>
                        <p className="text-xs text-default-500">파티명이나 파티장 이름으로 참여할 파티를 찾아보세요.</p>
                    </div>
                    <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-end">
                        <Input
                            label="파티 검색"
                            labelPlacement="outside"
                            placeholder="파티명 또는 파티장 이름을 검색하세요."
                            value={searchValue}
                            onValueChange={setSearchValue}
                            maxLength={20}
                            radius="lg"
                            size="sm"
                            className="w-full sm:max-w-[360px]"
                            classNames={{ label: "text-xs font-medium text-default-500" }}/>
                        <Button
                            size={isMobile ? 'md' : 'md'}
                            color="primary"
                            radius="lg"
                            className="font-semibold sm:min-w-[88px]">
                            검색
                        </Button>
                        <div className="grow"/>
                        <Tooltip showArrow isDisabled={userId !== null && joinRaids.length < 5} content={joinRaids.length >= 5 ? "5개 이상일 경우 파티에 들어가실 수 없습니다." : "로그인 후 이용 가능합니다."}>
                            <div>
                                <Button
                                    fullWidth
                                    size="md"
                                    color="default"
                                    variant="flat"
                                    radius="lg"
                                    className="font-semibold"
                                    isDisabled={!userId || joinRaids.length >= 5}
                                    onPress={() => setOpenJoin(true)}>
                                    초대 링크 참가
                                </Button>
                            </div>
                        </Tooltip>
                        <Tooltip showArrow isDisabled={userId !== null && joinRaids.length < 5} content={joinRaids.length >= 5 ? "5개 이상일 경우 파티에 만드실 수 없습니다." : "로그인 후 이용 가능합니다."}>
                            <div>
                                <Button
                                    fullWidth
                                    size="md"
                                    color="primary"
                                    radius="lg"
                                    className="font-semibold"
                                    isDisabled={!userId || joinRaids.length >= 5}
                                    onPress={onOpen}>
                                    파티 만들기
                                </Button>
                            </div>
                        </Tooltip>
                    </div>
                </CardBody>
            </Card>
            {isMobile ? null : (
                <div className="w-full flex justify-center mt-8 overflow-hidden mb-4">
                    <div className="w-full max-w-[1240px] flex justify-center rounded-2xl bg-[#eeeeee] dark:bg-[#222222] p-4 mx-4">
                        <FixedLineAd isLoaded={true}/>
                    </div>
                </div>
            )}
            <div className="mt-5 min-h-[600px] w-full overflow-x-auto scrollbar-hide">
                {isLoadingData ? <LoadingComponent heightStyle={'h-[calc(100vh-105px)]'}/> : (
                    <div>
                        <div className="grid w-full gap-3 p-1 min-[681px]:grid-cols-2 min-[1021px]:grid-cols-3">
                            {results.slice((page-1) * rowsPerPage, page * rowsPerPage).map((raid) => {
                                const isJoined = isInvitedParty(raid.id, joinRaids);
                                return (
                                <Card key={raid.id} radius="lg" shadow="none" className="border border-default-200/80 bg-content1 transition-colors hover:border-primary-200 hover:bg-primary-50/30 dark:border-white/10 dark:bg-[#18181b] dark:hover:border-primary-500/40 dark:hover:bg-primary-500/5">
                                    <CardBody className="gap-4 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="min-w-0 grow">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="truncate text-lg font-bold">{raid.name}</h3>
                                                    {raid.isPwd ? <span className="text-default-400" title="비밀번호 필요"><LockerIcon size={15}/></span> : null}
                                                </div>
                                                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                                    <Chip size="sm" radius="full" variant="flat" color="secondary" startContent={<span className="pl-1"><LeaderIcon size={12}/></span>}>
                                                        {raid.managerNickname}
                                                    </Chip>
                                                    <Chip size="sm" radius="full" variant="flat">참여 {raid.members.length}명</Chip>
                                                </div>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <p className="text-[11px] text-default-400">평균 레벨</p>
                                                <p className="text-sm font-semibold tabular-nums text-default-600 dark:text-default-300">Lv.{raid.avgLevel}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-2 border-t border-default-100 pt-3 dark:border-white/[0.06]">
                                            <span className={clsx("text-xs font-medium", raid.isPwd ? "text-warning-600 dark:text-warning-400" : "text-success-600 dark:text-success-400")}>
                                                {raid.isPwd ? '비밀번호 필요' : '공개 파티'}
                                            </span>
                                            <Button
                                                size="sm"
                                                color={isJoined ? "success" : "primary"}
                                                variant={isJoined ? "flat" : "solid"}
                                                isLoading={isLoadingJoin[raid.id] ?? false}
                                                isDisabled={isJoined || !userId}
                                                radius="lg"
                                                className="font-semibold"
                                                onPress={async () => {
                                                    if (raid.isPwd) {
                                                        setSelectedRaid(raid);
                                                        setOpenPrivate(true);
                                                    } else {
                                                        await joinPublicParty(userId, raid, joinRaids, setLoadingJoin, dispatch);
                                                    }
                                                }}>
                                                {isJoined ? '참가 완료' : '참가'}
                                            </Button>
                                        </div>
                                    </CardBody>
                                </Card>
                                )
                            })}
                        </div>
                        {results.length === 0 && (
                            <Card radius="lg" shadow="none" className="border border-dashed border-default-200 bg-default-50/50 dark:border-white/10 dark:bg-white/[0.02]">
                                <CardBody className="items-center justify-center px-4 py-14 text-center">
                                    <p className="text-base font-semibold">조건에 맞는 공개 파티가 없습니다.</p>
                                    <p className="mt-1 text-sm text-default-500">다른 검색어를 입력하거나 새 파티를 만들어보세요.</p>
                                </CardBody>
                            </Card>
                        )}
                        <div className={clsx(
                            "flex w-full justify-center mt-3",
                            Math.ceil(results.length / rowsPerPage) > 1 ? '' : 'hidden'
                        )}>
                            <Pagination
                                isCompact
                                showControls
                                showShadow
                                color="primary"
                                page={page}
                                total={Math.ceil(results.length / rowsPerPage)}
                                onChange={(page) => setPage(page)}
                            />
                        </div>
                    </div>
                )}
            </div>
            <JoinPartyModal
                isOpen={isOpenJoin}
                setOpen={setOpenJoin}
                userId={userId}
                joinRaids={joinRaids}
                dispatch={dispatch}/>
            <AddPartyModal 
                isOpen={isOpen} 
                onOpenChange={onOpenChange} 
                raids={raids} 
                userId={userId}
                joinRaids={joinRaids}
                dispatch={dispatch}/>
            <JoinPrivatePartyModal
                isOpenPrivate={isOpenPrivate}
                setOpenPrivate={setOpenPrivate}
                userId={userId}
                joinRaids={joinRaids}
                selectedRaid={selectedRaid}
                setSelectedRaid={setSelectedRaid}
                dispatch={dispatch}/>
        </div>
    )
}

// 공개 파티 비밀번호 입력 Modal
type JoinPrivatePartyModalProps = {
    isOpenPrivate: boolean,
    setOpenPrivate: SetStateFn<boolean>,
    userId: string | null,
    joinRaids: Raid[],
    selectedRaid: Raid | null,
    setSelectedRaid: SetStateFn<Raid | null>,
    dispatch: AppDispatch
}
function JoinPrivatePartyModal({ isOpenPrivate, setOpenPrivate, userId, joinRaids, selectedRaid, setSelectedRaid, dispatch }: JoinPrivatePartyModalProps) {
    const [inputPwd, setInputPwd] = useState('');
    const [isLoadingJoin, setLoadingJoin] = useState(false);
    const [isErrorPwd, setErrorPwd] = useState(false);

    return (
        <Modal
            size="sm"
            radius="lg"
            isDismissable={false}
            isOpen={isOpenPrivate}
            onClose={() => {
                setSelectedRaid(null);
                setInputPwd('');
                setLoadingJoin(false);
                setOpenPrivate(false);
                setErrorPwd(false);
            }}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="px-5 pb-2 pt-5 text-xl">비밀번호로 참가</ModalHeader>
                        <ModalBody className="gap-4 px-5 py-3">
                            <div className="w-full">
                                <p className="text-sm text-default-500">선택한 파티의 비밀번호를 입력해 주세요.</p>
                                {selectedRaid && (
                                    <div className="mt-3 rounded-xl bg-default-50 px-3 py-3 dark:bg-white/[0.04]">
                                        <p className="font-semibold">{selectedRaid.name}</p>
                                        <p className="mt-1 text-xs text-default-500">파티장 {selectedRaid.managerNickname} · 평균 Lv.{selectedRaid.avgLevel} · 참여 {selectedRaid.members.length}명</p>
                                    </div>
                                )}
                                <Input
                                    isRequired
                                    type="password"
                                    label="비밀번호"
                                    labelPlacement="outside"
                                    placeholder="최대 18글자"
                                    value={inputPwd}
                                    onValueChange={setInputPwd}
                                    radius="lg"
                                    isInvalid={isErrorPwd}
                                    errorMessage="비밀번호가 일치하지 않습니다."
                                    maxLength={18}/>
                            </div>
                        </ModalBody>
                        <ModalFooter className="gap-2 px-5 pb-5 pt-2">
                            <Button variant="flat" radius="lg" onPress={onClose}>취소</Button>
                            <Button color="primary" radius="lg" className="grow font-semibold" isDisabled={inputPwd === ''} isLoading={isLoadingJoin} onPress={async () => await handleJoinPrivateParty(userId, selectedRaid, inputPwd, joinRaids, setLoadingJoin, onClose, dispatch)}>참가하기</Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

// 파티 참가 Modal
type JoinPartyModalProps = {
    isOpen: boolean,
    setOpen: SetStateFn<boolean>,
    userId: string | null,
    joinRaids: Raid[],
    dispatch: AppDispatch
}
function JoinPartyModal({ isOpen, setOpen, userId, joinRaids, dispatch }: JoinPartyModalProps) {
    const [inputLink, setInputLink] = useState('');
    const [inputPwd, setInputPwd] = useState('');
    const [isLoadingJoin, setLoadingJoin] = useState(false);
    const [party, setParty] = useState<Raid | null>(null);
    const [isErrorLink, setErrorLink] = useState(false);
    const [isErrorPwd, setErrorPwd] = useState(false);

    return (
        <Modal
            size="sm"
            radius="lg"
            isDismissable={false}
            isOpen={isOpen}
            onClose={() => {
                setInputLink('');
                setInputPwd('');
                setLoadingJoin(false);
                setOpen(false);
                setParty(null);
                setErrorLink(false);
                setErrorPwd(false);
            }}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="px-5 pb-2 pt-5 text-xl">초대 링크로 참가</ModalHeader>
                        <ModalBody className="gap-4 px-5 py-3">
                            <div className="w-full">
                                <p className="mb-3 text-sm text-default-500">파티장에게 받은 초대 링크를 입력해 주세요.</p>
                                <Input
                                    isRequired
                                    label="초대 링크"
                                    labelPlacement="outside"
                                    placeholder="20글자"
                                    isDisabled={party !== null}
                                    value={inputLink}
                                    onValueChange={setInputLink}
                                    radius="lg"
                                    isInvalid={isErrorLink}
                                    errorMessage="초대 링크가 올바르지 않습니다."
                                    maxLength={30}/>
                                {party ? party.isPwd ? (
                                    <div className="mt-4 rounded-xl bg-default-50 p-3 dark:bg-white/[0.04]">
                                        <p className="mb-3 text-sm text-default-600 dark:text-default-300">비밀번호가 설정된 파티입니다. 비밀번호를 입력해 주세요.</p>
                                        <Input
                                            isRequired
                                            type="password"
                                            label="비밀번호"
                                            labelPlacement="outside"
                                            placeholder="최대 18글자"
                                            value={inputPwd}
                                            onValueChange={setInputPwd}
                                            radius="lg"
                                            isInvalid={isErrorPwd}
                                            errorMessage="비밀번호가 일치하지 않습니다."
                                            maxLength={18}/>
                                    </div>
                                ) : null : null}
                            </div>
                        </ModalBody>
                        <ModalFooter className="gap-2 px-5 pb-5 pt-2">
                            <Button variant="flat" radius="lg" onPress={onClose}>취소</Button>
                            <Button color="primary" radius="lg" className="grow font-semibold" isDisabled={inputLink === '' || (party !== null && inputPwd === '')} isLoading={isLoadingJoin} onPress={async () => await handleJoinParty(userId, inputLink, inputPwd, setLoadingJoin, party, setParty, setErrorLink, setErrorPwd, onClose, joinRaids, dispatch)}>참가하기</Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}



// 파티 추가 Modal
type AddPartyModalProps = {
    isOpen: boolean,
    onOpenChange: () => void,
    raids: Raid[],
    userId: string | null,
    joinRaids: Raid[],
    dispatch: AppDispatch
}
function AddPartyModal({ isOpen, onOpenChange, raids, userId, joinRaids, dispatch }: AddPartyModalProps) {
    const [inputName, setInputName] = useState("");
    const [selectedPwd, setSelectedPwd] = useState('yes');
    const [selectedOpen, setSelectedOpen] = useState('yes');
    const [inputPwd, setInputPwd] = useState('');
    const [isLoadingAdd, setLoadingAdd] = useState(false);
    const titleCharacter: string = useSelector((state: RootState) => state.login.user.character);
    const expeditions: Character[] = useSelector((state: RootState) => state.login.user.expedition);
    const findCharacter = expeditions.find(character => character.nickname === titleCharacter);
    const level = findCharacter ? findCharacter.level : 0;

    return (
        <Modal 
            size="sm"
            radius="lg"
            isDismissable={false} 
            isOpen={isOpen} 
            onOpenChange={onOpenChange}
            onClose={() => {
                setInputName('');
                setSelectedPwd('yes');
                setSelectedOpen('yes');
                setInputPwd('');
                setLoadingAdd(false);
            }}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="px-5 pb-2 pt-5 text-xl">새 파티 만들기</ModalHeader>
                        <ModalBody className="gap-4 px-5 py-3">
                            <div className="w-full">
                                <p className="mb-4 text-sm text-default-500">함께 플레이할 파티 정보를 설정해 주세요.</p>
                                <Input
                                    isRequired
                                    label="파티명"
                                    labelPlacement="outside"
                                    placeholder="최대 12글자"
                                    value={inputName}
                                    onValueChange={setInputName}
                                    radius="lg"
                                    maxLength={12}/>
                                <p className="mt-5 text-xs font-semibold text-default-500">공개 범위</p>
                                <Tabs 
                                    fullWidth
                                    radius="lg"
                                    color="primary" 
                                    selectedKey={selectedOpen} 
                                    onSelectionChange={(key) => setSelectedOpen(String(key))}
                                    className="mt-2">
                                    <Tab key="yes" title="공개 파티"/>
                                    <Tab key="no" title="비공개 파티"/>
                                </Tabs>
                                <p className="mt-5 text-xs font-semibold text-default-500">입장 방식</p>
                                <Tabs 
                                    fullWidth
                                    radius="lg"
                                    color="primary" 
                                    selectedKey={selectedPwd} 
                                    onSelectionChange={(key) => setSelectedPwd(String(key))}
                                    className="mt-2">
                                    <Tab key="yes" title="누구나 참가"/>
                                    <Tab key="no" title="비밀번호 사용"/>
                                </Tabs>
                                <Input
                                    isRequired
                                    type="password"
                                    label="비밀번호"
                                    labelPlacement="outside"
                                    placeholder="최대 18글자"
                                    value={inputPwd}
                                    onValueChange={setInputPwd}
                                    maxLength={18}
                                    radius="lg"
                                    className={clsx(
                                        "mt-3",
                                        selectedPwd === 'no' ? '' : 'hidden'
                                    )}/>
                            </div>
                        </ModalBody>
                        <ModalFooter className="gap-2 px-5 pb-5 pt-2">
                            <Button variant="flat" radius="lg" onPress={onClose}>취소</Button>
                            <Button fullWidth color="primary" isLoading={isLoadingAdd} isDisabled={inputName.trim() === '' || (selectedPwd === 'no' && inputPwd.trim() === '')} radius="lg" className="font-semibold" onPress={async () => await handleAddRaid(dispatch, inputName, selectedOpen === 'yes', selectedPwd === 'no', inputPwd, onClose, userId, setLoadingAdd, titleCharacter, joinRaids, level)}>파티 만들기</Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
