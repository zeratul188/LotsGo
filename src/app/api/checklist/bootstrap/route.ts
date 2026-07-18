import { normalizeChecklist } from "@/app/checklist/lib/normalizeChecklist";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const id = new URL(req.url).searchParams.get('id')?.trim();
    if (!id) {
        return NextResponse.json({ error: '회원 ID가 필요합니다.' }, { status: 400 });
    }

    try {
        const { adminDatabase, adminDB } = await import('@/utiils/firebaseAdmin');
        const [memberSnapshot, biweeklySnapshot] = await Promise.all([
            adminDB.collection('members').where('id', '==', id).limit(1).get(),
            adminDatabase.ref('/checklist/biweekly').once('value')
        ]);

        if (memberSnapshot.empty) {
            return NextResponse.json({ error: '회원을 찾을 수 없습니다.' }, { status: 404 });
        }

        const data = memberSnapshot.docs[0].data();
        const life = normalizeLife(data.life);

        return NextResponse.json({
            checklist: normalizeChecklist(data.checklist),
            life,
            biweekly: Number(biweeklySnapshot.val() ?? 0)
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: '체크리스트 데이터를 불러오지 못했습니다.' }, { status: 500 });
    }
}

function normalizeLife(value: any) {
    if (!value) return null;

    const seconds = Number(value.date?.seconds ?? value.date?._seconds);
    const nanoseconds = Number(value.date?.nanoseconds ?? value.date?._nanoseconds ?? 0);
    return {
        life: Number(value.life ?? 0),
        max: Number(value.max ?? 10000),
        isBlessing: value.isBlessing === true,
        date: {
            seconds: Number.isFinite(seconds) ? seconds : Math.floor(Date.now() / 1000),
            nanoseconds: Number.isFinite(nanoseconds) ? nanoseconds : 0
        }
    };
}
