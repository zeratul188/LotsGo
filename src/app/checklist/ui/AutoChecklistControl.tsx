'use client'

import {
    addToast,
    Button,
    Chip,
    Divider,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Progress,
    Select,
    SelectItem,
    useDisclosure
} from '@heroui/react';
import { useEffect, useRef, useState } from 'react';
import type Tesseract from 'tesseract.js';
import type { Boss } from '../../api/checklist/boss/route';
import { checkWeek, type CheckCharacter, type Checklist } from '../../store/checklistSlice';
import type { AppDispatch } from '../../store/store';
import { getBosses, handleAutoRaidCheck } from '../lib/checklistFeat';
import { findBossByRecognitionText, findRaidCompletion } from '../lib/autoChecklistRecognition';

type AutoChecklistControlProps = {
    checklist: CheckCharacter[],
    bosses: Boss[],
    dispatch: AppDispatch,
    isDisabled: boolean
}

type CaptureStatus = 'idle' | 'requesting' | 'loading-ocr' | 'active' | 'stopped' | 'error';
type OcrWorker = Tesseract.Worker;
type FrameTrackProcessor = {
    readable: ReadableStream<VideoFrame>
}
type FrameTrackProcessorConstructor = new (options: {
    track: MediaStreamTrack,
    maxBufferSize?: number
}) => FrameTrackProcessor;

const PROGRESS_ANALYSIS_INTERVAL = 500;
const OCR_ANALYSIS_INTERVAL = 1400;
const PROGRESS_CONFIRMATIONS = 3;
const COMPLETION_CONFIRMATIONS = 2;
const RAID_CONTEXT_TIMEOUT = 30 * 1000;
const OCR_ANALYSIS_TIMEOUT = 20 * 1000;
const FRAME_FRESHNESS_TIMEOUT = 5 * 1000;
const FRAME_SIGNATURE_WIDTH = 32;
const FRAME_SIGNATURE_HEIGHT = 18;

function getFrameSignature(context: CanvasRenderingContext2D): number {
    const pixels = context.getImageData(0, 0, FRAME_SIGNATURE_WIDTH, FRAME_SIGNATURE_HEIGHT).data;
    let hash = 2166136261;
    for (let index = 0; index < pixels.length; index += 4) {
        const brightness = ((pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3) >> 4;
        hash ^= brightness;
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function countRaidProgressChecks(context: CanvasRenderingContext2D, width: number, height: number): number {
    const pixels = context.getImageData(0, 0, width, height).data;
    const mask = new Uint8Array(width * height);
    for (let pixelIndex = 0; pixelIndex < mask.length; pixelIndex++) {
        const dataIndex = pixelIndex * 4;
        const red = pixels[dataIndex];
        const green = pixels[dataIndex + 1];
        const blue = pixels[dataIndex + 2];
        if (green >= 130
            && green >= red * 1.5
            && green >= blue * 1.15
            && green - red >= 55) {
            mask[pixelIndex] = 1;
        }
    }

    const checkCenters: { x: number, y: number }[] = [];
    const stack: number[] = [];
    for (let pixelIndex = 0; pixelIndex < mask.length; pixelIndex++) {
        if (!mask[pixelIndex]) continue;

        mask[pixelIndex] = 0;
        stack.push(pixelIndex);
        let area = 0;
        let minX = width;
        let minY = height;
        let maxX = 0;
        let maxY = 0;

        while (stack.length > 0) {
            const currentIndex = stack.pop()!;
            const x = currentIndex % width;
            const y = Math.floor(currentIndex / width);
            area += 1;
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);

            for (let offsetY = -1; offsetY <= 1; offsetY++) {
                for (let offsetX = -1; offsetX <= 1; offsetX++) {
                    if (offsetX === 0 && offsetY === 0) continue;
                    const nextX = x + offsetX;
                    const nextY = y + offsetY;
                    if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) continue;
                    const nextIndex = nextY * width + nextX;
                    if (!mask[nextIndex]) continue;
                    mask[nextIndex] = 0;
                    stack.push(nextIndex);
                }
            }
        }

        const componentWidth = maxX - minX + 1;
        const componentHeight = maxY - minY + 1;
        const aspectRatio = componentWidth / componentHeight;
        const fillRatio = area / (componentWidth * componentHeight);
        const isCheckShape = area >= 35
            && area <= 900
            && componentWidth >= 10
            && componentWidth <= 70
            && componentHeight >= 8
            && componentHeight <= 60
            && aspectRatio >= 0.65
            && aspectRatio <= 1.9
            && fillRatio >= 0.08
            && fillRatio <= 0.55
            && minY >= height * 0.20
            && maxY <= height * 0.82;
        if (isCheckShape) {
            checkCenters.push({ x: (minX + maxX) / 2, y: (minY + maxY) / 2 });
        }
    }

    checkCenters.sort((a, b) => a.x - b.x);
    let maximumSequence = 0;
    for (const start of checkCenters) {
        if (start.x > width * 0.28) break;

        let sequence = 1;
        let current = start;
        while (true) {
            const next = checkCenters.find((candidate) => {
                const horizontalGap = candidate.x - current.x;
                return horizontalGap >= width * 0.04
                    && horizontalGap <= width * 0.22
                    && Math.abs(candidate.y - current.y) <= height * 0.05;
            });
            if (!next) break;
            sequence += 1;
            current = next;
        }
        maximumSequence = Math.max(maximumSequence, sequence);
    }

    return maximumSequence;
}

export default function AutoChecklistControl({ checklist, bosses, dispatch, isDisabled }: AutoChecklistControlProps) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedNickname, setSelectedNickname] = useState('');
    const [status, setStatus] = useState<CaptureStatus>('idle');
    const [statusMessage, setStatusMessage] = useState('캐릭터를 선택하고 화면 공유를 시작하세요.');
    const [ocrProgress, setOcrProgress] = useState(0);
    const [recognizedText, setRecognizedText] = useState('');
    const [completionOcrText, setCompletionOcrText] = useState('');
    const [lastOcrAt, setLastOcrAt] = useState('');
    const [currentBoss, setCurrentBoss] = useState<Boss | null>(null);
    const [lastCompletion, setLastCompletion] = useState('');
    const [lastResult, setLastResult] = useState('아직 자동 체크된 관문이 없습니다.');
    const [recognitionNameCount, setRecognitionNameCount] = useState(0);
    const [detectedProgressCount, setDetectedProgressCount] = useState(0);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const progressCanvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const workerRef = useRef<OcrWorker | null>(null);
    const frameWorkerRef = useRef<Worker | null>(null);
    const frameProcessorRef = useRef<FrameTrackProcessor | null>(null);
    const frameProcessorTrackRef = useRef<MediaStreamTrack | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isAnalyzingRef = useRef(false);
    const lastOcrAnalysisAtRef = useRef(0);
    const analysisStartedAtRef = useRef(0);
    const analyzingWorkerRef = useRef<OcrWorker | null>(null);
    const isRecoveringOcrRef = useRef(false);
    const checklistRef = useRef(checklist);
    const bossesRef = useRef(bosses);
    const selectedNicknameRef = useRef(selectedNickname);
    const currentBossRef = useRef<Boss | null>(null);
    const raidCandidateRef = useRef<{ id: string, count: number } | null>(null);
    const completionCandidateRef = useRef<{ key: string, count: number } | null>(null);
    const processedEventsRef = useRef(new Set<string>());
    const raidRefreshCountRef = useRef(0);
    const progressCandidateRef = useRef<{ bossId: string, count: number, confirmations: number } | null>(null);
    const lastProgressCountRef = useRef(0);
    const progressSaveQueueRef = useRef(Promise.resolve());
    const progressRetryAtRef = useRef(0);
    const captureSessionRef = useRef(0);
    const lastRaidSeenAtRef = useRef(0);
    const lastFrameSignatureRef = useRef<number | null>(null);
    const lastFrameChangedAtRef = useRef(0);

    useEffect(() => {
        checklistRef.current = checklist;
    }, [checklist]);

    useEffect(() => {
        bossesRef.current = bosses;
        setRecognitionNameCount(bosses.reduce((count, boss) => count + (boss.screenNames?.length ?? 0), 0));
    }, [bosses]);

    useEffect(() => {
        selectedNicknameRef.current = selectedNickname;
    }, [selectedNickname]);

    useEffect(() => () => {
        if (timerRef.current) clearInterval(timerRef.current);
        frameWorkerRef.current?.postMessage({ type: 'stop' });
        frameWorkerRef.current?.terminate();
        frameProcessorTrackRef.current?.stop();
        streamRef.current?.getTracks().forEach((track) => track.stop());
        void workerRef.current?.terminate();
    }, []);

    const resetDetectionState = () => {
        setRecognizedText('');
        setCompletionOcrText('');
        setLastOcrAt('');
        setCurrentBoss(null);
        setLastCompletion('');
        setLastResult('아직 자동 체크된 관문이 없습니다.');
        setDetectedProgressCount(0);
        currentBossRef.current = null;
        raidCandidateRef.current = null;
        completionCandidateRef.current = null;
        processedEventsRef.current.clear();
        raidRefreshCountRef.current = 0;
        progressCandidateRef.current = null;
        lastProgressCountRef.current = 0;
        progressRetryAtRef.current = 0;
        lastRaidSeenAtRef.current = 0;
        lastFrameSignatureRef.current = null;
        lastFrameChangedAtRef.current = 0;
        lastOcrAnalysisAtRef.current = 0;
    };

    const clearCurrentRaidContext = () => {
        currentBossRef.current = null;
        raidCandidateRef.current = null;
        completionCandidateRef.current = null;
        raidRefreshCountRef.current = 0;
        progressCandidateRef.current = null;
        lastProgressCountRef.current = 0;
        progressRetryAtRef.current = 0;
        setDetectedProgressCount(0);
        setCurrentBoss(null);
        setLastCompletion('');
    };

    const clearExpiredRaidContext = () => {
        if (!document.hasFocus()
            || !currentBossRef.current
            || Date.now() - lastRaidSeenAtRef.current <= RAID_CONTEXT_TIMEOUT) return;

        clearCurrentRaidContext();
        setLastResult('레이드 화면이 더 이상 감지되지 않아 화면 공유 대기 상태로 전환했습니다.');
    };

    const stopCapture = (message = '화면 공유가 중지되었습니다.') => {
        captureSessionRef.current += 1;
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        frameWorkerRef.current?.postMessage({ type: 'stop' });
        frameWorkerRef.current?.terminate();
        frameWorkerRef.current = null;
        frameProcessorTrackRef.current?.stop();
        frameProcessorTrackRef.current = null;
        frameProcessorRef.current = null;
        streamRef.current?.getTracks().forEach((track) => {
            track.onended = null;
            track.stop();
        });
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
        void workerRef.current?.terminate();
        workerRef.current = null;
        isAnalyzingRef.current = false;
        analysisStartedAtRef.current = 0;
        analyzingWorkerRef.current = null;
        isRecoveringOcrRef.current = false;
        setStatus('stopped');
        setStatusMessage(message);
        setOcrProgress(0);
    };

    const applyRecognitionResult = async (text: string, target: 'raid' | 'completion') => {
        const compactText = text.replace(/\s+/g, ' ').trim().slice(0, 240);

        if (target === 'raid') {
            setRecognizedText(compactText || '인식된 텍스트 없음');
            setLastOcrAt(new Date().toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }));
            const detectedBoss = findBossByRecognitionText(text, bossesRef.current);
            if (detectedBoss) {
                if (Date.now() - lastFrameChangedAtRef.current > FRAME_FRESHNESS_TIMEOUT) {
                    raidCandidateRef.current = null;
                    return;
                }
                if (currentBossRef.current && currentBossRef.current.id !== detectedBoss.id) {
                    clearCurrentRaidContext();
                }
                if (raidCandidateRef.current?.id === detectedBoss.id) {
                    raidCandidateRef.current.count += 1;
                } else {
                    raidCandidateRef.current = { id: detectedBoss.id, count: 1 };
                }
                if (raidCandidateRef.current.count >= 2) {
                    currentBossRef.current = detectedBoss;
                    setCurrentBoss(detectedBoss);
                    lastRaidSeenAtRef.current = Date.now();
                }
            } else if (compactText && !currentBossRef.current) {
                const registeredCount = bossesRef.current.reduce((count, boss) => count + (boss.screenNames?.length ?? 0), 0);
                setLastResult(registeredCount > 0
                    ? `레이드 문구를 읽었지만 등록된 화면 인식 이름 ${registeredCount}개와 일치하지 않습니다.`
                    : '불러온 게임 화면 표시 이름이 없습니다. 관리자 등록 데이터와 연결되지 않았습니다.');
            }
            return;
        }

        setCompletionOcrText(compactText || '인식된 텍스트 없음');
        const completion = findRaidCompletion(text);
        if (!completion) {
            completionCandidateRef.current = null;
            return;
        }

        setLastCompletion(completion.label);
        const boss = currentBossRef.current;
        if (!boss) {
            setLastResult('완료 문구는 감지했지만 레이드 이름을 확인하지 못했습니다.');
            return;
        }
        lastRaidSeenAtRef.current = Date.now();

        const eventKey = `${boss.id}:${completion.type}:${completion.stage ?? 'all'}`;
        if (completionCandidateRef.current?.key === eventKey) {
            completionCandidateRef.current.count += 1;
        } else {
            completionCandidateRef.current = { key: eventKey, count: 1 };
        }
        if ((completionCandidateRef.current?.count ?? 0) < COMPLETION_CONFIRMATIONS) return;
        if (processedEventsRef.current.has(eventKey)) return;

        processedEventsRef.current.add(eventKey);
        try {
            const result = await handleAutoRaidCheck(
                checklistRef.current,
                selectedNicknameRef.current,
                boss.id,
                completion.type,
                completion.stage,
                dispatch
            );
            const message = result.changed
                ? `${result.contentName} ${completion.label} 자동 체크 완료`
                : `${result.contentName} ${completion.label}은 이미 완료되어 있습니다.`;
            setLastResult(message);
            if (completion.type === 'all') clearCurrentRaidContext();
            addToast({
                title: result.changed ? '자동 체크 완료' : '이미 완료된 관문',
                description: message,
                color: result.changed ? 'success' : 'default'
            });
        } catch (error) {
            processedEventsRef.current.delete(eventKey);
            const message = error instanceof Error ? error.message : '자동 체크 저장에 실패했습니다.';
            setLastResult(message);
            addToast({ title: '자동 체크 실패', description: message, color: 'danger' });
        }
    };

    const replaceLocalChecklistItem = (nickname: string, bossName: string, checklistItem: Checklist, shouldDispatch = true) => {
        const characterIndex = checklistRef.current.findIndex((character) => character.nickname === nickname);
        const checklistIndex = characterIndex === -1
            ? -1
            : checklistRef.current[characterIndex].checklist.findIndex((item) => item.name === bossName);
        if (characterIndex === -1 || checklistIndex === -1) return;

        checklistRef.current = checklistRef.current.map((character, currentCharacterIndex) => currentCharacterIndex === characterIndex
            ? {
                ...character,
                checklist: character.checklist.map((item, currentChecklistIndex) => currentChecklistIndex === checklistIndex
                    ? checklistItem
                    : item)
            }
            : character);
        if (shouldDispatch) {
            dispatch(checkWeek({ characterIndex, checklistIndex, checklist: checklistItem }));
        }
    };

    const applyOptimisticStageCheck = (boss: Boss, stage: number): Checklist | null => {
        const nickname = selectedNicknameRef.current;
        const character = checklistRef.current.find((item) => item.nickname === nickname);
        const raidChecklist = character?.checklist.find((item) => item.name === boss.name);
        if (!raidChecklist) return null;

        let changed = false;
        const optimisticChecklist: Checklist = {
            ...raidChecklist,
            items: raidChecklist.items.map((item) => {
                if (item.stage !== stage || item.isDisable || item.isCheck) return item;
                changed = true;
                return { ...item, isCheck: true };
            })
        };
        if (!changed) return null;

        replaceLocalChecklistItem(nickname, boss.name, optimisticChecklist);
        return raidChecklist;
    };

    const enqueueProgressStageChecks = (boss: Boss, completedStageCount: number) => {
        const firstStage = lastProgressCountRef.current + 1;
        if (completedStageCount < firstStage) return;

        lastProgressCountRef.current = completedStageCount;
        setDetectedProgressCount(completedStageCount);
        progressSaveQueueRef.current = progressSaveQueueRef.current.then(async () => {
            for (let stage = firstStage; stage <= completedStageCount; stage++) {
                const eventKey = `${boss.id}:stage:${stage}`;
                if (processedEventsRef.current.has(eventKey)) continue;

                processedEventsRef.current.add(eventKey);
                const previousChecklist = applyOptimisticStageCheck(boss, stage);
                try {
                    const result = await handleAutoRaidCheck(
                        checklistRef.current,
                        selectedNicknameRef.current,
                        boss.id,
                        'stage',
                        stage,
                        dispatch
                    );
                    replaceLocalChecklistItem(result.nickname, result.contentName, result.checklistItem, false);
                    const message = result.changed
                        ? `${result.contentName} ${stage}관문 진행도 자동 체크 완료`
                        : `${result.contentName} ${stage}관문은 이미 완료되어 있습니다.`;
                    setLastCompletion(`${stage}관문 진행도 완료`);
                    setLastResult(message);
                    lastRaidSeenAtRef.current = Date.now();
                    addToast({
                        title: result.changed ? '관문 진행도 자동 체크 완료' : '이미 완료된 관문',
                        description: message,
                        color: result.changed ? 'success' : 'default'
                    });
                } catch (error) {
                    if (previousChecklist) {
                        replaceLocalChecklistItem(selectedNicknameRef.current, boss.name, previousChecklist);
                    }
                    processedEventsRef.current.delete(eventKey);
                    lastProgressCountRef.current = Math.min(lastProgressCountRef.current, stage - 1);
                    progressRetryAtRef.current = Date.now() + 10_000;
                    setDetectedProgressCount(lastProgressCountRef.current);
                    const message = error instanceof Error ? error.message : '관문 진행도 저장에 실패했습니다.';
                    setLastResult(message);
                    addToast({ title: '관문 진행도 저장 실패', description: message, color: 'danger' });
                    break;
                }
            }
        });
    };

    const inspectRaidProgress = (source: CanvasImageSource, sourceWidth: number, sourceHeight: number) => {
        const boss = currentBossRef.current;
        const progressCanvas = progressCanvasRef.current;
        if (!boss
            || !progressCanvas
            || sourceWidth === 0
            || sourceHeight === 0
            || Date.now() < progressRetryAtRef.current) return;

        const context = progressCanvas.getContext('2d', { willReadFrequently: true });
        if (!context) return;
        progressCanvas.width = 480;
        progressCanvas.height = 320;
        context.filter = 'none';
        context.drawImage(
            source,
            0,
            0,
            sourceWidth * 0.22,
            sourceHeight * 0.32,
            0,
            0,
            progressCanvas.width,
            progressCanvas.height
        );

        const detectedCount = countRaidProgressChecks(context, progressCanvas.width, progressCanvas.height);
        const character = checklistRef.current.find((item) => item.nickname === selectedNicknameRef.current);
        const raidChecklist = character?.checklist.find((item) => item.name === boss.name);
        const maximumStage = raidChecklist?.items.reduce((maximum, item) => Math.max(maximum, item.stage), 0) ?? 0;
        const completedStageCount = maximumStage > 0 ? Math.min(detectedCount, maximumStage) : detectedCount;
        if (completedStageCount <= lastProgressCountRef.current) {
            progressCandidateRef.current = null;
            return;
        }

        const candidate = progressCandidateRef.current;
        if (candidate?.bossId === boss.id && candidate.count === completedStageCount) {
            candidate.confirmations += 1;
        } else {
            progressCandidateRef.current = { bossId: boss.id, count: completedStageCount, confirmations: 1 };
        }

        if ((progressCandidateRef.current?.confirmations ?? 0) < PROGRESS_CONFIRMATIONS) return;
        progressCandidateRef.current = null;
        enqueueProgressStageChecks(boss, completedStageCount);
    };

    const createOcrWorker = async (): Promise<OcrWorker> => {
        const { createWorker, OEM } = await import('tesseract.js');
        const worker = await createWorker(['kor', 'eng'], OEM.LSTM_ONLY, {
            logger: (message) => {
                if (typeof message.progress === 'number') setOcrProgress(Math.round(message.progress * 100));
            }
        });
        await worker.setParameters({
            preserve_interword_spaces: '1',
            debug_file: '/dev/null'
        });
        return worker;
    };

    const recoverOcrWorker = async () => {
        if (isRecoveringOcrRef.current || !streamRef.current?.active) return;

        const captureSession = captureSessionRef.current;
        const stalledWorker = workerRef.current;
        isRecoveringOcrRef.current = true;
        workerRef.current = null;
        analyzingWorkerRef.current = null;
        isAnalyzingRef.current = false;
        analysisStartedAtRef.current = 0;
        setStatusMessage('OCR 응답이 지연되어 화면 인식기를 자동으로 다시 준비하고 있습니다.');

        try {
            void stalledWorker?.terminate();
            const replacementWorker = await createOcrWorker();
            if (captureSessionRef.current !== captureSession || !streamRef.current?.active) {
                await replacementWorker.terminate();
                return;
            }
            workerRef.current = replacementWorker;
            setStatusMessage('화면 인식기가 복구되어 계속 분석하고 있습니다.');
        } catch (error) {
            const message = error instanceof Error ? error.message : '화면 인식기를 다시 준비하지 못했습니다.';
            setStatusMessage(message);
        } finally {
            isRecoveringOcrRef.current = false;
        }
    };

    const analyzeFrameSource = async (source: CanvasImageSource, sourceWidth: number, sourceHeight: number) => {
        clearExpiredRaidContext();
        // 전체 화면 공유 중 로츠고에 다시 포커스하면, 화면에 표시된 레이드 상태를
        // 게임의 레이드명으로 재인식할 수 있으므로 게임 창으로 돌아갈 때까지 OCR을 멈춘다.
        if (document.hasFocus()) return;
        inspectRaidProgress(source, sourceWidth, sourceHeight);
        const now = Date.now();
        if (now - lastOcrAnalysisAtRef.current < OCR_ANALYSIS_INTERVAL) return;
        const canvas = canvasRef.current;
        if (!canvas || sourceWidth === 0 || sourceHeight === 0 || isRecoveringOcrRef.current) return;
        if (isAnalyzingRef.current) {
            if (Date.now() - analysisStartedAtRef.current > OCR_ANALYSIS_TIMEOUT) void recoverOcrWorker();
            return;
        }

        const worker = workerRef.current;
        if (!worker) {
            void recoverOcrWorker();
            return;
        }

        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) return;

        canvas.width = FRAME_SIGNATURE_WIDTH;
        canvas.height = FRAME_SIGNATURE_HEIGHT;
        context.filter = 'none';
        context.drawImage(source, 0, 0, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
        const frameSignature = getFrameSignature(context);
        if (lastFrameSignatureRef.current !== frameSignature) {
            lastFrameSignatureRef.current = frameSignature;
            lastFrameChangedAtRef.current = Date.now();
        }

        isAnalyzingRef.current = true;
        lastOcrAnalysisAtRef.current = now;
        analysisStartedAtRef.current = Date.now();
        analyzingWorkerRef.current = worker;
        try {
            if (currentBossRef.current) {
                canvas.width = 1600;
                canvas.height = 700;
                context.filter = 'grayscale(1) contrast(2)';
                context.drawImage(
                    source,
                    sourceWidth * 0.25,
                    sourceHeight * 0.35,
                    sourceWidth * 0.50,
                    sourceHeight * 0.35,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );
                await worker.setParameters({ tessedit_pageseg_mode: '11' as Tesseract.PSM });
                const completionResult = await worker.recognize(canvas);
                const completion = findRaidCompletion(completionResult.data.text);
                void applyRecognitionResult(completionResult.data.text, 'completion');
                raidRefreshCountRef.current += 1;
                if (completion?.type === 'all' || raidRefreshCountRef.current % 5 !== 0) return;
            }

            canvas.width = 1600;
            canvas.height = 500;
            context.filter = 'none';
            context.drawImage(
                source,
                0,
                sourceHeight * 0.015,
                sourceWidth * 0.20,
                sourceHeight * 0.14,
                0,
                0,
                canvas.width,
                canvas.height
            );
            await worker.setParameters({ tessedit_pageseg_mode: '6' as Tesseract.PSM });
            const raidResult = await worker.recognize(canvas);
            await applyRecognitionResult(raidResult.data.text, 'raid');
        } catch (error) {
            if (workerRef.current === worker) {
                const message = error instanceof Error ? error.message : '화면 분석 중 오류가 발생했습니다.';
                setStatusMessage(message);
            }
        } finally {
            if (analyzingWorkerRef.current === worker) {
                analyzingWorkerRef.current = null;
                isAnalyzingRef.current = false;
                analysisStartedAtRef.current = 0;
            }
        }
    };

    const analyzeCurrentFrame = async () => {
        const video = videoRef.current;
        if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) return;
        await analyzeFrameSource(video, video.videoWidth, video.videoHeight);
    };

    const startTimerFallback = () => {
        if (timerRef.current) return;
        frameProcessorTrackRef.current?.stop();
        frameProcessorTrackRef.current = null;
        frameProcessorRef.current = null;
        setStatusMessage('브라우저 호환 모드로 화면을 분석하고 있습니다. 브라우저 탭을 화면에 유지해 주세요.');
        timerRef.current = setInterval(() => void analyzeCurrentFrame(), PROGRESS_ANALYSIS_INTERVAL);
        void analyzeCurrentFrame();
    };

    const startFrameDrivenAnalysis = (
        track: MediaStreamTrack,
        captureSession: number,
        useDirectTrackTransfer = false
    ) => {
        let frameWorker: Worker;
        let isUsingMainThreadProcessor = false;
        try {
            frameWorker = new Worker('/workers/autoChecklistFrameWorker.js?v=background-progress-2');
            frameWorkerRef.current = frameWorker;
        } catch {
            startTimerFallback();
            return;
        }

        frameWorker.onmessage = (event: MessageEvent<{
            type: 'ready' | 'frame' | 'progress' | 'heartbeat' | 'stalled' | 'unsupported' | 'error',
            bitmap?: ImageBitmap,
            width?: number,
            height?: number,
            frameAge?: number,
            count?: number
        }>) => {
            const { type, bitmap, width, height, count } = event.data;
            if (captureSessionRef.current !== captureSession) {
                bitmap?.close();
                return;
            }

            if (type === 'ready') {
                setStatusMessage('화면 공유 프레임을 계속 분석하고 있습니다. 로스트아크를 플레이해도 됩니다.');
                return;
            }

            if (type === 'frame' && bitmap && width && height) {
                void analyzeFrameSource(bitmap, width, height).finally(() => bitmap.close());
                return;
            }

            if (type === 'progress' && typeof count === 'number') {
                const boss = currentBossRef.current;
                if (!boss || count <= lastProgressCountRef.current || Date.now() < progressRetryAtRef.current) return;
                const character = checklistRef.current.find((item) => item.nickname === selectedNicknameRef.current);
                const raidChecklist = character?.checklist.find((item) => item.name === boss.name);
                const maximumStage = raidChecklist?.items.reduce((maximum, item) => Math.max(maximum, item.stage), 0) ?? 0;
                const completedStageCount = maximumStage > 0 ? Math.min(count, maximumStage) : count;
                if (completedStageCount > lastProgressCountRef.current) {
                    enqueueProgressStageChecks(boss, completedStageCount);
                }
                return;
            }

            if (type === 'heartbeat') {
                clearExpiredRaidContext();
                if (isAnalyzingRef.current
                    && Date.now() - analysisStartedAtRef.current > OCR_ANALYSIS_TIMEOUT) {
                    void recoverOcrWorker();
                }
                return;
            }

            if (type === 'stalled') {
                frameWorker.terminate();
                if (frameWorkerRef.current === frameWorker) frameWorkerRef.current = null;
                frameProcessorTrackRef.current?.stop();
                frameProcessorTrackRef.current = null;
                frameProcessorRef.current = null;
                if (track.readyState === 'live') startFrameDrivenAnalysis(track, captureSession);
                return;
            }

            frameWorker.terminate();
            if (frameWorkerRef.current === frameWorker) frameWorkerRef.current = null;
            frameProcessorTrackRef.current?.stop();
            frameProcessorTrackRef.current = null;
            frameProcessorRef.current = null;
            if (isUsingMainThreadProcessor && track.readyState === 'live') {
                startFrameDrivenAnalysis(track, captureSession, true);
            } else {
                startTimerFallback();
            }
        };

        frameWorker.onerror = () => {
            if (captureSessionRef.current !== captureSession) return;
            frameWorker.terminate();
            if (frameWorkerRef.current === frameWorker) frameWorkerRef.current = null;
            frameProcessorTrackRef.current?.stop();
            frameProcessorTrackRef.current = null;
            frameProcessorRef.current = null;
            if (isUsingMainThreadProcessor && track.readyState === 'live') {
                startFrameDrivenAnalysis(track, captureSession, true);
            } else {
                startTimerFallback();
            }
        };

        if (!useDirectTrackTransfer) {
            const processorConstructor = (window as typeof window & {
                MediaStreamTrackProcessor?: FrameTrackProcessorConstructor
            }).MediaStreamTrackProcessor;
            if (processorConstructor) {
                const processorTrack = track.clone();
                try {
                    const processor = new processorConstructor({ track: processorTrack, maxBufferSize: 1 });
                    isUsingMainThreadProcessor = true;
                    frameProcessorRef.current = processor;
                    frameProcessorTrackRef.current = processorTrack;
                    frameWorker.postMessage({
                        type: 'start-stream',
                        readable: processor.readable,
                        interval: PROGRESS_ANALYSIS_INTERVAL
                    }, [processor.readable as unknown as Transferable]);
                    return;
                } catch {
                    processorTrack.stop();
                    frameProcessorRef.current = null;
                    frameProcessorTrackRef.current = null;
                    isUsingMainThreadProcessor = false;
                }
            }
        }

        const analysisTrack = track.clone();
        try {
            frameWorker.postMessage({
                type: 'start',
                track: analysisTrack,
                interval: PROGRESS_ANALYSIS_INTERVAL
            }, [analysisTrack]);
        } catch {
            analysisTrack.stop();
            frameWorker.terminate();
            frameWorkerRef.current = null;
            startTimerFallback();
        }
    };

    const startCapture = async () => {
        if (!selectedNickname || !navigator.mediaDevices?.getDisplayMedia) return;
        const captureSession = captureSessionRef.current + 1;
        captureSessionRef.current = captureSession;
        resetDetectionState();
        setStatus('requesting');
        setStatusMessage('공유할 로스트아크 게임 창을 선택하세요.');

        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { frameRate: { ideal: 8, max: 12 } },
                audio: false
            });
            streamRef.current = stream;
            const track = stream.getVideoTracks()[0];
            track.onended = () => stopCapture('브라우저에서 화면 공유가 종료되었습니다.');

            if (!videoRef.current) throw new Error('화면 분석기를 초기화하지 못했습니다.');
            videoRef.current.srcObject = stream;
            await videoRef.current.play();

            setStatus('loading-ocr');
            setStatusMessage('최신 레이드 인식 이름과 한글 화면 인식 모델을 준비하고 있습니다.');
            try {
                const latestBosses = await getBosses();
                bossesRef.current = latestBosses;
                const latestRecognitionNameCount = latestBosses.reduce((count, boss) => count + (boss.screenNames?.length ?? 0), 0);
                setRecognitionNameCount(latestRecognitionNameCount);
                if (latestRecognitionNameCount === 0) {
                    setLastResult('Firebase에서 불러온 게임 화면 표시 이름이 없습니다.');
                }
            } catch {
                setLastResult('최신 게임 화면 표시 이름을 불러오지 못해 현재 페이지의 데이터를 사용합니다.');
            }
            const worker = await createOcrWorker();
            if (captureSessionRef.current !== captureSession || !streamRef.current?.active) {
                await worker.terminate();
                return;
            }
            workerRef.current = worker;

            setStatus('active');
            setStatusMessage('화면을 분석하고 있습니다. 로스트아크를 플레이해도 됩니다.');
            startFrameDrivenAnalysis(track, captureSession);
        } catch (error) {
            if (captureSessionRef.current !== captureSession) return;
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
            const isCancelled = error instanceof DOMException && error.name === 'NotAllowedError';
            const message = isCancelled
                ? '화면 공유가 취소되었거나 권한이 허용되지 않았습니다.'
                : error instanceof Error ? error.message : '화면 공유를 시작하지 못했습니다.';
            setStatus('error');
            setStatusMessage(message);
            addToast({ title: '자동 체크 시작 실패', description: message, color: 'danger' });
        }
    };

    const isRunning = status === 'requesting' || status === 'loading-ocr' || status === 'active';
    const isSharing = status === 'loading-ocr' || status === 'active';
    const statusColor = status === 'active' ? 'success' : status === 'error' ? 'danger' : 'default';

    return (
        <>
            <Button
                fullWidth
                radius="sm"
                color={status === 'active' ? 'success' : 'secondary'}
                variant="flat"
                size="sm"
                className="hidden h-9 border border-secondary/30 px-2 text-xs font-medium md960:flex sm:text-sm"
                isDisabled={isDisabled}
                onPress={onOpen}>
                {status === 'active' ? '자동 체크 작동 중 (Beta)' : '자동 체크 기능 켜기 (Beta)'}
            </Button>
            {isSharing ? (
                <div className="hidden min-w-0 items-center gap-2 rounded-lg border border-primary-200/80 bg-primary-50/80 px-3 py-2 text-sm text-primary-700 md960:col-span-4 md960:flex dark:border-primary-800/70 dark:bg-primary-950/30 dark:text-primary-300">
                    <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-danger"/>
                    <p className="min-w-0 truncate">
                        {currentBoss
                            ? `${selectedNickname} "${currentBoss.name}" 레이드 중...`
                            : `"${selectedNickname}" 화면 공유 중...`}
                    </p>
                </div>
            ) : null}
            <video ref={videoRef} className="hidden" muted playsInline/>
            <canvas ref={canvasRef} className="hidden"/>
            <canvas ref={progressCanvasRef} className="hidden"/>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size="xl"
                scrollBehavior="inside"
                isDismissable={!status || status !== 'requesting'}>
                <ModalContent className="border border-gray-200/80 dark:border-white/10">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 border-b border-gray-200/80 px-6 py-5 dark:border-white/10">
                                <div className="flex items-center gap-2">
                                    <span className="h-5 w-1 rounded-full bg-secondary"/>
                                    <p className="text-xl font-semibold">레이드 자동 체크 (Beta)</p>
                                </div>
                                <p className="pl-3 text-sm font-normal fadedtext">게임 화면에서 레이드 이름과 완료 문구를 인식합니다.</p>
                            </ModalHeader>
                            <ModalBody className="gap-5 px-6 py-5">
                                <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm">
                                    <p className="font-semibold text-warning-700 dark:text-warning-300">사용 전 확인해 주세요</p>
                                    <ul className="mt-2 list-disc space-y-1.5 pl-5 fadedtext">
                                        <li>Chrome 또는 Edge PC 환경에서 로스트아크 게임 창을 선택하세요.</li>
                                        <li className="font-medium text-warning-800 dark:text-warning-200">레이드명 아래 화살표를 눌러 관문 진행도 UI를 축소하면 초록색 체크 표시를 확인할 수 없어 자동 체크가 작동하지 않습니다. 진행도 UI를 펼친 상태로 유지해 주세요.</li>
                                        <li>게임 해상도·UI 배율, 컷신이나 로딩 화면, 브라우저의 백그라운드 절전 상태에 따라 인식이 늦어지거나 일부 관문이 누락될 수 있습니다.</li>
                                        <li>브라우저 또는 게임 창을 최소화하거나 화면 공유 영상을 사용할 수 없는 상태가 되면 인식이 중단될 수 있습니다.</li>
                                        <li>화면은 서버에 전송하거나 저장하지 않고 현재 브라우저에서만 분석합니다.</li>
                                        <li>화면 공유가 끝나면 자동 체크도 함께 중지됩니다.</li>
                                    </ul>
                                </div>

                                <div>
                                    <p className="mb-2 font-semibold">이용 방법</p>
                                    <ol className="list-decimal space-y-1 pl-5 text-sm fadedtext">
                                        <li>플레이할 캐릭터를 선택합니다.</li>
                                        <li>화면 공유 시작을 누르고 로스트아크 창을 선택합니다.</li>
                                        <li>레이드 완료 문구가 반복 인식되면 해당 관문이 자동 체크됩니다.</li>
                                    </ol>
                                </div>

                                <Select
                                    label="플레이할 캐릭터"
                                    labelPlacement="outside"
                                    placeholder="캐릭터를 선택하세요."
                                    selectedKeys={selectedNickname ? [selectedNickname] : []}
                                    isDisabled={isRunning}
                                    onSelectionChange={(keys) => setSelectedNickname(Array.from(keys)[0]?.toString() ?? '')}>
                                    {checklist.map((character) => (
                                        <SelectItem key={character.nickname} textValue={character.nickname}>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="font-medium">{character.nickname}</span>
                                                <span className="text-xs fadedtext">{character.job} · Lv.{character.level}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </Select>

                                <Divider/>
                                <div className="space-y-3 rounded-xl border border-gray-200/80 p-4 dark:border-white/10">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-semibold">감지 상태</p>
                                        <Chip size="sm" color={statusColor} variant="flat">
                                            {status === 'active' ? '작동 중' : status === 'loading-ocr' ? '인식 모델 준비 중' : status === 'requesting' ? '공유 선택 중' : status === 'error' ? '오류' : '중지됨'}
                                        </Chip>
                                    </div>
                                    <p className="text-sm fadedtext">{statusMessage}</p>
                                    {status === 'loading-ocr' ? <Progress size="sm" value={ocrProgress} color="secondary" aria-label="OCR 준비 진행률"/> : null}
                                    <div className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-2 text-sm">
                                        <span className="fadedtext">현재 레이드</span>
                                        <span>{currentBoss?.name ?? '감지되지 않음'}</span>
                                        <span className="fadedtext">최근 완료 문구</span>
                                        <span>{lastCompletion || '감지되지 않음'}</span>
                                        <span className="fadedtext">최근 완료 OCR</span>
                                        <span className="break-all">{completionOcrText || '분석 대기 중'}</span>
                                        <span className="fadedtext">진행도 완료 관문</span>
                                        <span>{detectedProgressCount}개 감지</span>
                                        <span className="fadedtext">인식 이름 데이터</span>
                                        <span>{recognitionNameCount}개 등록됨</span>
                                        <span className="fadedtext">처리 결과</span>
                                        <span>{lastResult}</span>
                                        <span className="fadedtext">최근 OCR{lastOcrAt ? ` (${lastOcrAt})` : ''}</span>
                                        <span className="break-all">{recognizedText || '분석 대기 중'}</span>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter className="border-t border-gray-200/80 px-6 py-4 dark:border-white/10">
                                <Button variant="light" onPress={onClose}>닫기</Button>
                                {isRunning ? (
                                    <Button color="danger" variant="flat" onPress={() => stopCapture()}>화면 공유 중지</Button>
                                ) : (
                                    <Button
                                        color="secondary"
                                        isDisabled={!selectedNickname || isDisabled}
                                        onPress={startCapture}>
                                        화면 공유 시작
                                    </Button>
                                )}
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
