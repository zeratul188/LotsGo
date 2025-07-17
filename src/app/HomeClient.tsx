'use client'
import NotLoginComponent from "./home/NotLoginForm";
import UpdateComponent from "./home/UpdateForm";
import { TodoComponent } from "./home/TodoForm";
import { useMobileQuery } from "@/utiils/utils";
import CalendarComponent, { ContentData } from "./home/CalendarForm";
import ChecklistComponent from "./home/ChecklistForm";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Island, LostarkEvent, Notice } from "./home/calendarFeat";
import dayjs, { Dayjs } from "dayjs";

const BoxAd = dynamic(() => import('./ad/BoxAd'), { ssr: false });
const TwoLineAd = dynamic(() => import('./ad/TwoLineAd'), { ssr: false });

type HomeProps = {
  gate: ContentData | null;
  boss: ContentData | null;
  islands: Island[];
  islandTime: string | null;
  isInspection: boolean;
  notices: Notice[];
  events: LostarkEvent[];
};
export default function HomeClient({ gate, boss, islands, islandTime, isInspection, notices, events }: HomeProps) {
    const isMobile = useMobileQuery();
    const [isLoaded, setLoaded] = useState(false);
    const [isShowAd, setShowAd] = useState(false);
    return (
        <div className="w-full min-h-[calc(100vh-65px)]">
            <div className="p-5 w-full max-w-[1280px] mx-auto pb-20">
            <UpdateComponent/>
            <ChecklistComponent/>
            <TodoComponent/>
            <NotLoginComponent/>
            <CalendarComponent
                gate={gate}
                boss={boss}
                islands={islands}
                islandTime={dayjs(islandTime)}
                isInspection={isInspection}
                notices={notices}
                events={events}
                setLoaded={setLoaded} 
                setShowAd={setShowAd}/>
            {isLoaded && isShowAd ? isMobile ? (
                <div className="w-full flex justify-center px-4">
                    <div className="w-full max-w-[360px] min-h-[100px] mt-8">
                        <BoxAd isLoaded={isLoaded}/>
                    </div>
                </div>
            ) : (
                <div className="w-full flex justify-center px-4">
                    <div className="w-full mt-8">
                        <TwoLineAd isLoaded={isLoaded}/>
                    </div>
                </div>
            ) : <></>}
            </div>
        </div>
    )
}