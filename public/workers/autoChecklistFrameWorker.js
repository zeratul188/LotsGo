let isActive = false;
let frameReader = null;
let sharedTrack = null;
let healthTimer = null;
let lastFrameReadAt = 0;
let progressCanvas = typeof OffscreenCanvas === 'undefined' ? null : new OffscreenCanvas(480, 320);
let progressContext = progressCanvas?.getContext('2d', { willReadFrequently: true }) ?? null;
let progressCandidate = null;
let progressConfirmations = 0;
let lastProgressSent = -1;

const countRaidProgressChecks = (context, width, height) => {
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

    const checkCenters = [];
    const stack = [];
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
            const currentIndex = stack.pop();
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
};

const inspectProgress = (frame) => {
    if (!progressCanvas || !progressContext || !frame.displayWidth || !frame.displayHeight) return;
    try {
        progressContext.clearRect(0, 0, progressCanvas.width, progressCanvas.height);
        progressContext.drawImage(
            frame,
            0,
            0,
            frame.displayWidth * 0.22,
            frame.displayHeight * 0.32,
            0,
            0,
            progressCanvas.width,
            progressCanvas.height
        );
        const count = countRaidProgressChecks(progressContext, progressCanvas.width, progressCanvas.height);
        if (progressCandidate === count) {
            progressConfirmations += 1;
        } else {
            progressCandidate = count;
            progressConfirmations = 1;
        }
        if (progressConfirmations >= 3 && count !== lastProgressSent) {
            lastProgressSent = count;
            self.postMessage({ type: 'progress', count });
        }
    } catch {
        progressCanvas = null;
        progressContext = null;
    }
};

const stopFrameReading = async () => {
    isActive = false;
    if (healthTimer) clearInterval(healthTimer);
    healthTimer = null;
    try {
        await frameReader?.cancel();
    } catch {
        // The reader may already be closed when screen sharing ends.
    }
    sharedTrack?.stop();
    frameReader = null;
    sharedTrack = null;
    progressCandidate = null;
    progressConfirmations = 0;
    lastProgressSent = -1;
};

const readFrames = async (readable, interval) => {
    try {
        frameReader = readable.getReader();
        self.postMessage({ type: 'ready' });
        healthTimer = setInterval(() => {
            const frameAge = Date.now() - lastFrameReadAt;
            self.postMessage({ type: 'heartbeat', frameAge });
            if (frameAge > 45_000) {
                self.postMessage({ type: 'stalled' });
                void stopFrameReading();
            }
        }, 5000);

        let lastFrameSentAt = 0;
        while (isActive) {
            const { done, value: frame } = await frameReader.read();
            if (done || !frame) break;
            lastFrameReadAt = Date.now();

            try {
                const now = Date.now();
                if (now - lastFrameSentAt < interval) continue;

                lastFrameSentAt = now;
                inspectProgress(frame);
                const bitmap = await createImageBitmap(frame);
                self.postMessage({
                    type: 'frame',
                    bitmap,
                    width: frame.displayWidth,
                    height: frame.displayHeight
                }, [bitmap]);
            } finally {
                frame.close();
            }
        }
    } catch (error) {
        if (isActive) {
            self.postMessage({
                type: 'error',
                message: error instanceof Error ? error.message : '화면 프레임을 읽지 못했습니다.'
            });
        }
    } finally {
        if (healthTimer) clearInterval(healthTimer);
        healthTimer = null;
        try {
            frameReader?.releaseLock();
        } catch {
            // The lock may already have been released during cleanup.
        }
        sharedTrack?.stop();
        frameReader = null;
        sharedTrack = null;
        isActive = false;
    }
};

self.onmessage = async (event) => {
    if (event.data?.type === 'stop') {
        await stopFrameReading();
        return;
    }

    if (event.data?.type !== 'start' && event.data?.type !== 'start-stream') return;

    const interval = Math.max(Number(event.data.interval) || 1400, 500);
    isActive = true;
    lastFrameReadAt = Date.now();

    if (event.data.type === 'start-stream') {
        await readFrames(event.data.readable, interval);
        return;
    }

    if (typeof MediaStreamTrackProcessor === 'undefined') {
        event.data.track?.stop();
        isActive = false;
        self.postMessage({ type: 'unsupported' });
        return;
    }

    sharedTrack = event.data.track;
    const processor = new MediaStreamTrackProcessor({ track: sharedTrack, maxBufferSize: 1 });
    await readFrames(processor.readable, interval);
};
