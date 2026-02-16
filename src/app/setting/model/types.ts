export type History = {
    id: string,
    ipAddress: string,
    createdAt: Date | null,
    expiresAt: Date | null,
    lastUsedAt: Date | null,
    revokedAt: Date | null,
    revoked: boolean
}