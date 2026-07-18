import { addToast, Card, CardBody, CardHeader, Chip, Divider } from "@heroui/react";
import { copyToClipboard, getBackgroundByGrade, getColorTextByGrade } from "@/utiils/utils";
import { Avatar, CharacterInfo } from "../model/types";

const avatarTypeOrder = [
    "무기 아바타",
    "머리 아바타",
    "상의 아바타",
    "하의 아바타",
    "얼굴1 아바타",
    "얼굴2 아바타",
    "악기 아바타",
    "이동 효과"
];

type AvatarGroup = {
    type: string;
    label: string;
    avatars: Avatar[];
};

function getAvatarGroups(avatars: Avatar[]): AvatarGroup[] {
    const groupedAvatars = new Map<string, Avatar[]>();

    avatars.forEach((avatar) => {
        const group = groupedAvatars.get(avatar.type) ?? [];
        group.push(avatar);
        groupedAvatars.set(avatar.type, group);
    });

    const orderedTypes = [
        ...avatarTypeOrder.filter((type) => groupedAvatars.has(type)),
        ...Array.from(groupedAvatars.keys()).filter((type) => !avatarTypeOrder.includes(type))
    ];

    return orderedTypes.map((type) => ({
        type,
        label: type.replace(/ 아바타$/, ""),
        avatars: groupedAvatars.get(type) ?? []
    }));
}

function DyeColorCode({ label, color }: { label: string; color: string | null }) {
    if (!color) {
        return null;
    }

    const onClickCopy = async () => {
        const clipboardColor = color.replace(/^#/, "");

        try {
            await copyToClipboard(clipboardColor);
            addToast({
                title: "색상 코드 복사 완료",
                description: `${clipboardColor} 코드를 클립보드에 복사했습니다.`,
                color: "success"
            });
        } catch {
            addToast({
                title: "색상 코드 복사 실패",
                description: "클립보드 권한을 확인한 후 다시 시도해 주세요.",
                color: "danger"
            });
        }
    };

    return (
        <button
            type="button"
            aria-label={`${label} ${color} 복사`}
            title={`${color} 복사`}
            onClick={onClickCopy}
            className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md px-1 py-0.5 text-[10px] text-default-500 transition-colors hover:bg-default-200/70 hover:text-default-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:hover:bg-white/10 dark:hover:text-default-200"
        >
            <span
                aria-hidden="true"
                className="h-3.5 w-3.5 rounded-full border border-black/15 shadow-sm dark:border-white/20"
                style={{ backgroundColor: color }}
            />
            <span>{label}</span>
            <span className="font-mono font-semibold text-default-700 dark:text-white">{color}</span>
        </button>
    );
}

// 아바타 컴포넌트
export function AvatarComponent({ info }: { info: CharacterInfo }) {
    const avatars = info.avatars;
    const avatarGroups = getAvatarGroups(avatars);

    return (
        <div className="w-full">
            <Card
                fullWidth
                radius="lg"
                className="overflow-hidden border border-default-200/80 bg-content1/95 shadow-sm dark:border-white/10 dark:bg-[#18181b]"
            >
                <CardHeader className="flex items-center justify-between gap-4 px-5 py-4">
                    <div>
                        <p className="text-lg font-semibold">아바타</p>
                        <p className="mt-0.5 text-xs text-default-500">착용 중인 아바타와 덧입기 구성을 부위별로 확인하세요.</p>
                    </div>
                    <Chip size="sm" radius="full" variant="flat" color="primary">
                        {avatars.length}개 장착
                    </Chip>
                </CardHeader>
                <Divider/>
                <CardBody className="p-0">
                    <div className="flex w-full flex-col md960:flex-row">
                        <div className="relative flex h-[520px] grow items-center justify-center overflow-hidden bg-[#11151b] md960:h-[760px]">
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(0,112,243,0.16),transparent_42%)]"/>
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent"/>
                            {info.profile.characterImageUrl !== '-' ? (
                                <img
                                    alt={`${info.nickname} 캐릭터 아바타`}
                                    src={info.profile.characterImageUrl}
                                    className="relative z-10 h-full w-auto max-w-full object-contain"
                                />
                            ) : (
                                <div className="relative z-10 flex flex-col items-center gap-2 text-default-400">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-2xl">?</div>
                                    <p className="text-sm">캐릭터 이미지가 없습니다.</p>
                                </div>
                            )}
                            <div className="absolute bottom-4 left-4 z-20 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white backdrop-blur-md">
                                <p className="text-sm font-semibold">{info.nickname}</p>
                                <p className="mt-0.5 text-xs text-white/60">{info.profile.className} · Lv.{info.profile.itemLevel.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="h-auto w-full border-t border-default-200/80 bg-default-50/50 md960:h-[760px] md960:w-[420px] md960:border-l md960:border-t-0 dark:border-white/10 dark:bg-black/10">
                            <div className="border-b border-default-200/70 px-4 py-3 dark:border-white/10">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-semibold">부위별 장착 정보</p>
                                    <p className="text-xs text-default-500">{avatarGroups.length}개 부위</p>
                                </div>
                            </div>

                            <div className="space-y-3 p-3 md960:h-[calc(100%-49px)] md960:overflow-y-auto md960:scrollbar-hide">
                                {avatarGroups.length > 0 ? avatarGroups.map((group) => (
                                    <section
                                        key={group.type}
                                        className="overflow-hidden rounded-2xl border border-default-200/80 bg-content1 shadow-sm dark:border-white/10 dark:bg-white/[0.035]"
                                    >
                                        <div className="flex items-center justify-between border-b border-default-200/70 bg-default-100/70 px-3.5 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                                            <p className="text-xs font-semibold">{group.label}</p>
                                            <span className="rounded-full bg-default-200/70 px-2 py-0.5 text-[10px] font-medium tabular-nums text-default-600 dark:bg-white/10 dark:text-default-300">
                                                {group.avatars.length}
                                            </span>
                                        </div>

                                        <div className="divide-y divide-default-200/60 dark:divide-white/10">
                                            {group.avatars.map((avatar, index) => (
                                                <div
                                                    key={`${avatar.type}-${avatar.name}-${index}`}
                                                    className={`flex gap-3 px-3.5 py-3 transition-colors hover:bg-default-100/70 dark:hover:bg-white/[0.05] ${avatar.dyes && avatar.dyes.length > 0 ? "items-start" : "items-center"}`}
                                                >
                                                    <div className={`h-12 w-12 shrink-0 rounded-xl p-[2px] ${getBackgroundByGrade(avatar.grade)}`}>
                                                        <img
                                                            src={avatar.icon}
                                                            alt={avatar.name}
                                                            className="h-full w-full rounded-[10px] object-cover"
                                                        />
                                                    </div>
                                                    <div className="min-w-0 grow">
                                                        <div className="flex items-center gap-2">
                                                            <p className={`min-w-0 truncate text-sm font-semibold ${getColorTextByGrade(avatar.grade)}`}>
                                                                {avatar.name}
                                                            </p>
                                                            {avatar.isInner ? (
                                                                <Chip
                                                                    size="sm"
                                                                    radius="full"
                                                                    variant="flat"
                                                                    color="secondary"
                                                                    className="h-5 shrink-0 px-1 text-[10px] font-semibold"
                                                                >
                                                                    덧입기
                                                                </Chip>
                                                            ) : null}
                                                        </div>
                                                        <p className="mt-1 text-xs text-default-500">{avatar.grade} · {group.label}</p>
                                                        {avatar.dyes && avatar.dyes.length > 0 ? (
                                                            <div className="mt-2 rounded-xl border border-default-200/70 bg-default-50/80 p-2 dark:border-white/10 dark:bg-black/10">
                                                                <p className="mb-1.5 text-[10px] font-semibold text-default-500">염색 정보</p>
                                                                <div className="space-y-1.5">
                                                                    {avatar.dyes.map((dye, dyeIndex) => (
                                                                        <div
                                                                            key={`${dye.part}-${dyeIndex}`}
                                                                            className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-content1/80 px-2 py-1.5 dark:bg-white/[0.04]"
                                                                        >
                                                                            <span className="min-w-10 text-[10px] font-semibold text-default-600 dark:text-default-300">
                                                                                {dye.part}
                                                                            </span>
                                                                            <DyeColorCode label="색상" color={dye.baseColor}/>
                                                                            {dye.patternIcon ? (
                                                                                <DyeColorCode label="패턴" color={dye.patternColor}/>
                                                                            ) : null}
                                                                            {dye.gloss ? (
                                                                                <span className="whitespace-nowrap text-[10px] text-default-400">광택 {dye.gloss}</span>
                                                                            ) : null}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )) : (
                                    <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-default-300 text-sm text-default-400 dark:border-white/15">
                                        장착 중인 아바타가 없습니다.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
