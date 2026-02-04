"use client";

/**
 * SM&CR document helpers backed by the server API.
 */

export async function persistDocumentBlob(): Promise<void> {
  throw new Error("persistDocumentBlob has been replaced by server uploads.");
}

export async function removeDocumentBlob(id: string): Promise<void> {
  await fetch(`/api/smcr/documents/${id}`, { method: "DELETE" });
}

export async function fetchDocumentBlob(id: string): Promise<Blob | null> {
  const response = await fetch(`/api/smcr/documents/${id}`);
  if (!response.ok) return null;
  return response.blob();
}
