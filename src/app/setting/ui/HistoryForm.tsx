import { useEffect, useState } from "react";
import { History } from "../model/types";
import { LoadingComponent } from "../../UtilsCompnents";
import { getRemainingDays, loadHistorys } from "../lib/historyFeat";
import { formatDate } from "@/utiils/utils";
import clsx from "clsx";
import { Card, CardBody, Chip, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";

const MAX_SIZE = 25;

export default function HistoryComponent() {
    const [isLoaded, setLoaded] = useState(false);
    const [historys, setHistorys] = useState<History[]>([]);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const run = async () => await loadHistorys(setHistorys, setLoaded);
        run();
    }, []);

    if (!isLoaded) {
        return <LoadingComponent heightStyle="min-h-[calc(100vh-65px)]"/>
    }

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between"><div><h1 className="text-xl font-bold">로그인 기록</h1><p className="mt-1 text-xs text-default-500">최근 로그인과 세션 만료 상태를 확인합니다.</p></div><Chip size="sm" radius="full" variant="flat">총 {historys.length}건</Chip></div>
            <Card radius="lg" shadow="none" className="border border-default-200/80 dark:border-white/10">
                <CardBody className="p-0">
                <div className="hidden overflow-x-auto md:block">
                <Table fullWidth aria-label="table-historys" removeWrapper classNames={{ th: "h-10 bg-default-50 text-xs font-semibold text-default-500 dark:bg-white/[0.04]", td: "border-b border-default-100 py-3 dark:border-white/[0.06]", tr: "hover:bg-default-50/70 dark:hover:bg-white/[0.03]" }}>
                    <TableHeader>
                        <TableColumn>IP 주소</TableColumn>
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
                <div className="divide-y divide-default-100 md:hidden dark:divide-white/[0.06]">
                    {historys.slice((page - 1) * MAX_SIZE, page * MAX_SIZE).map(history => (
                        <article key={history.id} className="space-y-3 px-4 py-4">
                            <div className="flex items-center justify-between"><p className="font-semibold">{history.ipAddress || 'Unknown'}</p><Chip variant="flat" radius="full" size="sm" color={history.revoked ? 'danger' : 'success'}>{history.revoked ? '만료됨' : `${getRemainingDays(history.expiresAt)}일 남음`}</Chip></div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs"><div><p className="text-default-400">생성 날짜</p><p className="mt-0.5">{history.createdAt ? formatDate(history.createdAt) : '-'}</p></div><div><p className="text-default-400">만료 날짜</p><p className="mt-0.5">{history.expiresAt ? formatDate(history.expiresAt) : '-'}</p></div><div><p className="text-default-400">마지막 로그인</p><p className="mt-0.5">{history.lastUsedAt ? formatDate(history.lastUsedAt) : '-'}</p></div><div><p className="text-default-400">만료된 날짜</p><p className="mt-0.5">{history.revokedAt ? formatDate(history.revokedAt) : '-'}</p></div></div>
                        </article>
                    ))}
                </div>
                </CardBody>
            </Card>
            <div className="flex w-full flex-col items-end gap-3 sm:flex-row sm:items-center">
                <Pagination
                    showControls
                    color="primary"
                    page={page}
                    onChange={setPage}
                    total={Math.ceil(historys.length / MAX_SIZE)}/>
                <p className="text-right text-xs text-default-400 sm:ml-auto">만료된 로그인 기록은 만료된 일자 기준으로 15일 후 자동 삭제됩니다.</p>
            </div>
        </div>
    )
}
