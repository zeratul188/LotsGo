'use client'

import {
    Children,
    ChangeEvent,
    isValidElement,
    KeyboardEvent,
    ReactNode,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";
import { createPortal } from "react-dom";

type SelectOption = {
    disabled: boolean;
    group?: string;
    label: ReactNode;
    value: string;
};

type SimulatorSelectProps = {
    "aria-label"?: string;
    children: ReactNode;
    className?: string;
    defaultValue?: string | number;
    disabled?: boolean;
    onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
    value?: string | number;
};

type MenuPosition = {
    bottom?: number;
    left: number;
    maxHeight: number;
    top?: number;
    width: number;
};

function getOptionValue(value: unknown, fallback: ReactNode) {
    if (value !== undefined && value !== null) return String(value);
    return typeof fallback === "string" || typeof fallback === "number" ? String(fallback) : "";
}

function collectOptions(children: ReactNode, group?: string): SelectOption[] {
    return Children.toArray(children).flatMap((child) => {
        if (!isValidElement(child)) return [];
        if (child.type === "optgroup") {
            const props = child.props as { children?: ReactNode; label?: string };
            return collectOptions(props.children, props.label);
        }
        if (child.type !== "option") return [];
        const props = child.props as { children?: ReactNode; disabled?: boolean; value?: unknown };
        return [{
            disabled: Boolean(props.disabled),
            group,
            label: props.children,
            value: getOptionValue(props.value, props.children),
        }];
    });
}

function getNextEnabledIndex(options: SelectOption[], currentIndex: number, direction: 1 | -1) {
    if (!options.length) return -1;
    for (let offset = 1; offset <= options.length; offset += 1) {
        const index = (currentIndex + direction * offset + options.length) % options.length;
        if (!options[index].disabled) return index;
    }
    return currentIndex;
}

function getAdjacentEnabledIndex(options: SelectOption[], currentIndex: number, direction: 1 | -1) {
    for (let index = currentIndex + direction; index >= 0 && index < options.length; index += direction) {
        if (!options[index].disabled) return index;
    }
    return currentIndex;
}

function getEdgeEnabledIndex(options: SelectOption[], fromEnd = false) {
    if (!fromEnd) return options.findIndex((option) => !option.disabled);
    for (let index = options.length - 1; index >= 0; index -= 1) {
        if (!options[index].disabled) return index;
    }
    return -1;
}

export default function SimulatorSelect({
    children,
    className = "",
    disabled,
    onChange,
    value,
    defaultValue,
    "aria-label": ariaLabel,
}: SimulatorSelectProps) {
    const options = useMemo(() => collectOptions(children), [children]);
    const selectedValue = String(value ?? defaultValue ?? options[0]?.value ?? "");
    const selectedIndex = Math.max(0, options.findIndex((option) => option.value === selectedValue));
    const selectedOption = options[selectedIndex];
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(selectedIndex);
    const [position, setPosition] = useState<MenuPosition | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const listboxId = useId();

    useEffect(() => {
        if (!open) return;
        setActiveIndex(selectedIndex);

        const updatePosition = () => {
            const rect = buttonRef.current?.getBoundingClientRect();
            if (!rect) return;
            const viewportPadding = 8;
            const menuGap = 6;
            const availableBelow = window.innerHeight - rect.bottom - viewportPadding - menuGap;
            const availableAbove = rect.top - viewportPadding - menuGap;
            const openUpward = availableBelow < 180 && availableAbove > availableBelow;
            const maxHeight = Math.max(120, Math.min(320, openUpward ? availableAbove : availableBelow));
            const width = Math.max(rect.width, 112);
            const left = Math.min(Math.max(viewportPadding, rect.left), window.innerWidth - width - viewportPadding);
            setPosition(openUpward
                ? { bottom: window.innerHeight - rect.top + menuGap, left, maxHeight, width }
                : { left, maxHeight, top: rect.bottom + menuGap, width });
        };
        const closeOnOutsideClick = (event: PointerEvent) => {
            const target = event.target as Node;
            if (!buttonRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
        };

        updatePosition();
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);
        document.addEventListener("pointerdown", closeOnOutsideClick);
        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
            document.removeEventListener("pointerdown", closeOnOutsideClick);
        };
    }, [open, selectedIndex]);

    const selectValue = (nextValue: string) => {
        const nextOption = options.find((option) => option.value === nextValue);
        if (!nextOption || nextOption.disabled) return;
        const event = {
            currentTarget: { value: nextValue },
            target: { value: nextValue },
        } as unknown as ChangeEvent<HTMLSelectElement>;
        onChange?.(event);
        setOpen(false);
        buttonRef.current?.focus();
    };

    useEffect(() => {
        const button = buttonRef.current;
        if (!button) return;
        const handleNativeWheel = (event: globalThis.WheelEvent) => {
            if (disabled || options.length < 2 || event.deltaY === 0) return;
            event.preventDefault();
            event.stopPropagation();
            const direction = event.deltaY < 0 ? 1 : -1;
            const nextIndex = getAdjacentEnabledIndex(options, selectedIndex, direction);
            if (nextIndex !== selectedIndex) selectValue(options[nextIndex].value);
        };
        button.addEventListener("wheel", handleNativeWheel, { passive: false });
        return () => button.removeEventListener("wheel", handleNativeWheel);
    }, [disabled, options, selectedIndex]);

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (["ArrowDown", "ArrowUp", "Enter", " ", "Escape", "Home", "End"].includes(event.key)) event.preventDefault();
        if (event.key === "Escape") {
            setOpen(false);
            return;
        }
        if (!open) {
            if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) setOpen(true);
            return;
        }
        if (event.key === "ArrowDown") setActiveIndex((index) => getNextEnabledIndex(options, index, 1));
        if (event.key === "ArrowUp") setActiveIndex((index) => getNextEnabledIndex(options, index, -1));
        if (event.key === "Home") setActiveIndex(getEdgeEnabledIndex(options));
        if (event.key === "End") setActiveIndex(getEdgeEnabledIndex(options, true));
        if (event.key === "Enter" || event.key === " ") selectValue(options[activeIndex]?.value ?? selectedValue);
    };

    let previousGroup: string | undefined;
    return <>
        <button
            aria-label={ariaLabel}
            aria-controls={open ? listboxId : undefined}
            aria-expanded={open}
            aria-haspopup="listbox"
            className={`${className} simulator-select-trigger`}
            disabled={disabled}
            onClick={() => setOpen((current) => !current)}
            onKeyDown={handleKeyDown}
            ref={buttonRef}
            type="button"
        >
            <span className="min-w-0 grow truncate text-left">{selectedOption?.label ?? selectedValue}</span>
            <svg aria-hidden="true" className="ml-2 h-4 w-4 shrink-0 transition-transform duration-200 data-[open=true]:rotate-180" data-open={open} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 16 16"><path d="m4 6 4 4 4-4"/></svg>
        </button>
        {open && position && createPortal(
            <div
                aria-label={ariaLabel}
                className="simulator-select-menu"
                id={listboxId}
                onKeyDown={(event) => {
                    if (event.key === "Escape") {
                        event.preventDefault();
                        setOpen(false);
                        buttonRef.current?.focus();
                    }
                }}
                ref={menuRef}
                role="listbox"
                style={{
                    bottom: position.bottom,
                    left: position.left,
                    maxHeight: position.maxHeight,
                    top: position.top,
                    width: position.width,
                }}
            >
                {options.map((option, index) => {
                    const showGroup = option.group && option.group !== previousGroup;
                    previousGroup = option.group;
                    return <div key={`${option.group ?? "option"}-${option.value}-${index}`}>
                        {showGroup ? <div className="simulator-select-group">{option.group}</div> : null}
                        <button
                            aria-selected={option.value === selectedValue}
                            className="simulator-select-option"
                            data-active={index === activeIndex}
                            data-selected={option.value === selectedValue}
                            disabled={option.disabled}
                            onClick={() => selectValue(option.value)}
                            onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                            role="option"
                            tabIndex={-1}
                            type="button"
                        >
                            <span className="min-w-0 grow truncate text-left">{option.label}</span>
                            {option.value === selectedValue ? <svg aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 16 16"><path d="m3 8 3 3 7-7"/></svg> : null}
                        </button>
                    </div>;
                })}
            </div>,
            document.body,
        )}
    </>;
}
