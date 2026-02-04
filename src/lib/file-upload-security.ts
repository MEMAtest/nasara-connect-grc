// ============================================================================
// FILE UPLOAD SECURITY
// ============================================================================

import { fileTypeFromBuffer } from "file-type";
import { logError } from "./logger";

// ============================================================================
// CONFIGURATION
// ============================================================================

export const FILE_UPLOAD_CONFIG = {
  maxFileSize: 50 * 1024 * 1024, // 50MB

  allowedMimeTypes: new Set([
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/msword",
    "application/vnd.ms-excel",
    "image/png",
    "image/jpeg",
    "image/gif",
    "text/plain",
    "text/csv",
  ]),

  allowedExtensions: new Set([
    ".pdf",
    ".docx",
    ".doc",
    ".xlsx",
    ".xls",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".txt",
    ".csv",
  ]),

  dangerousExtensions: new Set([
    ".exe", ".bat", ".cmd", ".sh", ".ps1", ".vbs", ".js", ".jar",
    ".msi", ".dll", ".scr", ".com", ".pif", ".application", ".gadget",
    ".msp", ".hta", ".cpl", ".msc", ".wsf", ".wsh", ".ws",
  ]),
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  detectedMimeType?: string;
}

export async function validateFileUpload(
  file: File,
  config = FILE_UPLOAD_CONFIG
): Promise<FileValidationResult> {
  // 1. Check file size
  if (file.size > config.maxFileSize) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${config.maxFileSize / 1024 / 1024}MB`,
    };
  }

  // 2. Check extension
  const ext = getFileExtension(file.name).toLowerCase();

  if (config.dangerousExtensions.has(ext)) {
    return {
      valid: false,
      error: "This file type is not allowed for security reasons",
    };
  }

  if (!config.allowedExtensions.has(ext)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${Array.from(config.allowedExtensions).join(", ")}`,
    };
  }

  // 3. Check declared MIME type
  if (file.type && !config.allowedMimeTypes.has(file.type)) {
    return {
      valid: false,
      error: "Invalid file MIME type",
    };
  }

  // 4. Detect actual file type from magic numbers
  const buffer = Buffer.from(await file.arrayBuffer());
  const detectedType = await detectFileType(buffer);

  if (detectedType && !config.allowedMimeTypes.has(detectedType)) {
    return {
      valid: false,
      error: "File content does not match an allowed type",
    };
  }

  // 5. Check for file type mismatch (potential spoofing)
  if (detectedType && file.type && detectedType !== file.type) {
    // Allow some flexibility for similar types
    const isSimilar = areSimilarMimeTypes(file.type, detectedType);
    if (!isSimilar) {
      logError(
        new Error(`File type mismatch: declared=${file.type}, detected=${detectedType}`),
        "File upload security warning"
      );
      // Don't reject, but log for monitoring
    }
  }

  // 6. Additional validation for specific file types
  if (ext === ".pdf") {
    const isValidPdf = validatePdfStructure(buffer);
    if (!isValidPdf) {
      return {
        valid: false,
        error: "Invalid or corrupted PDF file",
      };
    }
  }

  return {
    valid: true,
    detectedMimeType: detectedType || file.type,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot !== -1 ? filename.slice(lastDot) : "";
}

async function detectFileType(buffer: Buffer): Promise<string | null> {
  try {
    const type = await fileTypeFromBuffer(buffer);
    return type?.mime || null;
  } catch {
    return null;
  }
}

function areSimilarMimeTypes(type1: string, type2: string): boolean {
  // Group similar MIME types
  const groups = [
    ["image/jpeg", "image/jpg"],
    ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    ["text/plain", "text/csv"],
  ];

  for (const group of groups) {
    if (group.includes(type1) && group.includes(type2)) {
      return true;
    }
  }

  return false;
}

function validatePdfStructure(buffer: Buffer): boolean {
  // Check PDF magic number
  const header = buffer.slice(0, 8).toString("ascii");
  if (!header.startsWith("%PDF-")) {
    return false;
  }

  // Check for EOF marker (basic structure validation)
  const trailer = buffer.slice(-1024).toString("ascii");
  if (!trailer.includes("%%EOF")) {
    return false;
  }

  return true;
}

// ============================================================================
// FILENAME SANITIZATION
// ============================================================================

export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  let sanitized = filename.replace(/[/\\]/g, "_");

  // Remove null bytes and control characters
  sanitized = sanitized.replace(/[\x00-\x1f\x7f]/g, "");

  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*]/g, "_");

  // Limit length
  if (sanitized.length > 200) {
    const ext = getFileExtension(sanitized);
    sanitized = sanitized.slice(0, 200 - ext.length) + ext;
  }

  // Ensure not empty
  if (!sanitized || sanitized === "." || sanitized === "..") {
    sanitized = "unnamed_file";
  }

  return sanitized;
}

// ============================================================================
// VIRUS SCANNING INTERFACE
// ============================================================================

export interface VirusScanResult {
  clean: boolean;
  threat?: string;
  scanTime?: number;
}

export async function scanFileForViruses(buffer: Buffer): Promise<VirusScanResult> {
  // If ClamAV is available, use it
  if (process.env.CLAMAV_HOST) {
    return scanWithClamAV(buffer);
  }

  // If VirusTotal API key is available, use it
  if (process.env.VIRUSTOTAL_API_KEY) {
    return scanWithVirusTotal(buffer);
  }

  // No scanning available - log warning and allow
  console.warn("No virus scanning configured. File accepted without scan.");
  return { clean: true };
}

async function scanWithClamAV(buffer: Buffer): Promise<VirusScanResult> {
  try {
    // @ts-expect-error -- clamscan has no type declarations
    const { default: NodeClam } = await import("clamscan");
    const clamscan = await new NodeClam().init({
      clamdscan: {
        host: process.env.CLAMAV_HOST,
        port: parseInt(process.env.CLAMAV_PORT || "3310", 10),
      },
    });

    const start = Date.now();
    const { isInfected, viruses } = await clamscan.scanBuffer(buffer);

    return {
      clean: !isInfected,
      threat: viruses?.[0],
      scanTime: Date.now() - start,
    };
  } catch (error) {
    logError(error, "ClamAV scan failed");
    // Fail open with warning - or fail closed depending on security requirements
    return { clean: true };
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function scanWithVirusTotal(_buffer: Buffer): Promise<VirusScanResult> {
  // Implementation for VirusTotal API
  // Note: VirusTotal has rate limits and is async (may take time)
  console.warn("VirusTotal scanning not yet implemented");
  return { clean: true };
}
