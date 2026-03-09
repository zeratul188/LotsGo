import { useEffect, useMemo, useState } from "react"
import { Badge } from "../model/types";
import { LoadingComponent } from "../../UtilsCompnents";
import { loadBadges, loadIds, useUpdateData } from "../lib/badgeFeat";
import { Button, Input, NumberInput, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import clsx from "clsx";

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

    if (isLoading) {
        return <LoadingComponent heightStyle={'h-[calc(100vh-105px)]'}/>;
    }

    return (
        <div className="w-full min-h-[calc(100vh-105px)]">
            <div className="w-full flex flex-col sm:flex-row gap-2 mb-4 items-center">
                <div className="w-full sm:w-[max-content] flex gap-2">
                    <Input
                        radius="sm"
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
                        className="w-full sm:w-[300px]"/>
                    <Button
                        radius="sm"
                        color="primary"
                        onPress={() => {
                            const searchedDonates = badges.filter(badge => badge.id.includes(search) || badge.nickname.includes(search));
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
                        label="캐릭터 수"
                        size="sm"
                        value={badges.length}
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
                <Button
                    color="primary"
                    radius="sm"
                    isLoading={isLoadingButton}
                    className="w-full sm:w-[max-content]"
                    onPress={onClickUpdateData}>
                    최신화
                </Button>
            </div>
            <div className="w-full overflow-x-auto scrollbar-hide">
                <Table
                    removeWrapper
                    className="w-[400px] min-[401px]:w-full"
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
                        <TableColumn>캐릭터명</TableColumn>
                        <TableColumn>ID</TableColumn>
                    </TableHeader>
                    <TableBody items={items} emptyContent="캐릭터가 존재하지 않습니다.">
                        {(item) => (
                            <TableRow key={item.uid}>
                                <TableCell>{item.nickname}</TableCell>
                                <TableCell>{item.id}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
