import React from "react";

type AdminIconProps = {
    size?: number;
    className?: string;
};

/** 관리자 권한과 운영 도구를 표현하는 방패형 아이콘 */
export default function AdminIcon({ size = 24, className = "" }: AdminIconProps) {
    return (
        <svg
            aria-hidden="true"
            className={className}
            fill="none"
            height={size}
            viewBox="0 0 24 24"
            width={size}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M12 2.75 19 5.5v5.9c0 4.36-2.8 8.13-7 9.85-4.2-1.72-7-5.49-7-9.85V5.5l7-2.75Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
            />
            <path
                d="M8.5 14.75h7M9.25 12h5.5M10 9.25h4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.7"
            />
        </svg>
    );
}
