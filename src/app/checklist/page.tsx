'use client'
import { ChecklistStatue, useChecklistForm } from "./ChecklistForm"
import { useSelector } from "react-redux";
import { LoadingComponent } from "../UtilsCompnents";
import { checkLogin, getBosses, loadChecklist } from "./checklistFeat";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { CheckCharacter } from "../store/checklistSlice";
import { Character } from "../store/loginSlice";

export default function Checklist() {
    const checklistForm = useChecklistForm();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const expedition: Character[] = useSelector((state: RootState) => state.login.user.expedition);
    const checklist: CheckCharacter[] = useSelector((state: RootState) => state.checklist.checklist);
    
    useEffect(() => {
        if (!expedition || expedition.length === 0) return;
        if (checkLogin(router) && checklistForm.bosses.length !== 0) {
            loadChecklist(checklistForm.setLoading, dispatch, expedition, checklistForm.bosses);
        }
    }, [checklistForm.bosses, expedition]);

    useEffect(() => {
        const loadBosses = async () => {
            const data = await getBosses();
            checklistForm.setBosses(data);
        }
        loadBosses();
    }, []);

    if (checklistForm.isLoading) {
        return <LoadingComponent heightStyle="min-h-[calc(100vh-65px)]"/>
    } else {
        return (
            <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto">
                <ChecklistStatue checklist={checklist} bosses={checklistForm.bosses}/>
            </div>
        )
    }
}

