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
    Tooltip
} from "@heroui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import CheckIcon from "@/Icons/CheckIcon";

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
            <div className="w-full mt-4 grid grid-cols-2 min-[617px]:grid-cols-3 min-[925px]:grid-cols-4 min-[1233px]:grid-cols-5 gap-2">
                {checklistForm.datas.slice((page-1)*countByPage, page*countByPage).map((item, index) => (
                    <Tooltip key={index} showArrow content={<div className={clsx(
                        item.isGold ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                    )}>
                        {item.isGold ? '골드 획득 가능' : "골드 획득 불가"}
                    </div>}>
                        <Card shadow="sm" radius="sm" className={clsx(
                            "border-l-4",
                            item.isGold ? "border-[#F3B600]" : "border-[#cccccc] dark:border-[#333333]"
                        )}>
                            <CardBody className="py-2.5 sm:py-3 px-1.5 sm:px-2">
                                <div>
                                    <p className="text-[8pt] sm:text-[10pt] font-bold">{item.contentName} {item.difficulty}</p>
                                    <div className="w-full flex gap-1">
                                        <p className="grow text-[7pt] sm:text-[9pt]">{item.nickname}</p>
                                        <p className="fadedtext text-[7pt] sm:text-[9pt]">Lv.{item.level}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Tooltip>
                ))}
            </div>
            {checklistForm.datas.length === 0 ? (
                <div className="w-full h-[140px] sm:h-[240px] fadedtext flex justify-center items-center">
                    <div className="flex gap-2 items-center">
                        <CheckIcon size={24}/>
                        <p className="text-md sm:text-xl">남은 숙제가 없거나 데이터가 존재하지 않습니다.</p>
                    </div>
                </div>
            ) : <></>}
            {checklistForm.datas.length > 0 && Math.ceil(checklistForm.datas.length / countByPage) > 1 ? (
                <div className="w-full flex justify-center mt-4">
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