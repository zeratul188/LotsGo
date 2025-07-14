import { useEffect, useState } from "react";
import { CheckCharacter } from "../store/checklistSlice";
import { ChecklistData, isLogin, loadChecklist } from "./checklistFeat";
import { LoadingComponent } from "../UtilsCompnents";
import { Boss } from "../api/checklist/boss/route";
import { getAllCountChecklist, getAllGolds, getBosses, getCompleteChecklist, getHaveGolds } from "../checklist/checklistFeat";
import { 
    Button,
    Card, CardBody,
    Pagination,
    Progress,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow
} from "@heroui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import clsx from "clsx";

// state 관리
function useChecklistForm() {
    const [checklist, setChecklist] = useState<CheckCharacter[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [isLogin, setLogin] = useState(false);
    const [bosses, setBosses] = useState<Boss[]>([]);
    const [isAdministrator, setAdministrator] = useState(false);
    const [datas, setDatas] = useState<ChecklistData[]>([]);

    return {
        checklist, setChecklist,
        isLoading, setLoading,
        isLogin, setLogin,
        bosses, setBosses,
        isAdministrator, setAdministrator,
        datas, setDatas
    }
}

// 숙제 관리 컴포넌트
export default function ChecklistComponent() {
    const checklistForm = useChecklistForm();
    const router = useRouter();
    const [page, setPage] = useState(1);
    const countByPage = 10;
    
    useEffect(() => {
        checklistForm.setLogin(isLogin());
        const isAdministrator = localStorage.getItem('isAdministrator');
        if (isAdministrator === 'true') {
            checklistForm.setAdministrator(true);
        }
    }, []);
    useEffect(() => {
        const loadData = async () => {
            if (checklistForm.isLogin) {
                const bossDatas = await getBosses();
                checklistForm.setBosses(bossDatas);
            }
        }
        loadData();
    }, [checklistForm.isLogin]);
    useEffect(() => {
        const loadData = async () => {
            if (checklistForm.isLogin) {
                await loadChecklist(checklistForm.setChecklist, checklistForm.setLoading, checklistForm.setDatas, checklistForm.bosses);
            }
        }
        loadData();
    }, [checklistForm.bosses]);

    if (!checklistForm.isLogin || (checklistForm.checklist.length === 0 && !checklistForm.isLoading) || checklistForm.isAdministrator) {
        return <></>;
    }
    if (checklistForm.isLoading) {
        return <LoadingComponent heightStyle="min-h-[240px]"/>
    }

    return (
        <div className="w-full mb-5">
            <Card fullWidth radius="sm">
                <CardBody>
                    <div className="w-full flex flex-col sm:flex-row gap-4 sm:gap-8 sm:items-center">
                        <p className="text-xl sm:grow">남은 숙제 현황</p>
                        <Progress 
                            aria-label="all-gold"
                            size="md"
                            color="warning"
                            label={(
                                <div className="flex items-center">
                                    <Image
                                        src="/icons/gold.png" 
                                        width={19} 
                                        height={19} 
                                        alt="goldicon"
                                        className="w-[19px] h-[19px]"/>
                                    <span className="ml-1 text-md">주간 수익 골드량 : {getHaveGolds(checklistForm.bosses, checklistForm.checklist).toLocaleString()} / {getAllGolds(checklistForm.bosses, checklistForm.checklist).toLocaleString()}</span>
                                </div>
                            )}
                            showValueLabel={true}
                            radius="sm"
                            value={getHaveGolds(checklistForm.bosses, checklistForm.checklist)}
                            maxValue={getAllGolds(checklistForm.bosses, checklistForm.checklist)}
                            className="w-full sm:w-[360px]"/>
                        <Progress 
                            aria-label="all-gold"
                            size="md"
                            color="success"
                            label={`📃 숙제 진행 상황 : ${getCompleteChecklist(checklistForm.checklist)} / ${getAllCountChecklist(checklistForm.checklist)}`}
                            showValueLabel={true}
                            radius="sm"
                            value={getCompleteChecklist(checklistForm.checklist)}
                            maxValue={getAllCountChecklist(checklistForm.checklist)}
                            className="w-full sm:w-[360px]"/>
                        <Button
                            radius="sm"
                            variant="flat"
                            onPress={() => router.push('/checklist')}
                            className="w-full sm:w-[max-content]">
                            페이지 이동
                        </Button>
                    </div>
                </CardBody>
            </Card>
            <div className="w-full overflow-x-auto scrollbar-hide mt-4">
                <div className="w-[700px] min-[701px]:w-full">
                    <Table fullWidth removeWrapper radius="sm">
                        <TableHeader>
                            <TableColumn>콘텐츠명</TableColumn>
                            <TableColumn>난이도</TableColumn>
                            <TableColumn>캐릭터명</TableColumn>
                            <TableColumn>캐릭터 레벨</TableColumn>
                            <TableColumn>골드 획득 가능 여부</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="✔️ 남은 숙제가 없거나 데이터가 존재하지 않습니다.">
                            {checklistForm.datas.slice((page-1)*countByPage, page*countByPage).map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.contentName}</TableCell>
                                    <TableCell>{item.difficulty}</TableCell>
                                    <TableCell>{item.nickname}</TableCell>
                                    <TableCell>Lv.{item.level}</TableCell>
                                    <TableCell>
                                        <p className={clsx( 
                                            item.isGold ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                                        )}>{item.isGold ? '획득 가능' : "획득 불가"}</p>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
            {checklistForm.datas.length > 0 && Math.ceil(checklistForm.datas.length / countByPage) > 1 ? (
                <div className="w-full flex justify-center mt-2">
                    <Pagination
                        isCompact
                        showControls
                        color="primary"
                        page={page}
                        total={Math.ceil(checklistForm.datas.length / countByPage)}
                        onChange={setPage}/>
                </div>
            ) : <></>}
        </div>
    )
}