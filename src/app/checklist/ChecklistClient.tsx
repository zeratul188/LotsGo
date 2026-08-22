'use client'
import { ChecklistStatue, useChecklistForm, ChecklistComponent, ChecklistModal, RemainChecklistComponent, FilterComponent } from "./ui/ChecklistForm"
import BossInfoModal from "./ui/BossInfoModal"
import { CubeDetailComponent } from "./ui/CubeComponents"
import { useSelector } from "react-redux";
import { LoadingComponent } from "../UtilsCompnents";
import { checkLogin, getBosses, getCubes, handleResetChecklist, loadChecklist, settingFilter } from "./lib/checklistFeat";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { CheckCharacter } from "../store/checklistSlice";
import { Character, LoginUser } from "../store/loginSlice";
import { addToast, Button } from "@heroui/react";
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
import { normalizeChecklist } from "./lib/normalizeChecklist";
import HomeworkIcon from "@/Icons/HomeworkIcon";
import ChecklistLoadingSkeleton from "./ui/ChecklistLoadingSkeleton";
import RaidIcon from "@/Icons/RaidIcon";
import { registerRaidsAutomatically } from "./lib/raidAutoRegistration";
import { useLoadingTask } from "../components/loading/LoadingProgress";


export const defaultSettings: Settings = {
    isHideDayContent: false,
    isHideBonusMode: false,
    isAutoDeleteUnselectedRaids: false
}


const BoxAd = dynamic(() => import('../ad/BoxAd'), { ssr: false });
const LineAd = dynamic(() => import('../ad/LineAd'), { ssr: false });

function ContentInfoIcon() {
    return (
        <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 11v5"/>
            <path d="M12 8h.01"/>
        </svg>
    )
}

function CubeIcon() {
    return (
        <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/>
            <path d="m4.4 7.7 7.6 4.4 7.6-4.4M12 21v-8.9"/>
        </svg>
    )
}

function ActionChevron({ isOpen = false }: { isOpen?: boolean }) {
    return (
        <svg
            aria-hidden="true"
            className={clsx("transition-transform duration-200", isOpen && "rotate-180")}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="m7 10 5 5 5-5"/>
        </svg>
    )
}


export default function ChecklistClient() {
    const isCheckedToken = useSelector((state: RootState) => state.login.isCheckedToken);

    const initialChecklist: CheckCharacter[] = normalizeChecklist(iChecklist);
    const initialBosses: Boss[] = iBosses;
    const initialCubes: Cube[] = iCubes;

    const checklistForm = useChecklistForm(initialBosses, initialCubes);
    const dispatch = useDispatch<AppDispatch>();
    const expedition: Character[] = useSelector((state: RootState) => state.login.user.expedition);
    const checklist: CheckCharacter[] = useSelector((state: RootState) => state.checklist.checklist);
    const isMobile = useMobileQuery();
    const [isLoadingReset, setLoadingReset] = useState(false);
    const [isAutoRegisteringRaids, setAutoRegisteringRaids] = useState(false);
    const [autoChecklistNickname, setAutoChecklistNickname] = useState('');
    const [isAutoChecklistSharing, setAutoChecklistSharing] = useState(false);
    const lastFetchRef = useRef(Date.now());
    
    const [isOpenBosses, setOpenBosses] = useState(false);
    const onOpenChangeBosses = (isOpen: boolean) => setOpenBosses(isOpen);
    useLoadingTask("레이드를 자동 등록하고 있어요", isAutoRegisteringRaids);

    const handleRaidAutoRegistration = async (nickname?: string) => {
        const autoDeleteMessage = checklistForm.isAutoDeleteUnselectedRaids
            ? "골드 지정에서 밀려난 기존 레이드는 설정에 따라 목록에서도 삭제됩니다."
            : "골드 지정에서 밀려난 기존 레이드는 목록에 유지되고 골드 지정만 해제됩니다.";
        const targetMessage = nickname
            ? `${nickname} 캐릭터의 레이드를 자동 등록하시겠습니까?`
            : `저장된 전체 캐릭터의 레이드를 자동 등록하시겠습니까?`;
        if (!confirm(`${targetMessage}\n${autoDeleteMessage}`)) return;

        setAutoRegisteringRaids(true);
        try {
            await registerRaidsAutomatically(checklist, checklistForm.bosses, dispatch, {
                autoDeleteUnselectedRaids: checklistForm.isAutoDeleteUnselectedRaids,
                targetNickname: nickname
            });
        } finally {
            setAutoRegisteringRaids(false);
        }
    };

    useEffect(() => {
        if (!isCheckedToken || !expedition || expedition.length === 0 || !checkLogin()) return;

        let isCancelled = false;
        const loadPageData = async () => {
            checklistForm.setLoading(true);

            const bossRequest = getBosses().catch(() => {
                addToast({
                    title: "보스 데이터 로드 오류",
                    description: "데이터베이스의 보스 정보를 불러오지 못해 기본 정보를 사용합니다.",
                    color: "warning"
                });
                return initialBosses;
            });
            const checklistRequest = loadChecklist(
                (isLoading) => {
                    if (isLoading) checklistForm.setLoading(true);
                },
                dispatch,
                expedition,
                initialBosses,
                checklistForm.setLife,
                checklistForm.setBlessing,
                checklistForm.setMax,
                checklistForm.setBiweekly,
                bossRequest
            );

            try {
                const [bossData] = await Promise.all([bossRequest, checklistRequest]);
                if (isCancelled) return;

                checklistForm.setBosses(bossData);
                checklistForm.setLoading(false);
            } catch {
                if (!isCancelled) checklistForm.setLoading(false);
            }
        };

        void loadPageData();
        return () => {
            isCancelled = true;
        };
    }, [isCheckedToken, expedition]);

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
                checklistForm.setAutoDeleteUnselectedRaids(settings.isAutoDeleteUnselectedRaids);
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
                    checklistForm.setAutoDeleteUnselectedRaids(settings.isAutoDeleteUnselectedRaids);
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
            <LoadingComponent
                heightStyle="min-h-[calc(100vh-65px)]"
                message="숙제 데이터를 준비하고 있어요"
                detail="로그인 정보와 원정대 숙제 현황을 확인하고 있습니다."/>
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
            <div>
                    <div className="w-full max-w-[1280px] mx-auto">
                        <section className="mt-5 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-[#171717]">
                            <div className="flex flex-col gap-1 border-b border-gray-200/80 px-4 py-4 sm:px-5 dark:border-white/10">
                                <h2 className="text-lg font-semibold">숙제 조회 설정</h2>
                                <p className="text-sm fadedtext">서버와 필터를 선택하고 필요한 현황을 빠르게 확인하세요.</p>
                            </div>
                            <div className="flex flex-col gap-3 border-t border-gray-200/80 bg-gray-50/50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.025] sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                <div className="shrink-0">
                                    <p className="text-sm font-semibold">정보 및 현황</p>
                                    <p className="text-xs fadedtext">필요한 상세 정보를 별도로 열어봅니다.</p>
                                </div>
                                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                                    <Button
                                        aria-label="전체 캐릭터 레이드 자동 등록"
                                        size="sm"
                                        radius="sm"
                                        variant="bordered"
                                        color="primary"
                                        isLoading={isAutoRegisteringRaids}
                                        isDisabled={checklistForm.isLoading || checklist.length === 0}
                                        className="h-8 min-h-0 w-full shrink-0 gap-1.5 border-primary-200 bg-white px-3 text-xs font-semibold text-primary-700 shadow-sm dark:border-primary-400/30 dark:bg-[#171717] dark:text-primary-300 sm:w-auto"
                                        startContent={!isAutoRegisteringRaids ? <RaidIcon size={15}/> : null}
                                        onPress={() => handleRaidAutoRegistration()}>
                                        전체 자동 등록
                                    </Button>
                                    <div className="flex h-8 w-full shrink-0 divide-x divide-gray-200/80 overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm dark:divide-white/10 dark:border-white/10 dark:bg-[#171717] sm:w-auto">
                                    <Button
                                        aria-label="콘텐츠 정보 열기"
                                        size="sm"
                                        radius="none"
                                        variant="light"
                                        className="h-full min-h-0 min-w-0 flex-1 gap-1.5 rounded-none bg-white px-2.5 text-xs font-semibold text-gray-600 data-[hover=true]:bg-gray-100 sm:flex-none sm:px-3 dark:bg-[#171717] dark:text-gray-300 dark:data-[hover=true]:bg-white/10"
                                        startContent={<ContentInfoIcon/>}
                                        endContent={<ActionChevron/>}
                                        onPress={() => {
                                            setOpenBosses(true);
                                        }}>
                                        콘텐츠 정보
                                    </Button>
                                    <Button
                                        aria-label={`남은 숙제 현황 ${checklistForm.isShowList ? '닫기' : '보기'}`}
                                        aria-pressed={checklistForm.isShowList}
                                        size="sm"
                                        radius="none"
                                        variant="light"
                                        className={clsx(
                                            "h-full min-h-0 min-w-0 flex-1 gap-1.5 rounded-none px-2.5 text-xs font-semibold sm:flex-none sm:px-3",
                                            checklistForm.isShowList
                                                ? "bg-primary-100/80 text-primary-700 data-[hover=true]:bg-primary-100 dark:bg-primary-400/15 dark:text-primary-300 dark:data-[hover=true]:bg-primary-400/20"
                                                : "bg-white text-gray-600 data-[hover=true]:bg-gray-100 dark:bg-[#171717] dark:text-gray-300 dark:data-[hover=true]:bg-white/10"
                                        )}
                                        startContent={<HomeworkIcon size={15}/>}
                                        endContent={<ActionChevron isOpen={checklistForm.isShowList}/>}
                                        onPress={() => {
                                            checklistForm.setShowList(!checklistForm.isShowList);
                                        }}>
                                        남은 숙제
                                    </Button>
                                    <Button
                                        aria-label={`큐브 현황 ${checklistForm.isShowCubeDetail ? '닫기' : '보기'}`}
                                        aria-pressed={checklistForm.isShowCubeDetail}
                                        size="sm"
                                        radius="none"
                                        variant="light"
                                        className={clsx(
                                            "h-full min-h-0 min-w-0 flex-1 gap-1.5 rounded-none px-2.5 text-xs font-semibold sm:flex-none sm:px-3",
                                            checklistForm.isShowCubeDetail
                                                ? "bg-secondary-100/80 text-secondary-700 data-[hover=true]:bg-secondary-100 dark:bg-secondary-400/15 dark:text-secondary-300 dark:data-[hover=true]:bg-secondary-400/20"
                                                : "bg-white text-gray-600 data-[hover=true]:bg-gray-100 dark:bg-[#171717] dark:text-gray-300 dark:data-[hover=true]:bg-white/10"
                                        )}
                                        startContent={<CubeIcon/>}
                                        endContent={<ActionChevron isOpen={checklistForm.isShowCubeDetail}/>}
                                        onPress={() => {
                                            checklistForm.setShowCubeDetail(!checklistForm.isShowCubeDetail);
                                        }}>
                                        큐브 현황
                                     </Button>
                                 </div>
                                </div>
                             </div>
                            <div className="border-t border-gray-200/80 px-4 pb-4 sm:px-5 sm:pb-5 dark:border-white/10">
                                <FilterComponent
                                    server={checklistForm.server}
                                    setServer={checklistForm.setServer}
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
                    </div>
                    {checklistForm.isLoading ? (
                        <ChecklistLoadingSkeleton/>
                    ) : (
                        <>
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
                                setAutoChecklistNickname={setAutoChecklistNickname}
                                isAutoRegisteringRaids={isAutoRegisteringRaids}
                                onRaidAutoRegistration={handleRaidAutoRegistration}/>
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
                        </>
                    )}
                </div>
            <div className="mx-auto w-full max-w-[1280px]">
                <div className="mx-4 mt-8 flex flex-col gap-4 rounded-2xl border border-danger/20 bg-danger/[0.025] p-4 shadow-sm dark:border-danger/30 dark:bg-danger/[0.06] sm:flex-row sm:items-start sm:p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-lg font-bold text-danger dark:bg-danger/15">
                        !
                    </div>
                    <div className="min-w-0 grow">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-sm font-semibold text-foreground">주간 초기화가 되지 않았나요?</h2>
                            <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-medium text-danger dark:bg-danger/15">
                                수동 초기화
                            </span>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-default-500 dark:text-default-400">
                            수요일 오전 6시 이후에도 초기화되지 않았다면 페이지를 새로고침한 뒤 다시 시도해주세요.
                        </p>
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-[11px] text-default-400 dark:text-default-500">
                                모든 숙제와 이번 주 부수입 기록이 초기화됩니다.
                            </p>
                            <Button
                                radius="md"
                                color="danger"
                                size="sm"
                                className="w-full font-semibold sm:w-auto"
                                isLoading={isLoadingReset}
                                onPress={async () => await handleResetChecklist(checklist, checklistForm.biweekly, dispatch, setLoadingReset)}>
                                수동으로 초기화
                            </Button>
                        </div>
                    </div>
                </div>
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
