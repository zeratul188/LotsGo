import { useEffect, useMemo, useState } from "react"
import { Donate } from "../model/types";
import { LoadingComponent } from "../../UtilsCompnents";
import { formatDate, getSumPrice, handleAddDonate, handleDeleteItem, loadDonates, resetInputs } from "../lib/donateFeat";
import { Button, Input, Modal, ModalBody, ModalContent, ModalHeader, NumberInput, Pagination, Popover, PopoverContent, PopoverTrigger, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Textarea, Tooltip, useDisclosure } from "@heroui/react";
import clsx from "clsx";
import { SetStateFn } from "@/utiils/utils";

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
            <div className="w-full flex flex-col sm:flex-row gap-2 mb-4 items-center">
                <div className="w-full sm:w-[max-content] flex gap-2">
                    <Input
                        radius="sm"
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
                        className="w-full sm:w-[300px]"/>
                    <Button
                        radius="sm"
                        color="primary"
                        onPress={() => {
                            const searchedDonates = donates.filter(donate => donate.id.includes(search) || donate.price.toString().includes(search));
                            setPage(1);
                            setResults(searchedDonates);
                        }}>
                        검색
                    </Button>
                </div>
                <div className="grow hidden sm:block"/>
                <div className="w-full sm:w-[248px] grid grid-cols-2 gap-2">
                    <NumberInput
                        isReadOnly
                        hideStepper
                        radius="sm"
                        label="후원 총 인원"
                        size="sm"
                        value={donates.length}
                        className="w-full sm:w-[120px]"/>
                    <NumberInput
                        isReadOnly
                        hideStepper
                        radius="sm"
                        label="검색 결과 개수"
                        size="sm"
                        value={results.length}
                        className="w-full sm:w-[120px]"/>
                </div>
                <Input
                    isReadOnly
                    radius="sm"
                    label="후원 총 금액"
                    size="sm"
                    value={`￦${getSumPrice(results).toLocaleString()}`}
                    className="w-full sm:w-[200px]"/>
                <Button
                    color="primary"
                    radius="sm"
                    className="w-full sm:w-[max-content]"
                    onPress={onOpen}>
                    추가
                </Button>
            </div>
            <div className="w-full overflow-x-auto scrollbar-hide">
                <Table 
                    removeWrapper
                    className="w-[700px] min-[701px]:w-full"
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
                                page={page}
                                total={Math.ceil(results.length / rowsPerPage)}
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
                                <TableCell>{item.id}</TableCell>
                                <TableCell>{formatDate(item.date)}</TableCell>
                                <TableCell>￦{item.price.toLocaleString()}</TableCell>
                                <TableCell>
                                    <Popover showArrow>
                                        <PopoverTrigger>
                                            <p className="max-w-[140px] min-[701px]:max-w-[280px] truncate overflow-hidden whitespace-nowrap cursor-pointer">
                                                {item.memo !== '' ? item.memo : '-'}
                                            </p>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <p className="max-w-[300px] sm:max-w-[500px] whitespace-pre-line p-1">
                                                {item.memo !== '' ? item.memo : '-'}
                                            </p>
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        color="danger"
                                        size="sm"
                                        isLoading={isLoadingDelete}
                                        radius="sm"
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
            onClose={() => {
                resetInputs(setID, setPrice, setMemo);
            }}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>후원 내역 추가</ModalHeader>
                        <ModalBody>
                            <Input
                                fullWidth
                                radius="sm"
                                label="아이디"
                                isRequired
                                labelPlacement="outside"
                                placeholder="아이디를 입력하세요."
                                value={id}
                                onValueChange={setID}/>
                            <NumberInput
                                fullWidth
                                radius="sm"
                                label="후원 금액"
                                isRequired
                                labelPlacement="outside"
                                placeholder="후원 금액을 입력하세요."
                                value={price}
                                onValueChange={setPrice}/>
                            <Textarea
                                radius="sm"
                                label="메모"
                                labelPlacement="outside"
                                placeholder="메모를 입력하세요."
                                minRows={2}
                                maxRows={7}
                                value={memo}
                                onValueChange={setMemo}/>
                            <Button
                                radius="sm"
                                color="primary"
                                isLoading={isLoading}
                                isDisabled={id.trim() === '' || isNaN(price)}
                                className="mb-4"
                                onPress={async () => {
                                    await handleAddDonate(id, price, memo, setLoading, onClose, donates, setDonates);
                                }}>
                                추가
                            </Button>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
