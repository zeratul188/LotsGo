import React from "react";

type ItemLevelIconProps = {
  /** px */
  size?: number;
  className?: string;
};

/**
 * Item Level / iLvl 배지 느낌 아이콘
 * - fill="currentColor" 기반이라 Tailwind text-* 로 색 제어 가능
 * - size로 가로/세로 동일 비율
 */
export function ItemLevelIcon({
  size = 20,
  className,
}: ItemLevelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Shield */}
      <path d="M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" />

      {/* Double chevron = level up */}
      <path d="M9 11l3-3 3 3" />
      <path d="M9 14l3-3 3 3" />
    </svg>
  );
}