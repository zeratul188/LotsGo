import { Button } from "@heroui/react";
import DiscordIcon from "@/Icons/DiscordIcon";

const inviteUrl = "https://discord.com/oauth2/authorize?client_id=1542723211316428930&permissions=405883920&integration_type=0&scope=bot+applications.commands";

export default function DiscordBotInvite() {
    return (
        <section className="mb-6 flex flex-col gap-5 rounded-2xl border border-white/20 bg-gradient-to-r from-[#5865F2] to-[#4752C4] p-5 text-white shadow-sm dark:border-white/15 dark:shadow-none sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <div className="min-w-0">
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                        <DiscordIcon className="h-6 w-6"/>
                    </span>
                    <h2 className="text-lg font-bold tracking-tight sm:text-xl">로츠고봇을 Discord 서버에 초대해보세요</h2>
                </div>
                <p className="mt-3 break-keep text-sm leading-6 text-white/90">
                    로츠고봇을 서버에 추가하고 길드원과 함께 사용할 기능을 설정해보세요.<br className="hidden sm:block"/>
                    음성 채널 생성과 닉네임 관리 기능을 Discord에서 이용할 수 있어요.
                </p>
            </div>
            <Button
                as="a"
                href={inviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                radius="lg"
                className="w-full shrink-0 border border-white/35 bg-white/15 px-6 font-semibold text-white shadow-none hover:bg-white/25 lg:w-auto">
                로츠고봇 초대하기
            </Button>
        </section>
    );
}
