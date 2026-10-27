"use client";

import React, { useState } from "react";
import { GripVertical, RotateCw, Trash2, Hand, Layers } from "lucide-react";
import { PdfPageItem } from "@/types/tools";

interface PageOrganizerProps {
  pages: PdfPageItem[];
  loading: boolean;
  error: string | null;
  truncated: boolean;
  onReorder: (from: number, to: number) => void;
  onRotate: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function PageOrganizer({
  pages,
  loading,
  error,
  truncated,
  onReorder,
  onRotate,
  onDelete,
}: PageOrganizerProps) {
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const dropAt = (from: number, to: number) => {
    onReorder(from, to);
    setPickedIndex(null);
    setDraggedIndex(null);
    setOverIndex(null);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 mt-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-52 rounded-xl border border-zinc-200 bg-zinc-50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="mt-6 p-6 rounded-xl border border-dashed border-zinc-300 text-center text-sm text-zinc-500">
        No pages left. Upload the PDF again to restore them.
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
      {truncated && (
        <div className="mb-3 p-2.5 rounded-xl bg-violet-50 border border-violet-200 text-xs text-violet-900">
          Showing the first 60 pages. Extra pages stay out of this view.
        </div>
      )}
      {pickedIndex !== null && (
        <div className="mb-3 p-3 bg-violet-600 text-white rounded-xl flex items-center justify-between">
          <div className="text-xs font-bold flex items-center gap-2">
            <Hand className="w-3.5 h-3.5" />
            Page {pickedIndex + 1} picked up — click another card to drop it there.
          </div>
          <button
            type="button"
            onClick={() => setPickedIndex(null)}
            className="px-2.5 py-1 text-[11px] font-bold bg-white text-violet-800 rounded-lg cursor-pointer"
          >
            Put down
          </button>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
        {pages.map((page, index) => {
          const isPicked = pickedIndex === index;
          const isTarget = pickedIndex !== null && pickedIndex !== index;
          const isDragOver = overIndex === index && draggedIndex !== index;
          return (
            <div
              key={page.id}
              draggable
              onDragStart={(event) => {
                setDraggedIndex(index);
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", String(index));
              }}
              onDragOver={(event) => {
                event.preventDefault();
                if (overIndex !== index) setOverIndex(index);
              }}
              onDragLeave={() => {
                if (overIndex === index) setOverIndex(null);
              }}
              onDrop={(event) => {
                event.preventDefault();
                const from = draggedIndex ?? pickedIndex;
                if (from !== null && from !== index) dropAt(from, index);
              }}
              onDragEnd={() => {
                setDraggedIndex(null);
                setOverIndex(null);
              }}
              onClick={() => {
                if (pickedIndex !== null && pickedIndex !== index) dropAt(pickedIndex, index);
              }}
              className={`relative rounded-xl border bg-white p-2.5 transition-all select-none ${
                isPicked
                  ? "border-violet-500 ring-4 ring-violet-200 -translate-y-0.5"
                  : isDragOver || isTarget
                  ? "border-dashed border-violet-400 bg-violet-50"
                  : "border-zinc-200 hover:border-violet-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-600">
                  <GripVertical className="w-3.5 h-3.5 text-zinc-400 cursor-grab" />
                  #{index + 1}
                </span>
                <span className="text-[10px] text-zinc-400">src {page.sourceIndex + 1}</span>
              </div>
              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                {page.thumbUrl ? (
                  <img
                    src={page.thumbUrl}
                    alt={`Page ${index + 1}`}
                    className="max-w-full max-h-full object-contain"
                    style={{ transform: `rotate(${page.rotate}deg)` }}
                  />
                ) : (
                  <Layers className="w-8 h-8 text-violet-400" />
                )}
              </div>
              <div className="mt-2 flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setPickedIndex(isPicked ? null : index);
                  }}
                  className={`px-2 py-1 text-[11px] font-bold rounded-md cursor-pointer ${
                    isPicked ? "bg-violet-600 text-white" : "bg-violet-50 text-violet-700"
                  }`}
                >
                  {isPicked ? "In hand" : "Pick up"}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onRotate(page.id);
                    }}
                    className="p-1.5 rounded-md text-zinc-500 hover:bg-violet-50 hover:text-violet-700 cursor-pointer"
                    title="Rotate 90°"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(page.id);
                    }}
                    className="p-1.5 rounded-md text-zinc-400 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                    title="Delete page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
