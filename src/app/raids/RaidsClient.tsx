'use client'
import { useEffect, useState } from "react";
import { addToast, Tab, Tabs } from "@heroui/react"
import { FindComponent } from "./ui/RaidListForm";
import { LoginUser } from "../store/loginSlice";
import { loadRaids } from "./lib/raidListFeat";
import { applyChangeParty, loadBosses } from "./lib/partyFeat";
import { PartyComponent } from "./ui/PartyForm";
import { Boss } from "../api/checklist/boss/route";
import { useMobileQuery } from "@/utiils/utils";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import { changeKey, changeUserId } from "../store/partySlice";
import { useRouter } from "next/navigation";

// state 관리
function raidsForm() {
    const [bosses, setBosses] = useState<Boss[]>([]);

    return {
        bosses, setBosses
    }
}

export default function RaidsClient() {
    const form = raidsForm();
    const [isLoadingData, setLoadingData] = useState(true);
    const isMobile = useMobileQuery();
    const dispatch = useDispatch<AppDispatch>();
    const raids = useSelector((state: RootState) => state.party.raids);
    const joinRaids = useSelector((state: RootState) => state.party.joinRaids);
    const selectedKey = useSelector((state: RootState) => state.party.selectedKey);
    const router = useRouter();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
        let userId = null;
        if (storedUser) {
            const id = storedUser.id;
            userId = id;
            dispatch(changeUserId(id));
        } else {
            addToast({
                title: "이용 불가",
                description: `로그인을 해야만 이용 가능합니다.`,
                color: "danger"
            });
            router.push('/login');
        }
        const loadData = async () => {
            const pRaids = await loadRaids(dispatch, userId);
            const pBosses = await loadBosses(form.setBosses);
            await Promise.all([pRaids, pBosses]);
            setLoadingData(false);
        }
        loadData();
    }, []);

    useEffect(() => {
        applyChangeParty(selectedKey, raids, dispatch);
    }, [selectedKey])

    return (
        <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto">
            <div className="mb-3">
                <Tabs 
                    fullWidth={isMobile}
                    variant="underlined" 
                    size="lg"
                    selectedKey={selectedKey}
                    onSelectionChange={(key) => dispatch(changeKey(String(key)))}>
                    <Tab key="find" title="파티 찾기"/>
                    {joinRaids.map((raid) => (
                        <Tab key={raid.id} title={raid.name}/>
                    ))}
                </Tabs>
            </div>
            {selectedKey === 'find' ? (
                <FindComponent 
                    joinRaids={joinRaids}
                    isLoadingData={isLoadingData}
                    dispatch={dispatch}/>
            ) : (
                <PartyComponent
                    dispatch={dispatch}
                    bosses={form.bosses}/>
            )}
        </div>
    )
}