import { SetStateFn } from "@/utiils/utils";
import { editApiKey, LoginUser } from "../../store/loginSlice";
import { AppDispatch } from "../../store/store";
import { addToast } from "@heroui/react";
import { encrypt } from "@/utiils/crypto";
import Cookies from 'js-cookie';

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY ? process.env.NEXT_PUBLIC_SECRET_KEY : 'null';

// API 키 등록 이벤트
export async function handleInsertKey(
    apiKey: string, 
    dispatch: AppDispatch, 
    setLoadingButton: SetStateFn<boolean>,
    setApiKey: SetStateFn<string>
) {
    setLoadingButton(true);
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;

    const lostarkRes = await fetch(`/api/lostark?value=null&code=3&key=${apiKey}`);

    if (lostarkRes.ok) {
        const encryptApiKey = encrypt(apiKey, secretKey);

        const res = await fetch(`/api/auth/apikey`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: id,
                apiKey: encryptApiKey,
                type: 'add'
            })
        });
        if (!res.ok) {
            addToast({
                title: "데이터 로드 오류",
                description: `데이터를 가져오는데 문제가 발생하였습니다.`,
                color: "danger"
            });
            return;
        }
        dispatch(editApiKey(encryptApiKey));
        const localUser = sessionStorage.getItem('user');
        const loginData = localUser ? JSON.parse(localUser) : null;
        if (loginData) {
            const loginUser: LoginUser = {
                id: loginData.id,
                character: loginData.character,
                expedition: loginData.expedition,
                apiKey: encryptApiKey
            }
            sessionStorage.setItem('user', JSON.stringify(loginUser));
            Cookies.set('userApiKey', encryptApiKey, {
                path: '/',
                secure: true,
                sameSite: 'lax',
            });
        }
        addToast({
            title: "등록 완료",
            description: `로스트아크 API 키를 정상적으로 등록하였습니다.`,
            color: "success"
        });
    } else {
        addToast({
            title: "키 오류",
            description: `입력한 API 키가 올바른 API 키가 아닙니다.`,
            color: "danger"
        });
    }
    setApiKey('');
    setLoadingButton(false);
}

// API 키 제거 이벤트
export async function handleRemoveKey(
    dispatch: AppDispatch,
    setLoadingButton: SetStateFn<boolean>,
    setShowKey: SetStateFn<boolean>
) {
    setLoadingButton(true);
    const userStr = sessionStorage.getItem('user');
    const storedUser: LoginUser = userStr ? JSON.parse(userStr) : null;
    const id = storedUser.id;

    const res = await fetch(`/api/auth/apikey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id,
            type: 'remove'
        })
    });
    if (!res.ok) {
        addToast({
            title: "데이터 로드 오류",
            description: `데이터를 가져오는데 문제가 발생하였습니다.`,
            color: "danger"
        });
        return;
    }
    dispatch(editApiKey(null));
    const localUser = sessionStorage.getItem('user');
    const loginData = localUser ? JSON.parse(localUser) : null;
    if (loginData) {
        const loginUser: LoginUser = {
            id: loginData.id,
            character: loginData.character,
            expedition: loginData.expedition,
            apiKey: null
        }
        sessionStorage.setItem('user', JSON.stringify(loginUser));
    }
    addToast({
        title: "제거 완료",
        description: `로츠고에 저장된 로스트아크 API 키를 정상적으로 제거하였습니다.`,
        color: "success"
    });
    setShowKey(false);
    setLoadingButton(false);
}
