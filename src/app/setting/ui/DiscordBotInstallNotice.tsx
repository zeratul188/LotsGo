import { Button, Card, CardBody } from "@heroui/react";

type Props = {
    botUserId: string;
};

export default function DiscordBotInstallNotice({ botUserId }: Props) {
    return (
        <Card radius="lg" shadow="none" className="border border-warning-300/50 bg-warning-50/50 dark:border-warning-500/20 dark:bg-warning-500/5">
            <CardBody className="gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="font-bold text-warning-700 dark:text-warning-400">로츠고봇 설치가 필요합니다.</p>
                    <p className="mt-1 text-sm leading-6 text-default-500">봇을 서버에 추가한 뒤 역할 목록에서 로츠고봇 역할을 지급할 역할보다 위로 이동해 주세요.</p>
                </div>
                <Button
                    as="a"
                    href={`https://discord.com/oauth2/authorize?client_id=${botUserId}&permissions=420563984&integration_type=0&scope=bot+applications.commands`}
                    target="_blank"
                    rel="noreferrer"
                    radius="lg"
                    color="warning"
                    className="shrink-0 font-semibold">
                    로츠고봇 초대
                </Button>
            </CardBody>
        </Card>
    );
}
