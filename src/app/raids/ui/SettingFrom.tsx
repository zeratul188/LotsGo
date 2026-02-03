import { AppDispatch, RootState } from "@/app/store/store"
import { MemberBox, Raid } from "../model/types"
import { addToast, Button, Checkbox, cn, Code, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch } from "@heroui/react"
import { useState } from "react"
import { useSelector } from "react-redux"
import { getMemberBoxs, handleChangeLink, handleChangeManager, handleChangeName, handleChangePwd, handleChangePwdSetting, isManagerByUserId } from "../lib/settingFeat"
import { RaidMember } from "@/app/api/raids/members/route"
import { copyToClipboard, SetStateFn } from "@/utiils/utils"
import clsx from "clsx"
import { decrypt } from "@/utiils/crypto"

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY ? process.env.NEXT_PUBLIC_SECRET_KEY : 'null';

// 파티 설정 컴포넌트
type PartySettingComponentProps = {
    raid: Raid,
    members: RaidMember[],
    dispatch: AppDispatch
}
export function PartySettingComponent({ raid, members, dispatch }: PartySettingComponentProps) {
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
    
    const userId = useSelector((state: RootState) => state.party.userId);

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

    return (
        <div className="w-full pt-2">
            <div className="w-full flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="grow">
                    <h3 className="font-bold text-xl">파티명 변경</h3>
                    <p>기존 파티명 : {raid.name}</p>
                </div>
                <div className="flex flex-col items-end">
                    <div className="w-full sm:w-[320px] flex flex-col sm:flex-row gap-2">
                        <Input
                            fullWidth
                            radius="sm"
                            placeholder="변경할 파티명 (최대 12글자)"
                            maxLength={12}
                            value={changeName}
                            onValueChange={setChangeName}/>
                        <Button
                            radius="sm"
                            color="primary"
                            isLoading={isLoadingChangeName}
                            isDisabled={changeName.trim() === '' || !isManagerByUserId(raid, userId)}
                            onPress={onChangeName}>
                            변경하기
                        </Button>
                    </div>
                    <p className={clsx(
                        "text-sm text-red-400 dark:text-red-600 mt-1",
                        !isManagerByUserId(raid, userId) ? '' : 'hidden'
                    )}>파티장만 조작이 가능합니다.</p>
                </div>
            </div>
            <Divider className="my-4"/>
            <div className="w-full flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="grow">
                    <h3 className="font-bold text-xl">파티장 위임</h3>
                    <p>현재 파티장 : {raid.managerNickname} ({raid.managerId})</p>
                </div>
                <div className="flex flex-col items-end">
                    <Button
                        fullWidth
                        radius="sm"
                        color="primary"
                        isDisabled={!isManagerByUserId(raid, userId)}
                        onPress={() => setOpenChangeManager(true)}>
                        변경하기
                    </Button>
                    <p className={clsx(
                        "text-sm text-red-400 dark:text-red-600 mt-1",
                        !isManagerByUserId(raid, userId) ? '' : 'hidden'
                    )}>파티장만 조작이 가능합니다.</p>
                </div>
            </div>
            <Divider className="my-4"/>
            <div className="w-full flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="grow">
                    <h3 className="font-bold text-xl">초대코드 관리</h3>
                    <p>현재 초대코드 : {raid.link}</p>
                </div>
                <div className="flex flex-col items-end">
                    <div className="w-full grid grid-cols-2 gap-2">
                        <Button
                            fullWidth
                            radius="sm"
                            color="primary"
                            isDisabled={!isManagerByUserId(raid, userId)}
                            onPress={onPressCopyToClipboard}>
                            복사하기
                        </Button>
                        <Button
                            fullWidth
                            radius="sm"
                            color="primary"
                            isDisabled={!isManagerByUserId(raid, userId)}
                            isLoading={isLoadingChangeLink}
                            onPress={onChangeLink}>
                            변경하기
                        </Button>
                    </div>
                    <p className={clsx(
                        "text-sm text-red-400 dark:text-red-600 mt-1",
                        !isManagerByUserId(raid, userId) ? '' : 'hidden'
                    )}>파티장만 조작이 가능합니다.</p>
                </div>
            </div>
            <Divider className="my-4"/>
            <div className="w-full flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="grow">
                    <h3 className="font-bold text-xl">비밀번호 관리</h3>
                    <div className="flex gap-3 mt-1">
                        <Switch
                            size="sm"
                            isDisabled={!raid.isPwd}
                            isSelected={isShowPwd}
                            onValueChange={setShowPwd}>
                            표시
                        </Switch>
                        <Code>{isShowPwd ? raid.pwd !== 'null' ? decrypt(raid.pwd, secretKey) : "비밀번호 없음" : "************"}</Code>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <Switch
                        size="sm"
                        isSelected={raid.isPwd}
                        isDisabled={isDisabledPwd}
                        onValueChange={onValueChangeSetPwd}>
                        비밀번호 설정
                    </Switch>
                    <div className="w-full sm:w-[320px] flex flex-col sm:flex-row gap-2">
                        <Input
                            fullWidth
                            radius="sm"
                            placeholder="변경할 비밀번호 (최대 18글자)"
                            maxLength={18}
                            isDisabled={!raid.isPwd}
                            value={changePwd}
                            onValueChange={setChangePwd}/>
                        <Button
                            radius="sm"
                            color="primary"
                            isLoading={isLoadingChangePwd}
                            isDisabled={!raid.isPwd || changePwd.trim() === '' || !isManagerByUserId(raid, userId)}
                            onPress={onChangePwd}>
                            변경하기
                        </Button>
                    </div>
                    <p className={clsx(
                        "text-sm text-red-400 dark:text-red-600",
                        !raid.isPwd ? '' : 'hidden'
                    )}>비밀번호 설정이 활성화가 되어 있어야만 비밀번호를 설정하실 수 있습니다.</p>
                    <p className={clsx(
                        "text-sm text-red-400 dark:text-red-600",
                        !isManagerByUserId(raid, userId) ? '' : 'hidden'
                    )}>파티장만 조작이 가능합니다.</p>
                </div>
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
            radius="sm"
            scrollBehavior="inside"
            isOpen={isOpenChangeManager}
            onOpenChange={(isOpen) => setOpenChangeManager(isOpen)}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>파티장 위임</ModalHeader>
                        <ModalBody>
                            <p>파티장을 위임할 파티원을 선택해주세요.</p>
                            <div className="w-full max-h-[400px] overflow-y-auto overflow-x-hidden">
                                {getMemberBoxs(raid.members, members, raid.managerId).map((box, index) => (
                                    <div key={index} className="w-full min-h-[64px] mb-1">
                                        <Checkbox
                                            aria-label={box.nickname}
                                            classNames={{
                                                base: cn(
                                                    "w-full max-w-full bg-content1",
                                                    "hover:bg-content2",
                                                    "cursor-pointer rounded-lg gap-2 border-2 border-transparent m-auto box-border",
                                                    "data-[selected=true]:border-primary"
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
                            <Button
                                fullWidth
                                radius="sm"
                                size="lg"
                                color="primary"
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