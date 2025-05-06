import bcrypt from 'bcryptjs';

// 값을 암호화 함수수
export async function hashValue (value: string): Promise<string> {
    const saltRounds = Number(process.env.NEXT_PUBLIC_SALTROUNDS);
    const hashedValue = await bcrypt.hash(value, saltRounds);
    return hashedValue;
}

// 해쉬된 값과 비교 대상 값과의 동일 여부 확인 함수수
export async function isMatchValue (value: string, hashedValue: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(value, hashedValue);
    return isMatch;
}