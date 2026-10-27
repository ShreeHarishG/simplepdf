"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Download,
  RefreshCw,
  Sparkles,
  Sliders,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  Info,
  GripVertical,
  Hand,
  Layers,
  X,
  AlertCircle,
  Wifi,
} from "lucide-react";
import { ToolDefinition, UploadedFile, ToolOptions, PdfPageItem } from "@/types/tools";
import { useBackendStatus } from "@/context/BackendStatusContext";
import ToolOptionsPanel from "@/components/ToolOptionsPanel";
import PagePreviewGrid from "@/components/PagePreviewGrid";
import { renderPdfPages } from "@/lib/pdfPreview";
import {
  MAX_FILE_BYTES,
  MAX_FILES,
  apiMergePdf,
  apiCompressPdf,
  apiPdfToWord,
  apiWordToPdf,
  apiOfficeToPdf,
  apiPdfThumbnails,
  apiPhotoToPdf,
  apiPdfToImage,
  apiPdfToExcel,
  apiWatermarkPdf,
  apiSplitPdf,
  apiOrganizePdf,
  apiProtectPdf,
  apiUnlockPdf,
  apiPageNumbers,
  apiExtractText,
} from "@/lib/backendApi";

const PAGE_TOOLS = new Set(["organize-pdf", "split-pdf", "rotate-pdf"]);

const OFFICE_DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const OFFICE_XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const OFFICE_PPTX = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

function samplePngFile(name: string): File {
  const bytes = Uint8Array.from(
    atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="),
    (char) => char.charCodeAt(0)
  );
  return new File([bytes], name, { type: "image/png" });
}

async function loadSampleFile(url: string, name: string, type: string): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Could not load the sample file.");
  return new File([await response.blob()], name, { type });
}

function nextAngle(current: PdfPageItem["rotate"], delta: 90 | -90): PdfPageItem["rotate"] {
  return ((((current + delta) % 360) + 360) % 360) as PdfPageItem["rotate"];
}

interface ToolWorkspaceProps {
  tool: ToolDefinition;
  onBack: () => void;
  onOpenBackendModal?: () => void;
}

export default function ToolWorkspace({
  tool,
  onBack,
}: ToolWorkspaceProps) {
  const { isOnline, latencyMs, toolMatrix } = useBackendStatus();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState("Preparing files...");
  const [isDone, setIsDone] = useState(false);
  const [downloadFileName, setDownloadFileName] = useState("");
  const [fileSavings, setFileSavings] = useState<{
    originalSize: number;
    compressedSize: number;
    percent: number;
  } | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [processedByBackend, setProcessedByBackend] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pages, setPages] = useState<PdfPageItem[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [pagesError, setPagesError] = useState<string | null>(null);
  const [pagesTruncated, setPagesTruncated] = useState(false);

  // Pick & Drop States
  // 1. Click-to-pick up mode (explicit UI level pick up and drop)
  const [pickedUpIndex, setPickedUpIndex] = useState<number | null>(null);

  // 2. Mouse drag-and-drop states
  const [draggedCardIndex, setDraggedCardIndex] = useState<number | null>(null);
  const [dragOverCardIndex, setDragOverCardIndex] = useState<number | null>(null);

  // Tool Specific Options
  const [options, setOptions] = useState<ToolOptions>({
    compressionLevel: "recommended",
    sortOrder: "custom",
    pdfStandard: "pdf1.7",
    orientation: "portrait",
    pageSize: "a4",
    margin: "small",
    mergeAllImages: true,
    splitMode: "each",
    pageRange: "all",
    organizeMode: "keep",
    rotateAngle: 90,
    watermarkText: "CONFIDENTIAL",
    watermarkOpacity: 0.25,
    watermarkMode: "text",
    watermarkPosition: "center",
    watermarkRotation: 45,
    watermarkScale: 0.28,
    watermarkLogoFile: null,
    pageNumberPosition: "footer-center",
    pageNumberStart: 1,
    pageNumberFormat: "page-n-of-n",
    imageFormat: "png",
    imageDpi: 150,
    imagePages: "all",
    password: "",
    confirmPassword: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sourceFileId = files[0]?.id;

  useEffect(() => {
    setFiles([]);
    setIsDragging(false);
    setIsProcessing(false);
    setProgress(0);
    setIsDone(false);
    setDownloadFileName("");
    setFileSavings(null);
    setResultBlob(null);
    setProcessedByBackend(false);
    setErrorMessage(null);
    setPages([]);
    setPagesError(null);
    setPagesTruncated(false);
    setPickedUpIndex(null);
  }, [tool.id]);

  useEffect(() => {
    if (!PAGE_TOOLS.has(tool.id)) {
      setPages([]);
      setPagesError(null);
      setPagesTruncated(false);
      setPagesLoading(false);
      return;
    }

    const source = files[0]?.rawFile;
    if (!source) {
      setPages([]);
      setPagesLoading(false);
      return;
    }

    let cancelled = false;
    const loadThumbs = async () => {
      setPagesLoading(true);
      setPagesError(null);
      setPagesTruncated(false);
      try {
        const rendered = await renderPdfPages(source);
        if (cancelled) return;
        if (rendered.length > 0) {
          setPages(rendered);
          return;
        }
        throw new Error("No pages rendered");
      } catch {
        try {
          const data = await apiPdfThumbnails(source);
          if (cancelled) return;
          setPages(
            data.pages.map((page) => ({
              id: `page-${page.index}-${source.lastModified}`,
              sourceIndex: page.index,
              rotate: 0,
              selected: true,
              thumbUrl: page.image,
            }))
          );
          setPagesTruncated(data.truncated);
        } catch {
          if (!cancelled) {
            setPages([]);
            setPagesError("Could not preview pages. Try another PDF.");
          }
        }
      } finally {
        if (!cancelled) setPagesLoading(false);
      }
    };

    loadThumbs();
    return () => {
      cancelled = true;
    };
  }, [tool.id, sourceFileId]);

  // Format file size
  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Handle file addition
  const handleAddFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const incoming = Array.from(fileList);
    const tooBig = incoming.filter((f) => f.size > MAX_FILE_BYTES).map((f) => f.name);
    const accepted = incoming.filter((f) => f.size <= MAX_FILE_BYTES);

    if (tooBig.length > 0) {
      setErrorMessage(`These files exceed the 50 MB limit and were skipped: ${tooBig.join(", ")}`);
    } else {
      setErrorMessage(null);
    }
    if (accepted.length === 0) return;

    const newFiles: UploadedFile[] = accepted.map((f, idx) => ({
      id: `${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 9)}`,
      name: f.name,
      size: f.size,
      type: f.type,
      lastModified: f.lastModified,
      previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
      status: "ready",
      rawFile: f,
    }));

    if (tool.multiple) {
      setFiles((prev) => [...prev, ...newFiles].slice(0, MAX_FILES));
    } else {
      setFiles(newFiles.slice(0, 1));
    }
  };

  const handleAddSampleFiles = async () => {
    try {
      setErrorMessage(null);
      const stamp = Date.now();
      const pdf = (name: string) => loadSampleFile("/samples/sample.pdf", name, "application/pdf");
      const loaded: File[] =
        tool.id === "word-to-pdf"
          ? [await loadSampleFile("/samples/sample.docx", "Project_Specification_Draft.docx", OFFICE_DOCX)]
          : tool.id === "excel-to-pdf"
          ? [await loadSampleFile("/samples/sample.xlsx", "Q3_Budget.xlsx", OFFICE_XLSX)]
          : tool.id === "ppt-to-pdf"
          ? [await loadSampleFile("/samples/sample.pptx", "Kickoff_Deck.pptx", OFFICE_PPTX)]
          : tool.id === "photo-to-pdf"
          ? [samplePngFile("Scanned_Receipt_Page1.png"), samplePngFile("Scanned_Receipt_Page2.png")]
          : tool.id === "merge-pdf"
          ? [
              await pdf("Technical_Resume_Part1.pdf"),
              await pdf("Project_Portfolio.pdf"),
              await pdf("Certifications_Appendix.pdf"),
            ]
          : [await pdf(tool.id === "split-pdf" ? "Quarterly_Report.pdf" : "Sample_Document.pdf")];

      const samples: UploadedFile[] = loaded.map((file, index) => ({
        id: `sample-${index}-${stamp}`,
        name: file.name,
        size: file.size,
        type: file.type,
        status: "ready" as const,
        rawFile: file,
      }));
      setFiles((prev) => (tool.multiple ? [...prev, ...samples] : [samples[0]]));
    } catch {
      setErrorMessage("Could not load the sample file. Upload a real document instead.");
    }
  };

  // Remove file
  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (pickedUpIndex !== null) setPickedUpIndex(null);
  };

  // Move file with up/down arrows
  const moveFile = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= files.length) return;

    handleDropAt(index, targetIndex);
  };

  // Execute Pick & Drop Reordering
  const handleDropAt = (sourceIndex: number, targetIndex: number) => {
    if (sourceIndex === targetIndex) {
      setPickedUpIndex(null);
      setDraggedCardIndex(null);
      setDragOverCardIndex(null);
      return;
    }

    setFiles((prev) => {
      const updated = [...prev];
      const [movedItem] = updated.splice(sourceIndex, 1);
      updated.splice(targetIndex, 0, movedItem);
      return updated;
    });

    setPickedUpIndex(null);
    setDraggedCardIndex(null);
    setDragOverCardIndex(null);
  };

  // Toggle Pick Up for a card
  const handleTogglePickUp = (index: number) => {
    if (pickedUpIndex === index) {
      // Put it down / cancel
      setPickedUpIndex(null);
    } else if (pickedUpIndex !== null) {
      // Already picked up another card, drop it here!
      handleDropAt(pickedUpIndex, index);
    } else {
      // Pick this card up
      setPickedUpIndex(index);
    }
  };

  const validateBeforeProcess = (): string | null => {
    if (files.length === 0) return "Add a file first.";
    if (tool.id === "merge-pdf" && files.length < 2) return "Add at least two PDFs to merge.";
    if (tool.id === "split-pdf") {
      if (pages.length === 0) return "Wait for the page preview, or upload the PDF again.";
      if (pages.filter((page) => page.selected).length === 0) return "Click the pages you want to keep.";
    }
    if ((tool.id === "organize-pdf" || tool.id === "rotate-pdf") && pages.length === 0) {
      return "Wait for the page preview, or upload the PDF again.";
    }
    if (tool.id === "pdf-to-image" && options.imagePages === "range" && !options.pageRange?.trim()) {
      return "Enter the pages to convert.";
    }
    if (tool.id === "watermark-pdf") {
      if (options.watermarkMode === "logo" && !options.watermarkLogoFile) {
        return "Upload a logo image to watermark with.";
      }
      if (options.watermarkMode !== "logo" && !options.watermarkText?.trim()) {
        return "Enter watermark text.";
      }
    }
    if (tool.id === "protect-pdf") {
      if (!options.password || options.password.length < 4) return "Enter a password of at least 4 characters.";
      if (options.password !== options.confirmPassword) return "Passwords do not match.";
    }
    if (tool.id === "unlock-pdf" && !options.password) return "Enter the current PDF password.";
    return null;
  };

  const handleProcess = async () => {
    const validationError = validateBeforeProcess();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setErrorMessage(null);
    setProcessingStage("Preparing files for processing...");

    try {
      const rawFiles: File[] = files.map((f) => {
        if (!f.rawFile) throw new Error("Upload the file again. The original file is missing.");
        return f.rawFile;
      });

      setProgress(30);
      setProcessingStage(`Running ${tool.name}...`);

      let receivedBlob: Blob;
      let finalFilename = "";
      const source = rawFiles[0];
      const pageRange = options.pageRange?.trim() || "all";
      const selectedPages = pages.filter((page) => page.selected).map((page) => page.sourceIndex + 1);
      const splitRange = selectedPages.length ? selectedPages.join(",") : "all";

        if (tool.id === "merge-pdf") {
          const res = await apiMergePdf(rawFiles);
          receivedBlob = res.blob;
          finalFilename = res.filename;
        } else if (tool.id === "pdf-compression") {
          const res = await apiCompressPdf(source, options.compressionLevel || "recommended");
          receivedBlob = res.blob;
          finalFilename = res.filename;
          const origSize = res.originalSize;
          const compSize = res.compressedSize;
          const percent = origSize > 0 ? Math.max(0, Math.round(((origSize - compSize) / origSize) * 100)) : 0;
          setFileSavings({ originalSize: origSize, compressedSize: compSize, percent });
        } else if (tool.id === "pdf-to-word") {
          const res = await apiPdfToWord(source);
          receivedBlob = res.blob;
          finalFilename = res.filename;
        } else if (tool.id === "word-to-pdf") {
          const res = await apiWordToPdf(source, options.pdfStandard || "pdf1.7");
          receivedBlob = res.blob;
          finalFilename = res.filename;
        } else if (tool.id === "excel-to-pdf" || tool.id === "ppt-to-pdf") {
          const res = await apiOfficeToPdf(source, options.pdfStandard || "pdf1.7");
          receivedBlob = res.blob;
          finalFilename = res.filename;
        } else if (tool.id === "photo-to-pdf") {
          const res = await apiPhotoToPdf(
            rawFiles,
            options.orientation || "portrait",
            options.pageSize || "a4",
            options.margin || "small"
          );
          receivedBlob = res.blob;
          finalFilename = res.filename;
        } else if (tool.id === "pdf-to-image") {
          const imagePages = options.imagePages === "range" ? pageRange : "all";
          const res = await apiPdfToImage(source, imagePages, options.imageFormat || "png", options.imageDpi || 150);
          receivedBlob = res.blob;
          finalFilename = res.filename;
        } else if (tool.id === "pdf-to-excel") {
          const res = await apiPdfToExcel(source);
          receivedBlob = res.blob;
          finalFilename = res.filename;
        } else if (tool.id === "watermark-pdf") {
          const res = await apiWatermarkPdf(source, options.watermarkText || "CONFIDENTIAL", options.watermarkOpacity ?? 0.25, {
            mode: options.watermarkMode || "text",
            position: options.watermarkPosition || "center",
            rotation: options.watermarkRotation ?? 45,
            scale: options.watermarkScale ?? 0.28,
            logo: options.watermarkLogoFile,
          });
          receivedBlob = res.blob;
          finalFilename = res.filename;
        } else if (tool.id === "split-pdf") {
          const res = await apiSplitPdf(source, "each", splitRange);
          receivedBlob = new Blob([res.blob], { type: "application/zip" });
          finalFilename = res.filename.toLowerCase().endsWith(".zip")
            ? res.filename
            : `${res.filename.replace(/\.[^.]+$/, "")}_pages.zip`;
        } else if (tool.id === "rotate-pdf" || tool.id === "organize-pdf") {
          const res = await apiOrganizePdf(
            source,
            options.organizeMode || "keep",
            pageRange,
            pages.map((page) => page.sourceIndex),
            pages.map((page) => page.rotate)
          );
          receivedBlob = res.blob;
          finalFilename = res.filename;
        } else if (tool.id === "protect-pdf") {
          const res = await apiProtectPdf(source, options.password || "");
          receivedBlob = res.blob;
          finalFilename = res.filename;
        } else if (tool.id === "unlock-pdf") {
          const res = await apiUnlockPdf(source, options.password || "");
          receivedBlob = res.blob;
          finalFilename = res.filename;
        } else if (tool.id === "page-numbers") {
          const res = await apiPageNumbers(
            source,
            options.pageNumberPosition || "footer-center",
            options.pageNumberStart || 1,
            options.pageNumberFormat || "page-n-of-n"
          );
          receivedBlob = res.blob;
          finalFilename = res.filename;
        } else {
          const res = await apiExtractText(source);
          receivedBlob = res.blob;
          finalFilename = res.filename;
        }

        setProgress(85);
        setProcessingStage("Preparing your processed file...");
        await new Promise((r) => setTimeout(r, 250));

      setProgress(100);
      setResultBlob(receivedBlob);
      setDownloadFileName(finalFilename);
      setProcessedByBackend(true);
      setIsProcessing(false);
      setIsDone(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not process that file.";
      setIsProcessing(false);
      setIsDone(false);
      setProcessedByBackend(false);
      setResultBlob(null);
      setErrorMessage(message);
    }
  };

  // Trigger file download
  const handleDownload = () => {
    // If real file received from backend
    if (!resultBlob) {
      setErrorMessage("The real file is not ready yet. Process the document again.");
      return;
    }
    const filename =
      downloadFileName ||
      (tool.id === "split-pdf" || tool.id === "pdf-to-image"
        ? "simplepdf_pages.zip"
        : tool.id === "pdf-to-word"
        ? "document.docx"
        : tool.id === "pdf-to-excel"
        ? "document.xlsx"
        : "processed_file.pdf");
    const mime = filename.toLowerCase().endsWith(".docx")
      ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      : filename.toLowerCase().endsWith(".xlsx")
      ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      : filename.toLowerCase().endsWith(".zip")
      ? "application/zip"
      : filename.toLowerCase().endsWith(".txt")
      ? "text/plain"
      : filename.toLowerCase().endsWith(".pdf")
      ? "application/pdf"
      : resultBlob.type;
    const typedBlob = resultBlob.type === mime ? resultBlob : new Blob([resultBlob], { type: mime });
    const url = URL.createObjectURL(typedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFiles([]);
    setIsDone(false);
    setProgress(0);
    setFileSavings(null);
    setPickedUpIndex(null);
    setDraggedCardIndex(null);
    setDragOverCardIndex(null);
    setResultBlob(null);
    setProcessedByBackend(false);
    setErrorMessage(null);
    setPages([]);
    setPagesError(null);
    setPagesTruncated(false);
    setOptions((prev) => ({ ...prev, watermarkLogoFile: null }));
  };

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] flex flex-col bg-[#fafafc]">
      {/* Top Breadcrumb Bar */}
      <div className="bg-white border-b border-zinc-200/80 px-4 sm:px-6 py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All Tools
            </button>
            <div className="h-4 w-px bg-zinc-200" />
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: tool.color }}
              />
              <span className="text-sm font-bold text-zinc-900">{tool.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        {/* STATE 1: SUCCESS / DOWNLOAD SCREEN */}
        {isDone ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 max-w-xl mx-auto text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 shadow-sm">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mb-2">
              {tool.successTitle}
            </h2>

            <p className="text-sm text-zinc-600 mb-6">
              {tool.id === "split-pdf"
                ? `Each page is its own PDF, packed in ${downloadFileName || "a ZIP file"}.`
                : "Your document is ready for download. Clean, secure, and ready to share."}
            </p>

            {/* Compression savings badge if applicable */}
            {fileSavings && (
              <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex items-center justify-between text-left">
                <div>
                  <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                    File Size Reduced by {fileSavings.percent}%
                  </div>
                  <div className="text-xs text-emerald-700 mt-0.5">
                    {formatBytes(fileSavings.originalSize)} ➔{" "}
                    <span className="font-bold">
                      {formatBytes(fileSavings.compressedSize)}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full">
                  -{fileSavings.percent}%
                </span>
              </div>
            )}

            {/* BIG ACTION DOWNLOAD BUTTON in TFRENZY ORANGE */}
            <button
              onClick={handleDownload}
              className="w-full py-4 px-8 rounded-xl text-white bg-[#ea580c] hover:bg-[#c2410c] text-lg font-bold shadow-lg shadow-orange-500/25 transition-all transform active:scale-98 flex items-center justify-center gap-3 cursor-pointer"
            >
              <Download className="w-6 h-6" />
              Download {tool.downloadLabel}
            </button>

            {/* Secondary actions */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 w-full">
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Process Another File
              </button>
              <button
                onClick={onBack}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Back to All Tools
              </button>
            </div>

            {/* TFRENZY Note */}
            <div className="mt-8 pt-4 border-t border-zinc-200/80 text-xs text-zinc-500 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-zinc-400" />
              <span>
                Your files are processed securely and deleted automatically.
              </span>
            </div>
          </div>
        ) : isProcessing ? (
          /* STATE 2: PROCESSING SCREEN */
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 max-w-md mx-auto text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 animate-bounce shadow-md"
              style={{ backgroundColor: tool.lightBg }}
            >
              <Sparkles className="w-8 h-8" style={{ color: tool.color }} />
            </div>

            <h3 className="text-xl font-bold text-zinc-900 mb-2">
              Processing Document...
            </h3>
            <p className="text-xs text-zinc-500 mb-6 font-medium">
              {processingStage}
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-200 rounded-full h-3 overflow-hidden shadow-inner mb-3">
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${progress}%`,
                  backgroundColor: tool.color,
                }}
              />
            </div>
            <div className="text-xs font-bold text-zinc-600">{progress}%</div>
          </div>
        ) : files.length === 0 ? (
          /* STATE 3: DROPZONE WITH TFRENZY ORANGE ACTION BUTTON */
          <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept={tool.accept}
              multiple={tool.multiple}
              onChange={(e) => handleAddFiles(e.target.files)}
              className="hidden"
            />

            {/* Main Interactive Select Button */}
            <div className="max-w-xl w-full flex flex-col items-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mb-2">
                {tool.name}
              </h2>
              <p className="text-sm text-zinc-600 mb-8 max-w-md">
                {tool.tagline}
              </p>

              {/* Big TFRENZY Orange Action Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-80 py-5 px-8 rounded-2xl text-white bg-[#ea580c] hover:bg-[#c2410c] text-xl font-bold shadow-xl shadow-orange-500/20 hover:shadow-orange-500/30 transition-all transform active:scale-98 flex items-center justify-center gap-3 cursor-pointer"
              >
                <Upload className="w-6 h-6" />
                {tool.actionButtonText}
              </button>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleAddFiles(e.dataTransfer.files);
                }}
                className={`mt-6 w-full max-w-md p-8 border-2 border-dashed rounded-2xl transition-all ${
                  isDragging
                    ? "border-orange-500 bg-orange-50/50 scale-102"
                    : "border-zinc-300 hover:border-zinc-400 bg-white/60"
                }`}
              >
                <p className="text-sm font-medium text-zinc-600">
                  or drop {tool.acceptLabel} here
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Supported: {tool.supportedFormats.join(", ")} · Max 50 MB per file
                </p>
              </div>

              {/* Demo Sample Button */}
              <div className="mt-8 flex items-center gap-2">
                <span className="text-xs text-zinc-500">Don't have a file ready?</span>
                <button
                  onClick={handleAddSampleFiles}
                  className="text-xs font-bold text-[#ea580c] hover:underline cursor-pointer"
                >
                  Load Sample Document ➔
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* STATE 4: FILES LOADED DISPLAY WITH PICK & DROP REORDERING */
          <div className="flex-1 flex flex-col lg:flex-row gap-6">
            <input
              ref={fileInputRef}
              type="file"
              accept={tool.accept}
              multiple={tool.multiple}
              onChange={(e) => handleAddFiles(e.target.files)}
              className="hidden"
            />

            {/* Left: Files Stage */}
            <div className="flex-1 bg-white rounded-2xl border border-zinc-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">
                      Uploaded Documents ({files.length})
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {tool.id === "organize-pdf"
                        ? "Drag pages to reorder. Turn or remove pages, then save."
                        : tool.id === "split-pdf"
                        ? "Click the pages you want to keep. The preview shows the real page."
                        : tool.id === "rotate-pdf"
                        ? "Turn any page with the buttons. The preview rotates as you click."
                        : tool.id === "merge-pdf"
                        ? "Pick up any card and drop it where you want to arrange the order."
                        : "Verify your documents before processing."}
                    </p>
                  </div>

                  {tool.multiple && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add More
                    </button>
                  )}
                </div>

                {/* PICKED UP FLOATING STATUS BAR (Appears when a file is picked up) */}
                {pickedUpIndex !== null && (
                  <div className="mt-4 p-3.5 bg-gradient-to-r from-[#ea580c] to-amber-500 text-white rounded-xl shadow-lg flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center font-extrabold text-xs">
                        #{pickedUpIndex + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <Hand className="w-3.5 h-3.5 animate-bounce" />
                          <span>Document Picked Up: {files[pickedUpIndex]?.name}</span>
                        </div>
                        <div className="text-[11px] text-white/90 mt-0.5">
                          Click on ANY card or &quot;Drop Here&quot; target below to place it there.
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setPickedUpIndex(null)}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-bold bg-white text-zinc-900 rounded-lg hover:bg-zinc-100 transition-all cursor-pointer shadow-xs"
                    >
                      <X className="w-3 h-3" />
                      Put Down
                    </button>
                  </div>
                )}

                {/* Helpful Pick & Drop Guidance Banner */}
                {tool.multiple && files.length > 1 && pickedUpIndex === null && (
                  <div className="mt-4 p-2.5 bg-orange-50/90 border border-orange-200/90 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-orange-950">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-orange-200/70 text-[#ea580c]">
                        <Hand className="w-3.5 h-3.5" />
                      </span>
                      <span>
                        <strong className="font-bold text-orange-950">Pick &amp; Drop:</strong> Click <strong>&quot;Pick Up&quot;</strong> on any card to move it, or simply drag and drop with your mouse.
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-[#ea580c] px-2.5 py-0.5 bg-white rounded-full shadow-2xs border border-orange-200">
                      {files.length} documents
                    </span>
                  </div>
                )}

                {PAGE_TOOLS.has(tool.id) && (
                  <PagePreviewGrid
                    mode={tool.id === "split-pdf" ? "split" : tool.id === "rotate-pdf" ? "rotate" : "organize"}
                    pages={pages}
                    loading={pagesLoading}
                    error={pagesError}
                    onReorder={(from, to) => {
                      setPages((prev) => {
                        const next = [...prev];
                        const [moved] = next.splice(from, 1);
                        next.splice(to, 0, moved);
                        return next;
                      });
                    }}
                    onRotate={(id, delta) => {
                      setPages((prev) =>
                        prev.map((page) => (page.id === id ? { ...page, rotate: nextAngle(page.rotate, delta) } : page))
                      );
                    }}
                    onDelete={(id) => setPages((prev) => prev.filter((page) => page.id !== id))}
                    onToggleSelect={(id) => {
                      setPages((prev) =>
                        prev.map((page) => (page.id === id ? { ...page, selected: !page.selected } : page))
                      );
                    }}
                    onRotateAll={(delta) => {
                      setPages((prev) => prev.map((page) => ({ ...page, rotate: nextAngle(page.rotate, delta) })));
                    }}
                    onSelectAll={(selected) => {
                      setPages((prev) => prev.map((page) => ({ ...page, selected })));
                    }}
                  />
                )}

                {/* File Cards Grid with Visual Pick & Drop Reordering */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-5 ${PAGE_TOOLS.has(tool.id) ? "hidden" : ""}`}>
                  {files.map((file, idx) => {
                    const isPickedUp = pickedUpIndex === idx;
                    const isTargetWhenPickedUp = pickedUpIndex !== null && pickedUpIndex !== idx;
                    const isBeingDragged = draggedCardIndex === idx;
                    const isDragOver = dragOverCardIndex === idx && draggedCardIndex !== idx;

                    return (
                      <div
                        key={file.id}
                        draggable={tool.multiple}
                        onDragStart={(e) => {
                          setDraggedCardIndex(idx);
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", idx.toString());
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                          if (dragOverCardIndex !== idx) {
                            setDragOverCardIndex(idx);
                          }
                        }}
                        onDragLeave={() => {
                          if (dragOverCardIndex === idx) {
                            setDragOverCardIndex(null);
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const src = draggedCardIndex !== null ? draggedCardIndex : pickedUpIndex;
                          if (src !== null && src !== idx) {
                            handleDropAt(src, idx);
                          }
                          setDraggedCardIndex(null);
                          setDragOverCardIndex(null);
                        }}
                        onDragEnd={() => {
                          setDraggedCardIndex(null);
                          setDragOverCardIndex(null);
                        }}
                        className={`relative group bg-white border rounded-xl p-4 flex flex-col justify-between transition-all select-none ${
                          isPickedUp
                            ? "ring-4 ring-[#ea580c] border-[#ea580c] bg-orange-50/70 shadow-2xl -translate-y-1 scale-102 z-20"
                            : isTargetWhenPickedUp
                            ? "border-2 border-dashed border-[#ea580c]/60 hover:bg-orange-50/60 hover:border-[#ea580c] hover:shadow-md cursor-pointer hover:scale-101"
                            : isBeingDragged
                            ? "opacity-30 scale-95 border-2 border-dashed border-[#ea580c] bg-orange-50/50 shadow-inner"
                            : isDragOver
                            ? "border-2 border-[#ea580c] bg-orange-50/80 scale-102 shadow-lg ring-4 ring-[#ea580c]/20"
                            : "border-zinc-200/90 hover:border-orange-300 hover:shadow-xs"
                        }`}
                        onClick={() => {
                          if (pickedUpIndex !== null && pickedUpIndex !== idx) {
                            handleDropAt(pickedUpIndex, idx);
                          }
                        }}
                      >
                        {/* Overlay when another card is picked up & hovered over this slot */}
                        {isTargetWhenPickedUp && (
                          <div className="absolute inset-0 bg-orange-500/10 backdrop-blur-[0.5px] rounded-xl border-2 border-dashed border-[#ea580c] flex items-center justify-center z-10 hover:bg-orange-500/20 transition-colors">
                            <span className="bg-[#ea580c] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 animate-pulse">
                              <Hand className="w-3.5 h-3.5" />
                              Click to Drop Here (as #{idx + 1})
                            </span>
                          </div>
                        )}

                        {/* Top row: Drag Grip / Pick Up indicator + Thumbnail + Trash */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {/* Drag Grip Handle */}
                            {tool.multiple && (
                              <div
                                className="p-1 -ml-1 text-zinc-400 group-hover:text-[#ea580c] cursor-grab active:cursor-grabbing transition-colors"
                                title="Click and drag to move card"
                              >
                                <GripVertical className="w-4 h-4" />
                              </div>
                            )}

                            {/* Preview Icon */}
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center shadow-2xs shrink-0"
                              style={{ backgroundColor: tool.lightBg }}
                            >
                              {file.previewUrl ? (
                                <img
                                  src={file.previewUrl}
                                  alt={file.name}
                                  className="w-10 h-10 object-cover rounded-lg"
                                />
                              ) : (
                                <FileText
                                  className="w-5 h-5"
                                  style={{ color: tool.color }}
                                />
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Pick Up Button */}
                            {tool.multiple && files.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTogglePickUp(idx);
                                }}
                                className={`px-2 py-1 text-[11px] font-bold rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                                  isPickedUp
                                    ? "bg-[#ea580c] text-white shadow-xs"
                                    : "bg-orange-50 text-[#ea580c] hover:bg-orange-100 border border-orange-200"
                                }`}
                                title={isPickedUp ? "Put down" : "Pick up to move"}
                              >
                                <Hand className="w-3 h-3" />
                                <span>{isPickedUp ? "In Hand" : "Pick Up"}</span>
                              </button>
                            )}

                            {/* Remove file button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFile(file.id);
                              }}
                              className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Remove file"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* File Name & Size */}
                        <div className="mt-3">
                          <div
                            className="text-sm font-semibold text-zinc-900 truncate"
                            title={file.name}
                          >
                            {file.name}
                          </div>
                          <div className="text-xs text-zinc-500 mt-0.5">
                            {formatBytes(file.size)}
                          </div>
                        </div>

                        {/* Bottom Row: Sequence Order Badge & Arrow Controls */}
                        {tool.id === "merge-pdf" && files.length > 1 && (
                          <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                            <span
                              className={`font-bold px-2 py-0.5 rounded-md text-[11px] transition-colors ${
                                isPickedUp
                                  ? "bg-[#ea580c] text-white"
                                  : "bg-zinc-100 text-zinc-700 font-semibold"
                              }`}
                            >
                              Order: #{idx + 1}
                            </span>

                            <div className="flex items-center gap-1">
                              <button
                                disabled={idx === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveFile(idx, "up");
                                }}
                                className="p-1 rounded hover:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                                title="Move up"
                              >
                                <MoveUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                disabled={idx === files.length - 1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveFile(idx, "down");
                                }}
                                className="p-1 rounded hover:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                                title="Move down"
                              >
                                <MoveDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Stage Footer */}
              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                <span>
                  Total size:{" "}
                  <strong className="text-zinc-800 font-bold">
                    {formatBytes(files.reduce((acc, f) => acc + f.size, 0))}
                  </strong>
                </span>
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready for processing
                </span>
              </div>
            </div>

            {/* Right: Options Drawer */}
            <div className="w-full lg:w-80 bg-white rounded-2xl border border-zinc-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-4 border-b border-zinc-100 mb-5">
                  <Sliders className="w-4 h-4 text-zinc-700" />
                  <h3 className="text-base font-bold text-zinc-900">
                    {tool.name} Settings
                  </h3>
                </div>

                <ToolOptionsPanel
                  tool={tool}
                  options={options}
                  setOptions={setOptions}
                  files={files}
                  setFiles={setFiles}
                  onClearPick={() => setPickedUpIndex(null)}
                />
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4 border-t border-zinc-100">

                {errorMessage && (
                  <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  onClick={handleProcess}
                  className="w-full py-4 px-6 rounded-xl text-white bg-[#ea580c] hover:bg-[#c2410c] text-base font-bold shadow-lg shadow-orange-500/25 transition-all transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Layers className="w-5 h-5" />
                  <span>{tool.actionButtonText}</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
