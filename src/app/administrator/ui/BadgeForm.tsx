import { useEffect, useMemo, useState } from "react"
import { Badge } from "../model/types";
import { LoadingComponent } from "../../UtilsCompnents";
import { loadBadges, loadIds, useUpdateData } from "../lib/badgeFeat";
import { Button, Chip, Input, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import clsx from "clsx";

const badgeFieldClassNames = {
    inputWrapper: "border-default-200 bg-default-50 shadow-none data-[hover=true]:border-primary/50 dark:border-white/10 dark:bg-white/[0.04]",
    input: "text-sm"
};

const badgeTableClassNames = {
    th: "h-11 bg-default-100 text-xs font-bold text-default-500 dark:bg-white/[0.06]",
    td: "border-b border-default-100 py-3 text-sm last:border-b-0 dark:border-white/[0.06]"
};

export default function BadgeComponent() {
    const [badges, setBadges] = useState<Badge[]>([]);
    const [results, setResults] = useState<Badge[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [ids, setIds] = useState<string[]>([]);
    const [isLoadingButton, setLoadingButton] = useState(false);
    const rowsPerPage = 20;

    const onClickUpdateData = useUpdateData(ids, setLoadingButton, setBadges);

    useEffect(() => {
        const loadData = async () => {
            const badgePromise = loadBadges(setBadges);
            const idsPromise = loadIds(setIds);
            await Promise.all([badgePromise, idsPromise]);
            setLoading(false);
        }
        loadData();
    }, []);

    useEffect(() => {
        const searchedDonates = badges.filter(badge => badge.id.includes(search) || badge.nickname.includes(search));
        setPage(1);
        setResults(searchedDonates);
    }, [badges]);
    
    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return results.slice(start, end);
    }, [page, results]);
    const beneficiaryCount = useMemo(() => new Set(badges.map((badge) => badge.id)).size, [badges]);

    if (isLoading) {
        return <LoadingComponent heightStyle={'h-[calc(100vh-105px)]'}/>;
    }

    return (
        <div className="w-full min-h-[calc(100vh-105px)]">
            <section className="mb-5 rounded-2xl border border-default-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#171717]">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold">후원 혜택 대상</h2>
                        <p className="mt-1 text-sm text-default-500">후원 계정에 연결된 원정대 캐릭터와 혜택 적용 대상을 관리합니다.</p>
                    </div>
                    <Button
                        color="primary"
                        radius="lg"
                        isLoading={isLoadingButton}
                        className="font-bold sm:min-w-28"
                        onPress={onClickUpdateData}>
                        데이터 최신화
                    </Button>
                </div>
                <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
                <div className="flex w-full gap-2">
                    <Input
                        radius="lg"
                        variant="bordered"
                        aria-label="후원 혜택 대상 검색"
                        placeholder="ID, 캐릭터명을 입력하세요."
                        value={search}
                        onValueChange={setSearch}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const searchedDonates = badges.filter(badge => badge.id.includes(search) || badge.nickname.includes(search));
                                setPage(1);
                                setResults(searchedDonates);
                            }
                        }}
                        className="w-full sm:max-w-[360px]"
                        classNames={badgeFieldClassNames}/>
                    <Button
                        radius="lg"
                        color="primary"
                        className="min-w-20 font-bold"
                        onPress={() => {
                            const searchedDonates = badges.filter(badge => badge.id.includes(search) || badge.nickname.includes(search));
                                setPage(1);
                            setResults(searchedDonates);
                        }}>
                        검색
                    </Button>
                </div>
                <div className="grid grid-cols-1 gap-3 min-[440px]:grid-cols-3">
                    <div className="rounded-xl bg-default-50 px-4 py-3 dark:bg-white/[0.04]">
                        <p className="text-xs font-medium text-default-500">대상 계정</p>
                        <p className="mt-1 text-xl font-bold">{beneficiaryCount.toLocaleString()}개</p>
                    </div>
                    <div className="rounded-xl bg-secondary/10 px-4 py-3">
                        <p className="text-xs font-medium text-secondary-600 dark:text-secondary-400">혜택 캐릭터</p>
                        <p className="mt-1 text-xl font-bold text-secondary-700 dark:text-secondary-400">{badges.length.toLocaleString()}명</p>
                    </div>
                    <div className="rounded-xl bg-primary/10 px-4 py-3">
                        <p className="text-xs font-medium text-primary/70">검색 결과</p>
                        <p className="mt-1 text-xl font-bold text-primary">{results.length.toLocaleString()}명</p>
                    </div>
                </div>
                </div>
            </section>
            <section className="overflow-hidden rounded-2xl border border-default-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#171717] sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3 px-1">
                    <div>
                        <h3 className="font-bold">혜택 적용 캐릭터</h3>
                        <p className="mt-0.5 text-xs text-default-500">캐릭터명과 연결된 후원 계정을 확인합니다.</p>
                    </div>
                    <Chip size="sm" radius="full" color="primary" variant="flat">{results.length.toLocaleString()}명</Chip>
                </div>
            <div className="w-full overflow-x-auto scrollbar-hide">
                <Table
                    removeWrapper
                    className="w-[400px] min-[401px]:w-full"
                    aria-label="후원 혜택 적용 캐릭터 목록"
                    classNames={badgeTableClassNames}
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
                        <TableColumn>캐릭터명</TableColumn>
                        <TableColumn>ID</TableColumn>
                    </TableHeader>
                    <TableBody items={items} emptyContent="캐릭터가 존재하지 않습니다.">
                        {(item) => (
                            <TableRow key={item.uid}>
                                <TableCell><span className="font-semibold">{item.nickname}</span></TableCell>
                                <TableCell><Chip size="sm" radius="full" variant="flat">{item.id}</Chip></TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            </section>
        </div>
    )
}
