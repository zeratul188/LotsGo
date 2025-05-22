import { useState } from "react";

// state 관리
export function useChecklistForm() {
    const [isLoading, setLoading] = useState(true);
    const [isEmpty, setEmpty] = useState(false);

    return {
        isLoading, setLoading,
        isEmpty, setEmpty
    }
}