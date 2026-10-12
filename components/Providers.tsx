"use client";

import React, { ReactNode } from "react";
import { BackendStatusProvider } from "@/context/BackendStatusContext";

export default function Providers({ children }: { children: ReactNode }) {
  return <BackendStatusProvider>{children}</BackendStatusProvider>;
}
