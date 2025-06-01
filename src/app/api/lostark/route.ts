import { NextRequest, NextResponse } from 'next/server';
import axios from "axios";
import data from './data.json';

const LOSTARK_API_BASE = data.lostarkAPIBase;
const API_KEY = process.env.NEXT_PUBLIC_LOSTARK_API_KEY;

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const value = searchParams.get('value');
    const code = searchParams.get('code');

    if (!value || !code) {
        return NextResponse.json({ error: '값 없음' }, { status: 400 });
      }
    if (typeof value !== 'string' || typeof code !== 'string') {
        return NextResponse.json({ error: '변수의 타입의 문제 발생' }, { status: 400 });
    }
    if (isNaN(Number(code))) {
        return NextResponse.json({ error: '인덱스 변수가 숫자가 아님' }, { status: 400 });
    }

    const links = [
        `/characters/${encodeURIComponent(value)}/siblings`, // CHARACTERS - 원정대 캐릭터 정보 (모든 서버 포함함)
        `/armories/characters/${encodeURIComponent(value)}/profiles`, // ARMORIES/PROFILES - 캐릭터 프로파일 정보
        `/gamecontents/calendar`, // GAMECONTENTS - 게임 일정 (모험섬, 로웬, 필드보스 등)
        `/news/notices`, // NEWS/NOICES - 게임 공지사항
        `/news/events` // NEWS/EVENTS - 게임 내 이벤트
    ];

    try {
        const result = await axios.get(`${LOSTARK_API_BASE}${links[Number(code)]}`, {
            headers: {
                Authorization: `bearer ${API_KEY}`
            }
        });
        return NextResponse.json(result.data);
    } catch(error) {
        console.error('Lostark API error : ', error);
        return NextResponse.json({ error: 'Failed load Lostark API.' }, { status: 500 });
    }
}