'use client'
import { ChecklistStatue, useChecklistForm, ChecklistComponent, SelectServer, ChecklistModal, CubeDetailComponent, RemainChecklistComponent, FilterComponent, BossInfoModal } from "./ChecklistForm"
import { useSelector } from "react-redux";
import { LoadingComponent } from "../UtilsCompnents";
import { checkLogin, getBosses, getCubes, handleResetChecklist, loadChecklist, settingFilter } from "./checklistFeat";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { CheckCharacter } from "../store/checklistSlice";
import { Character, LoginUser } from "../store/loginSlice";
import { addToast, Button, ButtonGroup } from "@heroui/react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useMobileQuery } from "@/utiils/utils";
import dynamic from "next/dynamic";
import clsx from "clsx";
import Script from "next/script";
import NotLoginedComponent from "./NotLoginComponent";
import iChecklist from '@/data/checklist/data.json';
import iBosses from '@/data/bosses/data.json';
import iCubes from '@/data/cubes/data.json';
import { Boss } from "../api/checklist/boss/route";
import { Cube } from "../api/checklist/cube/route";
import FixedLineAd from "../ad/FixedLineAd";
import { Settings } from "../api/setting/route";


export const defaultSettings: Settings = {
    isHideDayContent: false,
    isHideBonusMode: false
}


const BoxAd = dynamic(() => import('../ad/BoxAd'), { ssr: false });
const LineAd = dynamic(() => import('../ad/LineAd'), { ssr: false });


export default function ChecklistClient() {
    const initialChecklist: CheckCharacter[] = iChecklist;
    const initialBosses: Boss[] = iBosses;
    const initialCubes: Cube[] = iCubes;

    const checklistForm = useChecklistForm();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const expedition: Character[] = useSelector((state: RootState) => state.login.user.expedition);
    const checklist: CheckCharacter[] = useSelector((state: RootState) => state.checklist.checklist);
    const isMobile = useMobileQuery();
    const [isLoadingReset, setLoadingReset] = useState(false);
    
    const [isOpenBosses, setOpenBosses] = useState(false);
    const onOpenChangeBosses = (isOpen: boolean) => setOpenBosses(isOpen);
    
    useEffect(() => {
        if (!expedition || expedition.length === 0) return;
        if (checkLogin() && checklistForm.bosses.length !== 0) {
            loadChecklist(checklistForm.setLoading, dispatch, expedition, checklistForm.bosses, checklistForm.setLife, checklistForm.setBlessing, checklistForm.setMax, checklistForm.setBiweekly);
        }
    }, [checklistForm.bosses, expedition]);

    useEffect(() => {
        const results: string[] = [];
        checklist.forEach((character) => {
            if (!results.includes(character.account)) {
                results.push(character.account);
            }
        });
        checklistForm.setAccounts(results);
    }, [checklist]);

    let lastFetch = 0; // 최근 새로고침 시점

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // ⚠ PC에서는 자동 새로고침 안 하고 그냥 리턴
        //const isMobileStatue = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        //if (!isMobileStatue) return;

        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                const now = Date.now();
                if (now - lastFetch > 10 * 60 * 1000) {
                    lastFetch = now;
                    checklistForm.setLoading(true);
                    loadChecklist(checklistForm.setLoading, dispatch, expedition, checklistForm.bosses, checklistForm.setLife, checklistForm.setBlessing, checklistForm.setMax, checklistForm.setBiweekly);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
        }
    }, [loadChecklist]);

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
        if (checkLogin()) {
            checklistForm.setLogined(true);
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
        const loadSettings = async () => {
            const settingLocal = localStorage.getItem('userSettings');
            if (settingLocal) {
                const localSetting: Settings = JSON.parse(settingLocal);
                const settings: Settings = { ...defaultSettings, ...localSetting};
                checklistForm.setHideDayContent(settings.isHideDayContent);
                checklistForm.setHideBonusMode(settings.isHideBonusMode);
                return;
            }
            const userStr = localStorage.getItem('user');
            const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
            if (storedUser) {
                const id = storedUser.id;
                const res = await fetch(`/api/setting?id=${id}`);
                if (res.ok) {
                    const settings: Settings = await res.json();
                    localStorage.setItem('userSettings', JSON.stringify(settings));
                    checklistForm.setHideDayContent(settings.isHideDayContent);
                    checklistForm.setHideBonusMode(settings.isHideBonusMode);
                } else {
                    addToast({
                        title: "로드 오류",
                        description: `데이터를 가져오는데 문제가 발생하였습니다.`,
                        color: "danger"
                    });
                }
            }
        }
        loadSettings();
        settingFilter(
            checklistForm.setRemainHomework, 
            checklistForm.setShowGoldCharacter,
            checklistForm.setHideCompleteContent
        );
    }, []);

    if (!checklistForm.isLogined) {
        return (
            <NotLoginedComponent 
                initialChecklist={initialChecklist} 
                initialBosses={initialBosses}
                initialCubes={initialCubes}/>
        )
    }

    return (
        <div className="min-h-[calc(100vh-65px)] p-5 w-full relative">
            <div className="w-full max-w-[1280px] mx-auto">
                <ChecklistStatue 
                    server={checklistForm.server}
                    filterContent={checklistForm.filterContent}
                    filterAccount={checklistForm.filterAccount}
                    isRemainHomework={checklistForm.isRemainHomework}
                    isShowGoldCharacter={checklistForm.isShowGoldCharacter}
                    checklist={checklist} 
                    bosses={checklistForm.bosses}
                    dispatch={dispatch}
                    life={checklistForm.life}
                    isBlessing={checklistForm.isBlessing}
                    setLife={checklistForm.setLife}
                    setBlessing={checklistForm.setBlessing}
                    max={checklistForm.max}
                    setMax={checklistForm.setMax}
                    accounts={checklistForm.accounts}
                    setAccounts={checklistForm.setAccounts}/>
            </div>
            {!checklistForm.isLoading && checklist.length > 0 ? isMobile ? (
                <div className="w-full flex justify-center overflow-hidden md960:pt-[110px]">
                    <div className="w-full max-w-[970px] min-h-[60px] max-h-[80px] mt-8">
                        <LineAd isLoaded={!checklistForm.isLoading}/>
                    </div>
                </div>
            ) : (
                <div className="w-full flex justify-center overflow-hidden md960:mt-[140px]">
                    <div className="w-full max-w-[1240px] flex justify-center rounded-2xl bg-[#eeeeee] dark:bg-[#222222] p-4">
                        <FixedLineAd isLoaded={!checklistForm.isLoading}/>
                    </div>
                </div>
            ) : <></>}
            {checklistForm.isLoading ? <LoadingComponent heightStyle="min-h-[calc(100vh-65px)]"/> : (
                <div>
                    <div className="w-full max-w-[1280px] mx-auto">
                        <div className="w-full flex flex-col sm:flex-row gap-3 sm:items-center">
                            <div className="grow">
                                <SelectServer 
                                    checklist={checklist} 
                                    server={checklistForm.server}
                                    setServer={checklistForm.setServer}/>
                            </div>
                            <ButtonGroup fullWidth={isMobile}>
                                <Button
                                    radius="sm"
                                    color="secondary"
                                    onPress={() => {
                                        setOpenBosses(true);
                                    }}>
                                    콘텐츠 정보
                                </Button>
                                <Button
                                    radius="sm"
                                    color={checklistForm.isShowList ? 'default' : 'primary'}
                                    onPress={() => {
                                        checklistForm.setShowList(!checklistForm.isShowList);
                                    }}>
                                    남은 숙제 현황 {checklistForm.isShowList ? '닫기' : "보기"}
                                </Button>
                                <Button
                                    radius="sm"
                                    color={checklistForm.isShowCubeDetail ? 'default' : 'primary'}
                                    onPress={() => {
                                        checklistForm.setShowCubeDetail(!checklistForm.isShowCubeDetail);
                                    }}>
                                    큐브 현황 {checklistForm.isShowCubeDetail ? '닫기' : "보기"}
                                </Button>
                            </ButtonGroup>
                        </div>
                        <div className={clsx(
                            checklistForm.isShowList ? 'block' : 'hidden'
                        )}>
                            <RemainChecklistComponent checklist={checklist} bosses={checklistForm.bosses}/>
                        </div>
                        <div className={clsx(
                            checklistForm.isShowCubeDetail ? 'block' : 'hidden'
                        )}>
                            <CubeDetailComponent checklist={checklist} cubes={checklistForm.cubes}/>
                        </div>
                        <FilterComponent
                            filterContent={checklistForm.filterContent}
                            setFilterContent={checklistForm.setFilterContent}
                            bosses={checklistForm.bosses}
                            checklist={checklist}
                            isRemainHomework={checklistForm.isRemainHomework}
                            setRemainHomework={checklistForm.setRemainHomework}
                            isShowGoldCharacter={checklistForm.isShowGoldCharacter}
                            setShowGoldCharacter={checklistForm.setShowGoldCharacter}
                            filterAccount={checklistForm.filterAccount}
                            setFilterAccount={checklistForm.setFilterAccount}
                            isHideCompleteContent={checklistForm.isHideCompleteContent}
                            setHideCompleteContent={checklistForm.setHideCompleteContent}/>
                    </div>
                    <ChecklistComponent 
                        checklist={checklist} 
                        server={checklistForm.server}
                        bosses={checklistForm.bosses}
                        cubes={checklistForm.cubes}
                        dispatch={dispatch}
                        onOpen={checklistForm.onOpen}
                        setModalData={checklistForm.setModalData}
                        biweekly={checklistForm.biweekly}
                        isHideDayContent={checklistForm.isHideDayContent}
                        filterContent={checklistForm.filterContent}
                        isRemainHomework={checklistForm.isRemainHomework}
                        isShowGoldCharacter={checklistForm.isShowGoldCharacter}
                        accounts={checklistForm.accounts}
                        setAccounts={checklistForm.setAccounts}
                        filterAccount={checklistForm.filterAccount}
                        isHideCompleteContent={checklistForm.isHideCompleteContent}
                        isHideBonusMode={checklistForm.isHideBonusMode}/>
                    <ChecklistModal
                        isOpen={checklistForm.isOpen}
                        modalData={checklistForm.modalData}
                        onOpenChange={checklistForm.onOpenChange}
                        checklist={checklist}
                        dispatch={dispatch}
                        bosses={checklistForm.bosses}/>
                    <BossInfoModal
                        isOpenBosses={isOpenBosses}
                        onOpenBosses={onOpenChangeBosses}
                        bosses={checklistForm.bosses}/>
                </div>
            )}
            <div className="w-full max-w-[1280px] mx-auto">
                <p className="fadedtext text-sm mt-8">수요일 6시에 초기화되지 않았나요?<br/>초기화되지 않았을 경우 한번 새로고침을 해보신 후 그래도 초기화가 되지 않았다면 아래 버튼을 눌러주세요.</p>
                <Button
                    radius="sm"
                    color="danger"
                    size="sm"
                    className="mt-2"
                    isLoading={isLoadingReset}
                    onPress={async () => await handleResetChecklist(checklist, checklistForm.biweekly, dispatch, setLoadingReset)}>
                    수동 초기화
                </Button>
                {!checklistForm.isLoading && checklist.length > 0 ? isMobile ? (
                    <div className="w-full flex justify-center px-4">
                        <div className="w-full max-w-[360px] min-h-[100px] mt-8">
                            <BoxAd isLoaded={!checklistForm.isLoading}/>
                        </div>
                    </div>
                ) : (
                    <div className="w-full flex justify-center px-4 overflow-hidden mt-8">
                        <div className="w-full max-w-[1240px] flex justify-center rounded-2xl bg-[#eeeeee] dark:bg-[#222222] p-8">
                            <div className="w-full max-w-[970px] min-h-[60px] max-h-[80px]">
                                <LineAd isLoaded={!checklistForm.isLoading}/>
                            </div>
                        </div>
                    </div>
                ) : <></>}
            </div>
            <Script
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1236449818258742"
                crossOrigin="anonymous"/>
        </div>
    )
}