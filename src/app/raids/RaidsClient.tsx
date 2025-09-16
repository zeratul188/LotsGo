'use client'
import { useEffect, useState } from "react";
import { Tab, Tabs } from "@heroui/react"
import { Raid } from "../api/raids/route";
import { FindComponent } from "./RaidListForm";
import { LoginUser } from "../store/loginSlice";
import { loadRaids } from "./raidListFeat";
import { applyChangeParty, loadBosses } from "./partyFeat";
import { PartyComponent } from "./PartyForm";
import { Boss } from "../api/checklist/boss/route";
import { useMobileQuery } from "@/utiils/utils";

// state 관리
function raidsForm() {
    const [selectedKey, setSelectedKey] = useState<string>('find');
    const [raids, setRaids] = useState<Raid[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [joinRaids, setJoinedRaids] = useState<Raid[]>([]);
    const [selectedParty, setSelectedParty] = useState<Raid | null>(null);
    const [bosses, setBosses] = useState<Boss[]>([]);

    return {
        selectedKey, setSelectedKey,
        raids, setRaids,
        userId, setUserId,
        joinRaids, setJoinedRaids,
        selectedParty, setSelectedParty,
        bosses, setBosses
    }
}

export default function RaidsClient() {
    const form = raidsForm();
    const [isLoadingData, setLoadingData] = useState(true);
    const isMobile = useMobileQuery();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
        let userId = null;
        if (storedUser) {
            const id = storedUser.id;
            userId = id;
            form.setUserId(id);
        }
        const loadData = async () => {
            const pRaids = await loadRaids(userId, form.setRaids, form.setJoinedRaids);
            const pBosses = await loadBosses(form.setBosses);
            await Promise.all([pRaids, pBosses]);
            setLoadingData(false);
        }
        loadData();
    }, []);

    useEffect(() => {
        applyChangeParty(form.selectedKey, form.raids, form.setSelectedParty);
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
                    raids={form.raids} 
                    setRaids={form.setRaids} 
                    userId={form.userId}
                    joinRaids={form.joinRaids}
                    setJoinRaids={form.setJoinedRaids}
                    isLoadingData={isLoadingData}
                    setLoadingData={setLoadingData}/>
            ) : (
                <PartyComponent
                    selectedParty={form.selectedParty}
                    bosses={form.bosses}/>
            )}
        </div>
    )
}