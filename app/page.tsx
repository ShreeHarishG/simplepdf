"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ToolCard from "@/components/ToolCard";
import ToolWorkspace from "@/components/ToolWorkspace";
import PythonBackendSpecModal from "@/components/PythonBackendSpecModal";
import Footer from "@/components/Footer";
import { TOOLS_CONFIG } from "@/data/tools";
import { ToolId } from "@/types/tools";
import { ArrowRight, Zap } from "lucide-react";

function HomeContent() {
  const searchParams = useSearchParams();
  const initialToolParam = searchParams.get("tool") as ToolId | null;

  const [activeToolId, setActiveToolId] = useState<ToolId | null>(
    TOOLS_CONFIG.some((t) => t.id === initialToolParam)
      ? initialToolParam
      : null
  );
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);

  // Sync with search params if changed
  useEffect(() => {
    const param = searchParams.get("tool") as ToolId | null;
    if (param && TOOLS_CONFIG.some((t) => t.id === param)) {
      setActiveToolId(param);
    }
  }, [searchParams]);

  const activeTool = TOOLS_CONFIG.find((t) => t.id === activeToolId) || null;

  const handleSelectTool = (id: ToolId | null) => {
    setActiveToolId(id);
    if (id) {
      window.history.pushState(null, "", `?tool=${id}`);
      window.scrollTo(0, 0);
    } else {
      window.history.pushState(null, "", "/");
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafc]">
      {/* Navigation Bar: Simple PDF Header */}
      <Navbar
        activeTool={activeToolId}
        onSelectTool={handleSelectTool}
        onOpenBackendModal={() => setIsBackendModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {activeTool ? (
          <ToolWorkspace
            tool={activeTool}
            onBack={() => handleSelectTool(null)}
            onOpenBackendModal={() => setIsBackendModalOpen(true)}
          />
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Hero Section */}
            <Hero onSelectTool={handleSelectTool} />

            {/* Core 5 Tools Grid - Task For Today */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">
                    Core PDF Tools
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Click any tool to start converting, merging, or compressing
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-orange-50 text-[#ea580c] border border-orange-200/60 rounded-full">
                  5 Tools Available
                </span>
              </div>

              {/* Grid: Exactly the 5 requested tools */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {TOOLS_CONFIG.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    onSelect={() => handleSelectTool(tool.id)}
                  />
                ))}

                {/* 6th Card: Python Backend Engine Callout */}
                <div
                  onClick={() => setIsBackendModalOpen(true)}
                  className="group relative flex flex-col justify-between p-6 sm:p-7 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent rounded-2xl border border-orange-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_14px_28px_rgba(234,88,12,0.12)] transition-all duration-200 hover:-translate-y-1.5 cursor-pointer text-left"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#ea580c] flex items-center justify-center mb-4">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div className="inline-block px-2 py-0.5 bg-orange-100 text-[#ea580c] text-[10px] font-extrabold rounded-md uppercase tracking-wide mb-2">
                      Ready For Backend
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 mb-2">
                      Python Backend Engine
                    </h3>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      All 5 core tools are pre-configured to hook into your FastAPI/Flask Python backend whenever you are ready.
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-orange-200/60 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#ea580c]">
                      Explore Python API
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#ea580c] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectTool={handleSelectTool}
        onOpenBackendModal={() => setIsBackendModalOpen(true)}
      />

      {/* Python Backend Spec Modal */}
      <PythonBackendSpecModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fafafc]">
          <div className="w-8 h-8 border-3 border-[#ea580c] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
