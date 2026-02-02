import { AppDispatch, RootState } from "@/app/store/store"
import { MemberBox, Raid } from "../model/types"
import { Button, Checkbox, cn, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react"
import { useState } from "react"
import { useSelector } from "react-redux"
import { getMemberBoxs, handleChangeManager, handleChangeName, isManagerByUserId } from "../lib/settingFeat"
import { RaidMember } from "@/app/api/raids/members/route"
import { SetStateFn } from "@/utiils/utils"
import clsx from "clsx"

// 파티 설정 컴포넌트
type PartySettingComponentProps = {
    raid: Raid,
    members: RaidMember[],
    dispatch: AppDispatch
}
export function PartySettingComponent({ raid, members, dispatch }: PartySettingComponentProps) {
    const [changeName, setChangeName] = useState('');
    const [isLoadingChangeName, setLoadingChangeName] = useState(false);
    const userId = useSelector((state: RootState) => state.party.userId);
    const [isOpenChangeManager, setOpenChangeManager] = useState(false);

    const onChangeName = handleChangeName(changeName, raid, dispatch, setLoadingChangeName);

    return (
        <div className="w-full pt-2">
            <div className="w-full flex flex-col sm:flex-row gap-1 items-center">
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
            <div className="w-full flex flex-col sm:flex-row gap-1 items-center">
                <div className="grow">
                    <h3 className="font-bold text-xl">파티장 위임</h3>
                    <p>현재 파티장 : {raid.managerNickname} ({raid.managerId})</p>
                </div>
                <div className="flex flex-col items-end">
                    <Button
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