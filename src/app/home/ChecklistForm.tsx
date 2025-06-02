import { useEffect, useState } from "react";
import { CheckCharacter } from "../store/checklistSlice";
import { getUnfinishedChecklist, getUnfinishedContents, isLogin, loadChecklist } from "./checklistFeat";
import { LoadingComponent } from "../UtilsCompnents";
import { Boss } from "../api/checklist/boss/route";
import { getAllCountChecklist, getAllGolds, getBosses, getCompleteChecklist, getHaveGolds } from "../checklist/checklistFeat";
import { 
    Card, CardBody, CardHeader, 
    Chip, 
    Divider, 
    Progress,
    ScrollShadow
} from "@heroui/react";
import Image from "next/image";
import CheckIcon from "@/Icons/CheckIcon";

// state 관리
function useChecklistForm() {
    const [checklist, setChecklist] = useState<CheckCharacter[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [isLogin, setLogin] = useState(false);
    const [bosses, setBosses] = useState<Boss[]>([]);
    const [isAdministrator, setAdministrator] = useState(false);

    return {
        checklist, setChecklist,
        isLoading, setLoading,
        isLogin, setLogin,
        bosses, setBosses,
        isAdministrator, setAdministrator
    }
}

// 숙제 관리 컴포넌트
export default function ChecklistComponent() {
    const checklistForm = useChecklistForm();
    
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
                await loadChecklist(checklistForm.setChecklist, checklistForm.setLoading);
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
        <div className="mb-5 flex flex-col sm:flex-row gap-5 w-full">
            <Card radius="sm" className="min-w-[360px]">
                <CardHeader className="text-xl">남은 숙제 현황</CardHeader>
                <Divider/>
                <CardBody>
                    <div>
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
                            className="w-full"/>
                        <Progress 
                            aria-label="all-gold"
                            size="md"
                            color="success"
                            label={`📃 숙제 진행 상황 : ${getCompleteChecklist(checklistForm.checklist)} / ${getAllCountChecklist(checklistForm.checklist)}`}
                            showValueLabel={true}
                            radius="sm"
                            value={getCompleteChecklist(checklistForm.checklist)}
                            maxValue={getAllCountChecklist(checklistForm.checklist)}
                            className="w-full mt-4"/>
                    </div>
                </CardBody>
            </Card>
            <div className="grow w-full overflow-x-hidden hover:overflow-x-auto">
                {getUnfinishedChecklist(checklistForm.checklist).length > 0 ? (
                    <ScrollShadow orientation="horizontal">
                        <div className="flex gap-5">
                            {getUnfinishedChecklist(checklistForm.checklist).map((character, index) => (
                                <div key={index} className="w-[250px] shrink-0">
                                    <p className="w-full text-center font-bold text-md">{character.nickname}</p>
                                    <Divider className="mt-1 mb-2"/>
                                    <div className="mt-2">
                                        <ScrollShadow className="h-[150px]" hideScrollBar>
                                            {getUnfinishedContents(character).map((content, idx) => (
                                                <Chip 
                                                    key={idx}
                                                    size="sm" 
                                                    variant="flat" 
                                                    className="min-w-full text-center mb-2">
                                                    {content}
                                                </Chip>
                                            ))}
                                        </ScrollShadow>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollShadow>
                ) : (
                    <div className="w-full h-[100px] sm:h-full flex gap-2 items-center justify-center">
                        <CheckIcon size={36}/>
                        <p className="text-md sm:text-xl fadedtext">골드 받는 모든 숙제를 완료하였습니다.</p>
                    </div>
                )}
            </div>
        </div>
    )
}