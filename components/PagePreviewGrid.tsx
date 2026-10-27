"use client";

import React, { useState } from "react";
import { GripVertical, RotateCcw, RotateCw, Trash2, Check } from "lucide-react";
import { PdfPageItem } from "@/types/tools";

interface PagePreviewGridProps {
  mode: "organize" | "split" | "rotate";
  pages: PdfPageItem[];
  loading: boolean;
  error: string | null;
  onReorder: (from: number, to: number) => void;
  onRotate: (id: string, delta: 90 | -90) => void;
  onDelete: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onRotateAll: (delta: 90 | -90) => void;
  onSelectAll: (selected: boolean) => void;
}

export default function PagePreviewGrid({
  mode,
  pages,
  loading,
  error,
  onReorder,
  onRotate,
  onDelete,
  onToggleSelect,
  onRotateAll,
  onSelectAll,
}: PagePreviewGridProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const selectedCount = pages.filter((page) => page.selected).length;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-80 rounded-2xl border border-zinc-200 bg-zinc-50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="mt-6 p-6 rounded-xl border border-dashed border-zinc-300 text-center text-sm text-zinc-500">
        No pages to show. Upload the PDF again.
      </div>
    );
  }

  return (
    <div className="mt-5">
      {error && (
        <div className="mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {mode === "split" && (
          <>
            <button
              type="button"
              onClick={() => onSelectAll(true)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-teal-50 text-teal-800 border border-teal-200 cursor-pointer"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={() => onSelectAll(false)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white text-zinc-700 border border-zinc-200 cursor-pointer"
            >
              Clear
            </button>
            <span className="text-xs text-zinc-500">{selectedCount} page{selectedCount === 1 ? "" : "s"} selected</span>
          </>
        )}
        {(mode === "rotate" || mode === "organize") && (
          <>
            <button
              type="button"
              onClick={() => onRotateAll(-90)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Turn all left
            </button>
            <button
              type="button"
              onClick={() => onRotateAll(90)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Turn all right
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {pages.map((page, index) => {
          const isDragOver = overIndex === index && draggedIndex !== index;
          const isSelected = Boolean(page.selected);
          return (
            <div
              key={page.id}
              draggable={mode === "organize"}
              onDragStart={() => setDraggedIndex(index)}
              onDragOver={(event) => {
                event.preventDefault();
                if (overIndex !== index) setOverIndex(index);
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (draggedIndex !== null && draggedIndex !== index) onReorder(draggedIndex, index);
                setDraggedIndex(null);
                setOverIndex(null);
              }}
              onDragEnd={() => {
                setDraggedIndex(null);
                setOverIndex(null);
              }}
              onClick={() => {
                if (mode === "split") onToggleSelect(page.id);
              }}
              className={`rounded-2xl border bg-white p-3 transition-all ${
                mode === "split" && isSelected
                  ? "border-teal-500 ring-4 ring-teal-100"
                  : isDragOver
                  ? "border-dashed border-violet-400 bg-violet-50"
                  : "border-zinc-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-zinc-700">
                  {mode === "organize" && <GripVertical className="w-4 h-4 text-zinc-400" />}
                  Page {index + 1}
                </span>
                {mode === "split" && (
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${isSelected ? "text-teal-700" : "text-zinc-400"}`}>
                    <Check className="w-3.5 h-3.5" />
                    {isSelected ? "Included" : "Skipped"}
                  </span>
                )}
              </div>

              <div className="min-h-64 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                <img
                  src={page.thumbUrl}
                  alt={`Page ${index + 1}`}
                  className="max-w-full max-h-80 object-contain"
                  style={{ transform: `rotate(${page.rotate}deg)`, transformOrigin: "center" }}
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {(mode === "rotate" || mode === "organize") && (
                  <>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRotate(page.id, -90);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-zinc-100 text-zinc-800 hover:bg-indigo-50 hover:text-indigo-800 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Left
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRotate(page.id, 90);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-zinc-100 text-zinc-800 hover:bg-indigo-50 hover:text-indigo-800 cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      Right
                    </button>
                  </>
                )}
                {mode === "organize" && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(page.id);
                    }}
                    className="ml-auto inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
