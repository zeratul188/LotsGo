import * as React from "react";

type IconProps = {
  size?: number | string;
  strokeWidth?: number;
  color?: string; // 기본 흰색
  className?: string;
  title?: string;
};

export function ListTurnBackIcon({
  size = 24,
  strokeWidth = 2.6,
  color = "currentColor",
  className,
  title = "Shuffle",
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>

      {/* 위 라인: 왼쪽은 수평 -> 대각선으로 내려가 교차 -> 오른쪽은 수평 + 화살표 */}
      <path
        d="M3 7H9.2L12 12L15.6 8.6H18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
      <path
        d="M18 6.2L21 8.6L18 11"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />

      {/* 아래 라인: 왼쪽은 수평 -> 대각선으로 올라가 교차 -> 오른쪽은 수평 + 화살표 */}
      <path
        d="M3 17H9.2L12 12L15.6 15.4H18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
      <path
        d="M18 13L21 15.4L18 17.8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
