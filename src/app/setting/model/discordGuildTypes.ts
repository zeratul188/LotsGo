export type ManageableDiscordGuild = {
    id: string,
    name: string,
    icon: string | null,
    owner: boolean,
    botInstalled: boolean
}

export type DiscordGuildChannel = {
    id: string,
    name: string,
    parentId: string | null
}

export type DiscordGuildRole = {
    id: string,
    name: string,
    color: number,
    position: number
}

export type DiscordWelcomeConfig = {
    channelId: string,
    embedTitle: string,
    embedDescription: string,
    guestButtonLabel: string,
    guestRoleId: string,
    memberButtonEnabled: boolean,
    memberButtonLabel: string,
    memberRoleId: string,
    hasMemberPassword: boolean,
    removeGuestRole: boolean,
    messageId: string | null,
    messageChannelId: string | null,
    messageUrl: string | null
}

export type DiscordGuildResources = {
    guild: ManageableDiscordGuild,
    botUserId: string,
    botCanManageRoles: boolean,
    channels: DiscordGuildChannel[],
    roles: DiscordGuildRole[],
    config: DiscordWelcomeConfig | null
}

export type DiscordWelcomeForm = {
    channelId: string,
    embedTitle: string,
    embedDescription: string,
    guestButtonLabel: string,
    guestRoleId: string,
    memberButtonEnabled: boolean,
    memberButtonLabel: string,
    memberRoleId: string,
    memberPassword: string,
    removeGuestRole: boolean
}
