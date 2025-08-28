import { 
    Button, 
    Card, CardBody, 
    Input, 
    Modal, 
    ModalBody, 
    ModalContent, 
    ModalHeader, 
    useDisclosure,
    Tooltip,
    Tabs,
    Tab,
    Table,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    TableHeader,
    Pagination,
    Chip
} from "@heroui/react";
import { Raid } from "../api/raids/route";
import { useEffect, useState } from "react";
import { SetStateFn, useMobileQuery } from "@/utiils/utils";
import clsx from "clsx";
import { handleAddRaid, handleJoinParty, handleJoinPrivateParty, isInvitedParty, joinPublicParty } from "./raidListFeat";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { LoadingComponent } from "../UtilsCompnents";
import { Character } from "../store/loginSlice";
import LeaderIcon from "@/Icons/LeaderIcon";
import LockerIcon from "@/Icons/LockerIcon";

// 파티 찾기 컴포넌트
type FindComponentProps = {
    raids: Raid[],
    setRaids: SetStateFn<Raid[]>,
    userId: string | null,
    joinRaids: Raid[],
    setJoinRaids: SetStateFn<Raid[]>,
    isLoadingData: boolean,
    setLoadingData: SetStateFn<boolean>
}
export function FindComponent({ raids, setRaids, userId, joinRaids, setJoinRaids, isLoadingData, setLoadingData }: FindComponentProps) {
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
            <Card radius="sm">
                <CardBody>
                    <div className="w-full flex flex-col sm:flex-row gap-3 sm:items-center">
                        <div>
                            <p className="fadedtext text-[8pt]">총 파티 개수</p>
                            <p className="text-lg font-bold">{results.length}</p>
                        </div>
                        <Input
                            label="검색"
                            placeholder="파티명 또는 파티장 이름을 검색하세요."
                            value={searchValue}
                            onValueChange={setSearchValue}
                            maxLength={20}
                            radius="sm"
                            size="sm"
                            className="w-full sm:w-[240px]"/>
                        <Button
                            size={isMobile ? 'md' : 'lg'}
                            color="primary"
                            radius="sm">
                            검색
                        </Button>
                        <div className="grow"/>
                        <Tooltip showArrow isDisabled={userId !== null && joinRaids.length < 5} content={joinRaids.length >= 5 ? "5개 이상일 경우 파티에 들어가실 수 없습니다." : "로그인 후 이용 가능합니다."}>
                            <div>
                                <Button
                                    fullWidth
                                    size={isMobile ? 'md' : 'lg'}
                                    color="primary"
                                    radius="sm"
                                    isDisabled={!userId || joinRaids.length >= 5}
                                    onPress={() => setOpenJoin(true)}>
                                    파티 참가
                                </Button>
                            </div>
                        </Tooltip>
                        <Tooltip showArrow isDisabled={userId !== null && joinRaids.length < 5} content={joinRaids.length >= 5 ? "5개 이상일 경우 파티에 만드실 수 없습니다." : "로그인 후 이용 가능합니다."}>
                            <div>
                                <Button
                                    fullWidth
                                    size={isMobile ? 'md' : 'lg'}
                                    color="primary"
                                    radius="sm"
                                    isDisabled={!userId || joinRaids.length >= 5}
                                    onPress={onOpen}>
                                    파티 추가
                                </Button>
                            </div>
                        </Tooltip>
                    </div>
                </CardBody>
            </Card>
            <div className="w-full overflow-x-auto scrollbar-hide mt-5">
                {isLoadingData ? <LoadingComponent heightStyle={'h-[calc(100vh-105px)]'}/> : (
                    <div>
                        <div className="w-full grid min-[681px]:grid-cols-2 min-[1021px]:grid-cols-3 gap-3 p-2">
                            {results.slice((page-1) * rowsPerPage, page * rowsPerPage).map((raid, index) => (
                                <Card key={index} radius="sm" shadow="sm">
                                    <CardBody>
                                        <div>
                                            <div className="w-full flex items-start">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-xl font-bold">{raid.name}</h3>
                                                    {raid.isPwd ? <div className="fadedtext"><LockerIcon size={16}/></div> : null}
                                                </div>
                                                <div className="grow"/>
                                                <p className="fadedtext text-sm">Lv.{raid.avgLevel}</p>
                                            </div>
                                            <div className="w-full flex gap-1 items-end">
                                                <Chip
                                                    size="sm"
                                                    radius="sm"
                                                    variant="flat"
                                                    color="secondary"
                                                    startContent={<div className="pl-1 pr-0.5"><LeaderIcon size={12}/></div>}>
                                                    {raid.managerNickname}
                                                </Chip>
                                                <Chip
                                                    size="sm"
                                                    radius="sm"
                                                    variant="flat">
                                                    {raid.members.length}명
                                                </Chip>
                                                <div className="grow"/>
                                                <Button
                                                    size="sm"
                                                    color="primary"
                                                    isLoading={isLoadingJoin[raid.id] ?? false}
                                                    isDisabled={isInvitedParty(raid.id, joinRaids)}
                                                    radius="sm"
                                                    onPress={async () => {
                                                        if (raid.isPwd) {
                                                            setSelectedRaid(raid);
                                                            setOpenPrivate(true);
                                                        } else {
                                                            await joinPublicParty(userId, raid, joinRaids, setJoinRaids, setLoadingJoin);
                                                        }
                                                    }}>
                                                    {isInvitedParty(raid.id, joinRaids) ? '참가 완료' : '참가'}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
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
                setJoinRaids={setJoinRaids}/>
            <AddPartyModal 
                isOpen={isOpen} 
                onOpenChange={onOpenChange} 
                raids={raids} 
                setRaids={setRaids} 
                userId={userId}
                joinRaids={joinRaids}
                setJoinRaids={setJoinRaids}/>
            <JoinPrivatePartyModal
                isOpenPrivate={isOpenPrivate}
                setOpenPrivate={setOpenPrivate}
                userId={userId}
                joinRaids={joinRaids}
                setJoinRaids={setJoinRaids}
                selectedRaid={selectedRaid}
                setSelectedRaid={setSelectedRaid}/>
        </div>
    )
}

// 공개 파티 비밀번호 입력 Modal
type JoinPrivatePartyModalProps = {
    isOpenPrivate: boolean,
    setOpenPrivate: SetStateFn<boolean>,
    userId: string | null,
    joinRaids: Raid[],
    setJoinRaids: SetStateFn<Raid[]>,
    selectedRaid: Raid | null,
    setSelectedRaid: SetStateFn<Raid | null>
}
function JoinPrivatePartyModal({ isOpenPrivate, setOpenPrivate, userId, joinRaids, setJoinRaids, selectedRaid, setSelectedRaid }: JoinPrivatePartyModalProps) {
    const [inputPwd, setInputPwd] = useState('');
    const [isLoadingJoin, setLoadingJoin] = useState(false);
    const [isErrorPwd, setErrorPwd] = useState(false);

    return (
        <Modal
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
                        <ModalHeader>공개 파티 참가</ModalHeader>
                        <ModalBody>
                            <div className="w-full pb-4">
                                <Input
                                    isRequired
                                    type="password"
                                    label="비밀번호"
                                    labelPlacement="outside"
                                    placeholder="최대 18글자"
                                    value={inputPwd}
                                    onValueChange={setInputPwd}
                                    radius="sm"
                                    isInvalid={isErrorPwd}
                                    errorMessage="비밀번호가 일치하지 않습니다."
                                    maxLength={18}/>
                                <Button
                                    fullWidth
                                    color="primary"
                                    radius="sm"
                                    isDisabled={inputPwd === ''}
                                    isLoading={isLoadingJoin}
                                    className="mt-4"
                                    onPress={async () => await handleJoinPrivateParty(userId, selectedRaid, inputPwd, joinRaids, setJoinRaids, setLoadingJoin, onClose)}>
                                    참가
                                </Button>
                            </div>
                        </ModalBody>
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
    setJoinRaids: SetStateFn<Raid[]>
}
function JoinPartyModal({ isOpen, setOpen, userId, joinRaids, setJoinRaids }: JoinPartyModalProps) {
    const [inputLink, setInputLink] = useState('');
    const [inputPwd, setInputPwd] = useState('');
    const [isLoadingJoin, setLoadingJoin] = useState(false);
    const [party, setParty] = useState<Raid | null>(null);
    const [isErrorLink, setErrorLink] = useState(false);
    const [isErrorPwd, setErrorPwd] = useState(false);

    return (
        <Modal
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
                        <ModalHeader>파티 참가</ModalHeader>
                        <ModalBody>
                            <div className="w-full pb-4">
                                <Input
                                    isRequired
                                    label="초대 링크"
                                    labelPlacement="outside"
                                    placeholder="20글자"
                                    isDisabled={party !== null}
                                    value={inputLink}
                                    onValueChange={setInputLink}
                                    radius="sm"
                                    isInvalid={isErrorLink}
                                    errorMessage="초대 링크가 올바르지 않습니다."
                                    maxLength={30}/>
                                {party ? party.isPwd ? (
                                    <div className="mt-4">
                                        <p className="mb-8 text-sm">참가할 파티가 비밀번호가 설정되어 있습니다. 비밀번호를 입력해주세요.</p>
                                        <Input
                                            isRequired
                                            type="password"
                                            label="비밀번호"
                                            labelPlacement="outside"
                                            placeholder="최대 18글자"
                                            value={inputPwd}
                                            onValueChange={setInputPwd}
                                            radius="sm"
                                            isInvalid={isErrorPwd}
                                            errorMessage="비밀번호가 일치하지 않습니다."
                                            maxLength={18}/>
                                    </div>
                                ) : null : null}
                                <Button
                                    fullWidth
                                    color="primary"
                                    radius="sm"
                                    isDisabled={inputLink === '' || (party !== null && inputPwd === '')}
                                    isLoading={isLoadingJoin}
                                    className="mt-4"
                                    onPress={async () => await handleJoinParty(userId, inputLink, inputPwd, setLoadingJoin, party, setParty, setErrorLink, setErrorPwd, onClose, joinRaids, setJoinRaids)}>
                                    참가
                                </Button>
                            </div>
                        </ModalBody>
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
    setRaids: SetStateFn<Raid[]>,
    userId: string | null,
    joinRaids: Raid[],
    setJoinRaids: SetStateFn<Raid[]>
}
function AddPartyModal({ isOpen, onOpenChange, raids, setRaids, userId, joinRaids, setJoinRaids }: AddPartyModalProps) {
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
                        <ModalHeader>파티 추가</ModalHeader>
                        <ModalBody>
                            <div className="w-full pb-4">
                                <Input
                                    isRequired
                                    label="파티명"
                                    labelPlacement="outside"
                                    placeholder="최대 12글자"
                                    value={inputName}
                                    onValueChange={setInputName}
                                    radius="sm"
                                    maxLength={12}/>
                                <p className="fadedtext mt-3 text-sm">공개 여부</p>
                                <Tabs 
                                    fullWidth
                                    radius="sm" 
                                    color="primary" 
                                    selectedKey={selectedOpen} 
                                    onSelectionChange={(key) => setSelectedOpen(String(key))}
                                    className="mt-1">
                                    <Tab key="yes" title="공개"/>
                                    <Tab key="no" title="비공개"/>
                                </Tabs>
                                <p className="fadedtext mt-3 text-sm">비밀번호 설정</p>
                                <Tabs 
                                    fullWidth
                                    radius="sm" 
                                    color="primary" 
                                    selectedKey={selectedPwd} 
                                    onSelectionChange={(key) => setSelectedPwd(String(key))}
                                    className="mt-1 mb-4">
                                    <Tab key="yes" title="미설정"/>
                                    <Tab key="no" title="설정"/>
                                </Tabs>
                                <Input
                                    isRequired
                                    type="password"
                                    label="비밀번호"
                                    labelPlacement="outside"
                                    placeholder="최대 18글자"
                                    value={inputPwd}
                                    onValueChange={setInputPwd}
                                    radius="sm"
                                    maxLength={18}
                                    className={clsx(
                                        "mb-4",
                                        selectedPwd === 'no' ? '' : 'hidden'
                                    )}/>
                                <Button
                                    fullWidth
                                    color="primary"
                                    isLoading={isLoadingAdd}
                                    isDisabled={inputName.trim() === '' || (selectedPwd === 'no' && inputPwd.trim() === '')}
                                    radius="sm"
                                    onPress={async () => await handleAddRaid(inputName, selectedOpen === 'yes', selectedPwd === 'no', inputPwd, raids, setRaids, onClose, userId, setLoadingAdd, titleCharacter, joinRaids, setJoinRaids, level)}>
                                    추가
                                </Button>
                            </div>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}