"use client";

import SlotMachine from "@/components/SlotMachine";

export default function Home() {
  return (
    <main className="min-h-screen bg-midnight flex items-start justify-center overflow-x-hidden">
      {/* Subtle radial glow behind machine */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gold/5 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full bg-pink-500/5 blur-[80px]" />
      </div>

      <div className="relative z-10 w-full">
        <SlotMachine />
      </div>
    </main>
  );
}
