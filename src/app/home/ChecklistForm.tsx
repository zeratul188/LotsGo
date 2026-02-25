import { useEffect, useState } from "react";
import { CheckCharacter } from "../store/checklistSlice";
import { getHighestBucket, groupByLevel10, isCompleteHomeworkByCharacter, isLogin, loadChecklist } from "./checklistFeat";
import { LoadingComponent } from "../UtilsCompnents";
import { Boss } from "../api/checklist/boss/route";
import { 
    getAllBoundGold,
    getAllContentGold,
    getAllContentOtherGold,
    getAllCountChecklistByStage, 
    getAllGolds, 
    getBosses, 
    getCompleteChecklistByStage, 
    getHaveGolds 
} from "../checklist/checklistFeat";
import { 
    Avatar,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Divider,
    Pagination,
    Progress,
    Tooltip
} from "@heroui/react";
import React from "react";
import { getImgByJob } from "../character/expeditionFeat";
import { ContentChip } from "../raids/ui/PartyForm";
import { useMobileQuery } from "@/utiils/utils";
import CutCircularProgress from "../components/ui/CutCircularProgress";
import PersonIcon from "@/Icons/PersonIcon";
import clsx from "clsx";

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
    const maxSize = isMobile ? 3 : 5;
    
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

    const goruped = groupByLevel10(checklistForm.checklist);
    const groupedChecklist = Array.from(goruped.entries());

    return (
        <div className="w-full mb-5">
            <Card fullWidth radius="sm">
                <CardHeader>
                    <div className="w-full sm:h-[180px] flex flex-col sm:flex-row gap-4 items-center">
                        <div className="flex gap-2 sm:gap-4">
                            <div className="p-3">
                                <CutCircularProgress 
                                    label="주간 골드량"
                                    size={isMobile ? 140 : 160} 
                                    strokeWidth={12}
                                    isMobile={isMobile}
                                    value={getHaveGolds(checklistForm.bosses, checklistForm.checklist)} 
                                    max={getAllGolds(checklistForm.bosses, checklistForm.checklist)}
                                    progressClassName="stroke-warning"/>
                            </div>
                            <div className="p-3">
                                <CutCircularProgress 
                                    label="숙제 진행 상황"
                                    size={isMobile ? 140 : 160} 
                                    strokeWidth={12}
                                    isMobile={isMobile}
                                    value={getCompleteChecklistByStage(checklistForm.checklist)} 
                                    max={getAllCountChecklistByStage(checklistForm.checklist)}
                                    progressClassName="stroke-secondary"/>
                            </div>
                        </div>
                        <Divider orientation={isMobile ? 'horizontal' : 'vertical'}/>
                        <div className="grow w-full flex flex-col gap-3">
                            <Progress
                                showValueLabel={getHaveGolds(checklistForm.bosses, checklistForm.checklist) > 0}
                                radius="sm"
                                size="sm"
                                color="success"
                                label={
                                    <div className="flex gap-1 items-center">
                                        <Chip 
                                            size="sm" 
                                            color="success" 
                                            variant="flat" 
                                            radius="sm"
                                            className="mr-1">거래 가능 골드</Chip>
                                        <img
                                            src="/icons/gold.png" 
                                            alt="goldicon"
                                            className="w-[14px] h-[14px]"/>
                                        <p>{getAllContentGold(checklistForm.bosses, checklistForm.checklist).toLocaleString()}</p>
                                    </div>
                                }
                                value={getAllContentGold(checklistForm.bosses, checklistForm.checklist)}
                                maxValue={getHaveGolds(checklistForm.bosses, checklistForm.checklist)}
                                className="w-full"/>
                            <Progress
                                showValueLabel={getHaveGolds(checklistForm.bosses, checklistForm.checklist) > 0}
                                radius="sm"
                                size="sm"
                                color="warning"
                                label={
                                    <div className="flex gap-1 items-center">
                                        <Chip 
                                            size="sm" 
                                            color="warning" 
                                            variant="flat" 
                                            radius="sm"
                                            className="mr-1">귀속 골드</Chip>
                                        <img
                                            src="/icons/gold.png" 
                                            alt="goldicon"
                                            className="w-[14px] h-[14px]"/>
                                        <p>{getAllBoundGold(checklistForm.bosses, checklistForm.checklist).toLocaleString()}</p>
                                    </div>
                                }
                                value={getAllBoundGold(checklistForm.bosses, checklistForm.checklist)}
                                maxValue={getHaveGolds(checklistForm.bosses, checklistForm.checklist)}
                                className="w-full"/>
                            <Progress
                                showValueLabel={getHaveGolds(checklistForm.bosses, checklistForm.checklist) > 0}
                                radius="sm"
                                size="sm"
                                color="secondary"
                                label={
                                    <div className="flex gap-1 items-center">
                                        <Chip 
                                            size="sm" 
                                            color="secondary" 
                                            variant="flat" 
                                            radius="sm"
                                            className="mr-1">부수입</Chip>
                                        <img
                                            src="/icons/gold.png" 
                                            alt="goldicon"
                                            className="w-[14px] h-[14px]"/>
                                        <p>{getAllContentOtherGold(checklistForm.bosses, checklistForm.checklist).toLocaleString()}</p>
                                    </div>
                                }
                                value={getAllContentOtherGold(checklistForm.bosses, checklistForm.checklist)}
                                maxValue={getHaveGolds(checklistForm.bosses, checklistForm.checklist)}
                                className="w-full"/>
                            <div>
                                <p className="text-[9pt] fadedtext">골드 비율</p>
                                {checklistForm.bosses.length && checklistForm.checklist.length ? (
                                    <div className="w-full h-2 bg-gray-200 rounded-full relative overflow-hidden mt-2">
                                        <div className="absolute top-0 left-0 h-full bg-purple-600" style={{ width: '100%' }}></div>
                                        <div className="absolute top-0 left-0 h-full bg-yellow-500" style={{ width: `${getHaveGolds(checklistForm.bosses, checklistForm.checklist) !== 0 ? Math.round(getAllContentGold(checklistForm.bosses, checklistForm.checklist) / getHaveGolds(checklistForm.bosses, checklistForm.checklist) * 1000) / 10 + Math.round(getAllBoundGold(checklistForm.bosses, checklistForm.checklist) / getHaveGolds(checklistForm.bosses, checklistForm.checklist) * 1000) / 10 : 0}%` }}></div>
                                        <div className="absolute top-0 left-0 h-full bg-green-500" style={{ width: `${getHaveGolds(checklistForm.bosses, checklistForm.checklist) !== 0 ? Math.round(getAllContentGold(checklistForm.bosses, checklistForm.checklist) / getHaveGolds(checklistForm.bosses, checklistForm.checklist) * 1000) / 10 : 0}%` }}></div>
                                    </div>
                                ) : <></>}
                            </div>
                        </div>
                        <Divider orientation={isMobile ? 'horizontal' : 'vertical'}/>
                        <div className="grow w-full h-full flex flex-col gap-2 items-start">
                            <p className="fadedtext text-sm">레벨 별 숙제 현황</p>
                            <div className="grow w-full h-full flex flex-col gap-2">
                                {groupedChecklist.map(([bucket, list]) => (
                                    <React.Fragment key={bucket.startLevel}>
                                        {bucket.startLevel < getHighestBucket(goruped) && <Divider/>}
                                        <div className="w-full flex gap-1 items-center">
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                radius="sm">
                                                {bucket.startLevel} ~ {bucket.endLevel !== 9999 && bucket.endLevel-1}
                                            </Chip>
                                            <div className="ml-auto flex gap-1">
                                                {list.slice(0, 10).map((character, index) => (
                                                    <Tooltip 
                                                        key={index} 
                                                        content={
                                                            <span className="flex gap-1 items-center py-1">
                                                                <p>{character.nickname}</p>
                                                                <p className="fadedtext text-[8pt] mr-2">Lv.{character.level}</p>
                                                                <Chip size="sm" variant="flat" radius="sm" color={isCompleteHomeworkByCharacter(character) ? 'success' : 'danger'}>{isCompleteHomeworkByCharacter(character) ? '완료' : '미완료'}</Chip>
                                                            </span>
                                                        }>
                                                        <PersonIcon className={clsx(
                                                            "w-[15px] h-[25px] fill-current",
                                                            isCompleteHomeworkByCharacter(character) ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'
                                                        )}/>
                                                    </Tooltip>
                                                ))}
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <Divider/>
                <CardBody className="pt-0.5">
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