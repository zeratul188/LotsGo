import { useEffect, useState } from "react";


export type SetStateFn<T> = React.Dispatch<React.SetStateAction<T>>;

export function useMobileQuery(): boolean {
    const query = '(max-width: 768px)';
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        setMatches(media.matches);

        const handler = () => setMatches(media.matches);
        media.addEventListener('change', handler);
        return () => media.removeEventListener('change', handler);
    });

    return matches;
}