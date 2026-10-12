// lib/backendApi.ts

const rawBackendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
export const BACKEND_URL = rawBackendUrl.replace(/\/+$/, "");

export interface BackendHealthResponse {
  isOnline: boolean;
  latencyMs: number;
  service?: string;
  status?: string;
  toolMatrix?: Record<string, { library: string; dependency: string }>;
  error?: string;
}

/**
 * Pings the Python FastAPI backend to determine live connection status and latency
 */
export async function checkBackendHealth(): Promise<BackendHealthResponse> {
  const startTime = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(`${BACKEND_URL}/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - startTime);

    if (response.ok) {
      const data = await response.json();
      return {
        isOnline: true,
        latencyMs,
        service: data.service,
        status: data.status,
        toolMatrix: data.tool_matrix,
      };
    } else {
      return {
        isOnline: false,
        latencyMs,
        error: `HTTP ${response.status} ${response.statusText}`,
      };
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    return {
      isOnline: false,
      latencyMs: 0,
      error: err.name === "AbortError" ? "Connection timed out" : err.message || "Backend unreachable",
    };
  }
}

/**
 * Merge multiple PDF files via backend: POST /api/merge-pdf
 */
export async function apiMergePdf(files: File[]): Promise<{ blob: Blob; filename: string }> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const response = await fetch(`${BACKEND_URL}/api/merge-pdf`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Backend Merge failed: ${errText || response.statusText}`);
  }

  const blob = await response.blob();
  const filename = extractFilenameFromHeader(response) || "simplepdf_merged.pdf";
  return { blob, filename };
}

/**
 * Compress PDF via backend: POST /api/compress-pdf
 */
export async function apiCompressPdf(
  file: File,
  level: string = "recommended"
): Promise<{ blob: Blob; filename: string; originalSize: number; compressedSize: number }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("level", level);

  const response = await fetch(`${BACKEND_URL}/api/compress-pdf`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Backend Compress failed: ${errText || response.statusText}`);
  }

  const blob = await response.blob();
  const filename = extractFilenameFromHeader(response) || `compressed_${file.name}`;
  return {
    blob,
    filename,
    originalSize: file.size,
    compressedSize: blob.size,
  };
}

/**
 * Convert PDF to Word via backend: POST /api/pdf-to-word
 */
export async function apiPdfToWord(file: File): Promise<{ blob: Blob; filename: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BACKEND_URL}/api/pdf-to-word`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Backend PDF-to-Word failed: ${errText || response.statusText}`);
  }

  const blob = await response.blob();
  const baseName = file.name.replace(/\.[^/.]+$/, "");
  const filename = extractFilenameFromHeader(response) || `${baseName}.docx`;
  return { blob, filename };
}

/**
 * Convert Word to PDF via backend: POST /api/word-to-pdf
 */
export async function apiWordToPdf(file: File): Promise<{ blob: Blob; filename: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BACKEND_URL}/api/word-to-pdf`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Backend Word-to-PDF failed: ${errText || response.statusText}`);
  }

  const blob = await response.blob();
  const baseName = file.name.replace(/\.[^/.]+$/, "");
  const filename = extractFilenameFromHeader(response) || `${baseName}.pdf`;
  return { blob, filename };
}

/**
 * Convert Photo to PDF via backend: POST /api/photo-to-pdf
 */
export async function apiPhotoToPdf(
  files: File[],
  orientation: string = "portrait"
): Promise<{ blob: Blob; filename: string }> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  formData.append("orientation", orientation);

  const response = await fetch(`${BACKEND_URL}/api/photo-to-pdf`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Backend Photo-to-PDF failed: ${errText || response.statusText}`);
  }

  const blob = await response.blob();
  const filename = extractFilenameFromHeader(response) || "simplepdf_photos.pdf";
  return { blob, filename };
}

function extractFilenameFromHeader(response: Response): string | null {
  const disposition = response.headers.get("content-disposition");
  if (!disposition) return null;
  const match = disposition.match(/filename="?([^";]+)"?/i);
  return match ? match[1] : null;
}

/**
 * Generates a minimal valid file for sample testing if real file is not available
 */
export function createMockValidFile(name: string, type: string): File {
  // Minimal valid PDF byte stream (single empty page)
  if (name.endsWith(".pdf") || type.includes("pdf")) {
    const minimalPdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >> endobj
xref
0 4
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
trailer << /Size 4 /Root 1 0 R >>
startxref
192
%%EOF`;
    return new File([minimalPdf], name, { type: "application/pdf" });
  }

  // Minimal 1x1 PNG for image testing
  if (name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg") || type.includes("image")) {
    const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const byteCharacters = atob(pngBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new File([byteArray], name, { type: "image/png" });
  }

  // Fallback text/docx
  return new File(["Simple PDF Document Content"], name, { type });
}
