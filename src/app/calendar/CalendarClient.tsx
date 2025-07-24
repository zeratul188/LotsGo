'use client'
import { useEffect } from "react";
import { NotLoginedComponent, useCalendarForm, WeekComponent } from "./CalendarForm"
import { addToast, Divider } from "@heroui/react";
import { useRouter } from "next/navigation";
import { loadBosses, loadGuild, loadWorks, removeAutoCalendarsByGuild, removeAutoCalendarsByWorks } from "./calendarFeat";
import { getAuth, onAuthStateChanged } from "firebase/auth";import BigComponent from "./CalendarForm";
import { checkLogin } from "../checklist/checklistFeat";
import Script from "next/script";

export default function CalendarClient() {
    const calendarForm = useCalendarForm();
    const router = useRouter();

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
            <BigComponent 
                works={calendarForm.works} 
                guild={calendarForm.guild}
                setWorks={calendarForm.setWorks}
                setGuild={calendarForm.setGuild}/>
            <Script
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1236449818258742"
                crossOrigin="anonymous"/>
        </div>
    )
}