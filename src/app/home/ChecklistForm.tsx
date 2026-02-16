import { useEffect, useState } from "react";
import { CheckCharacter } from "../store/checklistSlice";
import { isLogin, loadChecklist } from "./checklistFeat";
import { LoadingComponent } from "../UtilsCompnents";
import { Boss } from "../api/checklist/boss/route";
import { 
    getAllCountChecklist, 
    getAllCountChecklistByStage, 
    getAllGolds, 
    getBosses, 
    getCompleteChecklist, 
    getCompleteChecklistByStage, 
    getHaveGolds 
} from "../checklist/checklistFeat";
import { 
    Avatar,
    Button,
    Card,
    CardBody,
    CardHeader,
    Divider,
    Link,
    Pagination,
    Progress
} from "@heroui/react";
import React from "react";
import { getImgByJob } from "../character/expeditionFeat";
import { ContentChip } from "../raids/ui/PartyForm";
import { useMobileQuery } from "@/utiils/utils";

// state 관리
function useChecklistForm() {
    const [checklist, setChecklist] = useState<CheckCharacter[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [isLogin, setLogin] = useState(false);
    const [bosses, setBosses] = useState<Boss[]>([]);

    return {
        checklist, setChecklist,
        isLoading, setLoading,
        isLogin, setLogin,
        bosses, setBosses
    }
}

// 숙제 관리 컴포넌트
export default function ChecklistComponent() {
    const checklistForm = useChecklistForm();
    const [page, setPage] = useState(1);
    const isMobile = useMobileQuery();
    const maxSize = isMobile ? 5 : 7;
    
    useEffect(() => {
        checklistForm.setLogin(isLogin());
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
                await loadChecklist(checklistForm.setChecklist, checklistForm.setLoading, checklistForm.bosses);
            }
        }
        loadData();
    }, [checklistForm.bosses]);

    if (!checklistForm.isLogin || (checklistForm.checklist.length === 0 && !checklistForm.isLoading)) {
        return <></>;
    }
    if (checklistForm.isLoading) {
        return <LoadingComponent heightStyle="min-h-[240px]"/>
    }

    return (
        <div className="w-full mb-5">
            <Card fullWidth radius="sm">
                <CardHeader>
                    <div className="w-full flex flex-col sm:flex-row gap-4 sm:items-center">
                        <p className="text-xl sm:grow">숙제 현황</p>
                        <Progress 
                            aria-label="all-gold"
                            size="sm"
                            color="warning"
                            label={(
                                <div className="flex items-center">
                                    <img
                                        src="/icons/gold.png" 
                                        alt="goldicon"
                                        className="w-[19px] h-[19px]"/>
                                    <span className="ml-1 text-md">주간 골드량 : {getHaveGolds(checklistForm.bosses, checklistForm.checklist).toLocaleString()} / {getAllGolds(checklistForm.bosses, checklistForm.checklist).toLocaleString()}</span>
                                </div>
                            )}
                            showValueLabel={true}
                            radius="sm"
                            value={getHaveGolds(checklistForm.bosses, checklistForm.checklist)}
                            maxValue={getAllGolds(checklistForm.bosses, checklistForm.checklist)}
                            className="w-full sm:w-[300px]"/>
                        <Progress 
                            aria-label="all-gold"
                            size="sm"
                            color="secondary"
                            label={
                                <div className="flex gap-1 items-center">
                                    <p>📃 숙제 진행 상황 : {getCompleteChecklist(checklistForm.checklist)} / {getAllCountChecklist(checklistForm.checklist)}</p>
                                    <p className="fadedtext text-[9pt]">({getCompleteChecklistByStage(checklistForm.checklist)}/{getAllCountChecklistByStage(checklistForm.checklist)})</p>
                                </div>
                            }
                            showValueLabel={true}
                            radius="sm"
                            value={getCompleteChecklistByStage(checklistForm.checklist)}
                            maxValue={getAllCountChecklistByStage(checklistForm.checklist)}
                            className="w-full sm:w-[300px]"/>
                        <Button
                            radius="sm"
                            size="sm"
                            variant="flat"
                            showAnchorIcon
                            as={Link}
                            href="/checklist"
                            className="w-full sm:w-[max-content]">
                            페이지 이동
                        </Button>
                    </div>
                </CardHeader>
                <Divider/>
                <CardBody>
                    <div className="w-full">
                        {checklistForm.checklist.slice((page - 1) * maxSize, page * maxSize).map((item, idx) => (
                            <React.Fragment key={idx}>
                                <div className="w-full flex flex-col sm:flex-row gap-2 sm:gap-5 px-3 py-2 items-center">
                                    <div className="min-w-full sm:min-w-[240px] flex gap-3 items-center">
                                        <Avatar size="sm" isBordered color={item.isGold ? 'warning' : 'default'} src={getImgByJob(item.job)}/>
                                        <div className="grow">
                                            <div className="flex gap-1 items-center">
                                                <p className="text-[10pt]">{item.nickname}</p>
                                                {item.isGold ? (
                                                    <img 
                                                        src="/icons/gold.png" 
                                                        alt="goldicon"
                                                        className="w-[12px] h-[12px]"/>
                                                ) : null}
                                            </div>
                                            <p className="fadedtext text-[8pt]">{item.job} · Lv.{item.level.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="grow w-full flex flex-col sm:flex-row gap-3 sm:overflow-x-auto scrollbar-hide">
                                        {item.checklist.map((content, contentIndex) => <ContentChip key={contentIndex} bosses={checklistForm.bosses} content={content} isMemberGold={item.isGold}/>)}
                                    </div>
                                </div>
                                {idx < checklistForm.checklist.slice((page - 1) * maxSize, page * maxSize).length - 1 && <Divider/>}
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="w-full mt-2 gap-3 flex flex-col sm:flex-row justify-center sm:justify-start items-end">
                        <Pagination
                            showControls
                            color="primary"
                            page={page}
                            onChange={setPage}
                            total={Math.ceil(checklistForm.checklist.length / maxSize)}/>
                        <p className="ml-auto fadedtext text-[10pt] hidden sm:block">좌우 스크롤은 Shift키를 누르며 마우스 휠로 조작하세요.</p>
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}