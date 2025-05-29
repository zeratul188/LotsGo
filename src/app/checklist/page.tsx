'use client'
import { ChecklistStatue, useChecklistForm, ChecklistComponent, SelectServer, ChecklistModal } from "./ChecklistForm"
import { useSelector } from "react-redux";
import { LoadingComponent } from "../UtilsCompnents";
import { checkLogin, getBosses, getCubes, loadChecklist } from "./checklistFeat";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { CheckCharacter } from "../store/checklistSlice";
import { Character } from "../store/loginSlice";
import { addToast } from "@heroui/react";

export default function Checklist() {
    const checklistForm = useChecklistForm();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const expedition: Character[] = useSelector((state: RootState) => state.login.user.expedition);
    const checklist: CheckCharacter[] = useSelector((state: RootState) => state.checklist.checklist);
    
    useEffect(() => {
        if (!expedition || expedition.length === 0) return;
        if (checkLogin() && checklistForm.bosses.length !== 0) {
            loadChecklist(checklistForm.setLoading, dispatch, expedition, checklistForm.bosses);
        }
    }, [checklistForm.bosses, expedition]);

    useEffect(() => {
        const loadBosses = async () => {
            const data = await getBosses();
            checklistForm.setBosses(data);
        }
        loadBosses();
        const loadCubes = async () => {
            const data = await getCubes();
            checklistForm.setCubes(data);
        }
        loadCubes();
        if (!checkLogin()) {
            addToast({
                title: "이용 불가",
                description: `로그인을 해야만 이용 가능합니다.`,
                color: "danger"
            });
            router.push('/login');
        }
        const isAdministrator = localStorage.getItem('isAdministrator');
        if (isAdministrator === 'true') {
            addToast({
                title: "관리자 이용 불가",
                description: "관리자 계정은 해당 기능을 이용하실 수 없습니다.",
                color: "danger"
            });
            router.push('/');
        }
    }, []);

    if (checklistForm.isLoading) {
        return <LoadingComponent heightStyle="min-h-[calc(100vh-65px)]"/>
    } else {
        return (
            <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto">
                <ChecklistStatue 
                    checklist={checklist} 
                    bosses={checklistForm.bosses}
                    dispatch={dispatch}/>
                <SelectServer 
                    checklist={checklist} 
                    server={checklistForm.server}
                    setServer={checklistForm.setServer}/>
                <ChecklistComponent 
                    checklist={checklist} 
                    server={checklistForm.server}
                    bosses={checklistForm.bosses}
                    cubes={checklistForm.cubes}
                    dispatch={dispatch}
                    onOpen={checklistForm.onOpen}
                    setModalData={checklistForm.setModalData}/>
                <ChecklistModal
                    isOpen={checklistForm.isOpen}
                    modalData={checklistForm.modalData}
                    onOpenChange={checklistForm.onOpenChange}
                    checklist={checklist}
                    dispatch={dispatch}
                    bosses={checklistForm.bosses}/>
            </div>
        )
    }
}

