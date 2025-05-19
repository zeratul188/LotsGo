'use client'
import { useChecklistForm } from "./ChecklistForm"

export default function Checklist() {
    const checklistForm = useChecklistForm();

    return (
        <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto">
            checklist
        </div>
    )
}