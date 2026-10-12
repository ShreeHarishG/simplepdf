"use client";

import React from "react";
import Image from "next/image";
import { ShieldCheck, Zap, Lock, Terminal, Sparkles } from "lucide-react";
import { ToolId } from "@/types/tools";
import { TOOLS_CONFIG } from "@/data/tools";

interface FooterProps {
  onSelectTool: (id: ToolId) => void;
  onOpenBackendModal: () => void;
}

export default function Footer({
  onSelectTool,
  onOpenBackendModal,
}: FooterProps) {
  return (
    <footer className="bg-white border-t border-zinc-200/80 mt-auto">
      {/* Reassurance Banner */}
      <div className="border-b border-zinc-100 bg-[#fafafc] py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#ea580c] flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900">Lightning Fast</h4>
              <p className="text-xs text-zinc-500 mt-0.5">
                Process and convert your documents in seconds with high-speed performance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900">100% Free &amp; Secure</h4>
              <p className="text-xs text-zinc-500 mt-0.5">
                Files are strictly protected and processed with industry security standards.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900">Privacy First</h4>
              <p className="text-xs text-zinc-500 mt-0.5">
                Client privacy guaranteed. No data is stored without explicit consent.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-none">
                  <polygon
                    points="50,4 90,26 90,74 50,96 10,74 10,26"
                    fill="#ea580c"
                  />
                  <polygon
                    points="50,20 76,34 76,66 50,80 24,66 24,34"
                    fill="#ffffff"
                  />
                  <polygon
                    points="50,32 66,41 66,59 50,68 34,59 34,41"
                    fill="#ea580c"
                  />
                </svg>
              </div>
              <div className="text-2xl font-extrabold tracking-tight">
                <span className="text-zinc-900">Simple</span>
                <span className="text-[#ea580c] ml-1">PDF</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-500 max-w-sm leading-relaxed">
              Online document tools designed with simplicity. Effortlessly merge,
              compress, and convert your documents with TFRENZY.
            </p>

            {/* Company Logo in Footer */}
            <div className="pt-2 flex items-center gap-3">
              <span className="text-xs text-zinc-400 font-medium">Powered by:</span>
              <div className="relative h-9 w-36">
                <Image
                  src="/tfrenzy-logo.png"
                  alt="TFRENZY"
                  fill
                  sizes="144px"
                  className="object-contain object-left"
                />
              </div>
            </div>
          </div>

          {/* Col 2: Task For Today Tools */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-3">
              Task for Today Tools
            </h5>
            <ul className="space-y-2 text-xs">
              {TOOLS_CONFIG.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => onSelectTool(t.id)}
                    className="text-zinc-600 hover:text-[#ea580c] transition-colors cursor-pointer text-left font-medium"
                  >
                    {t.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Python Backend */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-3">
              Python Backend Engine
            </h5>
            <p className="text-xs text-zinc-500 mb-3 leading-relaxed">
              FastAPI backend integration specification and ready endpoints.
            </p>
            <button
              onClick={onOpenBackendModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-orange-950 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-[#ea580c]" />
              View Python Spec
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-3">
          <p>© 2026 Simple PDF by TFRENZY. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Developed with <Sparkles className="w-3.5 h-3.5 text-[#ea580c]" /> for TFRENZY (प्रौद्योगिकी करणीयम्)
          </p>
        </div>
      </div>
    </footer>
  );
}
