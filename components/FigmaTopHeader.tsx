"use client";

import React from "react";
import { Search, Terminal, Bell } from "lucide-react";

interface FigmaTopHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenBackendModal: () => void;
}

export default function FigmaTopHeader({
  searchQuery,
  onSearchChange,
  onOpenBackendModal,
}: FigmaTopHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-zinc-200/90 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      {/* Search Input matching Figma */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search or type command..."
          className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50/60 hover:bg-zinc-50 focus:bg-white border border-zinc-200/80 focus:border-zinc-300 rounded-lg outline-none transition-all placeholder:text-zinc-400 text-zinc-800"
        />
      </div>

      {/* Right User & Status Section matching Figma */}
      <div className="flex items-center gap-4">
        {/* Python Backend Indicator */}
        <button
          onClick={onOpenBackendModal}
          className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 text-xs font-semibold text-zinc-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-full transition-colors cursor-pointer"
          title="Python Backend Specification"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Terminal className="w-3.5 h-3.5 text-amber-700" />
          <span className="text-[11px] font-medium text-zinc-800">Python Backend Ready</span>
        </button>

        {/* User Profile matching Figma: Green avatar "SM" + "Saran SM" */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-zinc-200">
          <div className="w-7 h-7 rounded-full bg-[#55ba8a] text-white flex items-center justify-center text-xs font-bold">
            SM
          </div>
          <span className="text-xs font-bold text-zinc-800 select-none hidden sm:inline">
            Saran SM
          </span>
        </div>
      </div>
    </header>
  );
}
