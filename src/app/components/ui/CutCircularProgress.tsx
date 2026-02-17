import clsx from "clsx";
import React from "react";

type CutCircularProgressProps = {
  value: number;
  max: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
  gapAngle?: number; // 6시 방향에서 잘릴 각도 (기본 25도)
  inset?: number;
  trackClassName?: string;
  progressClassName?: string;
  showLabel?: boolean;
  isMobile?: boolean;
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);

  const sweep = ((endAngle - startAngle) % 360 + 360) % 360;
  const largeArcFlag = sweep > 180 ? 1 : 0;

  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

export default function CutCircularProgress({
  value,
  max,
  label = '',
  size = 84,
  strokeWidth = 10,
  gapAngle = 60,
  inset = 0,
  trackClassName = "stroke-zinc-200 dark:stroke-zinc-700",
  progressClassName = "stroke-primary",
  showLabel = true,
  isMobile = false
}: CutCircularProgressProps) {
  const percent =
    max <= 0 ? 0 : Math.max(0, Math.min(1, value / max));

  const cx = size / 2;
  const cy = size / 2;
  const r = Math.max(0, (size - strokeWidth) / 2 - inset);

  const totalArc = 360 - gapAngle;

  const startAngle = 90 + gapAngle / 2;
  const endAngle = 90 - gapAngle / 2;

  const trackPath = describeArc(cx, cy, r, startAngle, endAngle);

  // ✅ 진행 각도 계산
  const progressEndAngle = startAngle + totalArc * percent;

  const progressPath =
    percent === 0
      ? ""
      : describeArc(cx, cy, r, startAngle, progressEndAngle);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size}>
        {/* 트랙 */}
        <path
          d={trackPath}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={trackClassName}
        />

        {/* 진행 */}
        {percent > 0 && (
          <path
            d={progressPath}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={progressClassName}
          />
        )}
      </svg>

      {showLabel && (
        <div className="absolute text-sm tabular-nums text-center">
            <p className={clsx(
                "font-normal",
                isMobile ? "text-[8pt]" : "text-[9pt]"
            )}>{label}</p>
            <p className={clsx(
                "font-bold",
                isMobile ? "text-xl" : "text-2xl"
            )}>{value.toLocaleString()}</p>
            <p className={clsx(
                "font-normal fadedtext",
                isMobile ? "text-sm" : "text-md"
            )}>/ {max.toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}