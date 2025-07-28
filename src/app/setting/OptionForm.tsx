import { Divider, Switch } from "@heroui/react";
import { useEffect, useState } from "react";
import { Settings } from "../api/setting/route";
import { handleHideDayContent, loadSettings } from "./optionFeat";
import { LoadingComponent } from "../UtilsCompnents";

export default function OptionComponent() {
    const [settings, setSettings] = useState<Settings | null>(null);

    useEffect(() => {
        const loadData  = async () => {
            await loadSettings(setSettings);
        };
        loadData();
    }, []);

    if (!settings) {
        return <LoadingComponent heightStyle={'h-[calc(100vh-155px)]'}/>;
    }

    return (
        <div className="w-full">
            <h1 className="text-3xl">숙제</h1>
            <Divider className="mt-2 mb-2"/>
            <div className="flex gap-2 items-center py-2">
                <div className="grow">
                    <h3 className="text-xl">일일 콘텐츠 숨기기</h3>
                    <p className="fadedtext text-sm">캐릭터마다 일일 콘텐츠를 숨기며, 가로로 표현하는 캐릭터 수를 증가시킵니다.</p>
                </div>
                <Switch
                    size="lg"
                    isSelected={settings ? settings.isHideDayContent : false}
                    onValueChange={async (isSelected) => await handleHideDayContent(settings, setSettings)}/>
            </div>
        </div>
    )
}