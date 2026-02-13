"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import clsx from "clsx";
import { SYMBOLS, type Symbol } from "@/lib/utils";

interface ReelProps {
  finalSymbol: Symbol | null;
  spinning: boolean;
  stopDelay: number;
  reelIndex: number;
}

// Cache failed image sources globally so we never retry a broken src
const failedSrcs = new Set<string>();

function SymbolFace({ symbol, isSpinning }: { symbol: Symbol; isSpinning: boolean }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(() => failedSrcs.has(symbol.src));

  const handleError = useCallback(() => {
    failedSrcs.add(symbol.src);
    setImgFailed(true);
  }, [symbol.src]);

  const handleLoad = useCallback(() => {
    setImgLoaded(true);
  }, []);

  // When symbol changes, reset loaded state (but keep failed from cache)
  const prevSrc = useRef(symbol.src);
  if (prevSrc.current !== symbol.src) {
    prevSrc.current = symbol.src;
    setImgLoaded(false);
    setImgFailed(failedSrcs.has(symbol.src));
  }

  const showPlaceholder = imgFailed || !imgLoaded;

  return (
    <div className="w-full h-full relative overflow-hidden rounded-lg">
      {/* Placeholder (always rendered underneath to prevent layout shift) */}
      <div
        className={clsx(
          "absolute inset-0 flex flex-col items-center justify-center gap-1",
          "bg-gradient-to-br border-2 border-white/20 shadow-inner transition-opacity duration-100",
          symbol.color,
          showPlaceholder ? "opacity-100" : "opacity-0"
        )}
      >
        <span className="text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          {symbol.initials}
        </span>
        <span className="text-[10px] font-semibold text-white/90 text-center leading-tight px-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] uppercase tracking-wide">
          {symbol.name}
        </span>
      </div>

      {/* Real image (hidden if failed, fades in on load) */}
      {!imgFailed && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={symbol.src}
            alt={symbol.name}
            className={clsx(
              "absolute inset-0 w-full h-full object-cover rounded-lg transition-opacity duration-150",
              imgLoaded ? "opacity-100" : "opacity-0"
            )}
            onError={handleError}
            onLoad={handleLoad}
            draggable={false}
            loading="eager"
          />
          {/* Subtle Shine */}
          {imgLoaded && (
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-white/10 to-transparent pointer-events-none mix-blend-overlay" />
          )}
          {/* Name overlay at bottom */}
          {imgLoaded && !isSpinning && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-4 pb-1">
              <p className="text-[10px] font-bold text-white text-center truncate drop-shadow-[0_1px_2px_black] uppercase tracking-wider px-1">
                {symbol.name}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function Reel({ finalSymbol, spinning, stopDelay, reelIndex }: ReelProps) {
  const [displaySymbol, setDisplaySymbol] = useState<Symbol>(SYMBOLS[reelIndex % SYMBOLS.length]);
  const [isLocked, setIsLocked] = useState(false);
  const hasSpunRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (spinning) {
      hasSpunRef.current = true;
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

  const isIdle = !spinning && !isLocked;
  const isSpinCycling = spinning && !isLocked;
  const isLanding = isLocked;

  return (
    <div className="relative">
      {/* Outer gold frame */}
      <div className="absolute -inset-[3px] rounded-xl bg-gradient-to-b from-yellow-400 via-gold to-yellow-600 shadow-[0_0_12px_rgba(255,215,0,0.3)]" />

      {/* Inner container */}
      <div className="relative w-[95px] h-[115px] sm:w-[110px] sm:h-[130px] overflow-hidden rounded-xl bg-[#0a0f1e]">
        {/* Inner shadow */}
        <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.6)] rounded-xl pointer-events-none z-20" />

        {isIdle && !hasSpunRef.current ? (
          // First render: completely static, no animation = no jump
          <div className="w-full h-full">
            <SymbolFace symbol={displaySymbol} isSpinning={false} />
          </div>
        ) : (
          <AnimatePresence mode="sync">
            <motion.div
              key={`${displaySymbol.id}-${isLanding ? "land" : "cycle"}`}
              className="w-full h-full"
              initial={
                isLanding
                  ? { y: -40, scale: 0.8, opacity: 0.6 }
                  : false
              }
              animate={{
                y: 0,
                scale: 1,
                opacity: 1,
                transition: isLanding
                  ? { type: "spring", stiffness: 350, damping: 14, mass: 1.2 }
                  : { duration: 0.04 },
              }}
              style={{
                filter: isSpinCycling
                  ? "blur(4px) brightness(0.8)"
                  : "none",
              }}
            >
              <SymbolFace symbol={displaySymbol} isSpinning={isSpinCycling} />
            </motion.div>
          </AnimatePresence>
        )}

        {/* Lock flash effect */}
        {isLocked && spinning && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none z-30"
            initial={{ opacity: 0.6, background: "rgba(255, 215, 0, 0.25)" }}
            animate={{ opacity: 0, background: "rgba(255, 215, 0, 0)" }}
            transition={{ duration: 0.35 }}
          />
        )}
      </div>
    </div>
  );
}
