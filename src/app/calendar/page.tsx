'use client'
import { useEffect } from "react";
import { useCalendarForm, WeekComponent } from "./CalendarForm"
import { addToast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { loadBosses, loadGuild, loadWorks } from "./calendarFeat";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { LoadingComponent } from "../UtilsCompnents";

export default function Calendar() {
    const calendarForm = useCalendarForm();
    const router = useRouter();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                addToast({
                    title: "이용 불가",
                    description: `로그인을 해야만 이용 가능합니다.`,
                    color: "danger"
                });
                router.push('/login');
                return;
            }

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

            user.getIdToken().then(() => {
                const loadData = async () => {
                    const guildPromise = loadGuild(calendarForm.setGuild);
                    const bossPromise = loadBosses(calendarForm.setBosses);
                    const workPromise = loadWorks(calendarForm.setWorks);
                    await Promise.all([guildPromise, bossPromise, workPromise]);
                    // TODO 날짜가 지난 데이터는 삭제 (길드 + 개인 데이터 포함)
                    calendarForm.setLoading(false);
                }
                loadData();
            });
        });
        return () => unsubscribe();
    }, []);

    if (calendarForm.isLoading) return <LoadingComponent heightStyle="min-h-[calc(100vh-65px)]"/>

    return (
        <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto">
            <WeekComponent 
                works={calendarForm.works} 
                guild={calendarForm.guild} 
                bosses={calendarForm.bosses}
                setWorks={calendarForm.setWorks}
                setGuild={calendarForm.setGuild}/>
        </div>
    )
}