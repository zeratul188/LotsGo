import { randomUUID } from "crypto";
import sharp from "sharp";
import jwt from "jsonwebtoken";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDB, adminStorage } from "@/utiils/firebaseAdmin";
import type { MajorUpdate } from "@/app/home/model/types";

export const runtime = "nodejs";

const CONTENT_COLLECTION = "siteContent";
const CONTENT_DOCUMENT = "homeUpdates";
const CACHE_TAG = "home-updates";
const MAX_IMAGE_SIZE = 1024 * 1024;
const SIGNED_URL_TTL_MS = 6 * 24 * 60 * 60 * 1000;
const ALLOWED_IMAGE_TYPES = new Set(["image/webp", "image/png", "image/jpeg"]);
const JWT_SECRET = process.env.LOSTARK_JWT_SECRET!;

type AdministratorTokenPayload = {
    id: string,
    sessionId: string,
    isAdministrator?: boolean
};

type StoredMajorUpdate = MajorUpdate & {
    storagePath: string
};

export async function GET(req: NextRequest) {
    try {
        await authorizeAdministrator(req);
        return NextResponse.json({ items: await readItems() });
    } catch (error) {
        return handleError(error);
    }
}

export async function POST(req: NextRequest) {
    let uploadedPath = "";
    try {
        await authorizeAdministrator(req);
        const formData = await req.formData();
        const payload = parseFormData(formData);
        const file = getUploadedFile(formData.get("file"));
        if (!file) throw new Error("IMAGE_REQUIRED");

        const id = randomUUID();
        const uploaded = await uploadImage(file, id);
        uploadedPath = uploaded.storagePath;
        const item: StoredMajorUpdate = { id, ...payload, ...uploaded };
        await mutateItems((items) => [...items, item]);
        revalidateHome();
        return NextResponse.json({ message: "주요 업데이트를 추가했습니다.", item }, { status: 201 });
    } catch (error) {
        if (uploadedPath) await deleteImage(uploadedPath);
        return handleError(error);
    }
}

export async function PATCH(req: NextRequest) {
    let uploadedPath = "";
    try {
        await authorizeAdministrator(req);
        const contentType = req.headers.get("content-type") ?? "";

        if (contentType.includes("application/json")) {
            const body = await req.json();
            if (body.type !== "reorder") throw new Error("INVALID_REQUEST");
            const from = Number(body.from);
            const to = Number(body.to);
            await mutateItems((items) => moveItem(items, from, to));
            revalidateHome();
            return NextResponse.json({ message: "주요 업데이트 순서를 변경했습니다." });
        }

        const formData = await req.formData();
        const id = getString(formData.get("id"));
        if (!id) throw new Error("ID_REQUIRED");
        const current = (await readItems()).find((item) => item.id === id);
        if (!current) throw new Error("NOT_FOUND");

        const payload = parseFormData(formData);
        const file = getUploadedFile(formData.get("file"));
        let uploaded: Pick<StoredMajorUpdate, "url" | "storagePath"> | null = null;
        if (file) {
            uploaded = await uploadImage(file, id);
            uploadedPath = uploaded.storagePath;
        }

        const nextItem: StoredMajorUpdate = {
            ...current,
            ...payload,
            ...(uploaded ?? {})
        };
        await mutateItems((items) => items.map((item) => item.id === id ? nextItem : item));
        if (uploaded && current.storagePath !== uploaded.storagePath) {
            await deleteImage(current.storagePath);
        }
        revalidateHome();
        return NextResponse.json({ message: "주요 업데이트를 수정했습니다.", item: nextItem });
    } catch (error) {
        if (uploadedPath) await deleteImage(uploadedPath);
        return handleError(error);
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await authorizeAdministrator(req);
        const body = await req.json();
        const id = getString(body.id);
        if (!id) throw new Error("ID_REQUIRED");
        const current = (await readItems()).find((item) => item.id === id);
        if (!current) throw new Error("NOT_FOUND");

        await mutateItems((items) => items.filter((item) => item.id !== id));
        await deleteImage(current.storagePath);
        revalidateHome();
        return NextResponse.json({ message: "주요 업데이트를 삭제했습니다." });
    } catch (error) {
        return handleError(error);
    }
}

async function authorizeAdministrator(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");

    let decoded: AdministratorTokenPayload;
    try {
        decoded = jwt.verify(authHeader.slice(7), JWT_SECRET) as AdministratorTokenPayload;
    } catch {
        throw new Error("UNAUTHORIZED");
    }
    if (!decoded.isAdministrator) throw new Error("FORBIDDEN");

    const sessionSnapshot = await adminDB.collection("sessions").doc(decoded.sessionId).get();
    const session = sessionSnapshot.data();
    if (!sessionSnapshot.exists || session?.revoked || session?.userId !== decoded.id) {
        throw new Error("UNAUTHORIZED");
    }
}

async function readItems(): Promise<StoredMajorUpdate[]> {
    const snapshot = await adminDB.collection(CONTENT_COLLECTION).doc(CONTENT_DOCUMENT).get();
    if (!snapshot.exists) return [];
    const items = snapshot.data()?.items;
    if (!Array.isArray(items)) return [];

    const normalizedItems = items
        .map(normalizeItem)
        .filter((item): item is StoredMajorUpdate => item !== null);
    return Promise.all(normalizedItems.map(refreshUrl));
}

async function mutateItems(mutator: (items: StoredMajorUpdate[]) => StoredMajorUpdate[]) {
    const docRef = adminDB.collection(CONTENT_COLLECTION).doc(CONTENT_DOCUMENT);
    await adminDB.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(docRef);
        const rawItems: unknown[] = snapshot.exists && Array.isArray(snapshot.data()?.items) ? snapshot.data()?.items as unknown[] : [];
        const items = rawItems.map(normalizeItem).filter((item): item is StoredMajorUpdate => item !== null);
        transaction.set(docRef, {
            items: mutator(items),
            updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });
    });
}

function normalizeItem(value: unknown): StoredMajorUpdate | null {
    if (!value || typeof value !== "object") return null;
    const item = value as Record<string, unknown>;
    const id = getString(item.id);
    const url = getString(item.url);
    const title = getString(item.title);
    const sub = getString(item.sub);
    const color = getString(item.color);
    const storagePath = getString(item.storagePath);
    if (!id || !url || !title || !sub || !color || !storagePath) return null;
    return {
        id,
        url,
        title,
        sub,
        color,
        isBlack: item.isBlack === true,
        storagePath
    };
}

function parseFormData(formData: FormData): Omit<StoredMajorUpdate, "id" | "url" | "storagePath"> {
    const title = getString(formData.get("title"));
    const sub = getString(formData.get("sub"));
    const color = getString(formData.get("color"));
    const isBlack = getString(formData.get("isBlack")) === "true";
    if (!title || title.length > 120 || !sub || sub.length > 40 || !/^#[0-9A-Fa-f]{6}$/.test(color)) {
        throw new Error("INVALID_FIELDS");
    }
    return { title, sub, color, isBlack };
}

function getUploadedFile(value: FormDataEntryValue | null): File | null {
    return value instanceof File && value.size > 0 ? value : null;
}

async function uploadImage(file: File, id: string): Promise<Pick<StoredMajorUpdate, "url" | "storagePath">> {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) throw new Error("INVALID_IMAGE_TYPE");
    if (file.size >= MAX_IMAGE_SIZE) throw new Error("IMAGE_TOO_LARGE");

    const buffer = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(buffer).metadata();
    if (metadata.width !== 1200 || metadata.height !== 400) throw new Error("INVALID_IMAGE_DIMENSIONS");

    const extension = file.type === "image/jpeg" ? "jpg" : file.type.replace("image/", "");
    const storagePath = `home-updates/${id}-${randomUUID()}.${extension}`;
    const storageFile = adminStorage.bucket().file(storagePath);
    await storageFile.save(buffer, {
        resumable: false,
        metadata: {
            contentType: file.type,
            cacheControl: "public,max-age=31536000,immutable"
        }
    });
    const [url] = await storageFile.getSignedUrl({ version: "v4", action: "read", expires: Date.now() + SIGNED_URL_TTL_MS });

    return {
        storagePath,
        url
    };
}

async function refreshUrl(item: StoredMajorUpdate): Promise<StoredMajorUpdate> {
    const [url] = await adminStorage.bucket().file(item.storagePath).getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + SIGNED_URL_TTL_MS
    });
    return { ...item, url };
}

async function deleteImage(storagePath: string) {
    if (!storagePath) return;
    try {
        await adminStorage.bucket().file(storagePath).delete({ ignoreNotFound: true });
    } catch (error) {
        console.error("Failed to delete major update image", error);
    }
}

function moveItem(items: StoredMajorUpdate[], from: number, to: number) {
    if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < 0 || from >= items.length || to >= items.length) {
        throw new Error("INVALID_ORDER");
    }
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
}

function revalidateHome() {
    revalidateTag(CACHE_TAG);
    revalidatePath("/");
}

function getString(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function handleError(error: unknown) {
    const message = error instanceof Error ? error.message : "";
    const responseMap: Record<string, { error: string, status: number }> = {
        UNAUTHORIZED: { error: "로그인 정보가 유효하지 않습니다.", status: 401 },
        FORBIDDEN: { error: "관리자 권한이 필요합니다.", status: 403 },
        ID_REQUIRED: { error: "업데이트 ID가 필요합니다.", status: 400 },
        IMAGE_REQUIRED: { error: "이미지를 선택해주세요.", status: 400 },
        INVALID_IMAGE_TYPE: { error: "WebP, PNG, JPEG 이미지만 업로드할 수 있습니다.", status: 400 },
        IMAGE_TOO_LARGE: { error: "이미지 용량은 1MB 미만이어야 합니다.", status: 400 },
        INVALID_IMAGE_DIMENSIONS: { error: "이미지 크기는 반드시 1200 × 400px이어야 합니다.", status: 400 },
        INVALID_FIELDS: { error: "타이틀, 분류 문구, 배경색을 확인해주세요.", status: 400 },
        INVALID_ORDER: { error: "올바른 순서 정보가 아닙니다.", status: 400 },
        INVALID_REQUEST: { error: "올바르지 않은 요청입니다.", status: 400 },
        NOT_FOUND: { error: "주요 업데이트를 찾을 수 없습니다.", status: 404 }
    };
    const response = responseMap[message];
    if (response) return NextResponse.json({ error: response.error }, { status: response.status });
    console.error(error);
    return NextResponse.json({ error: "주요 업데이트를 처리하는 중 오류가 발생했습니다." }, { status: 500 });
}
