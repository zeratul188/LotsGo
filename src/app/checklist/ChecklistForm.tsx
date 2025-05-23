import { useState } from "react";
import { Boss } from "../api/checklist/boss/route";
import { CheckCharacter } from "../store/checklistSlice";
import { Button, Card, CardBody, Divider, Progress } from "@heroui/react";
import Image from "next/image";
import { getAllCountChecklist, getAllGolds, getCompleteChecklist, getHaveGolds } from "./checklistFeat";
import { useMobileQuery } from "@/utiils/utils";

// state 관리
export function useChecklistForm() {
    const [isLoading, setLoading] = useState(true);
    const [isEmpty, setEmpty] = useState(false);
    const [bosses, setBosses] = useState<Boss[]>([]);

    return {
        isLoading, setLoading,
        isEmpty, setEmpty,
        bosses, setBosses
    }
}

// 체크리스트 현황 컴포넌트트
type ChecklistStatueProps = {
    checklist: CheckCharacter[],
    bosses: Boss[]
}
export function ChecklistStatue({ checklist, bosses }: ChecklistStatueProps) {
    const isMobile = useMobileQuery();
    return (
        <Card fullWidth radius="sm">
            <CardBody>
                <div className="w-full flex flex-col md840:flex-row gap-4">
                    <div className="w-full md840:w-[400px]">
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
                                    <span className="ml-1 text-md">주간 수익 골드량 : {getHaveGolds(bosses, checklist).toLocaleString()} / {getAllGolds(bosses, checklist).toLocaleString()}</span>
                                </div>
                            )}
                            showValueLabel={true}
                            radius="sm"
                            value={getHaveGolds(bosses, checklist)}
                            maxValue={getAllGolds(bosses, checklist)}
                            className="w-full"/>
                    </div>
                    <div><Divider orientation={isMobile ? 'horizontal' : 'vertical'}/></div>
                    <div className="w-full md840:w-[400px]">
                        <Progress 
                            aria-label="all-gold"
                            size="md"
                            color="success"
                            label={`📃 숙제 진행 상황 : ${getCompleteChecklist(checklist)} / ${getAllCountChecklist(checklist)}`}
                            showValueLabel={true}
                            radius="sm"
                            value={getCompleteChecklist(checklist)}
                            maxValue={getAllCountChecklist(checklist)}
                            className="w-full"/>
                    </div>
                    <div><Divider orientation={isMobile ? 'horizontal' : 'vertical'}/></div>
                    <div className="grow-1 flex justify-end items-center">
                        <Button
                            color="primary"
                            className="w-full md840:w-[140px]">캐릭터 갱신하기</Button>
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}