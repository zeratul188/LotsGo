'use client'
import NotLoginComponent from "./home/NotLoginForm";
import UpdateComponent from "./home/UpdateForm";
import { TodoComponent } from "./home/TodoForm";
import { isJwtExpired, useMobileQuery } from "@/utiils/utils";
import CalendarComponent, { ContentData } from "./home/CalendarForm";
import ChecklistComponent from "./home/ChecklistForm";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Island, IslandData, LostarkEvent, Notice } from "./home/calendarFeat";
import dayjs, { Dayjs } from "dayjs";
import Script from "next/script";

const BoxAd = dynamic(() => import('./ad/BoxAd'), { ssr: false });
const TwoLineAd = dynamic(() => import('./ad/TwoLineAd'), { ssr: false });

type HomeProps = {
  gate: ContentData | null;
  boss: ContentData | null;
  islands: Island[];
  islandTime: string | null;
  islandDatas: IslandData[],
  isInspection: boolean;
  notices: Notice[];
  events: LostarkEvent[];
};
export default function HomeClient({ gate, boss, islands, islandTime, islandDatas, isInspection, notices, events }: HomeProps) {
    const isMobile = useMobileQuery();
    const [isLoaded, setLoaded] = useState(false);
    const [isShowAd, setShowAd] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const [isAuthed, setIsAuthed] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!userStr || !token || isJwtExpired(token)) {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            setIsAuthed(false);
            setAuthChecked(true);
            return;
        }

        try {
            const user = JSON.parse(userStr);
            if (!user?.id) throw new Error('NO_ID');
            setIsAuthed(true);
        } catch {
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
            setIsAuthed(false);
        } finally {
            setAuthChecked(true);
        }
    }, []);

    return (
        <div className="w-full min-h-[calc(100vh-65px)]">
            <div className="p-5 w-full max-w-[1280px] mx-auto pb-20">
            <UpdateComponent/>
            {authChecked ? (
                isAuthed ? (
                    <>
                        <ChecklistComponent/>
                        <TodoComponent/>
                    </>
                ) : <NotLoginComponent/>
            ) : null}
            <CalendarComponent
                gate={gate}
                boss={boss}
                islands={islands}
                islandTime={dayjs(islandTime)}
                islandDatas={islandDatas}
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
            <Script
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1236449818258742"
                crossOrigin="anonymous"/>
        </div>
    )
}