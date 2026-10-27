"use client";

import React from "react";
import { Search } from "lucide-react";

interface FigmaTopHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenBackendModal?: () => void;
}

export default function FigmaTopHeader({
  searchQuery,
  onSearchChange,
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

      {/* Right User Section matching Figma */}
      <div className="flex items-center gap-4">
        {/* User Profile matching Figma: Green avatar "SM" + "Saran SM" */}
        <div className="flex items-center gap-2.5">
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
