import { useEffect, useRef } from "react"

export function LineAd() {
    const adRef = useRef<HTMLModElement>(null);
    const pushed = useRef(false);
    useEffect(() => {
        if (!pushed.current && typeof window !== 'undefined') {
            try {
                (window as any).adsbygoogle = (window as any).adsbygoogle || [];
                (window as any).adsbygoogle.push({});
                pushed.current = true;
            } catch (e) {
                console.error(`Adsense error : `, e);
            }
        }
    }, []);

    return (
        <ins
            ref={adRef} 
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-1236449818258742"
            data-ad-slot="1198729070"
            data-ad-format="auto"
            data-full-width-responsive="true"></ins>
    )
}

export function BoxAd() {
    const adRef = useRef<HTMLModElement>(null);
    const pushed = useRef(false);
    useEffect(() => {
        if (!pushed.current && typeof window !== 'undefined') {
            try {
                (window as any).adsbygoogle = (window as any).adsbygoogle || [];
                (window as any).adsbygoogle.push({});
                pushed.current = true;
            } catch (e) {
                console.error(`Adsense error : `, e);
            }
        }
    }, []);

    return (
        <ins
            ref={adRef} 
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-1236449818258742"
            data-ad-slot="2140275653"
            data-ad-format="auto"
            data-full-width-responsive="true"></ins>
    )
}