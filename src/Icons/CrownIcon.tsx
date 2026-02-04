import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & {
  title?: string;
};

export function CrownIcon({ title = "Crown", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      {...props}
    >
      <title>{title}</title>

      {/* Crown top */}
      <path
        d="M4.5 9.2l2.3-4.2 5.2 4.2L17.2 5l2.3 4.2-1.3 6.3H5.8L4.5 9.2z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Base */}
      <path
        d="M6.2 15.5h11.6v2.3a1.8 1.8 0 0 1-1.8 1.8H8a1.8 1.8 0 0 1-1.8-1.8v-2.3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Jewels */}
      <circle cx="12" cy="9.1" r="0.9" fill="currentColor" />
      <circle cx="6.8" cy="6.2" r="0.9" fill="currentColor" />
      <circle cx="17.2" cy="6.2" r="0.9" fill="currentColor" />
    </svg>
  );
}
