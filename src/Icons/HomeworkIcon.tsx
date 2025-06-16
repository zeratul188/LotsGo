import React from "react";

export default function HomeworkIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 12h6" />
      <path d="M9 16h4" />
      <path d="M4 4h16v18H4z" />
      <path d="M4 8h16" />
    </svg>
  );
}
