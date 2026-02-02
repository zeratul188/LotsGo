import { AppDispatch, RootState } from "@/app/store/store"
import { Raid } from "../model/types"
import { Button, Divider, Input, Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react"
import { useState } from "react"
import { useSelector } from "react-redux"
import { handleChangeName, isManagerByUserId } from "../lib/settingFeat"
import { RaidMember } from "@/app/api/raids/members/route"
import { SetStateFn } from "@/utiils/utils"

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
            </div>
            <Divider className="my-4"/>
            <div className="w-full flex flex-col sm:flex-row gap-1 items-center">
                <div className="grow">
                    <h3 className="font-bold text-xl">파티장 위임</h3>
                    <p>현재 파티장 : {raid.managerNickname} ({raid.managerId})</p>
                </div>
                <Button
                    radius="sm"
                    color="primary"
                    isDisabled={!isManagerByUserId(raid, userId)}
                    onPress={onChangeName}>
                    변경하기
                </Button>
            </div>
        </div>
    )
}

type ChangeManagerModalProps = {
    dispatch: AppDispatch,
    setOpenChangeManager: SetStateFn<boolean>,
    isOpenChangeManager: boolean,
    raid: Raid,
    members: RaidMember
}
function ChangeManagerModal({ dispatch, setOpenChangeManager, isOpenChangeManager, raid, members }: ChangeManagerModalProps) {
    const [isLoadingChange, setLoadingChange] = useState(false);

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
                            
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}