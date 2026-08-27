import clsx from "clsx";
import React, { useEffect, useState } from "react";

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
  const percentage = Math.round(percent * 100);
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const isGoldProgress = progressClassName.includes("warning");

  useEffect(() => {
    setAnimatedPercent(percent);
  }, [percent]);

  const cx = size / 2;
  const cy = size / 2;
  const r = Math.max(0, (size - strokeWidth) / 2 - inset);

  const totalArc = 360 - gapAngle;

  const startAngle = 90 + gapAngle / 2;
  const endAngle = 90 - gapAngle / 2;

  const trackPath = describeArc(cx, cy, r, startAngle, endAngle);

  // ✅ 진행 각도 계산
  const progressEndAngle = startAngle + totalArc;

  const progressPath = describeArc(cx, cy, r, startAngle, progressEndAngle);

  return (
    <div className="relative flex h-full min-w-0 items-center gap-3 overflow-hidden rounded-xl border border-gray-200/80 bg-white/90 px-3 py-2.5 shadow-[0_2px_10px_rgba(15,23,42,0.03)] dark:border-white/10 dark:bg-white/[0.035] dark:shadow-none">
      <div className={clsx(
        "pointer-events-none absolute -right-5 -top-8 h-20 w-20 rounded-full blur-2xl",
        isGoldProgress ? "bg-warning/10" : "bg-secondary/10"
      )}/>
      <div className="relative shrink-0">
        <svg width={size} height={size} aria-hidden="true">
          <path
            d={trackPath}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={trackClassName}
          />
          <path
            d={progressPath}
            fill="none"
            pathLength={100}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={clsx(progressClassName, "transition-[stroke-dashoffset] duration-700 ease-out")}
            style={{
              strokeDasharray: 100,
              strokeDashoffset: 100 - animatedPercent * 100,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pb-1 text-center tabular-nums">
          <span className={clsx(
            "text-lg font-extrabold tracking-tight",
            isGoldProgress ? "text-warning-600 dark:text-warning-400" : "text-secondary-600 dark:text-secondary-400"
          )}>{percentage}<span className="ml-0.5 text-[10px] font-bold">%</span></span>
        </div>
      </div>

      {showLabel && (
        <div className="relative min-w-0 grow">
          <div className="flex items-center justify-between gap-2">
            <p className={clsx(
              "truncate font-semibold text-default-700 dark:text-default-600",
              isMobile ? "text-xs" : "text-sm"
            )}>{label}</p>
          </div>
          <div className="mt-1.5 flex min-w-0 items-baseline gap-1 tabular-nums">
            <span className="truncate text-base font-bold text-foreground">{value.toLocaleString()}</span>
            <span className="shrink-0 text-[11px] text-default-400">/ {max.toLocaleString()}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-default-200/80 dark:bg-white/10">
            <div
              className={clsx("h-full rounded-full transition-[width] duration-500", isGoldProgress ? "bg-warning" : "bg-secondary")}
              style={{ width: `${animatedPercent * 100}%` }}/>
          </div>
        </div>
      )}
    </div>
  );
}
