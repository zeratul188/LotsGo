'use client'
import { useEffect } from "react";
import { useCalendarForm, WeekComponent } from "./CalendarForm"
import { addToast, Divider } from "@heroui/react";
import { useRouter } from "next/navigation";
import { loadBosses, loadGuild, loadWorks, loadWorksByParty, removeAutoCalendarsByGuild, removeAutoCalendarsByWorks } from "./calendarFeat";
import { getAuth, onAuthStateChanged } from "firebase/auth";import BigComponent from "./CalendarForm";
import { checkLogin } from "../checklist/checklistFeat";

export default function CalendarClient() {
    const calendarForm = useCalendarForm();
    const router = useRouter();

    useEffect(() => {
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
            <Divider className="mt-6 mb-4"/>
            <BigComponent 
                works={calendarForm.works} 
                partyWorks={calendarForm.partyWorks}
                bosses={calendarForm.bosses}
                guild={calendarForm.guild}
                setWorks={calendarForm.setWorks}
                setGuild={calendarForm.setGuild}/>
        </div>
    )
}