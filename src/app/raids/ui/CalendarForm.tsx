'use client'

import { AppDispatch, RootState } from "@/app/store/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getDefaultWeeklySchedule, WeeklyRaidSchedule } from "../model/types";
import { Boss } from "@/app/api/checklist/boss/route";
import { useMobileQuery } from "@/utiils/utils";
import dynamic from "next/dynamic";
const FixedLineAd = dynamic(() => import("@/app/ad/FixedLineAd"), { ssr: false });

type CalendarComponentProps = {
    dispatch: AppDispatch,
    bosses: Boss[]
}
export function CalendarComponent({ dispatch, bosses }: CalendarComponentProps) {
    const selectedRaid = useSelector((state: RootState) => state.party.selectedRaid);
    const [weeklySchedule, setWeeklySchedule] = useState<WeeklyRaidSchedule[]>(getDefaultWeeklySchedule());
    const isMobile = useMobileQuery();

    const weekDatas = [
        { key: "wednesday",  title: "수요일"},
        { key: "thursday",  title: "목요일"},
        { key: "friday",  title: "금요일"},
        { key: "saturday",  title: "토요일"},
        { key: "sunday",  title: "일요일"},
        { key: "monday",  title: "월요일"},
        { key: "tuesday",  title: "화요일"}
    ]

    useEffect(() => {
        setWeeklySchedule(selectedRaid?.weeklySchedule ?? getDefaultWeeklySchedule());
    }, [selectedRaid]);

    return (
        <div className="w-full">
            {isMobile ? null : (
                <div className="w-full flex justify-center overflow-hidden mt-8 mb-4">
                    <div className="w-full max-w-[1240px] flex justify-center rounded-2xl bg-[#eeeeee] dark:bg-[#222222] p-4 mx-4">
                        <FixedLineAd isLoaded={true}/>
                    </div>
                </div>
            )}
            <div className="w-full mt-2">
                {weekDatas.map(week => (
                    <div key={week.key} className="w-full flex items-stretch gap-2">
                        <p className="self-stretch [writing-mode:vertical-rl] [text-orientation:mixed] flex items-center justify-center">
                            {week.title}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
