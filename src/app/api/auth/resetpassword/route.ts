import { NextRequest, NextResponse } from "next/server";
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/utiils/firebase';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = body.email;

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: '이메일이 유효하지 않습니다.' }, { status: 400 });
  }

  try {
    await sendPasswordResetEmail(auth, email);
    return NextResponse.json({ message: '재설정 이메일이 전송되었습니다.' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}