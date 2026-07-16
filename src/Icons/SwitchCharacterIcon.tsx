type SwitchCharacterIconProps = {
    size?: number,
    className?: string
}

export default function SwitchCharacterIcon({ size = 18, className }: SwitchCharacterIconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true">
            <path
                d="M7 19V5m0 0L3.5 8.5M7 5l3.5 3.5M17 5v14m0 0 3.5-3.5M17 19l-3.5-3.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"/>
        </svg>
    );
}
