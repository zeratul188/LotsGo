'use client'

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
    addToast,
    Button,
    Chip,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Switch,
    Tooltip,
    useDisclosure
} from "@heroui/react";
import clsx from "clsx";
import type { MajorUpdate } from "@/app/home/model/types";
import { useLoadingTask } from "@/app/components/loading/LoadingProgress";

type MajorUpdateDraft = Omit<MajorUpdate, "id"> & { id?: string };

const EMPTY_DRAFT: MajorUpdateDraft = {
    url: "",
    title: "",
    sub: "",
    color: "#1e2041",
    isBlack: false
};

const fieldClassNames = {
    inputWrapper: "border-default-200 bg-default-50 shadow-none data-[hover=true]:border-primary/50 dark:border-white/10 dark:bg-white/[0.04]",
    input: "text-sm"
};

export default function MajorUpdatesForm() {
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [draft, setDraft] = useState<MajorUpdateDraft>(EMPTY_DRAFT);
    const [isEditMode, setEditMode] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState("");
    const [fileError, setFileError] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [updates, setUpdates] = useState<MajorUpdateDraft[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [isSaving, setSaving] = useState(false);

    useLoadingTask("주요 업데이트 데이터를 불러오는 중이에요", isLoading);

    const preview = useMemo(() => ({
        ...draft,
        url: previewUrl || draft.url
    }), [draft, previewUrl]);

    const isDraftValid = useMemo(() => {
        const hasImage = isEditMode ? Boolean(draft.url || selectedFile) : Boolean(selectedFile);
        const hasRequiredText = Boolean(draft.sub.trim() && draft.title.trim());
        const hasValidColor = /^#[0-9A-Fa-f]{6}$/.test(draft.color);

        return hasImage && hasRequiredText && hasValidColor && !fileError && !isSaving;
    }, [draft.color, draft.sub, draft.title, draft.url, fileError, isEditMode, isSaving, selectedFile]);

    useEffect(() => {
        return () => {
            if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    useEffect(() => {
        void loadUpdates();
    }, []);

    const loadUpdates = async () => {
        try {
            const response = await requestApi("GET");
            const data = await response.json();
            if (!response.ok) throw new Error(data.error ?? "주요 업데이트를 불러오지 못했습니다.");
            setUpdates(data.items ?? []);
        } catch (error) {
            addToast({ title: "불러오기 오류", description: error instanceof Error ? error.message : "주요 업데이트를 불러오지 못했습니다.", color: "danger" });
        } finally {
            setLoading(false);
        }
    };

    const resetEditor = () => {
        setDraft(EMPTY_DRAFT);
        setEditMode(false);
        setSelectedFileName("");
        setFileError("");
        setPreviewUrl("");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const openCreateModal = () => {
        resetEditor();
        onOpen();
    };

    const openEditModal = (item: MajorUpdateDraft) => {
        resetEditor();
        setDraft(item);
        setPreviewUrl(item.url);
        setEditMode(true);
        onOpen();
    };

    const validateImage = (file: File) => {
        setFileError("");
        setSelectedFileName(file.name);
        setSelectedFile(null);

        if (!["image/webp", "image/png", "image/jpeg"].includes(file.type)) {
            setFileError("WebP, PNG, JPEG 형식의 이미지만 선택할 수 있습니다.");
            return;
        }
        if (file.size >= 1024 * 1024) {
            setFileError("이미지 용량은 반드시 1MB 미만이어야 합니다.");
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
            if (image.naturalWidth !== 1200 || image.naturalHeight !== 400) {
                URL.revokeObjectURL(objectUrl);
                setFileError(`이미지 크기는 반드시 1200 × 400px이어야 합니다. 선택한 이미지: ${image.naturalWidth} × ${image.naturalHeight}px`);
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(objectUrl);
        };
        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            setFileError("이미지를 확인할 수 없습니다. 다른 파일을 선택해주세요.");
        };
        image.src = objectUrl;
    };

    const onSelectImage = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) validateImage(file);
    };

    const saveDraft = async () => {
        if (!draft.title.trim() || !draft.sub.trim() || !/^#[0-9A-Fa-f]{6}$/.test(draft.color)) {
            addToast({ title: "입력값 확인", description: "타이틀, 분류 문구, 배경색을 확인해주세요.", color: "warning" });
            return;
        }
        if (!isEditMode && !selectedFile) {
            addToast({ title: "이미지 필요", description: "1200 × 400px 이미지를 선택해주세요.", color: "warning" });
            return;
        }

        setSaving(true);
        try {
            const formData = new FormData();
            formData.set("title", draft.title.trim());
            formData.set("sub", draft.sub.trim());
            formData.set("color", draft.color);
            formData.set("isBlack", String(draft.isBlack));
            if (draft.id) formData.set("id", draft.id);
            if (selectedFile) formData.set("file", selectedFile);

            const response = await requestApi(isEditMode ? "PATCH" : "POST", {
                body: formData
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error ?? "저장하지 못했습니다.");
            await loadUpdates();
            onClose();
            addToast({ title: isEditMode ? "수정 완료" : "추가 완료", description: data.message, color: "success" });
        } catch (error) {
            addToast({ title: "저장 오류", description: error instanceof Error ? error.message : "저장하지 못했습니다.", color: "danger" });
        } finally {
            setSaving(false);
        }
    };

    const removeUpdate = async (item: MajorUpdateDraft) => {
        if (!item.id || !confirm("이 주요 업데이트를 삭제하시겠습니까? 삭제한 이미지는 복구할 수 없습니다.")) return;
        try {
            const response = await requestApi("DELETE", { body: JSON.stringify({ id: item.id }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error ?? "삭제하지 못했습니다.");
            await loadUpdates();
            addToast({ title: "삭제 완료", description: data.message, color: "success" });
        } catch (error) {
            addToast({ title: "삭제 오류", description: error instanceof Error ? error.message : "삭제하지 못했습니다.", color: "danger" });
        }
    };

    const moveUpdate = async (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= updates.length) return;
        try {
            const response = await requestApi("PATCH", {
                body: JSON.stringify({ type: "reorder", from: index, to: target })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error ?? "순서를 변경하지 못했습니다.");
            await loadUpdates();
        } catch (error) {
            addToast({ title: "순서 변경 오류", description: error instanceof Error ? error.message : "순서를 변경하지 못했습니다.", color: "danger" });
        }
    };

    if (isLoading) {
        return <div className="flex min-h-[calc(100vh-105px)] items-center justify-center text-sm text-default-500">주요 업데이트를 불러오는 중입니다.</div>;
    }

    return (
        <div className="min-h-[calc(100vh-105px)] w-full">
            <section className="mb-5 rounded-2xl border border-default-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#171717] sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-bold">주요 업데이트 관리</h2>
                            <Chip size="sm" radius="full" color="success" variant="flat">Firestore 연동</Chip>
                        </div>
                        <p className="max-w-2xl text-sm leading-6 text-default-500">
                            홈 상단에 노출되는 주요 업데이트의 이미지와 문구, 배경색, 표시 순서를 관리합니다.
                        </p>
                    </div>
                    <Button color="primary" radius="lg" className="font-bold sm:min-w-36" onPress={openCreateModal}>
                        주요 업데이트 추가
                    </Button>
                </div>

                <div className="mt-5 rounded-2xl border border-warning-300/70 bg-warning-50 px-4 py-4 dark:border-warning-500/25 dark:bg-warning-500/10 sm:px-5">
                    <div className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning-400/20 font-black text-warning-700 dark:text-warning-300">!</div>
                        <div>
                            <p className="text-sm font-bold text-warning-800 dark:text-warning-200">이미지 등록 필수 규격</p>
                            <p className="mt-1 text-sm leading-6 text-warning-800/80 dark:text-warning-100/70">
                                이미지는 반드시 <strong>1200 × 400px</strong>, <strong>1MB 미만</strong>으로 등록해주세요. WebP, PNG, JPEG 형식을 지원합니다.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 min-[440px]:grid-cols-3">
                    <StatCard label="현재 등록" value={`${updates.length}개`} tone="primary" />
                    <StatCard label="필수 해상도" value="1200 × 400" tone="default" />
                    <StatCard label="최대 파일 용량" value="1MB 미만" tone="warning" />
                </div>
            </section>

            <section className="rounded-2xl border border-default-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#171717] sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3 px-1">
                    <div>
                        <h3 className="font-bold">노출 중인 업데이트</h3>
                        <p className="mt-0.5 text-xs text-default-500">위에서부터 홈 캐러셀에 표시되는 순서입니다.</p>
                    </div>
                    <Chip size="sm" radius="full" color="primary" variant="flat">{updates.length}개</Chip>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    {updates.map((item, index) => (
                        <article key={`${item.title}-${index}`} className="overflow-hidden rounded-2xl border border-default-200 bg-default-50/50 dark:border-white/10 dark:bg-white/[0.03]">
                            <BannerPreview item={item} />
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Chip size="sm" radius="full" variant="flat">{String(index + 1).padStart(2, "0")}</Chip>
                                            <p className="truncate text-sm font-bold">{item.title}</p>
                                        </div>
                                        <p className="mt-2 text-xs text-default-500">{item.sub} · 배경색 {item.color.toUpperCase()}</p>
                                    </div>
                                    <Chip size="sm" radius="full" color="success" variant="flat">노출 중</Chip>
                                </div>

                                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-default-200 pt-3 dark:border-white/10">
                                    <div className="flex gap-1">
                                        <Tooltip content={index === 0 ? "첫 번째 항목입니다." : "한 단계 위로 이동"}>
                                            <Button isIconOnly size="sm" radius="lg" variant="flat" isDisabled={index === 0} aria-label="위로 이동" onPress={() => moveUpdate(index, -1)}>↑</Button>
                                        </Tooltip>
                                        <Tooltip content={index === updates.length - 1 ? "마지막 항목입니다." : "한 단계 아래로 이동"}>
                                            <Button isIconOnly size="sm" radius="lg" variant="flat" isDisabled={index === updates.length - 1} aria-label="아래로 이동" onPress={() => moveUpdate(index, 1)}>↓</Button>
                                        </Tooltip>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" radius="lg" color="danger" variant="light" onPress={() => removeUpdate(item)}>삭제</Button>
                                        <Button size="sm" radius="lg" color="primary" variant="flat" onPress={() => openEditModal(item)}>수정 화면</Button>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size="5xl"
                scrollBehavior="inside"
                placement="center"
                classNames={{
                    base: "max-h-[92vh] bg-white dark:bg-[#171717]",
                    header: "border-b border-default-200 dark:border-white/10",
                    footer: "border-t border-default-200 dark:border-white/10"
                }}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col items-start gap-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-xl font-bold">{isEditMode ? "주요 업데이트 수정" : "주요 업데이트 추가"}</h2>
                                    <Chip size="sm" radius="full" color="success" variant="flat">실시간 저장</Chip>
                                </div>
                                <p className="text-sm font-normal text-default-500">입력 내용과 이미지가 홈에서 어떻게 보이는지 미리 확인할 수 있습니다.</p>
                            </ModalHeader>
                            <ModalBody className="py-5">
                                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)]">
                                    <div className="space-y-5">
                                        <div>
                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                <label className="text-sm font-bold" htmlFor="major-update-image">업데이트 이미지 <span className="text-danger">*</span></label>
                                                <span className="text-xs font-semibold text-danger">1200 × 400px · 1MB 미만 필수</span>
                                            </div>
                                            <button
                                                type="button"
                                                className={clsx(
                                                    "flex min-h-36 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-6 text-center transition-colors",
                                                    fileError
                                                        ? "border-danger-300 bg-danger-50 dark:border-danger-500/40 dark:bg-danger-500/10"
                                                        : "border-default-300 bg-default-50 hover:border-primary hover:bg-primary-50/40 dark:border-white/15 dark:bg-white/[0.03] dark:hover:border-primary"
                                                )}
                                                onClick={() => fileInputRef.current?.click()}>
                                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">＋</span>
                                                <span className="mt-3 text-sm font-bold">이미지를 선택해주세요</span>
                                                <span className="mt-1 text-xs leading-5 text-default-500">WebP, PNG, JPEG · 정확히 1200 × 400px · 1MB 미만</span>
                                                {selectedFileName && <span className="mt-3 max-w-full truncate rounded-full bg-default-200 px-3 py-1 text-xs font-medium dark:bg-white/10">{selectedFileName}</span>}
                                            </button>
                                            <input
                                                ref={fileInputRef}
                                                id="major-update-image"
                                                type="file"
                                                accept="image/webp,image/png,image/jpeg"
                                                className="sr-only"
                                                onChange={onSelectImage}/>
                                            {fileError && <p role="alert" className="mt-2 text-xs font-semibold leading-5 text-danger">{fileError}</p>}
                                            {!fileError && selectedFileName && <p className="mt-2 text-xs font-semibold text-success">이미지 규격을 확인했습니다. 미리보기에 반영되었습니다.</p>}
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Input
                                                isRequired
                                                radius="lg"
                                                variant="bordered"
                                                label="분류 문구"
                                                labelPlacement="outside"
                                                placeholder="예: 어비스 던전"
                                                value={draft.sub}
                                                onValueChange={(sub) => setDraft((current) => ({ ...current, sub }))}
                                                classNames={fieldClassNames}/>
                                            <Input
                                                isRequired
                                                radius="lg"
                                                variant="bordered"
                                                label="타이틀"
                                                labelPlacement="outside"
                                                placeholder="예: 지평의 성당 : 아르세노스"
                                                value={draft.title}
                                                onValueChange={(title) => setDraft((current) => ({ ...current, title }))}
                                                classNames={fieldClassNames}/>
                                        </div>

                                        <div className="rounded-2xl border border-default-200 bg-default-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="text-sm font-bold">배경색</p>
                                                    <p className="mt-1 text-xs text-default-500">이미지의 여백과 텍스트 뒤에 표시되는 색상입니다.</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="color"
                                                        aria-label="배경색 선택"
                                                        value={draft.color}
                                                        onChange={(event) => setDraft((current) => ({ ...current, color: event.target.value }))}
                                                        className="h-10 w-12 cursor-pointer rounded-lg border border-default-200 bg-transparent p-1 dark:border-white/10"/>
                                                    <Input
                                                        aria-label="배경색 코드"
                                                        radius="lg"
                                                        variant="bordered"
                                                        value={draft.color}
                                                        onValueChange={(color) => setDraft((current) => ({ ...current, color }))}
                                                        className="w-32"
                                                        classNames={fieldClassNames}/>
                                                </div>
                                            </div>
                                            <div className="mt-4 border-t border-default-200 pt-4 dark:border-white/10">
                                                <Switch
                                                    color="primary"
                                                    isSelected={draft.isBlack}
                                                    onValueChange={(isBlack) => setDraft((current) => ({ ...current, isBlack }))}>
                                                    <span className="text-sm font-medium">밝은 배경용 검정 글자 사용</span>
                                                </Switch>
                                            </div>
                                        </div>
                                    </div>

                                    <aside className="lg:sticky lg:top-0 lg:self-start">
                                        <div className="mb-2 flex items-center justify-between">
                                            <p className="text-sm font-bold">홈 화면 미리보기</p>
                                            <Chip size="sm" radius="full" variant="flat">3 : 1</Chip>
                                        </div>
                                        <div className="overflow-hidden rounded-2xl border border-default-200 bg-default-100 p-2 dark:border-white/10 dark:bg-black/20">
                                            <BannerPreview item={preview} isEditor />
                                        </div>
                                        <div className="mt-3 rounded-xl bg-default-100 px-4 py-3 text-xs leading-5 text-default-500 dark:bg-white/[0.05]">
                                            실제 홈에서는 화면 크기에 따라 이미지와 텍스트 위치가 반응형으로 조정됩니다. 모바일에서도 중요한 피사체가 오른쪽에 유지되는 이미지를 권장합니다.
                                        </div>
                                    </aside>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button radius="lg" variant="light" onPress={onClose}>닫기</Button>
                                <Tooltip content="저장 후 홈 화면에 즉시 반영됩니다.">
                                <Button radius="lg" color="primary" className="min-w-32 font-bold" isDisabled={!isDraftValid} isLoading={isSaving} onPress={saveDraft}>
                                    {isEditMode ? "수정 저장" : "업데이트 추가"}
                                </Button>
                                </Tooltip>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}

function BannerPreview({ item, isEditor = false }: { item: MajorUpdateDraft, isEditor?: boolean }) {
    return (
        <div
            className={clsx(
                "relative isolate aspect-[3/1] w-full overflow-hidden rounded-xl",
                item.isBlack ? "text-gray-950" : "text-white"
            )}
            style={{ backgroundColor: item.color || "#1e2041" }}>
            <div
                className="absolute inset-0 opacity-80"
                style={{ backgroundImage: "radial-gradient(circle at 12% 10%, rgba(255,255,255,0.2), transparent 34%), linear-gradient(135deg, rgba(255,255,255,0.08), transparent 55%)" }}/>
            {item.url ? (
                <img src={item.url} alt="" className="pointer-events-none absolute inset-0 z-10 h-full w-full select-none object-contain object-right" />
            ) : (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <span className={clsx("rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur", item.isBlack ? "bg-black/10" : "bg-white/15")}>이미지를 선택해주세요</span>
                </div>
            )}
            <div className={clsx(
                "absolute inset-0 z-[15]",
                item.isBlack
                    ? "bg-gradient-to-r from-white/70 via-white/20 to-transparent"
                    : "bg-gradient-to-r from-black/55 via-black/15 to-transparent"
            )}/>
            <div className={clsx("absolute inset-0 z-20 flex flex-col justify-end", isEditor ? "px-5 py-4 sm:px-7 sm:py-5" : "px-4 py-3 sm:px-5 sm:py-4")}>
                <p className={clsx("font-semibold opacity-80", isEditor ? "text-xs sm:text-sm" : "text-[10px] sm:text-xs")}>{item.sub || "분류 문구"}</p>
                <h3 className={clsx("mt-0.5 max-w-[65%] break-keep font-bold leading-tight tracking-tight", isEditor ? "text-base sm:text-xl" : "text-sm sm:text-base")}>{item.title || "주요 업데이트 타이틀"}</h3>
            </div>
        </div>
    );
}

function StatCard({ label, value, tone }: { label: string, value: string, tone: "primary" | "warning" | "default" }) {
    return (
        <div className={clsx(
            "rounded-xl px-4 py-3",
            tone === "primary" && "bg-primary/10",
            tone === "warning" && "bg-warning/15",
            tone === "default" && "bg-default-100 dark:bg-white/[0.05]"
        )}>
            <p className="text-xs font-medium text-default-500">{label}</p>
            <p className={clsx(
                "mt-1 text-lg font-bold",
                tone === "primary" && "text-primary",
                tone === "warning" && "text-warning-700 dark:text-warning-300"
            )}>{value}</p>
        </div>
    );
}

async function requestApi(method: string, options: RequestInit = {}) {
    const token = sessionStorage.getItem("token") ?? "";
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${token}`);
    if (typeof options.body === "string") headers.set("Content-Type", "application/json");
    return fetch("/api/administrator/major-updates", {
        ...options,
        method,
        headers,
        credentials: "include"
    });
}
