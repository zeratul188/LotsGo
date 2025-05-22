import { useState } from "react";
import { Boss } from "../api/checklist/boss/route";

// state 관리
export function useChecklistForm() {
    const [isLoading, setLoading] = useState(true);
    const [isEmpty, setEmpty] = useState(false);
    const [bosses, setBosses] = useState<Boss[]>([]);

    return {
        isLoading, setLoading,
        isEmpty, setEmpty,
        bosses, setBosses
    }
}

export function ChecklistStatue() {

}