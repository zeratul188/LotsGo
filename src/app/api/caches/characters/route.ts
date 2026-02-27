import { CharacterFile } from "@/app/character/lib/characterFeat";
import { CharacterInfo } from "@/app/character/model/types";
import redis from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const nickname = searchParams.get('nickname');

    const cacheKey = `combat:${nickname}`;

    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            const data = JSON.parse(cached);
            const file: CharacterFile = data.file;
            const date: Date = data.date;
            const expeditions: CharacterInfo[] = data.expeditions;
            const combatPower = data.combatPower ?? 0;
            return NextResponse.json({ file, date, expeditions, combatPower });
        }
        return NextResponse.json({ error: 'Not found Caches.' }, { status: 500 });
    } catch (e) {
        console.warn('Redis 오류, 캐시 스킵', e);
        return NextResponse.json({ error: 'Failed load Caches.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const nickname = body.nickname;
    const file: CharacterFile = body.file;
    const expeditions: CharacterInfo[] = body.expeditions;
    const today = new Date();
    const combatPower: number = Number(body.combatPower);

    const cacheKey = `combat:${nickname}`;

    try  {
        const data = {
            nickname: nickname,
            date: today,
            expeditions: expeditions,
            file: file,
            combatPower: combatPower
        }
        const TTL_TIME = 20 * 60;
        await redis.set(cacheKey, JSON.stringify(data), "EX", TTL_TIME);
        return NextResponse.json({ message: '데이터 저장이 정상적으로 처리되었습니다.' }, { status: 200 });
    } catch (e) {
        console.warn('Redis 오류, 캐시 스킵', e);
        return NextResponse.json({ error: 'Redis 저장 실패' }, { status: 500 });
    }
}