"use client";

import React, { useState, useRef } from "react";
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
  Terminal,
  GripVertical,
  Hand,
  Layers,
  X,
  Wifi,
  WifiOff,
  AlertCircle,
} from "lucide-react";
import { ToolDefinition, UploadedFile, ToolOptions } from "@/types/tools";
import { useBackendStatus } from "@/context/BackendStatusContext";
import {
  apiMergePdf,
  apiCompressPdf,
  apiPdfToWord,
  apiWordToPdf,
  apiPhotoToPdf,
  createMockValidFile,
} from "@/lib/backendApi";

interface ToolWorkspaceProps {
  tool: ToolDefinition;
  onBack: () => void;
  onOpenBackendModal: () => void;
}

export default function ToolWorkspace({
  tool,
  onBack,
  onOpenBackendModal,
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
    ocrEnabled: false,
    pdfStandard: "pdf1.7",
    orientation: "portrait",
    pageSize: "a4",
    margin: "small",
    mergeAllImages: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const newFiles: UploadedFile[] = Array.from(fileList).map((f, idx) => ({
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
      setFiles((prev) => [...prev, ...newFiles]);
    } else {
      setFiles(newFiles.slice(0, 1));
    }
  };

  // Add demo sample files if user wants quick test
  const handleAddSampleFiles = () => {
    const sampleNames: Record<string, string[]> = {
      "merge-pdf": ["Technical_Resume_Part1.pdf", "Project_Portfolio.pdf", "Certifications_Appendix.pdf"],
      "pdf-compression": ["Annual_Company_Presentation_2026.pdf"],
      "pdf-to-word": ["Contract_Agreement_Final.pdf"],
      "word-to-pdf": ["Project_Specification_Draft.docx"],
      "photo-to-pdf": ["Scanned_Receipt_Page1.jpg", "Scanned_Receipt_Page2.png"],
    };

    const names = sampleNames[tool.id] || ["Sample_Document.pdf"];
    const samples: UploadedFile[] = names.map((name, i) => {
      const type = name.endsWith(".docx")
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : name.endsWith(".jpg") || name.endsWith(".png")
        ? "image/jpeg"
        : "application/pdf";
      const mockFile = createMockValidFile(name, type);
      return {
        id: `sample-${i}-${Date.now()}`,
        name,
        size: (i + 1) * 1.8 * 1024 * 1024,
        type,
        status: "ready",
        rawFile: mockFile,
      };
    });

    setFiles((prev) => (tool.multiple ? [...prev, ...samples] : [samples[0]]));
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

  // Client simulation fallback
  const runClientSimulation = () => {
    setIsProcessing(true);
    setProgress(0);
    setProcessingStage("Preparing files in browser...");

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 10;
      if (currentProgress < 35) {
        setProcessingStage("Simulating document analysis...");
      } else if (currentProgress < 75) {
        if (tool.id === "merge-pdf") {
          setProcessingStage("Simulating PDF page merge...");
        } else if (tool.id === "pdf-compression") {
          setProcessingStage("Simulating PDF stream compression...");
        } else if (tool.id === "pdf-to-word") {
          setProcessingStage("Simulating Word DOCX conversion...");
        } else if (tool.id === "word-to-pdf") {
          setProcessingStage("Simulating PDF rendering...");
        } else {
          setProcessingStage("Simulating photo collation...");
        }
      } else if (currentProgress < 95) {
        setProcessingStage("Finalizing demo output file...");
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          setIsProcessing(false);
          setIsDone(true);
          setProcessedByBackend(false);

          // Configure demo result file
          const firstFileName = files[0].name.replace(/\.[^/.]+$/, "");
          let outName = "";
          if (tool.id === "merge-pdf") {
            outName = `${firstFileName}_merged.pdf`;
          } else if (tool.id === "pdf-compression") {
            outName = `${firstFileName}_compressed.pdf`;
            const origTotal = files.reduce((acc, f) => acc + f.size, 0);
            const compTotal = Math.round(origTotal * 0.35); // 65% savings
            setFileSavings({
              originalSize: origTotal,
              compressedSize: compTotal,
              percent: 65,
            });
          } else if (tool.id === "pdf-to-word") {
            outName = `${firstFileName}_converted.docx`;
          } else if (tool.id === "word-to-pdf") {
            outName = `${firstFileName}.pdf`;
          } else {
            outName = `${firstFileName}_photos.pdf`;
          }
          setDownloadFileName(outName);
        }, 500);
      } else {
        setProgress(currentProgress);
      }
    }, 200);
  };

  // Process files (with real Python backend connection when online)
  const handleProcess = async () => {
    if (files.length === 0) return;

    // Check if Python backend is online
    if (isOnline) {
      setIsProcessing(true);
      setProgress(10);
      setErrorMessage(null);
      setProcessingStage("Connecting to Python FastAPI engine at localhost:8000...");

      try {
        const rawFiles: File[] = files.map((f) => {
          if (f.rawFile) return f.rawFile;
          return createMockValidFile(f.name, f.type);
        });

        setProgress(30);
        const engineDesc =
          tool.id === "merge-pdf"
            ? "Executing pypdf native engine..."
            : tool.id === "pdf-compression"
            ? "Executing pypdf stream compression..."
            : tool.id === "pdf-to-word"
            ? "Executing pdf2docx converter..."
            : tool.id === "word-to-pdf"
            ? "Executing headless document converter..."
            : "Executing Pillow (PIL) photo engine...";
        setProcessingStage(engineDesc);

        let receivedBlob: Blob;
        let finalFilename = "";

        if (tool.id === "merge-pdf") {
          const res = await apiMergePdf(rawFiles);
          receivedBlob = res.blob;
          finalFilename = res.filename;
        } else if (tool.id === "pdf-compression") {
          const res = await apiCompressPdf(rawFiles[0], options.compressionLevel || "recommended");
          receivedBlob = res.blob;
          finalFilename = res.filename;
          const origSize = res.originalSize;
          const compSize = res.compressedSize;
          const percent = origSize > 0 ? Math.max(5, Math.round(((origSize - compSize) / origSize) * 100)) : 45;
          setFileSavings({
            originalSize: origSize,
            compressedSize: compSize,
            percent,
          });
        } else if (tool.id === "pdf-to-word") {
          const res = await apiPdfToWord(rawFiles[0]);
          receivedBlob = res.blob;
          finalFilename = res.filename;
        } else if (tool.id === "word-to-pdf") {
          const res = await apiWordToPdf(rawFiles[0]);
          receivedBlob = res.blob;
          finalFilename = res.filename;
        } else {
          // photo-to-pdf
          const res = await apiPhotoToPdf(rawFiles, options.orientation || "portrait");
          receivedBlob = res.blob;
          finalFilename = res.filename;
        }

        setProgress(85);
        setProcessingStage("Streaming processed file from Python backend...");
        await new Promise((r) => setTimeout(r, 250));

        setProgress(100);
        setResultBlob(receivedBlob);
        setDownloadFileName(finalFilename);
        setProcessedByBackend(true);
        setIsProcessing(false);
        setIsDone(true);
        return;
      } catch (err: any) {
        console.warn("Backend call failed, using client simulation fallback:", err);
        setErrorMessage(
          `Python backend request notice: ${err?.message || "Running in client demo mode"}`
        );
        // Fall back seamlessly to client simulation
      }
    }

    // Fallback: Client simulation
    runClientSimulation();
  };

  // Trigger file download
  const handleDownload = () => {
    // If real file received from backend
    if (resultBlob) {
      const url = URL.createObjectURL(resultBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadFileName || "processed_file.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }

    // Fallback demo blob
    let mimeType = "application/pdf";
    let content = "%PDF-1.4\n%Simple PDF Export (Demo Mode)\n";

    if (downloadFileName.endsWith(".docx")) {
      mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      content = "PK\x03\x04... [Simple PDF Converted DOCX file content]";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadFileName || "processed_file.pdf";
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

          <div className="flex items-center gap-2">
            {/* Live Backend Status Chip */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border ${
                isOnline === true
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : isOnline === false
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-zinc-50 text-zinc-600 border-zinc-200"
              }`}
            >
              {isOnline === true ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden sm:inline">Suite Online</span>
                  {latencyMs !== null && (
                    <span className="font-mono text-[10px] text-emerald-700 bg-emerald-100/80 px-1 py-0.2 rounded">
                      {latencyMs}ms
                    </span>
                  )}
                </>
              ) : isOnline === false ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Demo Mode</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse" />
                  <span>Checking Suite...</span>
                </>
              )}
            </div>

            <button
              onClick={onOpenBackendModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-orange-900 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-md transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-[#ea580c]" />
              <span className="hidden sm:inline">Python Backend Docs</span>
            </button>
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
              {tool.id === "merge-pdf" && "PDFs have been merged!"}
              {tool.id === "pdf-compression" && "Your PDF is compressed!"}
              {tool.id === "pdf-to-word" && "Your PDF has been converted to Word!"}
              {tool.id === "word-to-pdf" && "Your Word file is now a PDF!"}
              {tool.id === "photo-to-pdf" && "Photos converted to PDF!"}
            </h2>

            <p className="text-sm text-zinc-600 mb-6">
              Your document is ready for download. Clean, secure, and ready to share.
            </p>

            {/* Live Engine Execution Badge */}
            <div
              className={`w-full rounded-xl p-3 mb-5 border text-xs flex items-center justify-between text-left ${
                processedByBackend
                  ? "bg-emerald-50/90 border-emerald-300 text-emerald-950"
                  : "bg-amber-50/90 border-amber-300 text-amber-950"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {processedByBackend ? (
                  <Wifi className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <div>
                  <span className="font-bold">
                    {processedByBackend
                      ? "Processed by Python Backend"
                      : "Generated in Client Demo Mode"}
                  </span>
                  <div className="text-[11px] opacity-85 mt-0.5">
                    {processedByBackend
                      ? `Native Python engine (${
                          toolMatrix?.[tool.id.replace(/-/g, "_")]?.library || "pypdf"
                        }) processed this file.`
                      : "Run `python run_backend.py` to enable the full Python engine."}
                  </div>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                  processedByBackend
                    ? "bg-emerald-200/80 text-emerald-900"
                    : "bg-amber-200/80 text-amber-900"
                }`}
              >
                {processedByBackend ? "Real Engine" : "Demo Mode"}
              </span>
            </div>

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

            {/* BIG ACTION DOWNLOAD BUTTON in BRAND ORANGE */}
            <button
              onClick={handleDownload}
              className="w-full py-4 px-8 rounded-xl text-white bg-[#ea580c] hover:bg-[#c2410c] text-lg font-bold shadow-lg shadow-orange-500/25 transition-all transform active:scale-98 flex items-center justify-center gap-3 cursor-pointer"
            >
              <Download className="w-6 h-6" />
              Download {tool.id === "pdf-to-word" ? "Word DOCX" : "PDF"}
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

            {/* Engine Note */}
            <div className="mt-8 pt-4 border-t border-zinc-200/80 text-xs text-zinc-500 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-zinc-400" />
              <span>
                Simple PDF engine active. Seamlessly connects to your Python backend.
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
          /* STATE 3: DROPZONE WITH ORANGE ACTION BUTTON */
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

              {/* Big Brand Orange Action Button */}
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
                  Supported: {tool.supportedFormats.join(", ")}
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
                      {tool.id === "merge-pdf"
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

                {/* File Cards Grid with Visual Pick & Drop Reordering */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-5">
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

                {tool.id === "merge-pdf" && (
                  <div className="space-y-4">
                    <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide block">
                      Sort Options
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          const sorted = [...files].sort((a, b) =>
                            a.name.localeCompare(b.name)
                          );
                          setFiles(sorted);
                          setPickedUpIndex(null);
                        }}
                        className="w-full py-2 px-3 text-xs font-semibold text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg flex items-center justify-between cursor-pointer"
                      >
                        <span>Sort A-Z Alphabetical</span>
                        <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                      </button>
                      <button
                        onClick={() => {
                          const sorted = [...files].sort((a, b) =>
                            b.name.localeCompare(a.name)
                          );
                          setFiles(sorted);
                          setPickedUpIndex(null);
                        }}
                        className="w-full py-2 px-3 text-xs font-semibold text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg flex items-center justify-between cursor-pointer"
                      >
                        <span>Sort Z-A Reverse</span>
                        <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                      </button>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-xl border border-orange-200/60 text-xs text-orange-900">
                      Files will be concatenated in the exact sequential order listed on the left.
                    </div>
                  </div>
                )}

                {tool.id === "pdf-compression" && (
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide block">
                      Compression Level
                    </label>
                    {[
                      {
                        key: "extreme",
                        title: "Extreme Compression",
                        desc: "Less quality, high compression (highest size reduction)",
                      },
                      {
                        key: "recommended",
                        title: "Recommended Compression",
                        desc: "Good quality, good compression (ideal for emails)",
                      },
                      {
                        key: "less",
                        title: "Less Compression",
                        desc: "High quality, less compression (best visual detail)",
                      },
                    ].map((lvl) => (
                      <div
                        key={lvl.key}
                        onClick={() =>
                          setOptions({
                            ...options,
                            compressionLevel: lvl.key as any,
                          })
                        }
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          options.compressionLevel === lvl.key
                            ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 font-semibold"
                            : "border-zinc-200 hover:border-zinc-300 bg-white"
                        }`}
                      >
                        <div className="text-xs font-bold">{lvl.title}</div>
                        <div className="text-[11px] text-zinc-500 font-normal mt-0.5">
                          {lvl.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tool.id === "pdf-to-word" && (
                  <div className="space-y-4">
                    <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide block">
                      Conversion Engine
                    </label>
                    <div
                      onClick={() => setOptions({ ...options, ocrEnabled: false })}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        !options.ocrEnabled
                          ? "border-sky-500 bg-sky-50/50 font-semibold"
                          : "border-zinc-200 bg-white"
                      }`}
                    >
                      <div className="text-xs font-bold text-zinc-900">
                        Standard Conversion (No OCR)
                      </div>
                      <div className="text-[11px] text-zinc-500 font-normal mt-0.5">
                        Faster. Extracts digital text, tables, and images directly.
                      </div>
                    </div>

                    <div
                      onClick={() => setOptions({ ...options, ocrEnabled: true })}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        options.ocrEnabled
                          ? "border-sky-500 bg-sky-50/50 font-semibold"
                          : "border-zinc-200 bg-white"
                      }`}
                    >
                      <div className="text-xs font-bold text-zinc-900">
                        OCR Scan Recognition
                      </div>
                      <div className="text-[11px] text-zinc-500 font-normal mt-0.5">
                        Converts scanned non-selectable PDF pages into editable Word text.
                      </div>
                    </div>
                  </div>
                )}

                {tool.id === "word-to-pdf" && (
                  <div className="space-y-4">
                    <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide block">
                      PDF Standard
                    </label>
                    <select
                      value={options.pdfStandard}
                      onChange={(e) =>
                        setOptions({ ...options, pdfStandard: e.target.value as any })
                      }
                      className="w-full text-xs font-medium py-2 px-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="pdf1.7">Standard PDF (v1.7) - Web & Print</option>
                      <option value="pdf/a-1b">PDF/A-1b (Long term archival)</option>
                      <option value="pdf/a-2b">PDF/A-2b (Modern archival)</option>
                    </select>

                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200/60 text-xs text-blue-900">
                      Retains typography, headings, margins, and inline high-resolution images.
                    </div>
                  </div>
                )}

                {tool.id === "photo-to-pdf" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide block mb-1.5">
                        Page Orientation
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {["portrait", "landscape"].map((ori) => (
                          <button
                            key={ori}
                            onClick={() =>
                              setOptions({ ...options, orientation: ori as any })
                            }
                            className={`py-2 px-3 text-xs font-semibold rounded-lg capitalize border cursor-pointer transition-all ${
                              options.orientation === ori
                                ? "border-amber-500 bg-amber-50 text-amber-950 font-bold"
                                : "border-zinc-200 bg-white text-zinc-700"
                            }`}
                          >
                            {ori}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide block mb-1.5">
                        Page Size
                      </label>
                      <select
                        value={options.pageSize}
                        onChange={(e) =>
                          setOptions({ ...options, pageSize: e.target.value as any })
                        }
                        className="w-full text-xs font-medium py-2 px-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none"
                      >
                        <option value="fit">Fit image size (Original aspect)</option>
                        <option value="a4">A4 (297 x 210 mm)</option>
                        <option value="letter">US Letter (215 x 279 mm)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide block mb-1.5">
                        Margins
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {["none", "small", "big"].map((m) => (
                          <button
                            key={m}
                            onClick={() =>
                              setOptions({ ...options, margin: m as any })
                            }
                            className={`py-1.5 text-xs font-semibold rounded-lg capitalize border cursor-pointer transition-all ${
                              options.margin === m
                                ? "border-amber-500 bg-amber-50 text-amber-950 font-bold"
                                : "border-zinc-200 bg-white text-zinc-700"
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button - Brand Orange */}
              <div className="mt-8 pt-4 border-t border-zinc-100">
                {/* Live Backend Connection Chip */}
                {isOnline === true ? (
                  <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/90 text-xs flex items-center justify-between text-emerald-950 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="font-semibold text-emerald-900">
                        Connected to Python Backend
                      </span>
                    </div>
                    {latencyMs !== null && (
                      <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-medium">
                        {latencyMs}ms
                      </span>
                    )}
                  </div>
                ) : isOnline === false ? (
                  <div className="mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200/90 text-xs flex items-center justify-between text-amber-950 shadow-2xs">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span className="font-semibold text-amber-900">
                        Running in Demo Mode
                      </span>
                    </div>
                    <button
                      onClick={onOpenBackendModal}
                      className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                    >
                      Start Backend ➔
                    </button>
                  </div>
                ) : null}

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
