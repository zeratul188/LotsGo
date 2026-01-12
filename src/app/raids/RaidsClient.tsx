'use client'
import { useEffect, useState } from "react";
import { addToast, Tab, Tabs } from "@heroui/react"
import { Raid } from "../api/raids/route";
import { FindComponent } from "./RaidListForm";
import { LoginUser } from "../store/loginSlice";
import { loadRaids } from "./raidListFeat";
import { applyChangeParty, loadBosses } from "./partyFeat";
import { PartyComponent } from "./PartyForm";
import { Boss } from "../api/checklist/boss/route";
import { useMobileQuery } from "@/utiils/utils";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import { changeUserId } from "../store/partySlice";
import { useRouter } from "next/navigation";

// state 관리
function raidsForm() {
    const [selectedKey, setSelectedKey] = useState<string>('find');
    const [joinRaids, setJoinedRaids] = useState<Raid[]>([]);
    const [bosses, setBosses] = useState<Boss[]>([]);

    return {
        selectedKey, setSelectedKey,
        joinRaids, setJoinedRaids,
        bosses, setBosses
    }
}

export default function RaidsClient() {
    const form = raidsForm();
    const [isLoadingData, setLoadingData] = useState(true);
    const isMobile = useMobileQuery();
    const dispatch = useDispatch<AppDispatch>();
    const raids = useSelector((state: RootState) => state.party.raids);
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
            const pRaids = await loadRaids(dispatch, userId, form.setJoinedRaids);
            const pBosses = await loadBosses(form.setBosses);
            await Promise.all([pRaids, pBosses]);
            setLoadingData(false);
        }
        loadData();
    }, []);

    useEffect(() => {
        applyChangeParty(form.selectedKey, raids, dispatch);
    }, [form.selectedKey])

    return (
        <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto">
            <div className="mb-3">
                <Tabs 
                    fullWidth={isMobile}
                    variant="underlined" 
                    size="lg"
                    selectedKey={form.selectedKey}
                    onSelectionChange={(key) => form.setSelectedKey(String(key))}>
                    <Tab key="find" title="파티 찾기"/>
                    {form.joinRaids.map((raid) => (
                        <Tab key={raid.id} title={raid.name}/>
                    ))}
                </Tabs>
            </div>
            {form.selectedKey === 'find' ? (
                <FindComponent 
                    joinRaids={form.joinRaids}
                    setJoinRaids={form.setJoinedRaids}
                    isLoadingData={isLoadingData}
                    setLoadingData={setLoadingData}/>
            ) : (
                <PartyComponent
                    bosses={form.bosses}/>
            )}
        </div>
    )
}