import type { ReactNode } from "react";

export type SettingMenuIconName = 'expeditions' | 'setting' | 'apikey' | 'discord' | 'discord-guilds' | 'history' | 'change-password' | 'exit-site';

const iconPaths: Record<SettingMenuIconName, ReactNode> = {
    expeditions: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-1a6 6 0 0 1 12 0v1M17 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1"/></>,
    setting: <><path d="M4 7h10M18 7h2M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="16" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/></>,
    apikey: <><circle cx="8" cy="15" r="4"/><path d="m11 12 9-9 2 2-2 2 1 1-2 2-1-1-3 3M6.5 16.5h.01"/></>,
    discord: <><path d="M5 7c2-1 4-1 7-1s5 0 7 1l2 10c-2 2-4 3-6 3l-1-2a16 16 0 0 1-4 0l-1 2c-2 0-4-1-6-3L5 7Z"/><path d="M8.5 12h.01M15.5 12h.01"/></>,
    'discord-guilds': <><rect x="4" y="3" width="16" height="7" rx="2"/><rect x="4" y="14" width="16" height="7" rx="2"/><path d="M8 6.5h.01M8 17.5h.01M12 6.5h5M12 17.5h5"/></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7v5l3 2"/></>,
    'change-password': <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>,
    'exit-site': <><path d="M4 7h16M10 7V5h4v2M6 7l1 14h10l1-14M10 11v6M14 11v6"/></>
};

export function SettingMenuIcon({ name }: { name: SettingMenuIconName }) {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{iconPaths[name]}</svg>;
}
