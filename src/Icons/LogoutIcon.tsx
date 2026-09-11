type LogoutIconProps = {
    className?: string
};

export default function LogoutIcon({ className }: LogoutIconProps) {
    return (
        <svg
            aria-hidden="true"
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path
                d="M10 5.25H6.75A1.75 1.75 0 0 0 5 7v10.25A1.75 1.75 0 0 0 6.75 19H10"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"/>
            <path
                d="M14.25 8.25 18 12l-3.75 3.75M18 12H9.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"/>
        </svg>
    );
}
