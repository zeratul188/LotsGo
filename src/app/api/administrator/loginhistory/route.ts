import { History } from "@/app/setting/model/types";
import { firestore } from "@/utiils/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

function maskIp(ip?: string | null) {
  if (!ip) return "";

  // IPv4: 123.45.67.89 -> 123.45.67.xxx
  const v4 = ip.match(/^(\d{1,3}\.){3}\d{1,3}$/);
  if (v4) {
    const parts = ip.split(".");
    parts[2] = "***";
    parts[3] = "***";
    return parts.join(".");
  }

  // IPv6 (간단 마스킹): 마지막 2그룹 가리기
  // 예: 2001:0db8:85a3:0000:0000:8a2e:0370:7334 -> 2001:0db8:85a3:0000:0000:xxxx:xxxx
  if (ip.includes(":")) {
    const parts = ip.split(":");
    // 빈 문자열(::) 처리까지 완벽하진 않지만 관리자 표시는 이 정도면 충분
    for (let i = parts.length - 1; i >= 0 && i >= parts.length - 2; i--) {
      parts[i] = "****";
    }
    return parts.join(":");
  }

  // 그 외(예: 프록시 헤더 문자열 등)는 뒤쪽만 마스킹
  if (ip.length <= 6) return "***";
  return ip.slice(0, Math.min(6, ip.length)) + "…";
}

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) throw new Error("AUTH_NOT_TYPES");
        const userId = authHeader.split(' ')[1];

        const sessionQuery = query(
            collection(firestore, 'sessions'),
            where('userId', '==', userId)
        )
        const sessionSnapshot = await getDocs(sessionQuery);
        const historys: History[] = [];
        sessionSnapshot.forEach(sessionDoc => {
            const data = sessionDoc.data();
            historys.push({
                id: sessionDoc.id,
                createdAt: data.createdAt ?? null,
                expiresAt: data.expiresAt ?? null,
                ipAddress: data.ipAddress ? maskIp(data.ipAddress) : '-',
                lastUsedAt: data.lastUsedAt ?? null,
                revokedAt: data.revokedAt ?? null,
                revoked: data.revoked
            });
        });
        return NextResponse.json({ historys: historys });
    } catch(e: any) {
        if (e.message === "AUTH_NOT_TYPES") {
            return NextResponse.json({ error: 'API 요청이 잘못되었습니다.' }, { status: 400 });
        }
        return NextResponse.json({ error: '데이터 처리 중 문제가 발생하였습니다.' }, { status: 500 });
    }
}