import React from "react";

export default function LeaderIcon({
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
        <rect x="12.46" y="308.6" width="487.08" height="64.59"/>
        <rect x="12.46" y="401.46" width="487.08" height="64.59"/>
        <polygon points="214.05 373.19 12.46 373.19 12.46 58.87 85.09 178.28 214.05 373.19"/>
        <polygon points="457.59 360.27 256 360.27 256 45.95 328.63 165.37 457.59 360.27"/>
        <polygon points="297.95 373.19 499.54 373.19 499.54 58.87 426.91 178.28 297.95 373.19"/>
        <polygon points="54.41 360.27 256 360.27 256 45.95 183.37 165.37 54.41 360.27"/>
    </svg>
  );
}