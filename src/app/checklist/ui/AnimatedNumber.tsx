'use client'

import { useEffect, useRef, useState } from 'react';

type AnimatedNumberProps = {
    value: number
    className?: string
    fractionDigits?: number
}

const ANIMATION_DURATION = 700;

export default function AnimatedNumber({ value, className, fractionDigits = 0 }: AnimatedNumberProps) {
    const [displayValue, setDisplayValue] = useState(value);
    const displayValueRef = useRef(value);

    useEffect(() => {
        const startValue = displayValueRef.current;
        if (startValue === value) return;

        const startTime = performance.now();
        let animationFrame = 0;

        const animate = (currentTime: number) => {
            const progress = Math.min((currentTime - startTime) / ANIMATION_DURATION, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const multiplier = Math.pow(10, fractionDigits);
            const nextValue = Math.round(
                (startValue + (value - startValue) * easedProgress) * multiplier
            ) / multiplier;

            displayValueRef.current = nextValue;
            setDisplayValue(nextValue);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [value, fractionDigits]);

    return (
        <span className={className} aria-live="polite">
            {displayValue.toLocaleString(undefined, {
                minimumFractionDigits: fractionDigits,
                maximumFractionDigits: fractionDigits
            })}
        </span>
    );
}
