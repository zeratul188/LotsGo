import type { ReactNode } from "react";

export type ChecklistMenuIconName = 'view' | 'bonus' | 'raid' | 'info' | 'remaining' | 'cube' | 'account' | 'server' | 'content' | 'daily' | 'filter' | 'gold' | 'complete' | 'clear' | 'reset';

export const menuActionClass = "h-9 min-h-9 w-full justify-start gap-2 rounded-lg px-2 text-xs font-medium text-default-700 data-[hover=true]:bg-default-100 dark:text-default-200 dark:data-[hover=true]:bg-white/[0.07]";
export const menuSwitchClass = "-ml-2 shrink-0 origin-right scale-[0.8]";
export const menuSelectClassNames = {
    trigger: "h-8 min-h-8 rounded-md border border-default-200 bg-white px-2 shadow-none data-[hover=true]:bg-default-100 dark:border-white/10 dark:bg-white/[0.04] dark:data-[hover=true]:bg-white/[0.08]",
    value: "text-xs text-default-700 dark:text-default-200",
    selectorIcon: "text-default-400",
    popoverContent: "rounded-lg border border-default-200 dark:border-white/10"
};

export function ChecklistMenuIcon({ name }: { name: ChecklistMenuIconName }) {
    const paths: Record<ChecklistMenuIconName, ReactNode> = {
        view: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/></>,
        bonus: <><circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-4"/></>,
        raid: <><path d="m12 2 8 4v6c0 5-3.3 8-8 10-4.7-2-8-5-8-10V6l8-4Z"/><path d="m9 12 2 2 4-4"/></>,
        info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>,
        remaining: <><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5h6M9 11h6M9 15h4"/></>,
        cube: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4.5 7.8 7.5 4.3 7.5-4.3M12 12v9"/></>,
        account: <><circle cx="12" cy="8" r="3"/><path d="M5 20a7 7 0 0 1 14 0"/></>,
        server: <><rect x="4" y="3" width="16" height="7" rx="2"/><rect x="4" y="14" width="16" height="7" rx="2"/><path d="M8 6.5h.01M8 17.5h.01"/></>,
        content: <><path d="M4 5h16M4 12h16M4 19h16"/><circle cx="7" cy="5" r="1" fill="currentColor"/><circle cx="7" cy="12" r="1" fill="currentColor"/><circle cx="7" cy="19" r="1" fill="currentColor"/></>,
        daily: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 15l2 2 4-4"/></>,
        filter: <><path d="M4 7h10M18 7h2M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="16" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/></>,
        gold: <><circle cx="12" cy="12" r="9"/><path d="M15 9c-1-1-5-1-5 1s5 1 5 3-4 2-6 1M12 6v12"/></>,
        complete: <><path d="M4 7h16M4 12h11M4 17h9"/><path d="m16 16 2 2 3-4"/></>,
        clear: <><path d="M4 7h16M7 12h10M10 17h4"/><path d="m18 17 4 4m0-4-4 4"/></>,
        reset: <><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"/><path d="M12 7v5l3 2"/></>
    };

    return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function ChecklistMenuSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="border-b border-default-200/80 py-3 first:pt-0 last:border-b-0 dark:border-white/10">
            <h3 className="px-2 pb-1 text-[10px] font-semibold text-default-500">{title}</h3>
            <div className="space-y-0.5">{children}</div>
        </section>
    );
}

export function ChecklistMenuRow({ icon, label, children }: { icon: ChecklistMenuIconName; label: string; children: ReactNode }) {
    return (
        <div className="flex min-h-10 items-center gap-2 rounded-lg px-2 text-default-600 transition-colors hover:bg-default-100 dark:text-default-300 dark:hover:bg-white/[0.07]">
            <ChecklistMenuIcon name={icon}/>
            <span className="min-w-0 flex-1 text-xs font-medium leading-tight text-foreground">{label}</span>
            {children}
        </div>
    );
}
