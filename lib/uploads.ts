import { mkdir, writeFile } from "fs/promises";
import path from "path";

const IMAGE_MAX = 15 * 1024 * 1024;
const VIDEO_MAX = 80 * 1024 * 1024;
const ALLOWED = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["video/mp4", "mp4"],
  ["video/webm", "webm"],
  ["video/quicktime", "mov"],
]);

const BY_EXT = new Map([
  ["png", "png"],
  ["jpg", "jpg"],
  ["jpeg", "jpg"],
  ["webp", "webp"],
  ["gif", "gif"],
  ["mp4", "mp4"],
  ["webm", "webm"],
  ["mov", "mov"],
]);

export function uploadsRoot() {
  return path.resolve(process.cwd(), "data", "uploads");
}

function extensionFor(file: File) {
  const fromName = BY_EXT.get(file.name.split(".").pop()?.toLowerCase() ?? "") ?? null;
  const fromType = ALLOWED.get(file.type);
  if (file.type && !fromType) return null;
  if (fromType && fromName && fromType !== fromName) return null;
  return fromType ?? fromName;
}

function matchesSignature(ext: string, bytes: Buffer) {
  if (bytes.length < 12) return false;
  if (ext === "png") return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (ext === "jpg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (ext === "gif") {
    const head = bytes.subarray(0, 6).toString("ascii");
    return head === "GIF87a" || head === "GIF89a";
  }
  if (ext === "webp") return bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
  if (ext === "webm") return bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
  if (ext === "mp4" || ext === "mov") return bytes.subarray(4, 8).toString("ascii") === "ftyp";
  return false;
}

function isVideo(ext: string) {
  return ext === "mp4" || ext === "webm" || ext === "mov";
}

export async function saveUpload(file: File) {
  const ext = extensionFor(file);
  if (!ext) return { ok: false as const, error: "Usa una foto (png, jpg, webp, gif) o un video (mp4, webm, mov)." };
  const video = isVideo(ext);
  const max = video ? VIDEO_MAX : IMAGE_MAX;
  if (file.size > max) {
    return { ok: false as const, error: video ? "El video pesa más de 80 MB." : "La imagen pesa más de 15 MB." };
  }
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const name = `${crypto.randomUUID()}.${ext}`;
  const rel = path.posix.join(yyyy, mm, name);
  const abs = path.join(uploadsRoot(), yyyy, mm, name);
  await mkdir(path.dirname(abs), { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  if (!matchesSignature(ext, bytes)) {
    return { ok: false as const, error: "El archivo no coincide con una foto o un video permitido." };
  }
  await writeFile(abs, bytes);
  return {
    ok: true as const,
    path: rel.replaceAll("\\", "/"),
    url: `/api/files/${rel}`,
    kind: video ? ("video" as const) : ("imagen" as const),
  };
}

export function resolveUpload(parts: string[]) {
  if (parts.some((p) => p === "" || p === "." || p === ".." || p.includes("\\"))) return null;
  const root = uploadsRoot();
  const target = path.resolve(root, ...parts);
  const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;
  if (target !== root && !target.startsWith(rootWithSep)) return null;
  return target;
}

export function contentTypeFor(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".mp4") return "video/mp4";
  if (ext === ".webm") return "video/webm";
  if (ext === ".mov") return "video/quicktime";
  return "application/octet-stream";
}
