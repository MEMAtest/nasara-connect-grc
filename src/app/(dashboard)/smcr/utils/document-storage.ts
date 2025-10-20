"use client";

/**
 * Lightweight IndexedDB wrapper for storing SM&CR supporting documents.
 * Files are stored separately from metadata that lives in React state / localStorage.
 */

const DB_NAME = "smcr-document-store";
const STORE_NAME = "documents";
const DB_VERSION = 1;

type DocumentRecord = {
  id: string;
  blob: Blob;
  name: string;
  type: string;
  size: number;
  lastModified: number;
};

const isBrowser = typeof window !== "undefined" && typeof indexedDB !== "undefined";

function openDatabase(): Promise<IDBDatabase> {
  if (!isBrowser) {
    return Promise.reject(new Error("IndexedDB is unavailable in this environment."));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB."));

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
  });
}

export async function persistDocumentBlob(id: string, file: File | Blob): Promise<void> {
  if (!isBrowser) return;
  const db = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const record: DocumentRecord = {
      id,
      blob: file,
      name: "name" in file ? file.name : id,
      type: file.type ?? "application/octet-stream",
      size: file.size ?? 0,
      lastModified: "lastModified" in file ? file.lastModified : Date.now(),
    };

    store.put(record);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Failed to write document to IndexedDB."));
    tx.onabort = () => reject(tx.error ?? new Error("Document transaction aborted."));
  });

  db.close();
}

export async function removeDocumentBlob(id: string): Promise<void> {
  if (!isBrowser) return;
  const db = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Failed to delete document blob."));
    tx.onabort = () => reject(tx.error ?? new Error("Document delete transaction aborted."));
  });

  db.close();
}

export async function fetchDocumentBlob(id: string): Promise<Blob | null> {
  if (!isBrowser) return null;
  const db = await openDatabase();

  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      const result = request.result as DocumentRecord | undefined;
      resolve(result?.blob ?? null);
    };
    request.onerror = () => reject(request.error ?? new Error("Failed to fetch document blob."));
  });

  db.close();
  return blob;
}
