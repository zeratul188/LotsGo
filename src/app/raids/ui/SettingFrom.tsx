import { AppDispatch, RootState } from "@/app/store/store"
import { MemberBox, Raid } from "../model/types"
import { addToast, Button, Checkbox, cn, Code, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch } from "@heroui/react"
import { ReactNode, useState } from "react"
import { useSelector } from "react-redux"
import { getMemberBoxs, handleChangeLink, handleChangeManager, handleChangeName, handleChangePublicSetting, handleChangePwd, handleChangePwdSetting, handleDeleteRaid, handleLeaveRaid, isManagerByUserId } from "../lib/settingFeat"
import { RaidMember } from "@/app/api/raids/members/route"
import { copyToClipboard, SetStateFn, useMobileQuery } from "@/utiils/utils"
import clsx from "clsx"
import { decrypt } from "@/utiils/crypto"
import dynamic from "next/dynamic";
const FixedLineAd = dynamic(() => import("@/app/ad/FixedLineAd"), { ssr: false });

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY ? process.env.NEXT_PUBLIC_SECRET_KEY : 'null';
const settingModalClassNames = {
    backdrop: "bg-black/60 backdrop-blur-sm",
    base: "border border-default-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#171717]",
    header: "border-b border-default-200 px-5 py-4 dark:border-white/10",
    body: "gap-4 px-5 py-5",
    footer: "border-t border-default-200 px-5 py-4 dark:border-white/10"
};

const settingInputClassNames = {
    inputWrapper: "border-default-200 bg-default-50/70 shadow-none hover:border-default-300 dark:border-white/10 dark:bg-white/[0.04]"
};

function SettingGroup({ title, description, danger = false, children }: { title: string, description: string, danger?: boolean, children: ReactNode }) {
    return (
        <section className={clsx(
            "overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-[#171717]",
            danger ? "border-danger-200 dark:border-danger-500/30" : "border-default-200 dark:border-white/10"
        )}>
            <div className={clsx(
                "border-b px-5 py-4",
                danger ? "border-danger-200 bg-danger-50/60 dark:border-danger-500/30 dark:bg-danger-500/[0.08]" : "border-default-200 bg-default-50/70 dark:border-white/10 dark:bg-white/[0.03]"
            )}>
                <h2 className={clsx("text-base font-bold", danger ? "text-danger" : "text-foreground")}>{title}</h2>
                <p className="mt-1 text-sm text-default-500">{description}</p>
            </div>
            <div className="divide-y divide-default-200 dark:divide-white/10">{children}</div>
        </section>
    )
}

function SettingRow({ title, description, children }: { title: string, description: ReactNode, children: ReactNode }) {
    return (
        <div className="grid gap-4 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,420px)] lg:items-center">
            <div>
                <h3 className="font-bold text-foreground">{title}</h3>
                <div className="mt-1 text-sm leading-6 text-default-500">{description}</div>
            </div>
            <div className="flex min-w-0 flex-col gap-2 lg:items-end">{children}</div>
        </div>
    )
}

function PermissionNotice({ show, children = "파티장만 변경할 수 있습니다." }: { show: boolean, children?: ReactNode }) {
    if (!show) return null;
    return <p className="w-fit rounded-lg bg-danger-50 px-2.5 py-1.5 text-xs font-medium text-danger dark:bg-danger-500/10">{children}</p>
}

// 파티 설정 컴포넌트
type PartySettingComponentProps = {
    raid: Raid,
    members: RaidMember[],
    dispatch: AppDispatch
}
export function PartySettingComponent({ raid, members, dispatch }: PartySettingComponentProps) {
    const isMobile = useMobileQuery();
    // 파티명 변경
    const [changeName, setChangeName] = useState('');
    const [isLoadingChangeName, setLoadingChangeName] = useState(false);
    // 파티장 변경
    const [isOpenChangeManager, setOpenChangeManager] = useState(false);
    // 초대코드 관리
    const [isLoadingChangeLink, setLoadingChangeLink] = useState(false);
    // 비밀번호 관리
    const [changePwd, setChangePwd] = useState('');
    const [isLoadingChangePwd, setLoadingChangePwd] = useState(false);
    const [isShowPwd, setShowPwd] = useState(false);
    const [isDisabledPwd, setDisabledPwd] = useState(false);
    // 공개 여부 관리
    const [isDisablePublic, setDisablePublic] = useState(false);
    // 파티 탈퇴
    const [isLoadingLeave, setLoadingLeave] = useState(false);
    // 파티 해산
    const [isLoadingDalete, setLoadingDelete] = useState(false);

    const userId = useSelector((state: RootState) => state.party.userId);
    const isManager = isManagerByUserId(raid, userId);

    const onChangeName = handleChangeName(changeName, raid, dispatch, setLoadingChangeName);
    const onPressCopyToClipboard = async () => {
        await copyToClipboard(raid.link);
        addToast({
            title: `복사 완료`,
            description: "초대코드를 클립보드에 복사하였습니다.",
            color: "success"
        });
    }
    const onChangeLink = handleChangeLink(dispatch, setLoadingChangeLink, raid);
    const onValueChangeSetPwd = handleChangePwdSetting(dispatch, setDisabledPwd, setShowPwd, raid);
    const onChangePwd = handleChangePwd(dispatch, setLoadingChangePwd, setShowPwd, setChangePwd, raid, changePwd);
    const onValueChangePublic = handleChangePublicSetting(dispatch, setDisablePublic, raid);
    const onLeaveRaid = handleLeaveRaid(dispatch, setLoadingLeave, raid, userId);
    const onDeleteRaid = handleDeleteRaid(dispatch, setLoadingDelete, raid);

    return (
        <div className="w-full pt-2">
            {isMobile ? null : (
                <div className="w-full flex justify-center overflow-hidden mt-8 mb-4">
                    <div className="mx-4 flex w-full max-w-[1240px] justify-center rounded-2xl border border-default-200 bg-default-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                        <FixedLineAd isLoaded={true}/>
                    </div>
                </div>
            )}
            <div className="space-y-5">
                <section className="rounded-2xl border border-default-200 bg-gradient-to-br from-white to-primary-50/40 p-5 shadow-sm dark:border-white/10 dark:from-[#171717] dark:to-primary-500/[0.06]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Party settings</p>
                            <h2 className="mt-2 text-2xl font-bold text-foreground">{raid.name}</h2>
                            <p className="mt-1 text-sm text-default-500">파티 정보와 접근 권한을 안전하게 관리합니다.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            <div className="rounded-xl border border-default-200 bg-white/80 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                                <p className="text-[11px] text-default-400">파티장</p>
                                <p className="mt-0.5 max-w-28 truncate text-sm font-bold">{raid.managerNickname}</p>
                            </div>
                            <div className="rounded-xl border border-default-200 bg-white/80 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                                <p className="text-[11px] text-default-400">공개 상태</p>
                                <p className={clsx("mt-0.5 text-sm font-bold", raid.isOpen ? "text-success" : "text-default-500")}>{raid.isOpen ? "공개" : "비공개"}</p>
                            </div>
                            <div className="col-span-2 rounded-xl border border-default-200 bg-white/80 px-3 py-2 sm:col-span-1 dark:border-white/10 dark:bg-white/[0.04]">
                                <p className="text-[11px] text-default-400">참여 인원</p>
                                <p className="mt-0.5 text-sm font-bold">{raid.members?.length ?? 0}명</p>
                            </div>
                        </div>
                    </div>
                </section>

                <SettingGroup title="기본 설정" description="파티명, 파티장과 초대코드를 관리합니다.">
                    <SettingRow title="파티명 변경" description={<>현재 파티명 <span className="font-semibold text-foreground">{raid.name}</span></>}>
                        <div className="flex w-full flex-col gap-2 sm:flex-row">
                            <Input
                                fullWidth
                                radius="lg"
                                variant="bordered"
                                placeholder="변경할 파티명 (최대 12글자)"
                                maxLength={12}
                                value={changeName}
                                onValueChange={setChangeName}
                                classNames={settingInputClassNames}/>
                            <Button radius="lg" color="primary" className="shrink-0 font-semibold" isLoading={isLoadingChangeName} isDisabled={changeName.trim() === '' || !isManager} onPress={onChangeName}>변경하기</Button>
                        </div>
                        <PermissionNotice show={!isManager}/>
                    </SettingRow>

                    <SettingRow title="파티장 위임" description={<>현재 파티장 <span className="font-semibold text-foreground">{raid.managerNickname}</span> · {raid.managerId}</>}>
                        <Button fullWidth radius="lg" color="primary" variant="flat" className="font-semibold lg:max-w-40" isDisabled={!isManager} onPress={() => setOpenChangeManager(true)}>파티장 변경</Button>
                        <PermissionNotice show={!isManager}/>
                    </SettingRow>

                    <SettingRow title="초대코드 관리" description="초대코드는 파티에 직접 참여할 때 사용됩니다.">
                        <div className="flex w-full items-center gap-2 rounded-xl border border-default-200 bg-default-50/70 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                            <Code className="min-w-0 grow truncate bg-transparent">{isManager ? raid.link : "파티장만 확인 가능"}</Code>
                            <Button radius="lg" size="sm" variant="flat" color="primary" className="font-semibold" isDisabled={!isManager} onPress={onPressCopyToClipboard}>복사</Button>
                            <Button radius="lg" size="sm" color="primary" className="font-semibold" isDisabled={!isManager} isLoading={isLoadingChangeLink} onPress={onChangeLink}>재발급</Button>
                        </div>
                        <PermissionNotice show={!isManager}/>
                    </SettingRow>
                </SettingGroup>

                <SettingGroup title="접근 및 공개 설정" description="비밀번호와 파티 찾기 노출 여부를 설정합니다.">
                    <SettingRow title="비밀번호 관리" description="비공개 초대에 사용할 비밀번호를 설정합니다.">
                        <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-xl border border-default-200 bg-default-50/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                            <Switch size="sm" isSelected={raid.isPwd} isDisabled={isDisabledPwd || !isManager} onValueChange={onValueChangeSetPwd}>비밀번호 사용</Switch>
                            <div className="flex items-center gap-2">
                                <Switch size="sm" isDisabled={!raid.isPwd || !isManager} isSelected={isShowPwd} onValueChange={setShowPwd}>표시</Switch>
                                <Code>{isShowPwd ? raid.pwd !== 'null' ? decrypt(raid.pwd, secretKey) : "비밀번호 없음" : "************"}</Code>
                            </div>
                        </div>
                        <div className="flex w-full flex-col gap-2 sm:flex-row">
                            <Input fullWidth type="password" autoComplete="new-password" aria-label="변경할 비밀번호" radius="lg" variant="bordered" placeholder="변경할 비밀번호 (최대 18글자)" maxLength={18} isDisabled={!raid.isPwd} value={changePwd} onValueChange={setChangePwd} classNames={settingInputClassNames}/>
                            <Button radius="lg" color="primary" className="shrink-0 font-semibold" isLoading={isLoadingChangePwd} isDisabled={!raid.isPwd || changePwd.trim() === '' || !isManager} onPress={onChangePwd}>변경하기</Button>
                        </div>
                        <PermissionNotice show={!raid.isPwd}>비밀번호 사용을 먼저 활성화해 주세요.</PermissionNotice>
                        <PermissionNotice show={!isManager}/>
                    </SettingRow>

                    <SettingRow title="파티 공개 여부" description="공개하면 파티 찾기에서 다른 사용자가 이 파티를 확인할 수 있습니다.">
                        <div className="flex w-full items-center justify-between rounded-xl border border-default-200 bg-default-50/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                            <div>
                                <p className="text-sm font-semibold text-foreground">{raid.isOpen ? "공개 파티" : "비공개 파티"}</p>
                                <p className="mt-0.5 text-xs text-default-500">{raid.isOpen ? "파티 찾기에 노출되고 있습니다." : "초대코드로만 참여할 수 있습니다."}</p>
                            </div>
                            <Switch isSelected={raid.isOpen} isDisabled={!isManager || isDisablePublic} onValueChange={onValueChangePublic} aria-label="파티 공개 여부"/>
                        </div>
                        <PermissionNotice show={!isManager}/>
                    </SettingRow>
                </SettingGroup>

                <SettingGroup title="위험 영역" description="파티 탈퇴와 해산은 참여 상태에 직접 영향을 줍니다." danger>
                    <SettingRow title="파티 탈퇴" description={<>현재 참여한 <span className="font-semibold text-foreground">{raid.name}</span>에서 나갑니다.</>}>
                        <Button fullWidth radius="lg" color="danger" variant="flat" className="font-semibold lg:max-w-40" isDisabled={isManager} isLoading={isLoadingLeave} onPress={onLeaveRaid}>파티 탈퇴</Button>
                        <PermissionNotice show={isManager}>파티장은 위임 후 탈퇴할 수 있습니다.</PermissionNotice>
                    </SettingRow>

                    <SettingRow title="파티 해산" description="파티를 해산하면 참여한 모든 멤버가 자동으로 탈퇴됩니다.">
                        <Button fullWidth radius="lg" color="danger" className="font-semibold lg:max-w-40" isDisabled={!isManager} isLoading={isLoadingDalete} onPress={onDeleteRaid}>파티 해산</Button>
                        <PermissionNotice show={!isManager}/>
                    </SettingRow>
                </SettingGroup>
            </div>
            <ChangeManagerModal
                dispatch={dispatch}
                setOpenChangeManager={setOpenChangeManager}
                isOpenChangeManager={isOpenChangeManager}
                raid={raid}
                members={members}/>
        </div>
    )
}

type ChangeManagerModalProps = {
    dispatch: AppDispatch,
    setOpenChangeManager: SetStateFn<boolean>,
    isOpenChangeManager: boolean,
    raid: Raid,
    members: RaidMember[]
}
function ChangeManagerModal({ dispatch, setOpenChangeManager, isOpenChangeManager, raid, members }: ChangeManagerModalProps) {
    const [isLoadingChange, setLoadingChange] = useState(false);
    const [selectedMember, setSelectedMember] = useState<MemberBox | null>(null);

    return (
        <Modal
            radius="lg"
            size="lg"
            classNames={settingModalClassNames}
            scrollBehavior="inside"
            isOpen={isOpenChangeManager}
            onOpenChange={(isOpen) => setOpenChangeManager(isOpen)}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            <div className="space-y-1">
                                <h2 className="text-lg font-bold text-foreground">파티장 위임</h2>
                                <p className="text-sm font-normal text-default-500">파티 관리 권한을 넘겨받을 파티원을 선택하세요.</p>
                            </div>
                        </ModalHeader>
                        <ModalBody>
                            <div className="max-h-[400px] w-full space-y-2 overflow-y-auto overflow-x-hidden pr-1">
                                {getMemberBoxs(raid.members, members, raid.managerId).map((box, index) => (
                                    <div key={index} className="w-full min-h-[64px]">
                                        <Checkbox
                                            aria-label={box.nickname}
                                            classNames={{
                                                base: cn(
                                                    "m-auto box-border w-full max-w-full gap-3 rounded-xl border border-default-200 bg-default-50/60 px-3 py-2",
                                                    "cursor-pointer hover:border-primary/40 hover:bg-primary-50/30 dark:border-white/10 dark:bg-white/[0.03]",
                                                    "data-[selected=true]:border-primary data-[selected=true]:bg-primary-50 dark:data-[selected=true]:bg-primary-500/10"
                                                ),
                                                label: "w-full",
                                            }}
                                            isSelected={selectedMember ? selectedMember.userId === box.userId : false}
                                            onValueChange={(isSelected) => {
                                                if (selectedMember) {
                                                    if (selectedMember.userId === box.userId) {
                                                        setSelectedMember(null);
                                                        return;
                                                    }
                                                }
                                                setSelectedMember(box);
                                            }}>
                                            <div className="w-full flex flex-col">
                                                <span className="fadedtext text-sm">@{box.server} · {box.job} · Lv.{box.level}</span>
                                                <div className="w-full flex gap-1 items-center">
                                                    <span className="grow text-md">{box.nickname}</span>
                                                    <span className="fadedtext text-sm">{box.userId}</span>
                                                </div>
                                            </div>
                                        </Checkbox>
                                    </div>
                                ))}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button radius="lg" variant="light" onPress={onClose}>취소</Button>
                            <Button
                                radius="lg"
                                color="primary"
                                className="min-w-32 font-semibold"
                                isLoading={isLoadingChange}
                                isDisabled={!selectedMember}
                                onPress={async () => handleChangeManager({
                                    dispatch, onClose, setLoadingChange
                                }, {
                                    selectedMember, raid
                                })}>
                                위임하기
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
