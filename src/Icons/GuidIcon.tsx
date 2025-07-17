import React from "react";

const GuideBookIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M10 8C10 6.89543 10.8954 6 12 6H48C49.1046 6 50 6.89543 50 8V50C50 51.1046 49.1046 52 48 52H12C10.8954 52 10 51.1046 10 50V8Z"
      fill="#E2E8F0"
      stroke="#1E293B"
      strokeWidth="2"
    />
    <path
      d="M50 8H54C55.1046 8 56 8.89543 56 10V52C56 53.1046 55.1046 54 54 54H14"
      stroke="#1E293B"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M18 16H42"
      stroke="#1E293B"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M18 24H42"
      stroke="#1E293B"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M18 32H34"
      stroke="#1E293B"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default GuideBookIcon;
