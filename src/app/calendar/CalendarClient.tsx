'use client'
import { useEffect, useState } from "react";
import { NotLoginedComponent, useCalendarForm, WeekComponent } from "./CalendarForm"
import { addToast, Divider } from "@heroui/react";
import { useRouter } from "next/navigation";
import { loadBosses, loadGuild, loadWorks, removeAutoCalendarsByGuild, removeAutoCalendarsByWorks } from "./calendarFeat";
import { getAuth, onAuthStateChanged } from "firebase/auth";import BigComponent from "./CalendarForm";
import LineAd from "../ad/LineAd";
import BoxAd from "../ad/BoxAd";
import { useMobileQuery } from "@/utiils/utils";
import { checkLogin } from "../checklist/checklistFeat";

export default function CalendarClient() {
    const calendarForm = useCalendarForm();
    const router = useRouter();
    const isMobile = useMobileQuery();

    useEffect(() => {
        if (checkLogin()) {
            calendarForm.setLogined(true);
        }
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            const isAdministrator = localStorage.getItem('isAdministrator');
            if (isAdministrator === 'true') {
                addToast({
                    title: "관리자 이용 불가",
                    description: "관리자 계정은 해당 기능을 이용하실 수 없습니다.",
                    color: "danger"
                });
                router.push('/');
                return;
            }
            
            if (user) {
                user.getIdToken().then(() => {
                    const loadData = async () => {
                        const guildPromise = loadGuild(calendarForm.setGuild);
                        const bossPromise = loadBosses(calendarForm.setBosses);
                        const workPromise = loadWorks(calendarForm.setWorks);
                        await Promise.all([guildPromise, bossPromise, workPromise]);
                        calendarForm.setLoading(false);
                    }
                    loadData();
                });
            }
        });
        return () => unsubscribe();
    }, []);

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
    
    if (!calendarForm.isLogined) {
        return (
            <NotLoginedComponent/>
        )
    }

    return (
        <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto">
            <WeekComponent 
                works={calendarForm.works} 
                guild={calendarForm.guild} 
                bosses={calendarForm.bosses}
                setWorks={calendarForm.setWorks}
                setGuild={calendarForm.setGuild}/>
            <Divider className="mt-6 mb-4"/>
            {!calendarForm.isLoading && calendarForm.isLogined && calendarForm.bosses.length > 0 ? (
                <div className="w-full flex justify-center overflow-hidden md960:pt-[110px]">
                    <div className="w-full max-w-[970px] min-h-[60px] max-h-[80px] mt-8">
                        <LineAd isLoaded={!calendarForm.isLoading}/>
                    </div>
                </div>
            ) : <></>}
            <BigComponent 
                works={calendarForm.works} 
                guild={calendarForm.guild}
                setWorks={calendarForm.setWorks}
                setGuild={calendarForm.setGuild}/>
            {!calendarForm.isLoading && calendarForm.isLogined && calendarForm.bosses.length > 0 ? isMobile ? (
                <div className="w-full flex justify-center px-4">
                    <div className="w-full max-w-[360px] min-h-[100px] mt-8">
                    <BoxAd isLoaded={!calendarForm.isLoading}/>
                    </div>
                </div>
            ) : (
                <div className="w-full flex justify-center px-4 overflow-hidden mt-8">
                    <div className="w-full max-w-[970px] min-h-[60px] max-h-[80px] mt-8">
                        <LineAd isLoaded={!calendarForm.isLoading}/>
                    </div>
                </div>
            ) : <></>}
        </div>
    )
}