"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import JSConfetti from "js-confetti";
import { Heart, Sparkles } from "lucide-react";
import clsx from "clsx";
import Reel from "./Reel";
import { spin, COOLDOWN_MS, type SpinResult } from "@/lib/utils";

export default function SlotMachine() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [forceNextWin, setForceNextWin] = useState(false);
  const [godModeFlash, setGodModeFlash] = useState(false);
  const [spinCount, setSpinCount] = useState(0);

  const confettiRef = useRef<JSConfetti | null>(null);
  const lastTapRef = useRef<number>(0);
  const cooldownRafRef = useRef<number>(0);

  useEffect(() => {
    confettiRef.current = new JSConfetti();
    return () => {
      confettiRef.current?.clearCanvas();
      confettiRef.current = null;
    };
  }, []);

  // God Mode: double-tap logo
  const handleLogoTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 400) {
      setForceNextWin(true);
      setGodModeFlash(true);
      setTimeout(() => setGodModeFlash(false), 600);
    }
    lastTapRef.current = now;
  }, []);

  const REEL_STOP_DELAYS = [1000, 1500, 2000];
  const TOTAL_SPIN_TIME = 2300;

  // 3-burst confetti with rAF for smooth timing
  const fireConfetti = useCallback(() => {
    if (!confettiRef.current) return;

    confettiRef.current.addConfetti({
      emojis: ["❤️", "💍", "🥂", "💒", "🍾"],
      emojiSize: 50,
      confettiNumber: 60,
    });

    requestAnimationFrame(() => {
      setTimeout(() => {
        confettiRef.current?.addConfetti({
          confettiColors: ["#FFD700", "#FF69B4", "#FF1493", "#FFA500", "#FFFFFF"],
          confettiNumber: 120,
          confettiRadius: 5,
        });
      }, 350);
    });

    setTimeout(() => {
      confettiRef.current?.addConfetti({
        confettiColors: ["#FFD700", "#FFC700", "#FFE066"],
        confettiNumber: 80,
        confettiRadius: 4,
      });
    }, 900);
  }, []);

  // Smooth cooldown via requestAnimationFrame
  const startCooldown = useCallback(() => {
    setCooldown(true);
    setCooldownLeft(COOLDOWN_MS);
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const left = Math.max(0, COOLDOWN_MS - elapsed);
      setCooldownLeft(left);
      if (left <= 0) {
        setCooldown(false);
        setCooldownLeft(0);
      } else {
        cooldownRafRef.current = requestAnimationFrame(tick);
      }
    };

    cooldownRafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    return () => {
      if (cooldownRafRef.current) cancelAnimationFrame(cooldownRafRef.current);
    };
  }, []);

  const handleSpin = useCallback(() => {
    if (spinning || cooldown) return;

    const spinResult = spin(forceNextWin);
    setResult(spinResult);
    setSpinning(true);
    setShowResult(false);
    setSpinCount((c) => c + 1);

    if (forceNextWin) {
      setForceNextWin(false);
    }

    setTimeout(() => {
      setSpinning(false);
      setShowResult(true);

      if (spinResult.isWin) {
        fireConfetti();
      }

      startCooldown();
    }, TOTAL_SPIN_TIME);
  }, [spinning, cooldown, forceNextWin, fireConfetti, startCooldown]);

  const reels = result?.reels ?? [null, null, null];

  return (
    <div className="flex flex-col items-center w-full max-w-[450px] mx-auto px-4 min-h-[100dvh] relative select-none">

      {/* ===== HEADER / LOGO ===== */}
      <motion.div
        className="mt-8 mb-6 cursor-pointer relative z-10"
        onTouchEnd={handleLogoTap}
        onClick={handleLogoTap}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative px-8 py-4">
          {/* Subtle Back Glow */}
          <div className="absolute inset-0 rounded-3xl bg-rose-500/5 blur-3xl opacity-50" />

          <motion.h1
            className={clsx(
              "text-4xl sm:text-5xl font-bold text-center tracking-wide leading-tight relative z-10",
              "text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5E1] to-[#E8B298]",
              "font-serif drop-shadow-sm"
            )}
            animate={godModeFlash ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.4 }}
          >
            <Heart className="inline-block mb-1 mr-3 text-rose-400 fill-rose-400/20" size={28} />
            Casino Mariage
            <Heart className="inline-block mb-1 ml-3 text-rose-400 fill-rose-400/20" size={28} />
          </motion.h1>

          <p className="text-center text-[#E8B298]/80 text-sm mt-3 font-serif italic tracking-[0.2em]">
            ✦ L&apos;Amour tourne toujours ✦
          </p>
        </div>

        {forceNextWin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-rose-400 whitespace-nowrap font-bold"
          >
            ♥ MODE ACTIVÉ ♥
          </motion.div>
        )}
      </motion.div>

      {/* ===== ROMANTIC DIVIDER ===== */}
      <div className="flex items-center gap-3 my-3 w-full max-w-[300px]">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-300/50 to-transparent" />
        <Heart className="text-pink-400/60" size={14} fill="currentColor" />
        <Sparkles className="text-rose-300/60" size={14} />
        <Heart className="text-pink-400/60" size={14} fill="currentColor" />
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-300/50 to-transparent" />
      </div>

      {/* ===== SLOT MACHINE FRAME ===== */}
      <div className="relative w-full mt-3">
        {/* Romantic glow */}
        <div className="absolute -inset-3 rounded-3xl bg-gradient-to-b from-pink-400/15 via-rose-300/10 to-pink-400/15 blur-lg" />

        {/* Machine body */}
        {/* Machine body - More elegant, less neon */}
        <div className="relative bg-[#1a1a1a] rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl">

          {/* Heart decorations */}
          <div className="absolute top-4 left-4">
            <Heart className="text-pink-300/40" size={16} fill="currentColor" />
          </div>
          <div className="absolute top-4 right-4">
            <Heart className="text-pink-300/40" size={16} fill="currentColor" />
          </div>
          <div className="absolute bottom-4 left-4">
            <Heart className="text-rose-300/40" size={16} fill="currentColor" />
          </div>
          <div className="absolute bottom-4 right-4">
            <Heart className="text-rose-300/40" size={16} fill="currentColor" />
          </div>

          {/* Romantic header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3">
              <Heart className="text-pink-300/50" size={20} fill="currentColor" />
              <span className="text-rose-300 text-2xl font-bold tracking-[0.3em] font-serif drop-shadow-[0_0_15px_rgba(255,182,193,0.6)]">
                ♥ L&apos;AMOUR ♥
              </span>
              <Heart className="text-pink-300/50" size={20} fill="currentColor" />
            </div>
          </div>

          {/* ===== REELS ===== */}
          <div className="flex justify-center gap-3 sm:gap-4 relative z-10">
            {[0, 1, 2].map((i) => (
              <Reel
                key={i}
                finalSymbol={reels[i]}
                spinning={spinning}
                stopDelay={REEL_STOP_DELAYS[i]}
                reelIndex={i}
              />
            ))}

            {/* Elegant Payline Indicator - Absolute centered */}
            <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 pointer-events-none opacity-30 z-20">
              <div className="h-[1px] bg-gradient-to-r from-transparent via-red-400 to-transparent w-full" />
            </div>
          </div>
        </div>

        {/* Machine base */}
        <div className="mx-auto w-[85%] h-2 bg-gradient-to-b from-pink-300/30 to-rose-300/10 rounded-b-xl" />
      </div>

      {/* ===== RESULT DISPLAY ===== */}
      <div className="h-24 flex items-center justify-center my-3">
        <AnimatePresence mode="wait">
          {showResult && result && (
            <motion.div
              key={`${result.isWin}-${spinCount}`}
              initial={{ opacity: 0, scale: 0.3, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="text-center"
            >
              {result.isWin ? (
                <motion.div
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                >
                  <p className="text-3xl sm:text-4xl font-bold text-gold font-serif drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]">
                    JACKPOT !
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-pink-400 mt-1 drop-shadow-[0_0_10px_rgba(255,105,180,0.5)]">
                    🥂 SHOT TIME ! 🥂
                  </p>
                  <p className="text-sm text-gold/60 mt-1 italic font-serif">
                    {result.reels[0].name} x3
                  </p>
                </motion.div>
              ) : result.isNearMiss ? (
                <motion.div
                  initial={{ x: -5 }}
                  animate={{ x: [0, -3, 3, -2, 2, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <p className="text-xl font-bold text-yellow-400/90 font-serif">
                    Presque...! 😮
                  </p>
                  <p className="text-sm text-white/40 mt-1">
                    Retente ta chance !
                  </p>
                </motion.div>
              ) : (
                <div>
                  <p className="text-lg font-bold text-white/50 font-serif">
                    Pas cette fois ! 🎲
                  </p>
                  <p className="text-sm text-white/30 mt-1">
                    La chance tourne...
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== LANCER BUTTON ===== */}
      <div className="relative mt-2 mb-6">
        {!spinning && !cooldown && (
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400/50 via-rose-400/60 to-pink-400/50 blur-2xl"
            style={{ transform: "scale(1.5)" }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          />
        )}

        <motion.button
          onClick={handleSpin}
          disabled={spinning || cooldown}
          className={clsx(
            "relative px-12 py-4 sm:px-16 sm:py-5 rounded-full font-bold text-lg sm:text-xl uppercase tracking-[0.15em] font-serif",
            "transition-all duration-300",
            spinning || cooldown
              ? "bg-stone-800 text-stone-600 cursor-not-allowed shadow-none"
              : "bg-gradient-to-b from-rose-400 to-rose-600 text-white shadow-[0_4px_15px_rgba(225,29,72,0.4)] hover:shadow-[0_6px_20px_rgba(225,29,72,0.6)] hover:-translate-y-0.5"
          )}
          whileTap={!spinning && !cooldown ? { scale: 0.96, y: 4 } : {}}
          whileHover={!spinning && !cooldown ? { scale: 1.03 } : {}}
        >
          {spinning ? (
            <span className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
              >
                🎰
              </motion.span>
              <span className="text-gray-400">...</span>
            </span>
          ) : cooldown ? (
            <span className="text-lg tabular-nums">
              {Math.ceil(cooldownLeft / 1000)}s
            </span>
          ) : (
            <span className="flex items-center gap-3">
              <Heart size={18} fill="currentColor" />
              LANCER
              <Heart size={18} fill="currentColor" />
            </span>
          )}
        </motion.button>
      </div>



      {/* ===== DECORATIVE HEARTS (subtle) ===== */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-[0.07]">
        {[...Array(8)].map((_, i) => (
          <Heart
            key={i}
            className="absolute text-pink-400 animate-pulse"
            size={14 + i * 5}
            style={{
              left: `${(i * 13 + 5) % 90}%`,
              top: `${(i * 17 + 3) % 85}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + i * 0.3}s`,
            }}
            fill="currentColor"
          />
        ))}
      </div>
    </div>
  );
}
