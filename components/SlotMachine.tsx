"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import JSConfetti from "js-confetti";
import { Heart, Sparkles, Crown } from "lucide-react";
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
  const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    confettiRef.current = new JSConfetti();
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

      if (spinResult.isWin && confettiRef.current) {
        confettiRef.current.addConfetti({
          emojis: ["❤️", "💍", "🥂", "💒", "🎰", "🍾"],
          emojiSize: 60,
          confettiNumber: 100,
        });
        setTimeout(() => {
          confettiRef.current?.addConfetti({
            confettiColors: ["#FFD700", "#FF69B4", "#FF1493", "#FFA500", "#FFFFFF"],
            confettiNumber: 200,
            confettiRadius: 6,
          });
        }, 500);
      }

      setCooldown(true);
      setCooldownLeft(COOLDOWN_MS);
      const startTime = Date.now();
      cooldownIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const left = Math.max(0, COOLDOWN_MS - elapsed);
        setCooldownLeft(left);
        if (left <= 0) {
          setCooldown(false);
          setCooldownLeft(0);
          if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
        }
      }, 100);
    }, TOTAL_SPIN_TIME);
  }, [spinning, cooldown, forceNextWin]);

  const reels = result?.reels ?? [null, null, null];

  return (
    <div className="flex flex-col items-center w-full max-w-[450px] mx-auto px-4 min-h-[100dvh] relative select-none">

      {/* ===== HEADER / LOGO ===== */}
      <motion.div
        className="mt-8 mb-4 cursor-pointer relative z-10"
        onTouchEnd={handleLogoTap}
        onClick={handleLogoTap}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative px-6 py-3">
          {/* Double gold border frame */}
          <div className="absolute -inset-1 border border-gold/30 rounded-2xl" />
          <div className="absolute -inset-3 border-2 border-gold/20 rounded-2xl" />

          <motion.h1
            className={clsx(
              "text-3xl sm:text-4xl font-bold text-center tracking-wide leading-tight",
              "bg-gradient-to-r from-yellow-300 via-gold to-yellow-300 bg-clip-text text-transparent",
              "drop-shadow-[0_0_20px_rgba(255,215,0,0.4)]",
              "font-serif"
            )}
            animate={
              godModeFlash
                ? { scale: [1, 1.2, 1] }
                : {}
            }
            transition={{ duration: 0.4 }}
          >
            <Crown className="inline-block mb-1 mr-1 text-gold" size={24} />
            Casino Mariage
            <Crown className="inline-block mb-1 ml-1 text-gold" size={24} />
          </motion.h1>

          <p className="text-center text-gold/60 text-xs mt-1 font-serif italic tracking-widest">
            ✦ LOVE CASINO 777 ✦
          </p>
        </div>

        {forceNextWin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-pink-400 whitespace-nowrap font-bold"
          >
            ♠ MODE ACTIVÉ ♠
          </motion.div>
        )}
      </motion.div>

      {/* ===== DIVIDER ===== */}
      <div className="flex items-center gap-3 my-2 w-full max-w-[280px]">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <Heart className="text-pink-500/60" size={12} fill="currentColor" />
        <Sparkles className="text-gold/60" size={12} />
        <Heart className="text-pink-500/60" size={12} fill="currentColor" />
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      </div>

      {/* ===== SLOT MACHINE FRAME ===== */}
      <div className="relative w-full mt-2">
        {/* Outer glow */}
        <div className="absolute -inset-2 rounded-3xl bg-gradient-to-b from-gold/10 via-transparent to-gold/10 blur-sm" />

        {/* Machine body */}
        <div className="relative bg-gradient-to-b from-[#12183a] via-[#0e1430] to-[#0a0f25] rounded-2xl border-2 border-gold/40 p-5 sm:p-6 shadow-[0_0_40px_rgba(255,215,0,0.1),inset_0_1px_0_rgba(255,255,255,0.05)]">

          {/* Corner decorations */}
          <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-gold/50 rounded-tl-lg" />
          <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-gold/50 rounded-tr-lg" />
          <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-gold/50 rounded-bl-lg" />
          <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-gold/50 rounded-br-lg" />

          {/* 777 header */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-3">
              <span className="text-gold/40 text-lg">♠</span>
              <span className="text-gold text-3xl font-bold tracking-[0.4em] font-serif drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
                777
              </span>
              <span className="text-gold/40 text-lg">♠</span>
            </div>
          </div>

          {/* ===== REELS ===== */}
          <div className="flex justify-center gap-3 sm:gap-4">
            {[0, 1, 2].map((i) => (
              <Reel
                key={i}
                finalSymbol={reels[i]}
                spinning={spinning}
                stopDelay={REEL_STOP_DELAYS[i]}
                reelIndex={i}
              />
            ))}
          </div>

          {/* Payline */}
          <div className="relative mt-4 mb-2 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-500 to-red-500 shadow-[0_0_6px_rgba(255,105,180,0.6)]" />
            <div className="flex-1 h-[2px] bg-gradient-to-r from-pink-500/60 via-pink-400/30 to-pink-500/60" />
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-500 to-red-500 shadow-[0_0_6px_rgba(255,105,180,0.6)]" />
          </div>
        </div>

        {/* Machine base */}
        <div className="mx-auto w-[85%] h-2 bg-gradient-to-b from-gold/25 to-gold/5 rounded-b-xl" />
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
                  animate={{
                    scale: [1, 1.06, 1],
                  }}
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
      <div className="relative mt-1 mb-6">
        {/* Glow */}
        {!spinning && !cooldown && (
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-gold/50 via-yellow-400/50 to-gold/50 blur-xl"
            style={{ transform: "scale(1.4)" }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
        )}

        <motion.button
          onClick={handleSpin}
          disabled={spinning || cooldown}
          className={clsx(
            "relative px-14 py-4 sm:px-16 sm:py-5 rounded-full font-bold text-xl sm:text-2xl uppercase tracking-[0.15em]",
            "border-4 transition-all duration-200",
            spinning || cooldown
              ? "bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed shadow-[0_3px_0_0_rgba(60,60,60,1)]"
              : "bg-gradient-to-b from-yellow-400 via-gold to-yellow-600 border-yellow-500/80 text-[#1a0f00] shadow-[0_6px_0_0_rgba(160,120,0,1),0_8px_25px_rgba(0,0,0,0.5)] hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-500 active:shadow-[0_2px_0_0_rgba(160,120,0,1)] active:translate-y-1"
          )}
          whileTap={!spinning && !cooldown ? { scale: 0.94, y: 4 } : {}}
          whileHover={!spinning && !cooldown ? { scale: 1.04 } : {}}
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

      {/* ===== FOOTER STATS ===== */}
      <div className="w-full max-w-xs mb-8">
        <div className="flex justify-center gap-4 text-[11px] text-white/25 font-serif">
          <span>Tirages : {spinCount}</span>
          <span className="text-gold/20">|</span>
          <span>Chance : 1/3</span>
        </div>
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
