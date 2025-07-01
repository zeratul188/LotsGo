'use client'
import { useEffect, useRef } from "react"

export default function LineAd({ isLoaded }: { isLoaded: boolean }) {
    const adRef = useRef<HTMLModElement>(null);
    const pushed = useRef(false);
    useEffect(() => {
        if (!isLoaded) return;
        if (!pushed.current && typeof window !== 'undefined') {
            try {
                (window as any).adsbygoogle = (window as any).adsbygoogle || [];
                (window as any).adsbygoogle.push({});
                pushed.current = true;
            } catch (e) {
                console.error(`Adsense error : `, e);
            }
        }
    }, [isLoaded]);

    return (
        <ins
            ref={adRef} 
            className="adsbygoogle"
            style={{ 
                display: "block", 
                width: '100%',
                height: '100px' 
            }}
            data-ad-client="ca-pub-1236449818258742"
            data-ad-slot="1198729070"
            data-ad-format="horizontal"
            data-full-width-responsive="true"></ins>
    )
}