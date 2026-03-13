export default function SearchEmptyIcon({
  size = 56,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
    >
      <circle
        cx="27"
        cy="27"
        r="15"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d="M38 38L50 50"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M20 22H34"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M20 29H29"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M18 53H46"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M24 58H40"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}
