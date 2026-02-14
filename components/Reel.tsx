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

// Global preload cache - tracks which images have been successfully preloaded
const preloadedImages = new Set<string>();
let preloadPromise: Promise<void> | null = null;

// Preload all symbol images
function preloadAllImages(): Promise<void> {
  if (preloadPromise) return preloadPromise;

  preloadPromise = Promise.all(
    SYMBOLS.map((symbol) => {
      return new Promise<void>((resolve) => {
        if (preloadedImages.has(symbol.src)) {
          resolve();
          return;
        }

        const img = new Image();
        img.onload = () => {
          preloadedImages.add(symbol.src);
          resolve();
        };
        img.onerror = () => {
          failedSrcs.add(symbol.src);
          resolve(); // Resolve anyway to not block other images
        };
        img.src = symbol.src;
      });
    })
  ).then(() => { });

  return preloadPromise;
}

function SymbolFace({ symbol, isSpinning }: { symbol: Symbol; isSpinning: boolean }) {
  const [imgLoaded, setImgLoaded] = useState(() => preloadedImages.has(symbol.src));
  const [imgFailed, setImgFailed] = useState(() => failedSrcs.has(symbol.src));
  const imgRef = useRef<HTMLImageElement>(null);

  // Trigger preload on mount
  useEffect(() => {
    preloadAllImages();
  }, []);

  const handleError = useCallback(() => {
    failedSrcs.add(symbol.src);
    setImgFailed(true);
  }, [symbol.src]);

  const handleLoad = useCallback(() => {
    setImgLoaded(true);
  }, []);

  // Check if image is already loaded (from cache) on mount
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalWidth > 0) {
        setImgLoaded(true);
      } else {
        // Only set failed if truly broken (width 0), but usually onError fires
      }
    }
  }, []);

  // When symbol changes, reset loaded state (but keep failed from cache)
  const prevSrc = useRef(symbol.src);
  if (prevSrc.current !== symbol.src) {
    prevSrc.current = symbol.src;
    // If invalid in cache, fail immediately
    if (failedSrcs.has(symbol.src)) {
      setImgFailed(true);
      setImgLoaded(false);
    } else {
      setImgFailed(false);
      setImgLoaded(false);
    }
  }

  const showPlaceholder = imgFailed || !imgLoaded;

  return (
    <div className="w-full h-full relative overflow-hidden rounded-lg border border-white/10 shadow-sm bg-black">
      {/* Placeholder (always rendered underneath to prevent layout shift) */}
      <div
        className={clsx(
          "absolute inset-0 flex flex-col items-center justify-center gap-1 p-1",
          "bg-gradient-to-br shadow-inner transition-opacity duration-300",
          symbol.color,
          showPlaceholder ? "opacity-100" : "opacity-0"
        )}
      >
        <span className="text-xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          {symbol.initials}
        </span>
        <span className="text-[9px] font-semibold text-white/90 text-center leading-[1.1] break-words w-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] uppercase tracking-wide">
          {symbol.name}
        </span>
      </div>

      {/* Real image (hidden if failed, fades in on load) */}
      {!imgFailed && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={symbol.src}
            alt={symbol.name}
            className={clsx(
              "absolute inset-0 w-full h-full object-cover rounded-lg transition-opacity duration-500",
              imgLoaded ? "opacity-100" : "opacity-0"
            )}
            onError={handleError}
            onLoad={handleLoad}
            draggable={false}
            loading="eager"
          />

          {/* Subtle Bottom Shade for Text Readability - Only if loaded */}
          <div
            className={clsx(
              "absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none transition-opacity duration-500",
              imgLoaded ? "opacity-100" : "opacity-0"
            )}
          />

          {/* Name overlay at bottom */}
          {!isSpinning && (
            <div
              className={clsx(
                "absolute bottom-0 left-0 right-0 p-1 pb-1.5 flex items-end justify-center transition-opacity duration-500",
                imgLoaded ? "opacity-100" : "opacity-0"
              )}
            >
              <p className="text-[8px] sm:text-[9px] font-bold text-white text-center leading-[1.1] break-words uppercase tracking-wider drop-shadow-md px-0.5">
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
      {/* Outer gold frame - Softer and more elegant */}
      <div className="absolute -inset-[2px] rounded-xl bg-gradient-to-b from-[#cfb53b] via-[#fcd667] to-[#d4af37] shadow-lg" />

      {/* Inner container */}
      <div className="relative w-[95px] h-[115px] sm:w-[110px] sm:h-[130px] overflow-hidden rounded-xl bg-[#1a1a1a]">
        {/* Inner shadow for depth */}
        <div className="absolute inset-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.7)] rounded-xl pointer-events-none z-20" />

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
