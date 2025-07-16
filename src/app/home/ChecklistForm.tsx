import { useEffect, useState } from "react";
import { CheckCharacter } from "../store/checklistSlice";
import { ChecklistData, isLogin, loadChecklist } from "./checklistFeat";
import { LoadingComponent } from "../UtilsCompnents";
import { Boss } from "../api/checklist/boss/route";
import { getAllCountChecklist, getAllGolds, getBosses, getCompleteChecklist, getHaveGolds } from "../checklist/checklistFeat";
import { 
    Button,
    Card, CardBody,
    Progress
} from "@heroui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
                        <p className="text-xl sm:grow">숙제 현황</p>
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
        </div>
    )
}