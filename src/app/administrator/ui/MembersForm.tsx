import { useEffect, useRef, useState } from "react"
import { History, Member } from "../model/types";
import { LoadingComponent } from "../../UtilsCompnents";
import { getActivityRange, handleClickIp, handleMoreData, handleRemoveMember, handleRevorkHistory, handleSearchData, isLocked, loadData, loadHistorys } from "../lib/membersFeat";
import { Button, Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Pagination, Popover, PopoverContent, PopoverTrigger, Radio, RadioGroup, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { formatDate, SetStateFn, useMobileQuery } from "@/utiils/utils";

const memberFieldClassNames = {
    inputWrapper: "border-default-200 bg-default-50 shadow-none data-[hover=true]:border-primary/50 dark:border-white/10 dark:bg-white/[0.04]",
    input: "text-sm"
};

const memberTableClassNames = {
    th: "h-11 bg-default-100 text-xs font-bold text-default-500 dark:bg-white/[0.06]",
    td: "border-b border-default-100 py-3 text-sm last:border-b-0 dark:border-white/[0.06]"
};

const historyModalClassNames = {
    backdrop: "bg-black/60 backdrop-blur-sm",
    base: "border border-default-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#171717]",
    header: "border-b border-default-200 px-5 py-4 dark:border-white/10",
    body: "gap-4 px-5 py-5",
    footer: "border-t border-default-200 px-5 py-4 dark:border-white/10"
};

export default function MembersComponent() {
    const [memberLength, setMemberLength] = useState(0);
    const [filterLength, setFilterLength] = useState(0);
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [isLoadingButton, setLoadingButton] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [isOpenSessionModal, setOpenSessionModal] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('id');
    const [hasMore, setHasMore] = useState(false);
    const [isLoadingMore, setLoadingMore] = useState(false);

    const onClickMore = handleMoreData(members, search, selectedFilter, setLoadingMore, setHasMore, setMembers);

    useEffect(() => {
        const loadFuns = async () => {
            await loadData(setMembers, setLoading, setMemberLength, setFilterLength, setHasMore);
        }
        loadFuns();
    }, []);

    return (
        <div className="w-full">
            <section className="mb-5 rounded-2xl border border-default-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#171717]">
                <div className="mb-5">
                    <h2 className="text-xl font-bold">회원 조회</h2>
                    <p className="mt-1 text-sm text-default-500">회원 계정과 원정대, 로그인 활동 기록을 확인합니다.</p>
                </div>
                <div className="grid gap-4 xl:grid-cols-[auto_1fr] xl:items-end">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="min-w-28 rounded-xl bg-default-50 px-4 py-3 dark:bg-white/[0.04]">
                            <p className="text-xs font-medium text-default-500">전체 회원</p>
                            <p className="mt-1 text-2xl font-bold">{memberLength.toLocaleString()}</p>
                        </div>
                        <div className="min-w-28 rounded-xl bg-primary/10 px-4 py-3">
                            <p className="text-xs font-medium text-primary/70">검색 결과</p>
                            <p className="mt-1 text-2xl font-bold text-primary">{filterLength.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-end">
                    <RadioGroup
                        size="sm"
                        orientation="horizontal"
                        label="검색 기준"
                        value={selectedFilter}
                        onValueChange={setSelectedFilter}
                        classNames={{ wrapper: "gap-4", label: "text-xs font-medium text-default-500" }}>
                        <Radio value="id">아이디</Radio>
                        <Radio value="character">캐릭터명</Radio>
                    </RadioGroup>
                    <Input
                        placeholder="검색 내용을 입력하세요."
                        aria-label="회원 검색"
                        radius="lg"
                        variant="bordered"
                        value={search}
                        onValueChange={setSearch}
                        onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                                await handleSearchData(search, selectedFilter, setHasMore, setMembers, setLoading, setFilterLength);
                            }
                        }}
                        className="w-full md:w-[280px]"
                        classNames={memberFieldClassNames}/>
                    <Button
                        radius="lg"
                        color="primary"
                        className="font-bold md:min-w-24"
                        onPress={async () => await handleSearchData(search, selectedFilter, setHasMore, setMembers, setLoading, setFilterLength)}>
                        검색
                    </Button>
                    </div>
                </div>
            </section>
            <section className="w-full overflow-hidden rounded-2xl border border-default-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#171717] sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3 px-1">
                <div>
                    <h3 className="font-bold">회원 목록</h3>
                    <p className="mt-0.5 text-xs text-default-500">검색 결과에 포함된 회원의 계정 정보를 표시합니다.</p>
                </div>
                <Chip size="sm" radius="full" color="primary" variant="flat">{filterLength.toLocaleString()}명</Chip>
            </div>
            <div className="w-full overflow-x-auto overflow-y-hidden scrollbar-hide">
                {isLoading ? <LoadingComponent heightStyle={'h-[calc(100vh-105px)]'}/> : (
                    <div className="w-[820px] sm:w-full">
                        <Table
                            fullWidth 
                            isHeaderSticky
                            removeWrapper
                            bottomContent={
                                hasMore ? (
                                <div className="flex w-full justify-center">
                                    <Button 
                                        isLoading={isLoadingMore} 
                                        radius="lg"
                                        variant="flat"
                                        className="font-semibold"
                                        onPress={onClickMore}>                                        
                                        더 표시하기
                                    </Button>
                                </div>
                                ) : null
                            }
                            classNames={{
                                ...memberTableClassNames,
                                base: "max-h-[calc(100vh-240px)] overflow-scroll scrollbar-hide",
                                table: "max-h-[calc(100vh-275px)]",
                            }}>
                            <TableHeader>
                                <TableColumn>ID</TableColumn>
                                <TableColumn>대표 캐릭터 명</TableColumn>
                                <TableColumn>이메일</TableColumn>
                                <TableColumn>로그인 기록</TableColumn>
                                <TableColumn>원정대</TableColumn>
                                <TableColumn>관리</TableColumn>
                            </TableHeader>
                            <TableBody items={members} emptyContent="검색 결과가 없거나 데이터가 존재하지 않습니다.">
                                {(member) => (
                                    <TableRow key={member.docID}>
                                        <TableCell><span className="font-semibold">{member.id}</span></TableCell>
                                        <TableCell><span className="font-medium">{member.character || '-'}</span></TableCell>
                                        <TableCell><span className="text-default-500">{member.email}</span></TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                color="primary"
                                                radius="lg"
                                                variant="flat"
                                                onPress={() => {
                                                    setSelectedUserId(member.id);
                                                    setOpenSessionModal(true);
                                                }}>
                                                기록보기
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <Popover showArrow placement="bottom-end">
                                                <PopoverTrigger>
                                                    <Button
                                                        size="sm"
                                                        color="secondary"
                                                        variant="flat"
                                                        radius="lg">
                                                        원정대 ({member.expeditions.length})
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="border border-default-200 bg-white p-0 shadow-xl dark:border-white/10 dark:bg-[#1b1b1b]">
                                                    <div className="max-w-[calc(100vw-32px)] min-[441px]:w-[500px]">
                                                        <div className="border-b border-default-200 px-4 py-3 dark:border-white/10">
                                                            <div className="flex items-center justify-between gap-3">
                                                                <div>
                                                                    <p className="font-bold">{member.id}님의 원정대</p>
                                                                    <p className="mt-0.5 text-xs text-default-500">등록된 캐릭터와 서버 정보를 확인합니다.</p>
                                                                </div>
                                                                <Chip size="sm" radius="full" color="secondary" variant="flat">{member.expeditions.length}명</Chip>
                                                            </div>
                                                        </div>
                                                        <div className="max-h-[420px] overflow-y-auto p-3">
                                                        <Table
                                                            fullWidth
                                                            removeWrapper
                                                            aria-label={`${member.id}님의 원정대`}
                                                            classNames={memberTableClassNames}>
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
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                radius="lg"
                                                color="danger"
                                                variant="flat"
                                                isLoading={isLoadingButton}
                                                onPress={async () => {
                                                    if (confirm('데이터를 삭제하면 복구할 수 없습니다. 마지막 로그인으로부터 1년 이상 지난 회원이거나 삭제 요청 또는 삭제 대상인 경우에만 진행해주세요.\n데이터를 정말 삭제하시겠습니까?')) {
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
                )}
            </div>
            </section>
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
            radius="lg"
            size="3xl"
            isDismissable={false}
            scrollBehavior="inside"
            classNames={historyModalClassNames}
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
                        <ModalHeader className="flex flex-col items-start gap-1">
                            <div className="flex w-full items-center justify-between gap-3 pr-7">
                                <h2 className="text-xl font-bold">로그인 활동 기록</h2>
                                <Chip size="sm" radius="full" color="primary" variant="flat">{historys.length}건</Chip>
                            </div>
                            <p className="text-sm font-normal text-default-500">{selectedUserId} 계정의 세션 상태와 최근 사용 기록입니다.</p>
                        </ModalHeader>
                        <ModalBody>
                            {isLoaded ? (
                                <div className="w-full overflow-x-auto overflow-y-hidden rounded-xl border border-default-200 scrollbar-hide dark:border-white/10">
                                    <div className="w-[750px] min-[751px]:w-full">
                                        <SessionTable historys={historys} setHistorys={setHistorys}/>
                                    </div>
                                </div>
                            ) : <LoadingComponent heightStyle={'h-[500px]'}/>}
                        </ModalBody>
                        <ModalFooter>
                            <Button radius="lg" variant="flat" onPress={onClose}>닫기</Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

function SessionTable({ historys, setHistorys }: { historys: History[], setHistorys: SetStateFn<History[]> }) {
    const [page, setPage] = useState(1);
    const isMobile = useMobileQuery();
    const MAX_SIZE = isMobile ? 10 : 20;

    const [revealedIps, setRevealedIps] = useState<Map<string, string>>(new Map());
    const [lockedIds, setLockedIds] = useState<Set<string>>(new Set());
    const [loadings, setLoadings] = useState<Map<string, boolean>>(new Map());
    const timersRef = useRef<Map<string, number>>(new Map());
    
    useEffect(() => {
        const newMap = new Map();
        historys.forEach(history => newMap.set(history.id, false));
        setLoadings(newMap);

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
                        radius="lg"
                        page={page}
                        total={Math.max(1, Math.ceil(historys.length / MAX_SIZE))}
                        onChange={(page) => setPage(page)}/>
                </div>
            }
            classNames={memberTableClassNames}>
            <TableHeader>
                <TableColumn>IP 주소</TableColumn>
                <TableColumn>생성 일자</TableColumn>
                <TableColumn>만료 일자</TableColumn>
                <TableColumn>마지막 로그인</TableColumn>
                <TableColumn>만료 여부</TableColumn>
                <TableColumn>관리</TableColumn>
            </TableHeader>
            <TableBody emptyContent="로그인 기록이 없습니다.">
                {historys.slice((page-1) * MAX_SIZE, page * MAX_SIZE).map((history) => {
                    const revealed = revealedIps.get(history.id) ?? null;
                    const locked = isLocked(history.id, lockedIds);
                    const onClickIp = handleClickIp(history.id, lockedIds, timersRef, setLockedIds, setRevealedIps);
                    const onClickRevorkHistory = handleRevorkHistory(history.id, setHistorys, setLoadings);
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
                            <TableCell>{history.expiresAt ? formatDate(history.expiresAt) : '-'}</TableCell>
                            <TableCell>
                                <Chip
                                    radius="full"
                                    size="sm"
                                    variant="flat"
                                    color={getActivityRange(history.lastUsedAt).level}>
                                    {getActivityRange(history.lastUsedAt).label}
                                </Chip>
                            </TableCell>
                            <TableCell>
                                <Chip
                                    radius="full"
                                    size="sm"
                                    variant="flat"
                                    color={history.revoked ? 'danger' : 'success'}>
                                    {history.revoked ? '만료됨' : '유효'}
                                </Chip>
                            </TableCell>
                            <TableCell>
                                <Button 
                                    size="sm" 
                                    radius="lg"
                                    color="danger" 
                                    variant="flat"
                                    isLoading={loadings.get(history.id)}
                                    isDisabled={history.revoked}
                                    onPress={onClickRevorkHistory}>
                                    만료
                                </Button>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}
