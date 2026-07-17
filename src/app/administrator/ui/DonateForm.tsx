import { useEffect, useMemo, useState } from "react"
import { Donate } from "../model/types";
import { LoadingComponent } from "../../UtilsCompnents";
import { formatDate, getSumPrice, handleAddDonate, handleDeleteItem, loadDonates, resetInputs } from "../lib/donateFeat";
import { Button, Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, NumberInput, Pagination, Popover, PopoverContent, PopoverTrigger, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Textarea, useDisclosure } from "@heroui/react";
import clsx from "clsx";
import { SetStateFn } from "@/utiils/utils";

const donateFieldClassNames = {
    inputWrapper: "border-default-200 bg-default-50 shadow-none data-[hover=true]:border-primary/50 dark:border-white/10 dark:bg-white/[0.04]",
    label: "font-medium text-default-600"
};

const donateTableClassNames = {
    th: "h-11 bg-default-100 text-xs font-bold text-default-500 dark:bg-white/[0.06]",
    td: "border-b border-default-100 py-3 text-sm last:border-b-0 dark:border-white/[0.06]"
};

const donateModalClassNames = {
    backdrop: "bg-black/60 backdrop-blur-sm",
    base: "border border-default-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#171717]",
    header: "border-b border-default-200 px-5 py-4 dark:border-white/10",
    body: "gap-4 px-5 py-5",
    footer: "border-t border-default-200 px-5 py-4 dark:border-white/10"
};

export default function DonateComponent() {
    const [isLoading, setLoading] = useState(true);
    const [donates, setDonates] = useState<Donate[]>([]);
    const [results, setResults] = useState<Donate[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const rowsPerPage = 20;
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [isLoadingDelete, setLoadingDelete] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            await loadDonates(setDonates, setLoading);
        }
        loadData();
    }, []);

    useEffect(() => {
        const searchedDonates = donates.filter(donate => donate.id.includes(search) || donate.price.toString().includes(search));
        setPage(1);
        setResults(searchedDonates);
    }, [donates]);

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return results.slice(start, end);
    }, [page, results]);

    if (isLoading) {
        return <LoadingComponent heightStyle={'h-[calc(100vh-105px)]'}/>;
    }

    return (
        <div className="w-full min-h-[calc(100vh-105px)]">
            <section className="mb-5 rounded-2xl border border-default-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#171717]">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold">후원 내역 관리</h2>
                        <p className="mt-1 text-sm text-default-500">확인된 후원 내역과 금액, 운영 메모를 관리합니다.</p>
                    </div>
                    <Button
                        color="primary"
                        radius="lg"
                        className="font-bold sm:min-w-28"
                        onPress={onOpen}>
                        후원 추가
                    </Button>
                </div>
                <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
                <div className="flex w-full gap-2">
                    <Input
                        radius="lg"
                        variant="bordered"
                        aria-label="후원 내역 검색"
                        placeholder="ID, 금액을 입력하세요."
                        value={search}
                        onValueChange={setSearch}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const searchedDonates = donates.filter(donate => donate.id.includes(search) || donate.price.toString().includes(search));
                                setPage(1);
                                setResults(searchedDonates);
                            }
                        }}
                        className="w-full sm:max-w-[360px]"
                        classNames={donateFieldClassNames}/>
                    <Button
                        radius="lg"
                        color="primary"
                        className="min-w-20 font-bold"
                        onPress={() => {
                            const searchedDonates = donates.filter(donate => donate.id.includes(search) || donate.price.toString().includes(search));
                            setPage(1);
                            setResults(searchedDonates);
                        }}>
                        검색
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-default-50 px-4 py-3 dark:bg-white/[0.04]">
                        <p className="text-xs font-medium text-default-500">후원 인원</p>
                        <p className="mt-1 text-xl font-bold">{donates.length.toLocaleString()}명</p>
                    </div>
                    <div className="rounded-xl bg-primary/10 px-4 py-3">
                        <p className="text-xs font-medium text-primary/70">검색 결과</p>
                        <p className="mt-1 text-xl font-bold text-primary">{results.length.toLocaleString()}건</p>
                    </div>
                    <div className="col-span-2 rounded-xl bg-warning/10 px-4 py-3 sm:col-span-1 sm:min-w-44">
                        <p className="text-xs font-medium text-warning-600 dark:text-warning-400">검색 후원 합계</p>
                        <p className="mt-1 text-xl font-bold text-warning-700 dark:text-warning-400">￦{getSumPrice(results).toLocaleString()}</p>
                    </div>
                </div>
                </div>
            </section>
            <section className="overflow-hidden rounded-2xl border border-default-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#171717] sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3 px-1">
                    <div>
                        <h3 className="font-bold">후원 목록</h3>
                        <p className="mt-0.5 text-xs text-default-500">검색 조건에 맞는 후원 확인 내역입니다.</p>
                    </div>
                    <Chip size="sm" radius="full" color="primary" variant="flat">{results.length.toLocaleString()}건</Chip>
                </div>
            <div className="w-full overflow-x-auto scrollbar-hide">
                <Table 
                    removeWrapper
                    className="w-[700px] min-[701px]:w-full"
                    aria-label="후원 내역 목록"
                    classNames={donateTableClassNames}
                    bottomContent={
                        <div className={clsx(
                            "w-full justify-center",
                            results.length === 0 ? 'hidden' : "flex"
                        )}>
                            <Pagination
                                isCompact
                                showControls
                                showShadow
                                color="primary"
                                radius="lg"
                                page={page}
                                total={Math.max(1, Math.ceil(results.length / rowsPerPage))}
                                onChange={(page) => setPage(page)}/>
                        </div>
                    }>
                    <TableHeader>
                        <TableColumn>ID</TableColumn>
                        <TableColumn>후원 확인 날짜</TableColumn>
                        <TableColumn>후원 금액</TableColumn>
                        <TableColumn>메모</TableColumn>
                        <TableColumn>관리</TableColumn>
                    </TableHeader>
                    <TableBody items={items} emptyContent="후원 내역이 존재하지 않습니다.">
                        {(item) => (
                            <TableRow key={item.uid}>
                                <TableCell><span className="font-semibold">{item.id}</span></TableCell>
                                <TableCell><span className="text-default-500">{formatDate(item.date)}</span></TableCell>
                                <TableCell><span className="font-bold text-warning-700 dark:text-warning-400">￦{item.price.toLocaleString()}</span></TableCell>
                                <TableCell>
                                    <Popover showArrow placement="bottom">
                                        <PopoverTrigger>
                                            <button type="button" className="max-w-[140px] min-[701px]:max-w-[280px] truncate overflow-hidden whitespace-nowrap text-left text-default-600 hover:text-primary">
                                                {item.memo !== '' ? item.memo : '-'}
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="border border-default-200 bg-white p-0 shadow-xl dark:border-white/10 dark:bg-[#1b1b1b]">
                                            <div className="max-w-[300px] sm:max-w-[500px]">
                                            <p className="border-b border-default-200 px-4 py-3 text-sm font-bold dark:border-white/10">운영 메모</p>
                                            <p className="whitespace-pre-line px-4 py-3 text-sm text-default-600">
                                                {item.memo !== '' ? item.memo : '-'}
                                            </p>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        color="danger"
                                        size="sm"
                                        isLoading={isLoadingDelete}
                                        radius="lg"
                                        variant="flat"
                                        onPress={async () => {
                                            if (confirm('후원 항목을 제거하시겠습니까? 한번 삭제된 데이터는 복구할 수 없습니다.')) {
                                                await handleDeleteItem(item.uid, donates, setDonates, setLoadingDelete);
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
            </section>
            <DonateModal isOpen={isOpen} onOpenChange={onOpenChange} donates={donates} setDonates={setDonates}/>
        </div>
    )
}

// 후원 항목 추가 Modal
type DonateModalProps = {
    isOpen: boolean,
    onOpenChange: () => void,
    donates: Donate[],
    setDonates: SetStateFn<Donate[]>
}
function DonateModal({ isOpen, onOpenChange, donates, setDonates }: DonateModalProps) {
    const [id, setID] = useState('');
    const [price, setPrice] = useState(0);
    const [memo, setMemo] = useState('');
    const [isLoading, setLoading] = useState(false);
    return (
        <Modal 
            isOpen={isOpen} 
            onOpenChange={onOpenChange} 
            isDismissable={false}
            radius="lg"
            classNames={donateModalClassNames}
            onClose={() => {
                resetInputs(setID, setPrice, setMemo);
            }}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col items-start gap-1">
                            <h2 className="text-xl font-bold">후원 내역 추가</h2>
                            <p className="text-sm font-normal text-default-500">확인된 후원자와 금액, 운영에 필요한 메모를 입력하세요.</p>
                        </ModalHeader>
                        <ModalBody>
                            <section className="rounded-2xl border border-default-200 bg-default-50/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                            <h3 className="mb-4 text-sm font-bold text-default-700">후원 정보</h3>
                            <Input
                                fullWidth
                                radius="lg"
                                variant="bordered"
                                label="아이디"
                                isRequired
                                labelPlacement="outside"
                                placeholder="아이디를 입력하세요."
                                value={id}
                                classNames={donateFieldClassNames}
                                onValueChange={setID}/>
                            <NumberInput
                                fullWidth
                                radius="lg"
                                variant="bordered"
                                className="mt-4"
                                label="후원 금액"
                                isRequired
                                labelPlacement="outside"
                                placeholder="후원 금액을 입력하세요."
                                minValue={0}
                                value={price}
                                classNames={donateFieldClassNames}
                                onValueChange={setPrice}/>
                            <Textarea
                                radius="lg"
                                variant="bordered"
                                className="mt-4"
                                label="메모"
                                labelPlacement="outside"
                                placeholder="메모를 입력하세요."
                                minRows={2}
                                maxRows={7}
                                value={memo}
                                classNames={donateFieldClassNames}
                                onValueChange={setMemo}/>
                            </section>
                        </ModalBody>
                        <ModalFooter>
                            <Button radius="lg" variant="flat" onPress={onClose}>취소</Button>
                            <Button
                                radius="lg"
                                color="primary"
                                isLoading={isLoading}
                                isDisabled={id.trim() === '' || isNaN(price)}
                                className="min-w-24 font-bold"
                                onPress={async () => {
                                    await handleAddDonate(id, price, memo, setLoading, onClose, donates, setDonates);
                                }}>
                                후원 추가
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
