// app/api/redis-test/route.ts
import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET() {
  try {
    await redis.set('test', 'ping');
    const result = await redis.get('test');
    return NextResponse.json({ result });
  } catch (err) {
    console.error('[Redis 연결 실패]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : err });
  }
}
