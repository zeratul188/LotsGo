import 'server-only';
import jwt from 'jsonwebtoken';
import crypto from "crypto";

const JWT_SECRET = process.env.LOSTARK_JWT_SECRET!;

export function signAccessToken(payload: any) {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '30m',
        algorithm: 'HS256'
    });
}

export function generateRefreshToken() {
    return crypto.randomBytes(48).toString("base64url");
}

export function hashToken(token: string) {
    return crypto.createHash("sha256").update(token).digest('hex');
}