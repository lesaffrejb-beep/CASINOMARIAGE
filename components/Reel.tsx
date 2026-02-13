"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { SYMBOLS, type Symbol } from "@/lib/utils";

interface ReelProps {
  finalSymbol: Symbol | null;
  spinning: boolean;
  stopDelay: number;
  reelIndex: number;
}

interface SymbolFaceProps {
  symbol: Symbol;
  isSpinning: boolean;
}

function SymbolFace({ symbol, isSpinning }: SymbolFaceProps) {
  const [imgError, setImgError] = useState(false);
  const imgKey = symbol.src;

  // Reset error state when symbol changes
  useEffect(() => {
    setImgError(false);
  }, [imgKey]);

  if (imgError) {
    // Beautiful placeholder with initials + name
    return (
      <div
        className={clsx(
          "w-full h-full rounded-lg flex flex-col items-center justify-center gap-1",
          "bg-gradient-to-br border-2 border-white/20 shadow-inner",
          symbol.color
        )}
      >
        <span className="text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          {symbol.initials}
        </span>
        <span className="text-[10px] font-semibold text-white/90 text-center leading-tight px-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] uppercase tracking-wide">
          {symbol.name}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative rounded-lg overflow-hidden border-[1.5px] border-yellow-500/30 bg-black/20">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={symbol.src}
        alt={symbol.name}
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
        draggable={false}
        loading="eager"
      />

      {/* Subtle Shine */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-white/10 to-transparent pointer-events-none mix-blend-overlay" />

      {/* Name overlay at bottom */}
      {!isSpinning && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-4 pb-1">
          <p className="text-[10px] font-bold text-white text-center truncate drop-shadow-[0_1px_2px_black] uppercase tracking-wider px-1">
            {symbol.name}
          </p>
        </div>
      )}
    </div>
  );
}

export default function Reel({ finalSymbol, spinning, stopDelay, reelIndex }: ReelProps) {
  const [displaySymbol, setDisplaySymbol] = useState<Symbol>(SYMBOLS[reelIndex % SYMBOLS.length]);
  const [isLocked, setIsLocked] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (spinning) {
      setIsLocked(false);

      let tick = 0;
      intervalRef.current = setInterval(() => {
        tick++;
        setDisplaySymbol(SYMBOLS[tick % SYMBOLS.length]);
      }, 80);

      timeoutRef.current = setTimeout(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (finalSymbol) {
          setDisplaySymbol(finalSymbol);
        }
        setIsLocked(true);
      }, stopDelay);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [spinning, stopDelay, finalSymbol]);

  return (
    <div className="relative">
      {/* Outer gold frame */}
      <div className="absolute -inset-[3px] rounded-xl bg-gradient-to-b from-yellow-400 via-gold to-yellow-600 shadow-[0_0_12px_rgba(255,215,0,0.3)]" />

      {/* Inner container */}
      <div className="relative w-[95px] h-[115px] sm:w-[110px] sm:h-[130px] overflow-hidden rounded-xl bg-[#0a0f1e]">
        {/* Inner shadow */}
        <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.6)] rounded-xl pointer-events-none z-20" />

        <AnimatePresence mode="wait">
          <motion.div
            key={`${displaySymbol.id}-${isLocked ? "locked" : "spin"}`}
            className="w-full h-full"
            initial={isLocked ? { y: -50, scale: 0.7, opacity: 0.5 } : { y: 0, opacity: 0.6 }}
            animate={
              isLocked
                ? {
                  y: 0,
                  scale: 1,
                  opacity: 1,
                  transition: {
                    type: "spring",
                    stiffness: 400,
                    damping: 12,
                    mass: 1.5,
                  },
                }
                : {
                  y: [-15, 0, 15, 0], // Vertical vibration loop
                  opacity: 0.8,
                  transition: {
                    duration: 0.1,
                    repeat: Infinity,
                    ease: "linear"
                  },
                }
            }
            style={{
              filter: spinning && !isLocked ? "blur(4px) brightness(0.8)" : "none",
            }}
          >
            <SymbolFace symbol={displaySymbol} isSpinning={spinning && !isLocked} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Lock flash effect */}
      {isLocked && spinning && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none z-30"
          initial={{ opacity: 0.8, background: "rgba(255, 215, 0, 0.3)" }}
          animate={{ opacity: 0, background: "rgba(255, 215, 0, 0)" }}
          transition={{ duration: 0.4 }}
        />
      )}
    </div>
    </div >
  );
}
