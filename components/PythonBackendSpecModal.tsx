"use client";

import React, { useState } from "react";
import {
  X,
  Terminal,
  Check,
  Copy,
  Server,
  CheckCircle2,
  Wifi,
  WifiOff,
  RotateCw,
  ExternalLink,
} from "lucide-react";
import { useBackendStatus } from "@/context/BackendStatusContext";

interface PythonBackendSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PythonBackendSpecModal({
  isOpen,
  onClose,
}: PythonBackendSpecModalProps) {
  const [copied, setCopied] = useState(false);
  const { isOnline, latencyMs, isLoading, checkNow, service, backendUrl } =
    useBackendStatus();

  if (!isOpen) return null;

  const stackTable = [
    {
      feature: "Merge / Split / Rotate",
      library: "pypdf",
      dependency: "Native Python",
      endpoint: "POST /api/merge-pdf",
    },
    {
      feature: "PDF Compression",
      library: "pypdf",
      dependency: "Native Python",
      endpoint: "POST /api/compress-pdf",
    },
    {
      feature: "PDF to Word",
      library: "pdf2docx",
      dependency: "PyMuPDF + python-docx",
      endpoint: "POST /api/pdf-to-word",
    },
    {
      feature: "Word / PPT to PDF",
      library: "subprocess (LibreOffice) / docx2pdf",
      dependency: "Headless LibreOffice / MS Office",
      endpoint: "POST /api/word-to-pdf",
    },
    {
      feature: "Photo to PDF",
      library: "Pillow (PIL)",
      dependency: "Native Python",
      endpoint: "POST /api/photo-to-pdf",
    },
    {
      feature: "PDF to Image (Thumbnails)",
      library: "PyMuPDF (fitz) or pdf2image",
      dependency: "C Engine / Poppler",
      endpoint: "POST /api/pdf-to-image",
    },
    {
      feature: "PDF to Excel",
      library: "pdfplumber + pandas",
      dependency: "pdfminer.six + openpyxl",
      endpoint: "POST /api/pdf-to-excel",
    },
    {
      feature: "OCR (Scanned PDFs)",
      library: "pytesseract + pdf2image",
      dependency: "Tesseract Engine",
      endpoint: "POST /api/ocr-pdf",
    },
    {
      feature: "Watermark / Page Numbers",
      library: "ReportLab + pypdf",
      dependency: "Native Python",
      endpoint: "POST /api/watermark-pdf",
    },
  ];

  const handleCopyInstall = () => {
    navigator.clipboard.writeText("python run_backend.py");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-[#ea580c] flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Python PDF Engine Architecture
              </h3>
              <p className="text-xs text-zinc-400">
                Exact library &amp; underlying dependency matrix matching your specification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-zinc-700">
          {/* Live Suite Status banner */}
          <div
            className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isOnline === true
                ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                : isOnline === false
                ? "bg-amber-50 border-amber-200 text-amber-950"
                : "bg-zinc-50 border-zinc-200 text-zinc-900"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg mt-0.5 ${
                  isOnline === true
                    ? "bg-emerald-100 text-emerald-700"
                    : isOnline === false
                    ? "bg-amber-100 text-amber-700"
                    : "bg-zinc-200 text-zinc-600"
                }`}
              >
                {isOnline === true ? (
                  <Wifi className="w-5 h-5" />
                ) : isOnline === false ? (
                  <WifiOff className="w-5 h-5" />
                ) : (
                  <Server className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <strong className="text-sm font-bold">
                    {isOnline === true
                      ? "Python Suite is ONLINE"
                      : isOnline === false
                      ? "Python Suite is OFFLINE (Demo Mode Active)"
                      : "Checking Python Suite Status..."}
                  </strong>
                  {isOnline === true && latencyMs !== null && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-200/80 text-emerald-900">
                      {latencyMs}ms latency
                    </span>
                  )}
                </div>
                <p className="mt-1 leading-relaxed">
                  {isOnline === true ? (
                    <>
                      Connected to FastAPI engine at{" "}
                      <code className="font-bold font-mono bg-white/80 px-1 py-0.5 rounded border border-emerald-300">
                        {backendUrl}
                      </code>
                      . All native tools are processing real documents.
                    </>
                  ) : (
                    <>
                      The Next.js frontend is operating in browser simulation mode. Run{" "}
                      <code className="font-bold font-mono bg-white/80 px-1 py-0.5 rounded border border-amber-300">
                        python run_backend.py
                      </code>{" "}
                      to activate the native Python engine.
                    </>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={checkNow}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-white text-zinc-800 border border-zinc-200 hover:bg-zinc-100 shadow-2xs transition-all cursor-pointer shrink-0 disabled:opacity-50"
            >
              <RotateCw
                className={`w-3.5 h-3.5 text-[#ea580c] ${
                  isLoading ? "animate-spin" : ""
                }`}
              />
              <span>{isLoading ? "Pinging..." : "Test Ping"}</span>
            </button>
          </div>

          {/* Architecture Mapping Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2.5">
              Tool Specification Matrix
            </h4>
            <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-100/80 text-zinc-700 font-semibold border-b border-zinc-200">
                  <tr>
                    <th className="py-2.5 px-3">Feature / Tool</th>
                    <th className="py-2.5 px-3">Primary Python Library</th>
                    <th className="py-2.5 px-3">Underlying Dependency</th>
                    <th className="py-2.5 px-3">API Endpoint</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  {stackTable.map((row, i) => (
                    <tr key={i} className="hover:bg-orange-50/30 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-zinc-900">
                        {row.feature}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#ea580c] font-bold">
                        {row.library}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-500">
                        {row.dependency}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-600">
                        {row.endpoint}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Terminal Command */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Run Backend (FastAPI + Uvicorn)
              </h4>
              <button
                onClick={handleCopyInstall}
                className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy command</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3.5 bg-zinc-950 text-zinc-100 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
              <code>{`# Run Python Backend Suite:\npython run_backend.py\n\n# Or directly with Uvicorn:\nuvicorn backend.main:app --reload --port 8000`}</code>
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-zinc-500">
            Source code ready in <code className="text-zinc-800 font-bold">backend/main.py</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
