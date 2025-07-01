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
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useMobileQuery } from "@/utiils/utils";
import dynamic from "next/dynamic";

const BoxAd = dynamic(() => import('../ad/BoxAd'), { ssr: false });
const LineAd = dynamic(() => import('../ad/LineAd'), { ssr: false });

export default function ChecklistClient() {
    const checklistForm = useChecklistForm();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const expedition: Character[] = useSelector((state: RootState) => state.login.user.expedition);
    const checklist: CheckCharacter[] = useSelector((state: RootState) => state.checklist.checklist);
    const isMobile = useMobileQuery();
    
    useEffect(() => {
        if (!expedition || expedition.length === 0) return;
        if (checkLogin() && checklistForm.bosses.length !== 0) {
            loadChecklist(checklistForm.setLoading, dispatch, expedition, checklistForm.bosses, checklistForm.setLife, checklistForm.setBlessing, checklistForm.setMax);
        }
    }, [checklistForm.bosses, expedition]);

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
            const loadCubes = async () => {
                const token = await user?.getIdToken();
                if (token) {
                    const cubeData = await getCubes();
                    checklistForm.setCubes(cubeData);
                    const bossData = await getBosses();
                    checklistForm.setBosses(bossData);
                }
            }
            loadCubes();
        })
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

    return (
        <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto relative">
            <ChecklistStatue 
                checklist={checklist} 
                bosses={checklistForm.bosses}
                dispatch={dispatch}
                life={checklistForm.life}
                isBlessing={checklistForm.isBlessing}
                setLife={checklistForm.setLife}
                setBlessing={checklistForm.setBlessing}
                max={checklistForm.max}
                setMax={checklistForm.setMax}/>
            {!checklistForm.isLoading ? (
                <div className="w-full flex justify-center overflow-hidden md960:pt-[110px]">
                    <div className="w-full max-w-[970px] min-h-[60px] max-h-[80px] mt-8">
                        <LineAd isLoaded={!checklistForm.isLoading}/>
                    </div>
                </div>
            ) : <></>}
            {checklistForm.isLoading ? <LoadingComponent heightStyle="min-h-[calc(100vh-65px)]"/> : (
                <div>
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
            )}
            {!checklistForm.isLoading ? isMobile ? (
                <div className="w-full flex justify-center px-4">
                    <div className="w-full max-w-[360px] min-h-[100px] mt-8">
                    <BoxAd isLoaded={!checklistForm.isLoading}/>
                    </div>
                </div>
            ) : (
                <div className="w-full flex justify-center px-4 overflow-hidden mt-8">
                    <div className="w-full max-w-[970px] min-h-[60px] max-h-[80px] mt-8">
                        <LineAd isLoaded={!checklistForm.isLoading}/>
                    </div>
                </div>
            ) : <></>}
        </div>
    )
}