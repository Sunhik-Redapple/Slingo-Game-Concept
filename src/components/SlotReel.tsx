import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Crown, Coins, PlusCircle } from 'lucide-react';
import { ReelOutcome } from '../types';
import { soundFx } from '../utils/audio';

interface SlotReelProps {
  colIndex: number;
  isSpinning: boolean;
  outcome: ReelOutcome | null;
  delayMs: number;
  onReelStopped: (colIndex: number) => void;
  isMatched: boolean;
}

export function SlotReel({
  colIndex,
  isSpinning,
  outcome,
  delayMs,
  onReelStopped,
  isMatched,
}: SlotReelProps) {
  const [internalSpinning, setInternalSpinning] = useState(false);
  const [displayedNumber, setDisplayedNumber] = useState<number | string | null>(outcome?.value ?? null);
  const tickIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isSpinning) {
      setInternalSpinning(true);

      // Fast number cycle during spin
      tickIntervalRef.current = window.setInterval(() => {
        setDisplayedNumber(Math.floor(Math.random() * 70) + 1);
        if (Math.random() > 0.6) {
          soundFx.playReelTick(colIndex);
        }
      }, 70);

      const stopTimer = setTimeout(() => {
        if (tickIntervalRef.current) {
          clearInterval(tickIntervalRef.current);
          tickIntervalRef.current = null;
        }
        setInternalSpinning(false);
        soundFx.playReelStop(colIndex);
        onReelStopped(colIndex);
      }, delayMs);

      return () => {
        clearTimeout(stopTimer);
        if (tickIntervalRef.current) {
          clearInterval(tickIntervalRef.current);
        }
      };
    } else {
      setInternalSpinning(false);
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
    }
  }, [isSpinning, delayMs, colIndex, onReelStopped]);

  const renderSymbolContent = () => {
    if (internalSpinning) {
      return (
        <motion.div
          key="spinning"
          animate={{ y: [-16, 0, 16] }}
          transition={{ repeat: Infinity, duration: 0.1, ease: 'linear' }}
          className="absolute inset-0 flex items-center justify-center text-zinc-400 font-black text-lg sm:text-2xl blur-[0.4px] leading-none"
        >
          <span>{displayedNumber}</span>
        </motion.div>
      );
    }

    if (!outcome) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-zinc-300 font-bold text-xl select-none leading-none">
            —
          </span>
        </div>
      );
    }

    if (outcome.type === 'wild') {
      return (
        <motion.div
          key="wild"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-amber-500"
        >
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 animate-pulse" />
          <span className="text-[10px] font-black tracking-wider uppercase leading-none">WILD</span>
        </motion.div>
      );
    }

    if (outcome.type === 'super_wild') {
      return (
        <motion.div
          key="super_wild"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-purple-600"
        >
          <Crown className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 animate-bounce" />
          <span className="text-[9px] font-black tracking-wider uppercase leading-none">JOKER</span>
        </motion.div>
      );
    }

    if (outcome.type === 'coin') {
      return (
        <motion.div
          key="coin"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-amber-600"
        >
          <Coins className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
          <span className="text-[9px] font-bold leading-none">+500</span>
        </motion.div>
      );
    }

    if (outcome.type === 'free_spin') {
      return (
        <motion.div
          key="free_spin"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-emerald-600"
        >
          <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
          <span className="text-[9px] font-black leading-none">+1 SPIN</span>
        </motion.div>
      );
    }

    return (
      <motion.div
        key={`num-${outcome.value}`}
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <span
          className={`font-black text-lg sm:text-2xl tracking-tight leading-none transition-colors select-none ${
            isMatched ? 'text-emerald-600 scale-110 drop-shadow-xs' : 'text-zinc-800'
          }`}
        >
          {outcome.value}
        </span>
      </motion.div>
    );
  };

  return (
    <div
      id={`slot-reel-${colIndex}`}
      role="gridcell"
      aria-rowindex={1}
      aria-colindex={colIndex + 1}
      aria-label={`Slot Reel ${colIndex + 1}`}
      className={`relative flex aspect-square items-center justify-center overflow-hidden border border-zinc-200 transition-all duration-300 ${
        internalSpinning
          ? 'bg-zinc-100 shadow-inner'
          : isMatched
          ? 'bg-emerald-50 ring-2 ring-emerald-400 ring-inset'
          : 'bg-white hover:bg-zinc-50'
      }`}
    >
      {/* Reel shadow / metallic light effect */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/10" />

      {/* Reel center payline marker */}
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-red-400/20" />

      <AnimatePresence mode="wait">
        {renderSymbolContent()}
      </AnimatePresence>

      {/* Match flash indicator */}
      {isMatched && !internalSpinning && (
        <motion.div
          initial={{ opacity: 0.8, scale: 1.2 }}
          animate={{ opacity: 0, scale: 1.8 }}
          transition={{ duration: 0.6 }}
          className="pointer-events-none absolute inset-0 bg-emerald-400/30 rounded-full"
        />
      )}
    </div>
  );
}
