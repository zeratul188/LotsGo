import {
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow
} from "@heroui/react";
import JobEmblemIcon from "@/Icons/JobEmblemIcon";
import { CheckCharacter } from "@/app/store/checklistSlice";
import {
    formatOtherGoldDate,
    getAllOtherGoldRecords,
    getOtherGoldPreset
} from "../lib/otherGold";

type OtherGoldOverviewTableProps = {
    checklist: CheckCharacter[];
};

export default function OtherGoldOverviewTable({
    checklist
}: OtherGoldOverviewTableProps) {
    const records = getAllOtherGoldRecords(checklist);

    return (
        <div className="mt-3">
            <div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto sm:hidden">
                {records.length === 0 ? (
                    <div className="rounded-xl border border-default-200 px-4 py-10 text-center text-sm text-default-500 dark:border-white/10 dark:text-default-400">
                        이번 주에 등록된 부수입 기록이 없습니다.
                    </div>
                ) : records.map((record) => {
                    const preset = getOtherGoldPreset(record.icon);

                    return (
                        <div
                            key={`${record.nickname}-${record.id}`}
                            className="rounded-xl border border-default-200 bg-content1 p-3 dark:border-white/10 dark:bg-white/[0.025]">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-default-100 dark:bg-white/[0.06]">
                                    <img
                                        src={preset.image}
                                        alt={preset.label}
                                        className="h-9 w-9 object-contain"/>
                                </div>
                                <div className="min-w-0 grow">
                                    <p className="break-words text-sm font-semibold text-foreground">
                                        {record.source || "알 수 없음"}
                                    </p>
                                    <span className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-default-500 dark:text-default-400">
                                        <JobEmblemIcon job={record.job} size={16}/>
                                        <span className="truncate">{record.nickname}</span>
                                    </span>
                                </div>
                                <span className={`flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-bold tabular-nums ${
                                    record.gold < 0 ? "text-danger" : "text-foreground"
                                }`}>
                                    <img src="/icons/gold.png" alt="골드" className="h-4 w-4"/>
                                    {record.gold.toLocaleString()}
                                </span>
                            </div>
                            <p className="mt-3 border-t border-default-200 pt-2 text-xs text-default-500 dark:border-white/10 dark:text-default-400">
                                {formatOtherGoldDate(record.createdAt)}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="hidden overflow-x-auto rounded-xl border border-default-200 sm:block dark:border-white/10">
                <div className="max-h-[420px] min-w-[680px] overflow-y-auto">
                    <Table removeWrapper aria-label="전체 캐릭터 부수입 기록">
                        <TableHeader>
                            <TableColumn>아이콘</TableColumn>
                            <TableColumn>경로</TableColumn>
                            <TableColumn>캐릭터명</TableColumn>
                            <TableColumn>날짜</TableColumn>
                            <TableColumn>골드량</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="이번 주에 등록된 부수입 기록이 없습니다.">
                            {records.map((record) => {
                                const preset = getOtherGoldPreset(record.icon);

                                return (
                                <TableRow key={`${record.nickname}-${record.id}`}>
                                    <TableCell>
                                        <img
                                            src={preset.image}
                                            alt={preset.label}
                                            className="h-8 w-8 object-contain"/>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium">
                                            {record.source || "알 수 없음"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="flex items-center gap-2 whitespace-nowrap">
                                            <JobEmblemIcon job={record.job} size={18}/>
                                            <span>{record.nickname}</span>
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="whitespace-nowrap text-xs text-default-500 dark:text-default-400">
                                            {formatOtherGoldDate(record.createdAt)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`flex items-center gap-1 whitespace-nowrap font-medium tabular-nums ${
                                            record.gold < 0 ? "text-danger" : "text-foreground"
                                        }`}>
                                            <img src="/icons/gold.png" alt="골드" className="h-4 w-4"/>
                                            {record.gold.toLocaleString()}
                                        </span>
                                    </TableCell>
                                </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
