'use client'
import { useChecklistForm } from "./ChecklistForm"
import { useSelector } from "react-redux";
import { LoadingComponent } from "../UtilsCompnents";
import { checkLogin, loadChecklist } from "./checklistFeat";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../store/store";

export default function Checklist() {
    const checklistForm = useChecklistForm();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const expedition = useSelector((state: RootState) => state.login.user.expedition);
    const checklist = useSelector((state: RootState) => state.checklist.checklist);
    
    useEffect(() => {
        if (!expedition || expedition.length === 0) return;
        if (checkLogin(router)) {
            loadChecklist(checklistForm.setLoading, dispatch, expedition);
        }
    }, [expedition]);

    if (checklistForm.isLoading) {
        return <LoadingComponent heightStyle="min-h-[calc(100vh-65px)]"/>
    } else {
        return (
            <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto">
                checklist length : {checklist.length}
            </div>
        )
    }
}

