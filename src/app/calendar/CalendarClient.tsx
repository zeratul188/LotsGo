'use client'
import { useEffect } from "react";
import { useCalendarForm, WeekComponent } from "./CalendarForm"
import { addToast, Divider } from "@heroui/react";
import { loadBosses, loadGuild, loadWorks, loadWorksByParty, removeAutoCalendarsByGuild, removeAutoCalendarsByWorks } from "./calendarFeat";
import BigComponent from "./CalendarForm";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import Script from "next/script";
import dynamic from "next/dynamic";
import { useMobileQuery } from "@/utiils/utils";
import { ensureFirebaseAuth } from "@/utiils/firebaseAuth";
const LineAd = dynamic(() => import("@/app/ad/LineAd"), { ssr: false });
const FixedLineAd = dynamic(() => import("@/app/ad/FixedLineAd"), { ssr: false });
const BoxAd = dynamic(() => import("@/app/ad/BoxAd"), { ssr: false });

export default function CalendarClient() {
    const isMobile = useMobileQuery();
    const calendarForm = useCalendarForm();
    const isCheckedToken = useSelector((state: RootState) => state.login.isCheckedToken);
    const isLogined = useSelector((state: RootState) => state.login.isLogined);

    useEffect(() => {
        if (!isCheckedToken) return;
        calendarForm.setLogined(isLogined);
        if (!isLogined) {
            calendarForm.setLoading(false);
            return;
        }

        const loadData = async () => {
            try {
                await ensureFirebaseAuth();
                await Promise.all([
                    loadGuild(calendarForm.setGuild),
                    loadBosses(calendarForm.setBosses),
                    loadWorks(calendarForm.setWorks),
                    loadWorksByParty(calendarForm.setPartyWorks)
                ]);
            } catch (error) {
                console.error("Failed to load calendar data", error);
                addToast({
                    title: "일정 로드 오류",
                    description: "인증 정보를 복구하지 못했습니다. 잠시 후 다시 시도해 주세요.",
                    color: "danger"
                });
            } finally {
                calendarForm.setLoading(false);
            }
        };

        void loadData();
    }, [isCheckedToken, isLogined]);

    useEffect(() => {
        const settingData = async () => {
            try {
                await removeAutoCalendarsByWorks(calendarForm.works, calendarForm.setWorks);
            } catch (error) {
                console.error("Failed to remove expired personal calendars", error);
            } finally {
                calendarForm.setResetWorks(true);
            }
        }
        if (!calendarForm.resetWorks && calendarForm.isLogined) {
            settingData();
        }
    }, [calendarForm.works, calendarForm.isLogined]);

    useEffect(() => {
        const settingData = async () => {
            try {
                await removeAutoCalendarsByGuild(calendarForm.guild, calendarForm.setGuild);
            } catch (error) {
                console.error("Failed to remove expired guild calendars", error);
            } finally {
                calendarForm.setResetGuild(true);
            }
        }
        if (!calendarForm.resetGuild && calendarForm.guild && calendarForm.isLogined) {
            settingData();
        }
    }, [calendarForm.guild, calendarForm.isLogined]);

    return (
        <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto">
            <WeekComponent 
                works={calendarForm.works} 
                partyWorks={calendarForm.partyWorks}
                guild={calendarForm.guild} 
                bosses={calendarForm.bosses}
                setWorks={calendarForm.setWorks}
                setGuild={calendarForm.setGuild}
                isLogined={calendarForm.isLogined}/>
            {isMobile ? (
                <div className="w-full flex justify-center px-4 overflow-hidden mt-8 mb-8">
                    <div className="w-full max-w-[970px] min-h-[60px] max-h-[80px]">
                        <LineAd isLoaded={true}/>
                    </div>
                </div>
            ) : (
                <div className="w-full flex justify-center mt-8 overflow-hidden mb-8">
                    <div className="w-full max-w-[1240px] flex justify-center rounded-2xl bg-[#eeeeee] dark:bg-[#222222] p-4 mx-4">
                        <FixedLineAd isLoaded={true}/>
                    </div>
                </div>
            )}
            <Divider className="mt-6 mb-4"/>
            <BigComponent 
                works={calendarForm.works} 
                partyWorks={calendarForm.partyWorks}
                bosses={calendarForm.bosses}
                guild={calendarForm.guild}
                setWorks={calendarForm.setWorks}
                setGuild={calendarForm.setGuild}/>
            {isMobile ? (
                <div className="w-full flex justify-center px-4">
                    <div className="w-full max-w-[360px] min-h-[100px] mt-4">
                        <BoxAd isLoaded={true}/>
                    </div>
                </div>
            ) : (
                <div className="w-full flex justify-center px-4 overflow-hidden mt-8">
                    <div className="w-full max-w-[1240px] flex justify-center rounded-2xl bg-[#eeeeee] dark:bg-[#222222] p-8">
                        <div className="w-full max-w-[970px] min-h-[60px] max-h-[80px]">
                            <LineAd isLoaded={true}/>
                        </div>
                    </div>
                </div>
            )}
            <Script
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1236449818258742"
                crossOrigin="anonymous"/>
        </div>
    )
}
