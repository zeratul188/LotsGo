import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import { useEffect, useState } from "react";
import { getSimpleBossName } from "@/app/checklist/lib/checklistFeat";
import type { Boss } from "@/app/api/checklist/boss/route";

type ContentOrderModalProps = {
    isOpen: boolean;
    onClose: () => void;
    names: string[];
    bosses: Boss[];
    onSave: (names: string[]) => void;
};

export function ContentOrderModal({ isOpen, onClose, names, bosses, onSave }: ContentOrderModalProps) {
    const [draft, setDraft] = useState(names);

    useEffect(() => {
        if (isOpen) setDraft(names);
    }, [isOpen, names]);

    const handleDragEnd = ({ source, destination }: DropResult) => {
        if (!destination || source.index === destination.index) return;
        setDraft(current => {
            const next = [...current];
            const [moved] = next.splice(source.index, 1);
            next.splice(destination.index, 0, moved);
            return next;
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside" radius="lg" classNames={{
            backdrop: "bg-black/60 backdrop-blur-sm",
            base: "border border-default-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#171717]",
            header: "border-b border-default-200 px-5 py-4 dark:border-white/10",
            body: "px-5 py-5",
            footer: "border-t border-default-200 px-5 py-4 dark:border-white/10"
        }}>
            <ModalContent>
                <>
                    <ModalHeader className="flex flex-col gap-1">
                        <span>콘텐츠 순서변경</span>
                        <span className="text-sm font-normal text-default-500">콘텐츠를 끌어 원하는 순서로 옮겨주세요. 모든 멤버의 숙제 표에 적용됩니다.</span>
                    </ModalHeader>
                    <ModalBody>
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="content-order">
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                                        {draft.map((name, index) => (
                                            <Draggable key={name} draggableId={name} index={index}>
                                                {(dragProvided, snapshot) => (
                                                    <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}
                                                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm transition-colors ${snapshot.isDragging ? "border-primary bg-primary-50 dark:bg-primary-500/10" : "border-gray-200/80 bg-gray-50/80 dark:border-white/10 dark:bg-white/[0.04]"}`}>
                                                        <span aria-hidden="true" className="text-lg text-default-400">⋮⋮</span>
                                                        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{getSimpleBossName(bosses, name)}</span>
                                                        <span className="text-xs text-default-400 tabular-nums">{index + 1}</span>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="flat" radius="lg" onPress={onClose}>취소</Button>
                        <Button color="primary" radius="lg" className="font-semibold" onPress={() => onSave(draft)}>저장</Button>
                    </ModalFooter>
                </>
            </ModalContent>
        </Modal>
    );
}
