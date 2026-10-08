'use client'
import { ChecklistStatue, useChecklistForm, ChecklistComponent, ChecklistModal, RemainChecklistComponent, FilterComponent, SettingButton } from "./ui/ChecklistForm"
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
import { addToast, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, Select, SelectItem, Switch, Tooltip } from "@heroui/react";
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
import ChecklistLoadingSkeleton from "./ui/ChecklistLoadingSkeleton";
import { registerRaidsAutomatically } from "./lib/raidAutoRegistration";
import { useLoadingTask } from "../components/loading/LoadingProgress";
import ChecklistTableView from "./ui/ChecklistTableView";
import { ChecklistMenuIcon, ChecklistMenuRow, ChecklistMenuSection, menuActionClass, menuSelectClassNames, menuSwitchClass } from "./ui/ChecklistMenu";


export const defaultSettings: Settings = {
    checklistViewStyle: 'legacy',
    isTableBonusMode: false,
    isHideDayContent: false,
    isHideBonusMode: false,
    isAutoDeleteUnselectedRaids: false,
    isHideParadisePower: false,
    isHideCharacterMemo: false
}


const BoxAd = dynamic(() => import('../ad/BoxAd'), { ssr: false });
const LineAd = dynamic(() => import('../ad/LineAd'), { ssr: false });

function LookupSettingsIcon() {
    return (
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h10"/>
            <path d="M4 12h7"/>
            <path d="M4 18h5"/>
            <circle cx="17" cy="15" r="4"/>
            <path d="m20 18 2 2"/>
        </svg>
    )
}


export default function ChecklistClient() {
    const isCheckedToken = useSelector((state: RootState) => state.login.isCheckedToken);
    const showChecklistAds = useSelector((state: RootState) => !state.login.isLogined || !state.login.user.isSupporter);

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
    const [checklistViewStyle, setChecklistViewStyle] = useState<Settings['checklistViewStyle']>('legacy');
    const [isTableBonusMode, setTableBonusMode] = useState(false);
    const [viewportWidth, setViewportWidth] = useState(0);
    const [statusSidebarContainer, setStatusSidebarContainer] = useState<HTMLDivElement | null>(null);
    const lastFetchRef = useRef(Date.now());
    
    const [isOpenBosses, setOpenBosses] = useState(false);
    const [isOpenLookupDrawer, setOpenLookupDrawer] = useState(false);
    const onOpenChangeBosses = (isOpen: boolean) => setOpenBosses(isOpen);
    useLoadingTask("레이드를 자동 등록하고 있어요", isAutoRegisteringRaids);
    const isTableView = checklistViewStyle === 'table' && viewportWidth > 720;
    const showDesktopLookup = isTableView ? viewportWidth >= 1500 : viewportWidth >= 960;
    const toggleBonusManagement = async () => {
        const stored = localStorage.getItem('userSettings');
        const current: Settings = { ...defaultSettings, ...(stored ? JSON.parse(stored) : {}) };
        const next = { ...current, isTableBonusMode: !current.isTableBonusMode };
        localStorage.setItem('userSettings', JSON.stringify(next));
        setTableBonusMode(next.isTableBonusMode);
        const userStr = sessionStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) as LoginUser : null;
        if (user) {
            const response = await fetch('/api/setting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id, settings: next })
            });
            if (!response.ok) addToast({ title: '설정 저장 오류', description: '더보기 관리 설정을 저장하지 못했습니다.', color: 'danger' });
        }
    };

    const handleChecklistViewStyleChange = async (value: Settings['checklistViewStyle']) => {
        if (value === checklistViewStyle) return;

        const stored = localStorage.getItem('userSettings');
        const current: Settings = { ...defaultSettings, ...(stored ? JSON.parse(stored) : {}) };
        const next = { ...current, checklistViewStyle: value };
        localStorage.setItem('userSettings', JSON.stringify(next));
        setChecklistViewStyle(value);

        const userStr = sessionStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) as LoginUser : null;
        if (user) {
            const response = await fetch('/api/setting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id, settings: next })
            });
            if (!response.ok) addToast({ title: '설정 저장 오류', description: '숙제 화면 스타일을 저장하지 못했습니다.', color: 'danger' });
        }
    };

    const renderChecklistViewStyleSelect = (className?: string) => (
        <Select
            aria-label="숙제 화면 스타일"
            size="sm"
            radius="sm"
            variant="flat"
            selectedKeys={[checklistViewStyle]}
            onSelectionChange={keys => {
                const value = Array.from(keys)[0];
                if (value) void handleChecklistViewStyleChange(String(value) as Settings['checklistViewStyle']);
            }}
            className={className}
            classNames={menuSelectClassNames}>
            <SelectItem key="legacy">카드 스타일</SelectItem>
            <SelectItem key="table">표 스타일</SelectItem>
        </Select>
    );

    useEffect(() => {
        const updateViewportWidth = () => setViewportWidth(window.innerWidth);
        updateViewportWidth();
        window.addEventListener('resize', updateViewportWidth);
        return () => window.removeEventListener('resize', updateViewportWidth);
    }, []);

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

    const renderLookupMenu = (onClose?: () => void) => (
        <>
            <ChecklistMenuSection title="화면 설정">
                <ChecklistMenuRow icon="view" label="화면 스타일">
                    {renderChecklistViewStyleSelect("w-[124px] shrink-0")}
                </ChecklistMenuRow>
                {isTableView ? (
                    <ChecklistMenuRow icon="bonus" label="더보기 관리">
                        <Switch size="sm" className={menuSwitchClass} aria-label="더보기 관리" isSelected={isTableBonusMode} onValueChange={() => void toggleBonusManagement()}/>
                    </ChecklistMenuRow>
                ) : null}
            </ChecklistMenuSection>
            <ChecklistMenuSection title="바로가기">
                <Button variant="light" size="sm" className={menuActionClass} startContent={<ChecklistMenuIcon name="raid"/>} isLoading={isAutoRegisteringRaids} isDisabled={checklistForm.isLoading || checklist.length === 0} onPress={() => handleRaidAutoRegistration()}>전체 자동 등록</Button>
                <Button variant="light" size="sm" className={menuActionClass} startContent={<ChecklistMenuIcon name="info"/>} onPress={() => { onClose?.(); setOpenBosses(true); }}>콘텐츠 정보</Button>
                <Button variant="light" size="sm" className={clsx(menuActionClass, checklistForm.isShowList && "bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-white")} startContent={<ChecklistMenuIcon name="remaining"/>} aria-pressed={checklistForm.isShowList} onPress={() => { checklistForm.setShowList(!checklistForm.isShowList); onClose?.(); }}>남은 숙제</Button>
                <Button variant="light" size="sm" className={clsx(menuActionClass, checklistForm.isShowCubeDetail && "bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-white")} startContent={<ChecklistMenuIcon name="cube"/>} aria-pressed={checklistForm.isShowCubeDetail} onPress={() => { checklistForm.setShowCubeDetail(!checklistForm.isShowCubeDetail); onClose?.(); }}>큐브 현황</Button>
            </ChecklistMenuSection>
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
            {showDesktopLookup ? (
                <ChecklistMenuSection title="관리">
                    <Button variant="light" size="sm" className={clsx(menuActionClass, "!text-danger dark:!text-red-400")} startContent={<ChecklistMenuIcon name="reset"/>} isLoading={isLoadingReset} onPress={async () => await handleResetChecklist(checklist, checklistForm.biweekly, dispatch, setLoadingReset)}>주간 숙제 초기화</Button>
                    <p className="px-2 pb-1 text-[10px] leading-4 text-default-400">숙제와 이번 주 부수입 기록을 초기화합니다.</p>
                </ChecklistMenuSection>
            ) : null}
        </>
    );

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
                setChecklistViewStyle(settings.checklistViewStyle);
                setTableBonusMode(settings.isTableBonusMode);
                checklistForm.setHideDayContent(settings.isHideDayContent);
                checklistForm.setHideBonusMode(settings.isHideBonusMode);
                checklistForm.setAutoDeleteUnselectedRaids(settings.isAutoDeleteUnselectedRaids);
                checklistForm.setHideParadisePower(settings.isHideParadisePower);
                checklistForm.setHideCharacterMemo(settings.isHideCharacterMemo);
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
                    setChecklistViewStyle(settings.checklistViewStyle);
                    setTableBonusMode(settings.isTableBonusMode);
                    checklistForm.setHideDayContent(settings.isHideDayContent);
                    checklistForm.setHideBonusMode(settings.isHideBonusMode);
                    checklistForm.setAutoDeleteUnselectedRaids(settings.isAutoDeleteUnselectedRaids);
                    checklistForm.setHideParadisePower(settings.isHideParadisePower);
                    checklistForm.setHideCharacterMemo(settings.isHideCharacterMemo);
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
        <div className={clsx("min-h-[calc(100vh-65px)] w-full relative", isTableView ? "checklist-table-view min-h-[calc(100vh-65px)] p-3 lg1200:p-5" : "p-5")}>
            <Tooltip showArrow placement="right" content="숙제 조회 설정">
                <Button
                    isIconOnly
                    aria-label="숙제 조회 설정 열기"
                    color="primary"
                    radius="none"
                    className={clsx(
                        "fixed left-0 top-[330px] z-[60] h-16 w-11 min-w-0 cursor-pointer rounded-r-2xl border border-primary-300/70 bg-gradient-to-b from-primary-500 to-primary-600 text-white shadow-[0_8px_24px_rgba(0,111,238,0.3)] transition-all hover:w-12 hover:shadow-[0_10px_28px_rgba(0,111,238,0.4)] dark:border-primary-400/40 dark:from-primary-500 dark:to-primary-700",
                        showDesktopLookup && "hidden",
                        isOpenLookupDrawer && "pointer-events-none -translate-x-full opacity-0"
                    )}
                    onPress={() => setOpenLookupDrawer(true)}>
                    <LookupSettingsIcon/>
                </Button>
            </Tooltip>
            <Drawer
                placement="left"
                size={isMobile ? "full" : "sm"}
                radius={isMobile ? "none" : "lg"}
                isOpen={isOpenLookupDrawer}
                onOpenChange={setOpenLookupDrawer}
                classNames={{
                    base: "border-r border-gray-200/80 bg-white dark:border-white/10 dark:bg-[#151515]",
                    backdrop: "bg-black/35 backdrop-blur-[2px]"
                }}>
                <DrawerContent>
                    {(onClose) => (
                        <>
                            <DrawerHeader className="flex flex-col items-start gap-1 border-b border-gray-200/80 px-5 py-5 dark:border-white/10">
                                <div className="flex items-center justify-between gap-3 text-primary">
                                    <div className="flex items-center gap-2">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-400/15">
                                        <LookupSettingsIcon/>
                                    </span>
                                    <p className="text-lg font-bold text-foreground">숙제 조회 설정</p>
                                    </div>
                                </div>
                                <p className="pl-11 text-xs font-normal fadedtext">서버와 필터를 선택하고 필요한 현황을 빠르게 확인하세요.</p>
                            </DrawerHeader>
                            <DrawerBody className="gap-0 px-3 py-2 sm:px-4">
                                {renderLookupMenu(onClose)}
                            </DrawerBody>
                        </>
                    )}
                </DrawerContent>
            </Drawer>
            <div className={clsx(showDesktopLookup && "grid grid-cols-[270px_minmax(0,1fr)] items-start gap-4")}>
            {showDesktopLookup ? (
                <aside aria-label="숙제 조회 설정" className="scrollbar-none sticky top-0 h-[calc(100vh-80px)] overflow-y-auto rounded-xl border border-default-200 bg-default-50/50 px-2 py-2 dark:border-white/10 dark:bg-[#171717]">
                    <div ref={setStatusSidebarContainer}/>
                    {renderLookupMenu()}
                </aside>
            ) : null}
            <main className="min-w-0">
            <div className={clsx("w-full mx-auto", !isTableView && !showDesktopLookup && "max-w-[1280px]")}>
                <ChecklistStatue 
                    isTableView={isTableView}
                    isTableViewWide={isTableView && viewportWidth >= 1500}
                    isSidebarVisible={showDesktopLookup}
                    sidebarContainer={statusSidebarContainer}
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
            {showChecklistAds && !checklistForm.isLoading && checklist.length > 0 ? isMobile ? (
                <div className={clsx("w-full flex justify-center overflow-hidden", isTableView || showDesktopLookup ? "pt-5" : "md960:pt-[110px]")}>
                    <div className="w-full max-w-[970px] min-h-[60px] max-h-[80px] mt-8">
                        <LineAd isLoaded={!checklistForm.isLoading}/>
                    </div>
                </div>
            ) : (
                <div className={clsx("w-full flex justify-center overflow-hidden", isTableView || showDesktopLookup ? "mt-5" : "md960:mt-[220px]")}>
                    <div className="w-full max-w-[1240px] flex justify-center rounded-2xl bg-[#eeeeee] dark:bg-[#222222] p-4">
                        <FixedLineAd isLoaded={!checklistForm.isLoading}/>
                    </div>
                </div>
            ) : <></>}
            <div>
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
                            {isTableView ? (
                                <ChecklistTableView
                                    checklist={checklist}
                                    server={checklistForm.server}
                                    bosses={checklistForm.bosses}
                                    dispatch={dispatch}
                                    filterContent={checklistForm.filterContent}
                                    isRemainHomework={checklistForm.isRemainHomework}
                                    isShowGoldCharacter={checklistForm.isShowGoldCharacter}
                                    filterAccount={checklistForm.filterAccount}
                                    isHideCompleteContent={checklistForm.isHideCompleteContent}
                                    isHideDayContent={checklistForm.isHideDayContent}
                                    isBonusModeEnabled={isTableBonusMode}
                                    isHideParadisePower={checklistForm.isHideParadisePower}
                                    isHideCharacterMemo={checklistForm.isHideCharacterMemo}
                                    autoChecklistNickname={autoChecklistNickname}
                                    isAutoChecklistSharing={isAutoChecklistSharing}
                                    onSelectAutoChecklistCharacter={setAutoChecklistNickname}
                                    renderCharacterSettings={(characterIndex) => <SettingButton
                                        size={15}
                                        compact
                                        checklist={checklist}
                                        characterIndex={characterIndex}
                                        dispatch={dispatch}
                                        accounts={checklistForm.accounts}
                                        setAccounts={checklistForm.setAccounts}
                                        isAutoRegisteringRaids={isAutoRegisteringRaids}
                                        onRaidAutoRegistration={handleRaidAutoRegistration}/>}
                                    onOpenContentManager={(characterIndex, type) => {
                                        checklistForm.setModalData({ characterIndex, type });
                                        checklistForm.onOpen();
                                    }}/>
                            ) : <ChecklistComponent
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
                                isHideParadisePower={checklistForm.isHideParadisePower}
                                isHideCharacterMemo={checklistForm.isHideCharacterMemo}
                                autoChecklistNickname={autoChecklistNickname}
                                isAutoChecklistSharing={isAutoChecklistSharing}
                                setAutoChecklistNickname={setAutoChecklistNickname}
                                isAutoRegisteringRaids={isAutoRegisteringRaids}
                                onRaidAutoRegistration={handleRaidAutoRegistration}/>}
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
            </main>
            </div>
            <div className="mx-auto w-full max-w-[1280px]">
                {!isTableView && !showDesktopLookup ? <div className="mx-4 mt-8 flex flex-col gap-4 rounded-2xl border border-danger/20 bg-danger/[0.025] p-4 shadow-sm dark:border-danger/30 dark:bg-danger/[0.06] sm:flex-row sm:items-start sm:p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-lg font-bold text-danger dark:bg-danger/15">
                        !
                    </div>
                    <div className="min-w-0 grow">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-sm font-semibold text-foreground">주간 초기화가 되지 않았나요?</h2>
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
                                초기화
                            </Button>
                        </div>
                    </div>
                </div> : null}
                {showChecklistAds && !isTableView && !checklistForm.isLoading && checklist.length > 0 ? isMobile ? (
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
            {showChecklistAds && <Script
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1236449818258742"
                crossOrigin="anonymous"/>}
        </div>
    )
}
