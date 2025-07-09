import { SetStateFn } from "@/utiils/utils";
import { changeChracter, Character, LoginUser, saveExpedition } from "../store/loginSlice";
import { addToast } from "@heroui/react";
import { AppDispatch, RootState } from "../store/store";
import { decrypt } from "@/utiils/crypto";

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY ? process.env.NEXT_PUBLIC_SECRET_KEY : 'null';

// 초기 데이터 가져오기
export type ExpeditionCharacter = {
    nickname: string,
    level: number,
    server: string,
    job: string,
    isCharacter: boolean
}
export function initialData(expedition: Character[], setExpedition: SetStateFn<ExpeditionCharacter[]>, characterName: string) {
    let cloneExpedition: ExpeditionCharacter[] = [];
    for (const character of expedition) {
        const isCharacter = character.nickname === characterName;
        const newChracter: ExpeditionCharacter = {
            ...character,
            isCharacter: isCharacter
        }
        cloneExpedition.push(newChracter);
    }
    cloneExpedition.sort((a, b) => b.level - a.level);
    setExpedition(cloneExpedition);
}

// 대표 캐릭터 지정
export async function handleSelectCharacter(
    index: number, 
    expedition: ExpeditionCharacter[],
    setExpedition: SetStateFn<ExpeditionCharacter[]>,
    dispatch: AppDispatch
) {

    if (expedition[index].isCharacter) {
        addToast({
            title: "변경 불가",
            description: `대표 캐릭터는 반드시 존재해야 합니다.`,
            color: "danger"
        });
        return;
    }
    for (const character of expedition) {
        if (character.isCharacter) {
            character.isCharacter = false;
            break;
        }
    }
    expedition[index].isCharacter = true;
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;
    const res = await fetch(`/api/auth/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id,
            type: 'change-character',
            nickname: expedition[index].nickname
        })
    });
    if (!res.ok) {
        addToast({
            title: "서버 오류",
            description: `데이터를 저장하는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        return;
    }
    setExpedition(expedition);
    dispatch(changeChracter(expedition[index].nickname));
    const newExpeditions: Character[] = [];
    for (const character of expedition) {
        const newChracter: Character = {
            nickname: character.nickname,
            job: character.job,
            level: character.level,
            server: character.server
        }
        newExpeditions.push(newChracter);
    }
    const localData = localStorage.getItem('user');
    if (localData) {
        const localUser = JSON.parse(localData);
         const loginUser: LoginUser = {
            id: id,
            expedition: newExpeditions,
            character: expedition[index].nickname,
            apiKey: localUser.apiKey ? localUser.apiKey : null
        }
        localStorage.setItem('user', JSON.stringify(loginUser));
    }
    addToast({
        title: "변경 완료",
        description: `대표 캐릭터를 변경하였습니다.`,
        color: "success"
    });
}

// 캐릭터 갱신 버튼 이벤트
export function useClickUpdate(
    nickname: string,
    setLoading: SetStateFn<boolean>,
    setDisable: SetStateFn<boolean>,
    setExpedition: SetStateFn<ExpeditionCharacter[]>,
    dispatch: AppDispatch
) {
    const userStr = localStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const decryptedApiKey = storedUser?.apiKey ? decrypt(storedUser.apiKey, secretKey) : null;
    
    return async () => {
        setLoading(true);
        const lostarkRes = await fetch(`/api/lostark?value=${nickname}&code=0&key=${decryptedApiKey}`);
        if (!lostarkRes.ok) {
            if (lostarkRes.status === 503) {
                addToast({
                    title: "서버 점검",
                    description: `로스트아크가 점검중입니다. 점검 이후 시도해주세요.`,
                    color: "danger"
                });
            } else {
                addToast({
                    title: "로드 오류",
                    description: `데이터를 불러오는데 문제가 발생하였습니다.`,
                    color: "danger"
                });
            }
        } else {
            const data: Array<any> = await lostarkRes.json();
            if (data.length === 0) {
                addToast({
                    title: "캐릭터 이름 입력 문제",
                    description: '캐릭터 이름과 일치하는 캐릭터를 찾을 수 없습니다.',
                    color: "danger"
                });
            } else {
                const newExpedition: Character[] = [];
                for (const item of data) {
                    const newCharacter: Character = {
                        nickname: item.CharacterName,
                        level: Number(item.ItemAvgLevel.replaceAll(',', '')),
                        server: item.ServerName,
                        job: item.CharacterClassName
                    }
                    newExpedition.push(newCharacter);
                }
                newExpedition.sort((a, b) => b.level - a.level);
                let newNickname = '';
                let findIndex = newExpedition.findIndex(item => item.nickname === nickname);
                if (newExpedition.length > 0 && findIndex === -1) {
                    newNickname = newExpedition[0].nickname;
                } else {
                    newNickname = nickname;
                }

                const userStr = localStorage.getItem('user');
                const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
                const id = storedUser.id;
                const res = await fetch(`/api/auth/data`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: id,
                        type: 'update-expedition',
                        nickname: newNickname,
                        expedition: newExpedition
                    })
                });
                if (!res.ok) {
                    addToast({
                        title: "서버 오류",
                        description: `데이터를 저장하는데 문제가 발생하였습니다.`,
                        color: "danger"
                    });
                } else {
                    dispatch(saveExpedition(newExpedition));
                    dispatch(changeChracter(newNickname));
                    const newSettingExpeditions: ExpeditionCharacter[] = [];
                    for (const character of newExpedition) {
                        const isCharacter = character.nickname === newNickname;
                        const newChracter: ExpeditionCharacter = {
                            ...character,
                            isCharacter: isCharacter
                        }
                        newSettingExpeditions.push(newChracter);
                    }
                    setExpedition(newSettingExpeditions);
                    const defaultCharacter: Character | undefined = newSettingExpeditions.find(character => character.isCharacter);
                    const defaultNickname = defaultCharacter ? defaultCharacter.nickname : 'null';
                    const localData = localStorage.getItem('user');
                    if (localData) {
                        const localUser = JSON.parse(localData);
                        const loginUser: LoginUser = {
                            id: id,
                            expedition: newExpedition,
                            character: defaultNickname,
                            apiKey: localUser.apiKey ? localUser.apiKey : null
                        }
                        localStorage.setItem('user', JSON.stringify(loginUser));
                    }
                    addToast({
                        title: "갱신 완료",
                        description: `캐릭터들의 정볼를 갱신하였습니다.`,
                        color: "success"
                    });
                }
            }
        }

        const now = Date.now();
        localStorage.setItem("expedition_unlock_time", now.toString());
        setDisable(true);
        setLoading(false);
    }
}