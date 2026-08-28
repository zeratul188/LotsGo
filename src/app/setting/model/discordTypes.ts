export type DiscordConnectionUser = {
    id: string,
    username: string,
    globalName: string | null,
    avatar: string | null,
    connectedAt: string | null
}

export type DiscordConnectionStatus = {
    linked: false
} | {
    linked: true,
    user: DiscordConnectionUser
}
