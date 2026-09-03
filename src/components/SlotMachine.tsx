import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Play, RotateCw, Square, Zap } from 'lucide-react';
import { SlotReel } from './SlotReel';
import { ReelOutcome } from '../types';

interface SlotMachineProps {
  isSpinning: boolean;
  reelOutcomes: (ReelOutcome | null)[];
  spinsLeft: number;
  onSpin: () => void;
  onReelStopped: (colIndex: number) => void;
  matchedCols: boolean[];
  canSpin: boolean;
  isAutoSpin: boolean;
  onToggleAutoSpin: () => void;
}

const HOLD_DURATION_MS = 600;

export function SlotMachine({
  isSpinning,
  reelOutcomes,
  spinsLeft,
  onSpin,
  onReelStopped,
  matchedCols,
  canSpin,
  isAutoSpin,
  onToggleAutoSpin,
}: SlotMachineProps) {
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const progressAnimRef = useRef<number | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);
    };
  }, []);

  const handlePointerCancel = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (progressAnimRef.current) {
      cancelAnimationFrame(progressAnimRef.current);
      progressAnimRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  }, []);

  const handlePointerDown = useCallback(() => {
    if (!canSpin && !isAutoSpin) return;
    if (isAutoSpin) return; // If already auto-spinning, click will just stop

    setIsHolding(true);
    startTimeRef.current = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setHoldProgress(progress);

      if (progress < 100) {
        progressAnimRef.current = requestAnimationFrame(updateProgress);
      }
    };

    progressAnimRef.current = requestAnimationFrame(updateProgress);

    holdTimerRef.current = window.setTimeout(() => {
      handlePointerCancel();
      // Activated auto spin via hold!
      onToggleAutoSpin();
    }, HOLD_DURATION_MS);
  }, [canSpin, isAutoSpin, onToggleAutoSpin, handlePointerCancel]);

  const handlePointerUp = useCallback(() => {
    if (isAutoSpin) {
      // Toggle off auto spin
      onToggleAutoSpin();
      return;
    }

    if (isHolding) {
      const elapsed = Date.now() - startTimeRef.current;
      handlePointerCancel();

      // If released before hold threshold, execute single spin
      if (elapsed < HOLD_DURATION_MS && canSpin && !isSpinning) {
        onSpin();
      }
    }
  }, [isAutoSpin, isHolding, canSpin, isSpinning, onSpin, onToggleAutoSpin, handlePointerCancel]);

  return (
    <div
      id="slot-machine-wrapper"
      className="flex flex-col items-center w-full max-w-[min(95vw,60vh,560px)]"
    >
      {/* Slot Machine Chassis */}
      <div
        id="slot-machine-housing"
        className="w-full relative rounded-2xl border-2 border-zinc-300 bg-zinc-100 p-2 sm:p-3 shadow-md"
      >
        {/* Top slot header bar */}
        <div className="mb-2 flex items-center justify-between px-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                isAutoSpin ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-ping'
              }`}
            />
            <span>{isAutoSpin ? 'Auto-Spinning' : '5-Reel Slot'}</span>
          </div>
          <div className="flex items-center gap-1 bg-zinc-200/80 px-2 py-0.5 rounded-full text-[11px] text-zinc-700">
            <span>Spins:</span>
            <span className="font-extrabold text-zinc-900 tabular-nums">{spinsLeft}</span>
          </div>
        </div>

        {/* 1x5 Slot Reel Viewport */}
        <div
          id="grid-1x5"
          role="grid"
          aria-label="1 by 5 Slot Machine Reels"
          className="grid w-full grid-cols-5 gap-1 rounded-xl border border-zinc-300 bg-zinc-200/80 p-1 shadow-inner overflow-hidden"
        >
          {Array.from({ length: 5 }).map((_, col) => (
            <SlotReel
              key={`reel-${col}`}
              colIndex={col}
              isSpinning={isSpinning}
              outcome={reelOutcomes[col]}
              delayMs={700 + col * 260} // Staggered reel stop (classic slot machine feel)
              onReelStopped={onReelStopped}
              isMatched={matchedCols[col]}
            />
          ))}
        </div>

        {/* Bottom Slot Action Bar with Auto Button & Hold-to-Auto Spin */}
        <div className="mt-3 flex items-center gap-2">
          {/* Dedicated Auto Spin Toggle Button */}
          <motion.button
            id="slot-auto-toggle-btn"
            type="button"
            aria-label={isAutoSpin ? 'Stop Auto Spin' : 'Start Auto Spin'}
            whileHover={canSpin || isAutoSpin ? { scale: 1.03 } : {}}
            whileTap={canSpin || isAutoSpin ? { scale: 0.96 } : {}}
            disabled={(!canSpin && !isAutoSpin) || spinsLeft <= 0}
            onClick={onToggleAutoSpin}
            className={`flex items-center justify-center gap-1.5 py-3 px-3.5 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs shrink-0 cursor-pointer ${
              isAutoSpin
                ? 'bg-amber-500 hover:bg-amber-600 text-zinc-950 ring-2 ring-amber-400 font-extrabold'
                : canSpin
                ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800'
                : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
            }`}
          >
            <Zap className={`w-4 h-4 ${isAutoSpin ? 'fill-current animate-pulse' : ''}`} />
            <span>{isAutoSpin ? 'AUTO ON' : 'AUTO'}</span>
          </motion.button>

          {/* Main Spin Button with Hold-to-Auto & Click-to-Spin */}
          <div className="relative flex-1">
            <motion.button
              id="slot-spin-btn"
              type="button"
              aria-label={isAutoSpin ? 'Stop Auto Spin' : 'Spin Reels (Hold for Auto)'}
              whileHover={canSpin || isAutoSpin ? { scale: 1.02 } : {}}
              whileTap={canSpin || isAutoSpin ? { scale: 0.98 } : {}}
              disabled={(!canSpin && !isAutoSpin) || (isSpinning && !isAutoSpin)}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerCancel}
              onPointerCancel={handlePointerCancel}
              className={`relative overflow-hidden flex items-center justify-center gap-2 w-full py-3 px-4 sm:px-6 rounded-xl font-bold text-base sm:text-lg transition-all shadow-sm select-none ${
                isAutoSpin
                  ? 'bg-red-600 hover:bg-red-700 text-white active:bg-red-800 cursor-pointer'
                  : isSpinning
                  ? 'bg-zinc-400 text-white cursor-not-allowed opacity-90'
                  : canSpin
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-white active:bg-black cursor-pointer'
                  : 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {/* Hold Progress Bar Overlay */}
              {isHolding && holdProgress > 0 && !isAutoSpin && (
                <div
                  className="absolute left-0 top-0 bottom-0 bg-amber-500/40 transition-none pointer-events-none"
                  style={{ width: `${holdProgress}%` }}
                />
              )}

              {/* Button content */}
              <div className="relative z-10 flex items-center justify-center gap-2">
                {isAutoSpin ? (
                  <>
                    <Square className="w-4 h-4 fill-current animate-pulse text-white" />
                    <span>STOP AUTO</span>
                  </>
                ) : isHolding ? (
                  <>
                    <Zap className="w-5 h-5 fill-amber-300 text-amber-300 animate-bounce" />
                    <span>HOLD FOR AUTO ({Math.round(holdProgress)}%)</span>
                  </>
                ) : isSpinning ? (
                  <>
                    <RotateCw className="w-5 h-5 animate-spin" />
                    <span>Spinning...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>SPIN REELS</span>
                  </>
                )}
              </div>
            </motion.button>
          </div>
        </div>

        {/* Subtle helper caption under buttons */}
        <div className="mt-1.5 text-center text-[10px] font-medium text-zinc-400 select-none">
          {isAutoSpin
            ? 'Auto-spin is active • Tap STOP AUTO anytime to pause'
            : 'Tap SPIN once or hold for auto-spin'}
        </div>
      </div>
    </div>
  );
}
