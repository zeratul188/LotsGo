import { NextRequest } from "next/server";

export function getClientIp(req: NextRequest) {
    const xff = req.headers.get("x-forwarded-for");
    let ip = (xff ? xff.split(",")[0].trim() : null) ||
        req.headers.get("x-real-ip")?.trim() ||
        req.headers.get("cf-connecting-ip")?.trim() ||
        "unknown";

    // localhost IPv6
    if (ip === "::1") return "127.0.0.1";

    // IPv4-mapped IPv6 (::ffff:123.123.123.123) → IPv4만 뽑기
    if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");

    // 혹시 포트가 붙는 케이스(드물지만) "1.2.3.4:12345" → "1.2.3.4"
    ip = ip.replace(/:\d+$/, "");

    return ip;
}