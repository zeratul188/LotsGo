import React from "react";

export default function RaidIcon({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="currentColor"
      stroke="none">
    <g>
        <polygon points="492.83 19.17 425.43 39.47 120.94 343.96 168.04 391.06 472.53 86.57 492.83 19.17"/>
        <path d="M229.07,465.27l-73.36-108.98-49.59,49.59,108.98,73.36c9.17,6.17,20.14-4.8,13.97-13.97Z"/>
        <path d="M46.73,282.93l108.98,73.36-49.59,49.59-73.36-108.98c-6.17-9.17,4.8-20.14,13.97-13.97Z"/>
        <rect x="70.41" y="324.48" width="44.65" height="189.56" rx="18.16" ry="18.16" transform="translate(323.63 57.23) rotate(45)"/>
    </g>
    <g>
        <polygon points="19.17 19.17 86.57 39.47 391.06 343.96 343.96 391.06 39.47 86.57 19.17 19.17"/>
        <path d="M282.93,465.27l73.36-108.98,49.59,49.59-108.98,73.36c-9.17,6.17-20.14-4.8-13.97-13.97Z"/>
        <path d="M465.27,282.93l-108.98,73.36,49.59,49.59,73.36-108.98c6.17-9.17-4.8-20.14-13.97-13.97Z"/>
        <rect x="396.94" y="324.48" width="44.65" height="189.56" rx="18.16" ry="18.16" transform="translate(1012.2 419.27) rotate(135)"/>
    </g>
    </svg>
  );
}