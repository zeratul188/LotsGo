'use client'
import { ChecklistStatue, useChecklistForm, ChecklistComponent, SelectServer, ChecklistModal, CubeDetailComponent, RemainChecklistComponent, FilterComponent, BossInfoModal } from "./ui/ChecklistForm"
import { useSelector } from "react-redux";
import { LoadingComponent } from "../UtilsCompnents";
import { checkLogin, getBosses, getCubes, handleResetChecklist, loadChecklist, settingFilter } from "./lib/checklistFeat";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { CheckCharacter } from "../store/checklistSlice";
import { Character, LoginUser } from "../store/loginSlice";
import { addToast, Button, Spinner } from "@heroui/react";
import { useMobileQuery } from "@/utiils/utils";
import dynamic from "next/dynamic";
import clsx from "clsx";
import Script from "next/script";
import NotLoginedComponent from "./ui/NotLoginComponent";
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
    const isCheckedToken = useSelector((state: RootState) => state.login.isCheckedToken);

    const initialChecklist: CheckCharacter[] = iChecklist;
    const initialBosses: Boss[] = iBosses;
    const initialCubes: Cube[] = iCubes;

    const checklistForm = useChecklistForm();
    const dispatch = useDispatch<AppDispatch>();
    const expedition: Character[] = useSelector((state: RootState) => state.login.user.expedition);
    const checklist: CheckCharacter[] = useSelector((state: RootState) => state.checklist.checklist);
    const isMobile = useMobileQuery();
    const [isLoadingReset, setLoadingReset] = useState(false);
    const [autoChecklistNickname, setAutoChecklistNickname] = useState('');
    const [isAutoChecklistSharing, setAutoChecklistSharing] = useState(false);
    const lastFetchRef = useRef(Date.now());
    
    const [isOpenBosses, setOpenBosses] = useState(false);
    const onOpenChangeBosses = (isOpen: boolean) => setOpenBosses(isOpen);

    useEffect(() => {
        if (checklistForm.cubes.length === 0) {
            checklistForm.setCubes(initialCubes);
        }
    }, []);
    
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

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // ⚠ PC에서는 자동 새로고침 안 하고 그냥 리턴
        //const isMobileStatue = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        //if (!isMobileStatue) return;

        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                const now = Date.now();
                if (now - lastFetchRef.current > 20 * 60 * 1000) {
                    lastFetchRef.current = now;
                    checklistForm.setLoading(true);
                    loadChecklist(checklistForm.setLoading, dispatch, expedition, checklistForm.bosses, checklistForm.setLife, checklistForm.setBlessing, checklistForm.setMax, checklistForm.setBiweekly);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
        }
    }, [checklistForm.bosses, dispatch, expedition]);

    useEffect(() => {
        if (!isCheckedToken) return;
        if (checkLogin()) {
            checklistForm.setLogined(true);
            getBosses()
                .then((bossData) => {
                    checklistForm.setBosses(bossData);
                })
                .catch(() => {
                    checklistForm.setBosses([]);
                    addToast({
                        title: "보스 데이터 로드 오류",
                        description: "데이터베이스의 보스 정보를 불러오지 못했습니다.",
                        color: "danger"
                    });
                });
            getCubes()
                .then((cubeData) => {
                    checklistForm.setCubes(cubeData);
                })
                .catch(() => {
                    checklistForm.setCubes(initialCubes);
                });
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
            const userStr = sessionStorage.getItem('user');
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
    }, [isCheckedToken]);

    if (!isCheckedToken) {
        return (
            <div className="min-h-[calc(100vh-65px)] p-5 w-full flex justify-center items-center">
                <Spinner label="로그인 정보를 확인 중입니다..." variant="wave" classNames={{ label: 'fadedtext mt-4' }}/>
            </div>
        )
    }

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
                    setAccounts={checklistForm.setAccounts}
                    isLoadingData={checklistForm.isLoading}
                    autoChecklistNickname={autoChecklistNickname}
                    setAutoChecklistNickname={setAutoChecklistNickname}
                    setAutoChecklistSharing={setAutoChecklistSharing}/>
            </div>
            {!checklistForm.isLoading && checklist.length > 0 ? isMobile ? (
                <div className="w-full flex justify-center overflow-hidden md960:pt-[110px]">
                    <div className="w-full max-w-[970px] min-h-[60px] max-h-[80px] mt-8">
                        <LineAd isLoaded={!checklistForm.isLoading}/>
                    </div>
                </div>
            ) : (
                <div className="w-full flex justify-center overflow-hidden md960:mt-[220px]">
                    <div className="w-full max-w-[1240px] flex justify-center rounded-2xl bg-[#eeeeee] dark:bg-[#222222] p-4">
                        <FixedLineAd isLoaded={!checklistForm.isLoading}/>
                    </div>
                </div>
            ) : <></>}
            {checklistForm.isLoading ? <LoadingComponent heightStyle="min-h-[calc(100vh-65px)]"/> : (
                <div>
                    <div className="w-full max-w-[1280px] mx-auto">
                        <section className="mt-5 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-[#171717]">
                            <div className="flex flex-col gap-1 border-b border-gray-200/80 px-4 py-4 sm:px-5 dark:border-white/10">
                                <h2 className="text-lg font-semibold">숙제 조회 설정</h2>
                                <p className="text-sm fadedtext">서버와 필터를 선택하고 필요한 현황을 빠르게 확인하세요.</p>
                            </div>
                            <div className="p-4 sm:p-5">
                                <SelectServer 
                                    checklist={checklist} 
                                    server={checklistForm.server}
                                    setServer={checklistForm.setServer}/>
                            </div>
                            <div className="flex flex-col gap-3 border-t border-gray-200/80 bg-gray-50/50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.025] sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                <div className="shrink-0">
                                    <p className="text-sm font-semibold">정보 및 현황</p>
                                    <p className="text-xs fadedtext">필요한 상세 정보를 별도로 열어봅니다.</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                <Button
                                    size="sm"
                                    radius="md"
                                    variant="bordered"
                                    className="grow font-medium sm:grow-0"
                                    onPress={() => {
                                        setOpenBosses(true);
                                    }}>
                                    콘텐츠 정보
                                </Button>
                                <Button
                                    size="sm"
                                    radius="md"
                                    color="primary"
                                    variant={checklistForm.isShowList ? 'flat' : 'bordered'}
                                    className="grow font-medium sm:grow-0"
                                    onPress={() => {
                                        checklistForm.setShowList(!checklistForm.isShowList);
                                    }}>
                                    남은 숙제 현황 {checklistForm.isShowList ? '닫기' : "보기"}
                                </Button>
                                <Button
                                    size="sm"
                                    radius="md"
                                    color="primary"
                                    variant={checklistForm.isShowCubeDetail ? 'flat' : 'bordered'}
                                    className="grow font-medium sm:grow-0"
                                    onPress={() => {
                                        checklistForm.setShowCubeDetail(!checklistForm.isShowCubeDetail);
                                    }}>
                                    큐브 현황 {checklistForm.isShowCubeDetail ? '닫기' : "보기"}
                                </Button>
                                </div>
                            </div>
                            <div className="border-t border-gray-200/80 px-4 pb-4 sm:px-5 sm:pb-5 dark:border-white/10">
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
                            setHideCompleteContent={checklistForm.setHideCompleteContent}
                            isHideDayContent={checklistForm.isHideDayContent}
                            setHideDayContent={checklistForm.setHideDayContent}/>
                            </div>
                        </section>
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
                        isHideBonusMode={checklistForm.isHideBonusMode}
                        autoChecklistNickname={autoChecklistNickname}
                        isAutoChecklistSharing={isAutoChecklistSharing}
                        setAutoChecklistNickname={setAutoChecklistNickname}/>
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
