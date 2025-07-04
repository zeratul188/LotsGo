import { Button, Card, CardBody, CardHeader, Divider, Link } from "@heroui/react";
import { useEffect, useState } from "react";
import { isLogin } from "./checklistFeat";

export default function NotLoginComponent() {
    const [isLogined, setLogined] = useState(false);

    useEffect(() => {
        setLogined(isLogin());
    }, []);

    if (isLogined) {
        return <></>;
    }

    return (
        <Card radius="sm" className="border-2 border-[#e7a65c] dark:border-[#946c3f] bg-[#f1e8d4] dark:bg-[#1d150b]">
            <CardHeader>
                <div className="w-full flex gap-2 items-center">
                    <h3 className="grow text-md sm:text-xl">로그인 후 기능을 이용하세요.</h3>
                    <Button
                        as={Link}
                        showAnchorIcon
                        href="/login"
                        radius="sm"
                        color="primary">
                        로그인 이동
                    </Button>
                </div>
            </CardHeader>
            <Divider/>
            <CardBody>
                <p className="text-md sm:text-xl">로그인 하시면 이용자들을 위해 다양한 콘텐츠 관리 기능을 이용하실 수 있습니다.</p>
                <ul className="list-disc pl-4 mt-2">
                    <li>캐릭터의 주간/일일 콘텐츠를 기록하고 관리할 수 있습니다.</li>
                    <li>반복되는 숙제와 일정을 자동으로 정리하며, 콘텐츠 완료율도 시각적으로 확인할 수 있습니다.</li>
                    <li>개인 또는 길드 일정을 기록하고 확인할 수 있습니다.</li>
                </ul>
            </CardBody>
        </Card>
    )
}