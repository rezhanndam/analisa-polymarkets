"use client";

import { Sidebar } from "@/components/Sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0e172a]">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-6 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}
