// ---------------------------------------------------------------------------
// Secure file upload validation.
// We never trust the browser-declared MIME type. Each file is validated by its
// magic bytes (JPEG, PNG, WebP only) plus size limits, and dimensions are
// parsed from the file header where available.
// ---------------------------------------------------------------------------

export const ALLOWED_IMAGE_TYPES = new Set(["jpg", "jpeg", "png", "webp"]);
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
export const MIN_DIMENSION = 50;
export const MAX_DIMENSION = 8000;

// Parses dimensions + format from the raw bytes of JPEG/PNG/WebP images.
export function inspectImage(buffer) {
    if (!buffer || buffer.length < 12) return null;
    const bytes = new Uint8Array(buffer);

    // PNG: 8-byte signature, then IHDR with width/height
    const pngSig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    if (pngSig.every((b, i) => bytes[i] === b) && bytes.length >= 24) {
        const width = bytes.readUInt32BE(16);
        const height = bytes.readUInt32BE(20);
        return { format: "png", width, height };
    }

    // JPEG: starts FF D8 FF, then scan for SOF markers
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
        let offset = 2;
        while (offset + 9 < bytes.length) {
            if (bytes[offset] !== 0xff) {
                offset += 1;
                continue;
            }
            const marker = bytes[offset + 1];
            // Skip fill bytes
            if (marker === 0xff) {
                offset += 1;
                continue;
            }
            if (marker === 0xd8 || marker === 0x01) {
                offset += 2;
                continue;
            }
            const length = bytes.readUInt16BE(offset + 2);
            // SOF0, SOF1, SOF2, etc. (start of frame markers contain dimensions)
            if (
                marker >= 0xc0 &&
                marker <= 0xcf &&
                marker !== 0xc4 &&
                marker !== 0xc8 &&
                marker !== 0xcc
            ) {
                const height = bytes.readUInt16BE(offset + 5);
                const width = bytes.readUInt16BE(offset + 7);
                return { format: "jpeg", width, height };
            }
            offset += 2 + length; // eslint-disable-line no-use-before-define
        }
        return { format: "jpeg", width: 0, height: 0 };
    }

    // WebP: "RIFF" + size + "WEBP"
    if (
        bytes[0] === 0x52 && // R
        bytes[1] === 0x49 && // I
        bytes[2] === 0x46 && // F
        bytes[3] === 0x46 && // F
        bytes[8] === 0x57 && // W
        bytes[9] === 0x45 && // E
        bytes[10] === 0x42 && // B
        bytes[11] === 0x50 //   P
    ) {
        const chunkType = String.fromCharCode(
            bytes[12],
            bytes[13],
            bytes[14],
            bytes[15],
        );
        if (chunkType === "VP8 " && bytes.length >= 30) {
            const w = bytes.readUInt16LE(26) & 0x3fff;
            const h = bytes.readUInt16LE(28) & 0x3fff;
            return { format: "webp", width: w, height: h };
        }
        if (chunkType === "VP8L" && bytes.length >= 25) {
            const b1 = bytes[21];
            const n = ((bytes[21] & 0x3f) << 8) | bytes[22];
            const m = ((bytes[23] & 0x0f) << 8) | bytes[24];
            return { format: "webp", width: (n & 0x3fff) + 1, height: (m & 0x3fff) + 1 };
        }
        if (chunkType === "VP8X" && bytes.length >= 30) {
            const w = 1 + ((bytes[24] | (bytes[25] << 8) | (bytes[26] << 16)) & 0xffffff);
            const h = 1 + ((bytes[27] | (bytes[28] << 8) | (bytes[29] << 16)) & 0xffffff);
            return { format: "webp", width: w, height: h };
        }
        return { format: "webp", width: 0, height: 0 };
    }

    return null;
}

/**
 * Validate an uploaded image buffer.
 * @returns {{ ok: true, format: string, width: number, height: number, ext: string }}
 *   or { ok: false, error: string }
 */
export function validateImage(buffer) {
    if (!buffer || buffer.length === 0) {
        return { ok: false, error: "File is empty" };
    }
    if (buffer.length > MAX_IMAGE_BYTES) {
        return {
            ok: false,
            error: "File is too large. Maximum size is 5MB.",
        };
    }
    const meta = inspectImage(buffer);
    if (!meta) {
        return {
            ok: false,
            error: "Unsupported image format. Allowed: JPEG, PNG, WebP.",
        };
    }
    if (meta.width && meta.width < MIN_DIMENSION) {
        return { ok: false, error: "Image is too small." };
    }
    if (meta.width && meta.width > MAX_DIMENSION) {
        return { ok: false, error: "Image dimensions are too large." };
    }
    if (meta.height && (meta.height < MIN_DIMENSION || meta.height > MAX_DIMENSION)) {
        return { ok: false, error: "Image dimensions are out of range." };
    }
    return { ok: true, ...meta, ext: meta.format };
}