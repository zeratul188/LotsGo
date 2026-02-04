import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & {
  title?: string;
};

export function EditIcon({ title = "Edit", ...props }: IconProps) {
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

      {/* Pencil body */}
      <path
        d="M13.6 5.6l4.8 4.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.2 17.8l.6-3.7a2 2 0 0 1 .55-1.1l8.4-8.4a2 2 0 0 1 2.83 0l.8.8a2 2 0 0 1 0 2.83l-8.4 8.4a2 2 0 0 1-1.1.55l-3.7.6z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Pencil tip detail */}
      <path
        d="M8.3 15.7l2.9 2.9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Underline (content line) */}
      <path
        d="M5 20h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
