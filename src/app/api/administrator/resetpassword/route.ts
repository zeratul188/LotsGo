import crypto from "crypto";
import jwt from "jsonwebtoken";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/utiils/crypto";
import { hashValue } from "@/utiils/bcrypt";

const JWT_SECRET = process.env.LOSTARK_JWT_SECRET!;
const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY ?? 'null';
const PASSWORD_LENGTH = 12;

type AdministratorTokenPayload = {
    id: string,
    sessionId: string,
    isAdministrator?: boolean
}

function randomCharacter(characters: string) {
    return characters[crypto.randomInt(0, characters.length)];
}

function generateTemporaryPassword() {
    const groups = [
        'ABCDEFGHJKLMNPQRSTUVWXYZ',
        'abcdefghijkmnopqrstuvwxyz',
        '23456789'
    ];
    const allCharacters = groups.join('');
    const password = groups.map(randomCharacter);

    while (password.length < PASSWORD_LENGTH) {
        password.push(randomCharacter(allCharacters));
    }

    for (let index = password.length - 1; index > 0; index--) {
        const randomIndex = crypto.randomInt(0, index + 1);
        [password[index], password[randomIndex]] = [password[randomIndex], password[index]];
    }

    return password.join('');
}

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) throw new Error('UNAUTHORIZED');

        let decoded: AdministratorTokenPayload;
        try {
            decoded = jwt.verify(authHeader.slice(7), JWT_SECRET) as AdministratorTokenPayload;
        } catch {
            throw new Error('UNAUTHORIZED');
        }
        if (!decoded.isAdministrator) throw new Error('FORBIDDEN');

        const { adminAuth, adminDB } = await import('@/utiils/firebaseAdmin');
        const sessionSnapshot = await adminDB.collection('sessions').doc(decoded.sessionId).get();
        const session = sessionSnapshot.data();
        if (!sessionSnapshot.exists || session?.revoked || session?.userId !== decoded.id) {
            throw new Error('UNAUTHORIZED');
        }

        const body = await req.json();
        const id = typeof body.id === 'string' ? body.id.trim() : '';
        if (!id || id.length > 100) throw new Error('INVALID_ID');

        const memberSnapshot = await adminDB.collection('members').where('id', '==', id).limit(1).get();
        if (memberSnapshot.empty) throw new Error('MEMBER_NOT_FOUND');

        const memberDoc = memberSnapshot.docs[0];
        const memberData = memberDoc.data();
        const storedUid = typeof memberData.uid === 'string' ? memberData.uid.trim() : '';
        let firebaseUser = null;

        if (storedUid) {
            firebaseUser = await adminAuth.getUser(storedUid).catch(() => null);
        }
        if (!firebaseUser && typeof memberData.email === 'string') {
            const email = decrypt(memberData.email, secretKey).trim();
            if (email) firebaseUser = await adminAuth.getUserByEmail(email).catch(() => null);
        }
        if (!firebaseUser) throw new Error('AUTH_USER_NOT_FOUND');

        const temporaryPassword = generateTemporaryPassword();
        const hashedPassword = await hashValue(temporaryPassword);
        const previousPassword = memberData.password;
        const previousUid = memberData.uid;

        await memberDoc.ref.update({
            password: hashedPassword,
            uid: firebaseUser.uid
        });

        try {
            await adminAuth.updateUser(firebaseUser.uid, { password: temporaryPassword });
        } catch (error) {
            await memberDoc.ref.update({
                password: previousPassword === undefined ? FieldValue.delete() : previousPassword,
                uid: previousUid === undefined ? FieldValue.delete() : previousUid
            });
            throw error;
        }

        try {
            await adminAuth.revokeRefreshTokens(firebaseUser.uid);
        } catch (error) {
            console.error('Failed to revoke Firebase refresh tokens after password reset', error);
        }

        return NextResponse.json(
            { message: '임시 비밀번호를 생성했습니다.', temporaryPassword },
            { status: 200, headers: { 'Cache-Control': 'no-store' } }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (message === 'UNAUTHORIZED') {
            return NextResponse.json({ error: '로그인 정보가 유효하지 않습니다.' }, { status: 401 });
        }
        if (message === 'FORBIDDEN') {
            return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }
        if (message === 'INVALID_ID') {
            return NextResponse.json({ error: '회원 아이디를 다시 확인해주세요.' }, { status: 400 });
        }
        if (message === 'MEMBER_NOT_FOUND') {
            return NextResponse.json({ error: '회원 데이터를 찾을 수 없습니다.' }, { status: 404 });
        }
        if (message === 'AUTH_USER_NOT_FOUND') {
            return NextResponse.json({ error: 'Firebase Authentication에서 회원을 찾을 수 없습니다.' }, { status: 409 });
        }
        console.error('Failed to reset member password', error);
        return NextResponse.json({ error: '비밀번호를 재생성하는 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
