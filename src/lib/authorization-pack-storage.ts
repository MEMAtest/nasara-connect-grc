import path from "path";
import { promises as fs } from "fs";
import { del, put } from "@vercel/blob";

const storageRoot = path.resolve(process.cwd(), "storage", "authorization-pack");
const remoteKeyPattern = /^https?:\/\//i;

export function usesBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function isRemoteStorageKey(storageKey: string) {
  return remoteKeyPattern.test(storageKey);
}

export function resolveAuthorizationPackPath(storageKey: string) {
  const fullPath = path.resolve(storageRoot, storageKey);
  if (!fullPath.startsWith(storageRoot + path.sep) && fullPath !== storageRoot) {
    throw new Error("Invalid file path");
  }
  return fullPath;
}

export async function storeAuthorizationPackPdf(storageKey: string, pdfBytes: Uint8Array) {
  if (usesBlobStorage()) {
    const blob = await put(storageKey, Buffer.from(pdfBytes), {
      access: "public",
      addRandomSuffix: true,
      contentType: "application/pdf",
    });
    return { storageKey: blob.url };
  }

  const storagePath = resolveAuthorizationPackPath(storageKey);
  await fs.mkdir(path.dirname(storagePath), { recursive: true });
  await fs.writeFile(storagePath, Buffer.from(pdfBytes));
  return { storageKey };
}

export async function readAuthorizationPackPdf(storageKey: string) {
  if (isRemoteStorageKey(storageKey)) {
    const response = await fetch(storageKey);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch blob (status ${response.status})`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type");
    const contentLengthHeader = response.headers.get("content-length");
    const contentLength = contentLengthHeader ? Number(contentLengthHeader) : null;
    return { buffer, contentType, contentLength };
  }

  const storagePath = resolveAuthorizationPackPath(storageKey);
  try {
    await fs.access(storagePath);
  } catch {
    return null;
  }
  const buffer = await fs.readFile(storagePath);
  return { buffer, contentType: null, contentLength: buffer.length };
}

export async function removeAuthorizationPackPdf(storageKey: string) {
  if (isRemoteStorageKey(storageKey)) {
    if (!usesBlobStorage()) {
      return;
    }
    await del(storageKey);
    return;
  }

  const storagePath = resolveAuthorizationPackPath(storageKey);
  await fs.unlink(storagePath);
}
