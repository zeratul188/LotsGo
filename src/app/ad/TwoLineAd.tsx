'use client'
import { useEffect, useRef } from "react"

export default function TwoLineAd({ isLoaded }: { isLoaded: boolean }) {
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
                height: '150px' 
            }}
            data-ad-client="ca-pub-1236449818258742"
            data-ad-slot="2140275653"
            data-ad-format="auto"
            data-full-width-responsive="true"></ins>
    )
}