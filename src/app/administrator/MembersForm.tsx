import { useEffect, useMemo, useRef, useState } from "react"
import { Member } from "../api/auth/members/route"
import { LoadingComponent } from "../UtilsCompnents";
import { getActivityRange, handleClickIp, handleRemoveMember, isLocked, loadData, loadHistorys } from "./membersFeat";
import { Button, Chip, Input, Modal, ModalBody, ModalContent, ModalHeader, Pagination, Popover, PopoverContent, PopoverTrigger, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { formatDate, SetStateFn, useMobileQuery } from "@/utiils/utils";
import { History } from "../setting/model/types";

export default function MembersComponent() {
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [isLoadingButton, setLoadingButton] = useState(false);
    const [search, setSearch] = useState('');
    const [result, setResult] = useState<Member[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [isOpenSessionModal, setOpenSessionModal] = useState(false);
    const rowsPerPage = 20;

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return result.slice(start, end);
    }, [page, result]);

    useEffect(() => {
        const loadFuns = async () => {
            await loadData(setMembers, setLoading);
        }
        loadFuns();
    }, []);

    useEffect(() => {
        const searchedMembers = members.filter(member => member.id.includes(search) || member.character.includes(search) || member.email.includes(search));
        setResult(searchedMembers);
    }, [members]);

    if (isLoading) {
        return <LoadingComponent heightStyle={'h-[calc(100vh-105px)]'}/>;
    }

    return (
        <div className="w-full">
            <div className="flex justify-end mb-4">
                <div className="flex gap-2 w-full flex-col sm:flex-row">
                    <div className="grow flex gap-3">
                        <div>
                            <p className="fadedtext text-[10pt]">가입한 맴버 수</p>
                            <p className="font-bold text-xl">{members.length}</p>
                        </div>
                        <div>
                            <p className="fadedtext text-[10pt]">검색 결과 개수</p>
                            <p className="font-bold text-xl">{result.length}</p>
                        </div>
                    </div>
                    <Input
                        placeholder="검색 내용을 입력하세요."
                        radius="sm"
                        value={search}
                        onValueChange={setSearch}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const searchedMembers = members.filter(member => member.id.includes(search) || member.character.includes(search) || member.email.includes(search) || member.expeditions.some(character => character.nickname === search));
                                setResult(searchedMembers);
                            }
                        }}
                        className="w-full sm:w-[240px]"/>
                    <Button
                        radius="sm"
                        color="primary"
                        onPress={() => {
                            const searchedMembers = members.filter(member => member.id.includes(search) || member.character.includes(search) || member.email.includes(search) || member.expeditions.some(character => character.nickname === search));
                            setResult(searchedMembers);
                        }}>
                        검색
                    </Button>
                </div>
            </div>
            <div className="w-full overflow-x-auto overflow-y-hidden scrollbar-hide">
                <div className="w-[700px] sm:w-full">
                    <Table
                        fullWidth 
                        removeWrapper
                        bottomContent={
                            <div className="flex w-full justify-center">
                                <Pagination
                                    isCompact
                                    showControls
                                    showShadow
                                    color="primary"
                                    page={page}
                                    total={Math.ceil(result.length / rowsPerPage)}
                                    onChange={(page) => setPage(page)}/>
                            </div>
                        }>
                        <TableHeader>
                            <TableColumn>ID</TableColumn>
                            <TableColumn>대표 캐릭터 명</TableColumn>
                            <TableColumn>이메일</TableColumn>
                            <TableColumn>로그인 기록</TableColumn>
                            <TableColumn>원정대</TableColumn>
                            <TableColumn>관리</TableColumn>
                        </TableHeader>
                        <TableBody items={items} emptyContent="검색 결과가 없거나 데이터가 존재하지 않습니다.">
                            {(member) => (
                                <TableRow key={member.docID}>
                                    <TableCell>{member.id}</TableCell>
                                    <TableCell>{member.character}</TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            color="primary"
                                            radius="sm"
                                            onPress={() => {
                                                setSelectedUserId(member.id);
                                                setOpenSessionModal(true);
                                            }}>
                                            기록보기
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <Popover showArrow>
                                            <PopoverTrigger>
                                                <Button
                                                    size="sm"
                                                    color="secondary"
                                                    radius="sm">
                                                    원정대 ({member.expeditions.length})
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent>
                                                <div className="max-w-[calc(100vw-60px)] min-[441px]:w-[440px] pt-2 max-h-[500px] overflow-y-auto">
                                                    <Table
                                                        fullWidth
                                                        removeWrapper>
                                                        <TableHeader>
                                                            <TableColumn>캐릭터명</TableColumn>
                                                            <TableColumn>캐릭터 레벨</TableColumn>
                                                            <TableColumn>클래스</TableColumn>
                                                            <TableColumn>서버</TableColumn>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {member.expeditions.map((character, idx) => (
                                                                <TableRow key={idx}>
                                                                    <TableCell>{character.nickname}</TableCell>
                                                                    <TableCell>{character.level}</TableCell>
                                                                    <TableCell>{character.job}</TableCell>
                                                                    <TableCell>{character.server}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            radius="sm"
                                            color="danger"
                                            isLoading={isLoadingButton}
                                            onPress={async () => {
                                                if (confirm('데이터를 삭제하면 복구하실 수 없습니다. 마지막 로그인이로부터 1년 이상인 맴버이거나 삭제 요청이나 삭제 대상이 되는 경우가 아니면 삭제하시지 말아주세요.\n데이터를 정말 삭제하시겠습니까?')) {
                                                    await handleRemoveMember(member.uid, member.id, members, setMembers, setLoadingButton);
                                                }
                                            }}>
                                            삭제
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <HistoryModal
                selectedUserId={selectedUserId}
                setSelectedUserId={setSelectedUserId}
                isOpenSessionModal={isOpenSessionModal}
                setOpenSessionModal={setOpenSessionModal}/>
        </div>
    )
}

// 로그인 기록 Modal
type HistoryModalProps = {
    selectedUserId: string | null,
    setSelectedUserId: SetStateFn<string | null>,
    isOpenSessionModal: boolean,
    setOpenSessionModal: SetStateFn<boolean>
}
function HistoryModal({ selectedUserId, setSelectedUserId, isOpenSessionModal, setOpenSessionModal }: HistoryModalProps) {
    const [historys, setHistorys] = useState<History[]>([]);
    const [isLoaded, setLoaded] = useState(false);

    useEffect(() => {
        const run = async () => {
            if (selectedUserId) {
                await loadHistorys(selectedUserId, setHistorys, setLoaded);
            }
        }
        run();
    }, [selectedUserId]);

    if (!selectedUserId) return null;
    return (
        <Modal
            radius="sm"
            size="3xl"
            isDismissable={false}
            scrollBehavior="inside"
            isOpen={isOpenSessionModal}
            onOpenChange={(isOpen) => setOpenSessionModal(isOpen)}
            onClose={() => {
                setSelectedUserId(null);
                setHistorys([]);
                setLoaded(false);
            }}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>{selectedUserId}님의 로그인 기록</ModalHeader>
                        <ModalBody>
                            {isLoaded ? (
                                <div className="w-full overflow-x-auto overflow-y-hidden scrollbar-hide">
                                    <div className="w-[750px] min-[751px]:w-full">
                                        <SessionTable historys={historys}/>
                                    </div>
                                </div>
                            ) : <LoadingComponent heightStyle={'h-[500px]'}/>}
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

function SessionTable({ historys }: { historys: History[] }) {
    const [page, setPage] = useState(1);
    const isMobile = useMobileQuery();
    const MAX_SIZE = isMobile ? 10 : 20;

    const [revealedIps, setRevealedIps] = useState<Map<string, string>>(new Map());
    const [lockedIds, setLockedIds] = useState<Set<string>>(new Set());
    const timersRef = useRef<Map<string, number>>(new Map());
    
    useEffect(() => {
        return () => {
            timersRef.current.forEach((timer) => window.clearTimeout(timer));
            timersRef.current.clear();
        };
    }, []);

    return (
        <Table
            fullWidth
            removeWrapper
            bottomContent={
                <div className="flex w-full justify-center">
                    <Pagination
                        isCompact
                        showControls
                        showShadow
                        color="primary"
                        page={page}
                        total={Math.ceil(historys.length / MAX_SIZE)}
                        onChange={(page) => setPage(page)}/>
                </div>
            }>
            <TableHeader>
                <TableColumn>IP 주소</TableColumn>
                <TableColumn>생성 일자</TableColumn>
                <TableColumn>만료 일자</TableColumn>
                <TableColumn>머자먹 로그인</TableColumn>
                <TableColumn>만료 여부</TableColumn>
                <TableColumn>관리</TableColumn>
            </TableHeader>
            <TableBody emptyContent="로그인 기록이 없습니다.">
                {historys.slice((page-1) * MAX_SIZE, page * MAX_SIZE).map((history) => {
                    const revealed = revealedIps.get(history.id) ?? null;
                    const locked = isLocked(history.id, lockedIds);
                    const onClickIp = handleClickIp(history.id, lockedIds, timersRef, setLockedIds, setRevealedIps);
                    return (
                        <TableRow key={history.id}>
                            <TableCell>
                                <button
                                    type="button"
                                    disabled={locked}
                                    className={[
                                        "text-left w-full",
                                        !locked && history.ipAddress !== '-' ? "cursor-pointer hover:underline" : "cursor-default opacity-70",
                                    ].join(" ")}
                                    onClick={onClickIp}>
                                    {revealed ?? history.ipAddress}
                                </button>
                            </TableCell>
                            <TableCell>{history.createdAt ? formatDate(history.createdAt) : '-'}</TableCell>
                            <TableCell>{history.createdAt ? formatDate(history.createdAt) : '-'}</TableCell>
                            <TableCell>
                                <Chip
                                    radius="sm"
                                    size="sm"
                                    variant="flat"
                                    color={getActivityRange(history.lastUsedAt).level}>
                                    {getActivityRange(history.lastUsedAt).label}
                                </Chip>
                            </TableCell>
                            <TableCell>
                                <Chip
                                    radius="sm"
                                    size="sm"
                                    variant="flat"
                                    color={history.revoked ? 'danger' : 'success'}>
                                    {history.revoked ? '만료됨' : '유효'}
                                </Chip>
                            </TableCell>
                            <TableCell>
                                <Button size="sm" radius="sm" color="danger" isDisabled={history.revoked}>만료</Button>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}