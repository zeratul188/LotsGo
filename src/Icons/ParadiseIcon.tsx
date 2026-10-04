export default function ParadiseIcon({ className = "h-5 w-5" }: { className?: string }) {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
        </svg>
    );
}
