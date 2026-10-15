import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { Button, Popover, PopoverContent, Tooltip } from "@heroui/react";

export type ChecklistMenuIconName = 'view' | 'bonus' | 'raid' | 'info' | 'remaining' | 'cube' | 'account' | 'server' | 'content' | 'daily' | 'filter' | 'gold' | 'complete' | 'clear' | 'reset' | 'life' | 'order' | 'add' | 'refresh' | 'auto';

export const menuActionClass = "h-9 min-h-9 w-full justify-start gap-2 rounded-lg px-2 text-xs font-medium text-default-700 data-[hover=true]:bg-default-100 dark:text-white dark:data-[hover=true]:bg-white/[0.07]";
export const menuSwitchClass = "-ml-2 shrink-0 origin-right scale-[0.8]";
const compactButtonClass = "h-9 min-h-9 w-9 min-w-9 rounded-lg border border-transparent p-0 text-default-700 data-[hover=true]:bg-default-100 dark:text-white dark:data-[hover=true]:bg-white/[0.08]";
const compactSelectedClass = "border-primary/50 bg-primary/15 text-primary-700 dark:border-blue-400/60 dark:bg-blue-400/20 dark:!text-[#bfdbfe]";

export function CompactPopoverTooltip({ anchorRef, label, isOpen }: { anchorRef: RefObject<HTMLElement>; label: string; isOpen: boolean }) {
    const [position, setPosition] = useState<{ left: number; top: number } | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        const updatePosition = () => {
            const rect = anchorRef.current?.getBoundingClientRect();
            if (rect) setPosition({ left: rect.right + 10, top: rect.top + rect.height / 2 });
        };
        updatePosition();
        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);
        return () => {
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [anchorRef, isOpen]);

    return isOpen && position ? createPortal(
        <div role="tooltip" className="pointer-events-none fixed z-[100000] rounded-medium bg-content1 px-2.5 py-1 text-small font-normal text-foreground shadow-small" style={{ left: position.left, top: position.top, transform: "translateY(-50%)" }}>
            <span aria-hidden="true" className="absolute -left-1 top-1/2 -z-10 h-2.5 w-2.5 -translate-y-1/2 rotate-45 rounded-sm bg-content1"/>
            {label}
        </div>, document.body
    ) : null;
}
export const menuSelectClassNames = {
    trigger: "h-8 min-h-8 rounded-md border border-default-200 bg-white px-2 shadow-none data-[hover=true]:bg-default-100 dark:border-white/20 dark:bg-white/[0.04] dark:text-white dark:data-[hover=true]:bg-white/[0.08]",
    value: "text-xs text-default-700 dark:text-white dark:data-[placeholder=true]:text-white/80",
    selectorIcon: "text-default-500 dark:text-white",
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
        reset: <><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"/><path d="M12 7v5l3 2"/></>,
        life: <><path d="M20 4C9 2 3 8 5 15c2 6 14 6 15-11Z"/><path d="m4 21 11-12"/></>,
        order: <><path d="M8 4v16m0-16L5 7m3-3 3 3M16 20V4m0 16-3-3m3 3 3-3"/></>,
        add: <><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></>,
        refresh: <><path d="M20 11a8 8 0 0 0-14-5L4 8m0-5v5h5M4 13a8 8 0 0 0 14 5l2-2m0 5v-5h-5"/></>,
        auto: <><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 2v3m8-3v3M8 12l2 2 5-5"/></>
    };

    return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function CompactMenuButton({ icon, label, isSelected, isDanger = false, isDisabled = false, onPress }: {
    icon: ChecklistMenuIconName;
    label: string;
    isSelected?: boolean;
    isDanger?: boolean;
    isDisabled?: boolean;
    onPress: () => void;
}) {
    return (
        <Tooltip showArrow placement="right" content={label}>
            <Button
                isIconOnly
                variant="light"
                aria-label={label}
                aria-pressed={isSelected}
                isDisabled={isDisabled}
                className={`${compactButtonClass} ${isSelected ? compactSelectedClass : ""} ${isDanger ? "!text-danger dark:!text-red-400" : ""}`}
                onPress={onPress}>
                <ChecklistMenuIcon name={icon}/>
            </Button>
        </Tooltip>
    );
}

export function CompactMenuSelect({ icon, label, isSelected = false, children }: {
    icon: ChecklistMenuIconName;
    label: string;
    isSelected?: boolean;
    children: ReactNode;
}) {
    const [isPopoverOpen, setPopoverOpen] = useState(false);
    const [isTooltipOpen, setTooltipOpen] = useState(false);
    const anchorRef = useRef<HTMLSpanElement>(null!);

    return (
        <>
            <span ref={anchorRef} className="inline-flex">
                <Button
                    isIconOnly
                    variant="light"
                    aria-label={label}
                    aria-haspopup="dialog"
                    aria-expanded={isPopoverOpen}
                    onPress={() => {
                        setTooltipOpen(false);
                        setPopoverOpen(!isPopoverOpen);
                    }}
                    onMouseEnter={() => setTooltipOpen(true)}
                    onMouseLeave={() => setTooltipOpen(false)}
                    onFocus={() => setTooltipOpen(true)}
                    onBlur={() => setTooltipOpen(false)}
                    className={`${compactButtonClass} ${isSelected ? compactSelectedClass : ""}`}>
                    <ChecklistMenuIcon name={icon}/>
                </Button>
            </span>
            <CompactPopoverTooltip anchorRef={anchorRef} label={label} isOpen={isTooltipOpen && !isPopoverOpen}/>
            <Popover showArrow placement="right-start" offset={12} triggerRef={anchorRef} isOpen={isPopoverOpen} onOpenChange={(open) => {
                setPopoverOpen(open);
                if (open) setTooltipOpen(false);
            }}>
                <span className="hidden" aria-hidden="true"/>
                <PopoverContent className="border border-default-200 bg-white p-3 shadow-xl dark:border-white/10 dark:bg-[#171717] dark:text-white">
                    <div className="w-[220px] space-y-2">
                        <p className="text-xs font-semibold text-foreground dark:text-white">{label}</p>
                        {children}
                    </div>
                </PopoverContent>
            </Popover>
        </>
    );
}

export function ChecklistMenuSection({ title, children, compact = false }: { title: string; children: ReactNode; compact?: boolean }) {
    return (
        <section aria-label={compact ? title : undefined} className="border-b border-default-200/80 py-3 first:pt-0 last:border-b-0 dark:border-white/10">
            {!compact ? <h3 className="px-2 pb-1 text-[10px] font-semibold text-default-500 dark:text-white/80">{title}</h3> : null}
            <div className={compact ? "flex flex-col items-center gap-1" : "space-y-0.5"}>{children}</div>
        </section>
    );
}

export function ChecklistMenuRow({ icon, label, children }: { icon: ChecklistMenuIconName; label: string; children: ReactNode }) {
    return (
        <div className="flex min-h-10 items-center gap-2 rounded-lg px-2 text-default-700 transition-colors hover:bg-default-100 dark:text-white dark:hover:bg-white/[0.07]">
            <ChecklistMenuIcon name={icon}/>
            <span className="min-w-0 flex-1 text-xs font-medium leading-tight text-foreground dark:text-white">{label}</span>
            {children}
        </div>
    );
}
