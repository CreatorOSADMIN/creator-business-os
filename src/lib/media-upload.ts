import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

/**
 * Stores an uploaded answer image/video under `public/uploads/questions`
 * and returns the public URL to save on the Question record.
 *
 * NOTE: this writes to the local filesystem, which works for any
 * traditional/persistent-disk deployment (a VM, a container with a mounted
 * volume, `next start` behind a process manager, etc.) but NOT for
 * serverless platforms with an ephemeral filesystem (e.g. Vercel), where
 * files written here won't survive past the request. If this app is
 * deployed serverless, swap this function's body for an object-storage
 * provider (S3, Vercel Blob, Cloudinary, ...) — every call site in this
 * codebase only depends on the `{ url }` return shape, so that's a
 * same-signature swap.
 */

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "questions");
const PUBLIC_PREFIX = "/uploads/questions";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100MB

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

export class MediaUploadError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

export async function saveUploadedMedia(file: File): Promise<{ url: string; kind: "image" | "video" }> {
  const isImage = ALLOWED_IMAGE_TYPES.has(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.has(file.type);

  if (!isImage && !isVideo) {
    throw new MediaUploadError(
      "Unsupported file type. Allowed: JPEG, PNG, WEBP, GIF, MP4, WEBM, MOV.",
      415
    );
  }

  const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (file.size > maxBytes) {
    throw new MediaUploadError(
      `File too large. Max size is ${Math.round(maxBytes / (1024 * 1024))}MB.`,
      413
    );
  }

  const extension = EXTENSION_BY_TYPE[file.type];
  const filename = `${randomUUID()}.${extension}`;

  await mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return { url: `${PUBLIC_PREFIX}/${filename}`, kind: isImage ? "image" : "video" };
}
