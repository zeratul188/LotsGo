import { useEffect, useState } from "react";
import { History } from "../model/types";
import { LoadingComponent } from "../../UtilsCompnents";
import { getRemainingDays, loadHistorys } from "../lib/historyFeat";
import { formatDate, useMobileQuery } from "@/utiils/utils";
import clsx from "clsx";
import { Chip, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";

const MAX_SIZE = 25;

export default function HistoryComponent() {
    const [isLoaded, setLoaded] = useState(false);
    const [historys, setHistorys] = useState<History[]>([]);
    const [page, setPage] = useState(1);
    const isMobile = useMobileQuery();

    useEffect(() => {
        const run = async () => await loadHistorys(setHistorys, setLoaded);
        run();
    }, []);

    if (!isLoaded) {
        return <LoadingComponent heightStyle="min-h-[calc(100vh-65px)]"/>
    }

    return (
        <div className="w-full min-h-[calc(100vh-65px)]">
            <div className={clsx(
                'overflow-x-auto',
                isMobile ? 'max-w-[900px]' : 'w-full'
            )}>
                <Table
                    fullWidth
                    aria-label="table-historys"
                    removeWrapper 
                    className={clsx(isMobile ? 'w-[900px]' : '')}>
                    <TableHeader>
                        <TableColumn>IP주소</TableColumn>
                        <TableColumn>생성 날짜</TableColumn>
                        <TableColumn>만료 날짜</TableColumn>
                        <TableColumn>마지막 로그인 날짜</TableColumn>
                        <TableColumn>만료된 날짜</TableColumn>
                        <TableColumn>만료 여부</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {historys.slice((page - 1) * MAX_SIZE, page * MAX_SIZE).map(history => (
                            <TableRow key={history.id}>
                                <TableCell className={clsx(history.ipAddress ? '' : 'fadedtext')}>{history.ipAddress ? history.ipAddress : 'Unknown'}</TableCell>
                                <TableCell className={clsx(history.createdAt ? '' : 'fadedtext')}>{history.createdAt ? formatDate(history.createdAt) : '-'}</TableCell>
                                <TableCell className={clsx(history.expiresAt ? '' : 'fadedtext')}>{history.expiresAt ? formatDate(history.expiresAt) : '-'}</TableCell>
                                <TableCell className={clsx(history.lastUsedAt ? '' : 'fadedtext')}>{history.lastUsedAt ? formatDate(history.lastUsedAt) : '-'}</TableCell>
                                <TableCell className={clsx(history.revokedAt ? '' : 'fadedtext')}>{history.revokedAt ? formatDate(history.revokedAt) : '-'}</TableCell>
                                <TableCell>
                                    <Chip
                                        variant="flat"
                                        radius="sm"
                                        size="sm"
                                        color={history.revoked ? 'danger' : 'success'}>
                                        {history.revoked ? '만료됨' : `${getRemainingDays(history.expiresAt)}일 남음`}
                                    </Chip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="w-full mt-4 gap-3 flex flex-col sm:flex-row justify-center sm:justify-start items-end">
                <Pagination
                    showControls
                    color="primary"
                    page={page}
                    onChange={setPage}
                    total={Math.ceil(historys.length / MAX_SIZE)}/>
                <p className="ml-auto fadedtext text-[10pt]">만료된 로그인 기록은 만료된 일자 기준으로 15일 후 자동 삭제됩니다.</p>
            </div>
        </div>
    )
}
