'use client'
import { useEffect, useState } from "react";
import { Tab, Tabs } from "@heroui/react"
import { Raid } from "../api/raids/route";
import { FindComponent } from "./RaidListForm";
import { LoginUser } from "../store/loginSlice";
import { loadRaids } from "./raidListFeat";

// state 관리
function raidsForm() {
    const [selectedKey, setSelectedKey] = useState<string>('find');
    const [raids, setRaids] = useState<Raid[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [joinRaids, setJoinedRaids] = useState<Raid[]>([]);

    return {
        selectedKey, setSelectedKey,
        raids, setRaids,
        userId, setUserId,
        joinRaids, setJoinedRaids
    }
}

export default function RaidsClient() {
    const form = raidsForm();
    const [isLoadingData, setLoadingData] = useState(true);

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
            await loadRaids(userId, form.setRaids, form.setJoinedRaids, setLoadingData);
        }
        loadData();
    }, []);

    return (
        <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto">
            <div className="mb-3">
                <Tabs 
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
            ) : null}
        </div>
    )
}