'use client'
import { useEffect } from "react";
import { useCalendarForm, WeekComponent } from "./CalendarForm"
import { Divider } from "@heroui/react";
import { loadBosses, loadGuild, loadWorks, loadWorksByParty, removeAutoCalendarsByGuild, removeAutoCalendarsByWorks } from "./calendarFeat";
import { getAuth, onAuthStateChanged } from "firebase/auth";import BigComponent from "./CalendarForm";
import { checkLogin } from "../checklist/lib/checklistFeat";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import Script from "next/script";
import dynamic from "next/dynamic";
import { useMobileQuery } from "@/utiils/utils";
const LineAd = dynamic(() => import("@/app/ad/LineAd"), { ssr: false });
const FixedLineAd = dynamic(() => import("@/app/ad/FixedLineAd"), { ssr: false });
const BoxAd = dynamic(() => import("@/app/ad/BoxAd"), { ssr: false });

export default function CalendarClient() {
    const isMobile = useMobileQuery();
    const calendarForm = useCalendarForm();
    const isCheckedToken = useSelector((state: RootState) => state.login.isCheckedToken);

    useEffect(() => {
        if (!isCheckedToken) return;
        if (checkLogin()) {
            calendarForm.setLogined(true);
        }
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                user.getIdToken().then(() => {
                    const loadData = async () => {
                        const guildPromise = loadGuild(calendarForm.setGuild);
                        const bossPromise = loadBosses(calendarForm.setBosses);
                        const workPromise = loadWorks(calendarForm.setWorks);
                        const partyWorkPromise = loadWorksByParty(calendarForm.setPartyWorks);
                        await Promise.all([guildPromise, bossPromise, workPromise, partyWorkPromise]);
                        calendarForm.setLoading(false);
                    }
                    loadData();
                });
            }
        });
        return () => unsubscribe();
    }, [isCheckedToken]);

    useEffect(() => {
        const settingData = async () => {
            await removeAutoCalendarsByWorks(calendarForm.works, calendarForm.setWorks);
            calendarForm.setResetWorks(true);
        }
        if (!calendarForm.resetWorks && calendarForm.isLogined) {
            settingData();
        }
    }, [calendarForm.works, calendarForm.isLogined]);

    useEffect(() => {
        const settingData = async () => {
            await removeAutoCalendarsByGuild(calendarForm.guild, calendarForm.setGuild);
            calendarForm.setResetGuild(true);
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
