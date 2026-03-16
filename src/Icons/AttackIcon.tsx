import React from 'react';

type AttackIconProps = {
  size?: number;
  color?: string;
  className?: string;
};

export default function AttackIcon({ size = 24, color = "#a50e0e", className }: AttackIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 800"
      width={size}
      height={size}
      fill={color}
      className={className}
    >
      <path d="M45,178.12l412.37,412.37-66.56,66.56,62.76,62.76,101.75-101.75,66.66,66.66c-.07,1.22-.1,2.46-.1,3.71,0,36.76,29.8,66.56,66.56,66.56,36.76,0,66.56-29.8,66.56-66.56s-29.8-66.56-66.56-66.56c-1.24,0-2.48.04-3.71.1l-66.66-66.66,101.75-101.75-62.76-62.76-66.56,66.56L178.13,45H45s0,133.12,0,133.12Z" />
    </svg>
  );
}
