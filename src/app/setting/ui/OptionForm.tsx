import { Button, Card, CardBody, Chip, Switch } from "@heroui/react";
import { useEffect, useState } from "react";
import { Settings } from "../../api/setting/route";
import { handleHideBonusMode, handleHideDayContent, loadSettings, useAllLogout } from "../lib/optionFeat";
import { LoadingComponent } from "../../UtilsCompnents";

export default function OptionComponent() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isLoadingAllLogout, setLoadingAllLogout] = useState(false);

    const onClickAllLogout = useAllLogout(setLoadingAllLogout);

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
        <div className="w-full space-y-4">
            <div className="flex items-center gap-2">
                <div>
                    <h1 className="text-xl font-bold">기능 설정</h1>
                    <p className="mt-1 text-xs text-default-500">숙제 화면과 계정 보안 동작을 관리합니다.</p>
                </div>
            </div>
            <Card radius="lg" shadow="none" className="border border-default-200/80 dark:border-white/10">
                <CardBody className="p-0">
                    <div className="border-b border-default-200/80 px-4 py-3 dark:border-white/10">
                        <p className="text-sm font-semibold">숙제 설정</p>
                        <p className="mt-0.5 text-xs text-default-500">화면에 표시되는 콘텐츠를 조절합니다.</p>
                    </div>
                    <div className="divide-y divide-default-100 dark:divide-white/[0.06]">
                        <div className="flex items-center gap-4 px-4 py-4">
                            <div className="grow"><h3 className="text-sm font-semibold">일일 콘텐츠 숨기기</h3><p className="mt-1 text-xs text-default-500">일일 콘텐츠를 숨겨 캐릭터 목록을 더 넓게 표시합니다.</p></div>
                            <Switch size="sm" aria-label="일일 콘텐츠 숨기기" isSelected={settings.isHideDayContent} onValueChange={async () => await handleHideDayContent(settings, setSettings)}/>
                        </div>
                        <div className="flex items-center gap-4 px-4 py-4">
                            <div className="grow"><h3 className="text-sm font-semibold">더보기 관리 모드 숨기기</h3><p className="mt-1 text-xs text-default-500">더보기 관리 모드 전환 스위치를 숨깁니다.</p></div>
                            <Switch size="sm" aria-label="더보기 관리 모드 숨기기" isSelected={settings.isHideBonusMode} onValueChange={async () => await handleHideBonusMode(settings, setSettings)}/>
                        </div>
                    </div>
                </CardBody>
            </Card>
            <Card radius="lg" shadow="none" className="border border-danger-200/80 dark:border-danger-500/20">
                <CardBody className="p-4">
                    <div className="flex items-center gap-2"><p className="text-sm font-semibold">보안</p><Chip size="sm" radius="full" variant="flat" color="danger">계정 보호</Chip></div>
                    <div className="mt-4 flex items-center gap-4">
                        <div className="grow"><h3 className="text-sm font-semibold">모든 기기 로그아웃</h3><p className="mt-1 text-xs text-default-500">현재 기기를 제외한 모든 기기에서 로그아웃합니다.</p></div>
                        <Button radius="lg" color="danger" variant="flat" size="sm" isLoading={isLoadingAllLogout} onPress={onClickAllLogout}>모두 로그아웃</Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}
