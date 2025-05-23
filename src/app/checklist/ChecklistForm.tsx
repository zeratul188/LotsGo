import { useState } from "react";
import { Boss } from "../api/checklist/boss/route";
import { CheckCharacter } from "../store/checklistSlice";
import { 
    Button, 
    Card, CardBody, 
    Divider, 
    Progress, 
    RadioProps, RadioGroup, Radio, cn,
    Tooltip 
} from "@heroui/react";
import Image from "next/image";
import { getAllCountChecklist, getAllGolds, getCompleteChecklist, getHaveGolds, getServerList } from "./checklistFeat";
import { SetStateFn, useMobileQuery } from "@/utiils/utils";

// state 관리
export function useChecklistForm() {
    const [isLoading, setLoading] = useState(true);
    const [bosses, setBosses] = useState<Boss[]>([]);
    const [server, setServer] = useState('전체');

    return {
        isLoading, setLoading,
        bosses, setBosses,
        server, setServer
    }
}

// 체크리스트 현황 컴포넌트
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
                        <Tooltip 
                            showArrow
                            placement="left"
                            content="캐릭터 정보만 수정되며, 체크리스트는 영향을 주지 않습니다.">
                            <Button
                                color="primary"
                                className="w-full md840:w-[140px]">캐릭터 갱신하기</Button>
                        </Tooltip>
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}

// 서버 선택 컴포넌트
type SelectServerProps = {
    checklist: CheckCharacter[],
    server: string,
    setServer: SetStateFn<string>
}
export function SelectServer({ checklist, server, setServer }: SelectServerProps) {
    return (
        <RadioGroup
            description="서버를 선택하면 해당 서버인 캐릭터만 조회됩니다." 
            label="서버 선택"
            orientation="horizontal"
            value={server}
            onValueChange={setServer}
            className="mt-6">
            <CustomRadio key={0} value="전체">전체</CustomRadio>
            {getServerList(checklist).map((server, index) => (
                <CustomRadio key={index+1} value={server}>{server}</CustomRadio>
            ))}
        </RadioGroup>
    )
}

// 커스텀 라디오 요소
function CustomRadio(props: RadioProps) {
    const { children, ...otherProps } = props;
    return (
        <Radio
            {...otherProps}
            classNames={{
                base: cn(
                    "inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-between",
                    "flex-row-reverse max-w-[200px] cursor-pointer rounded-md gap-4 p-2 border-2 border-transparent",
                    "data-[selected=true]:border-primary",
                ),
            }}>
            {children}
        </Radio>
    )
}

// 체크리스트 컴포넌트
type ChecklistProps = {
    checklist: CheckCharacter[]
}
export function ChecklistComponent({ checklist }: ChecklistProps) {

    return (
        <div className="mt-5">
            checklist
        </div>
    )
}