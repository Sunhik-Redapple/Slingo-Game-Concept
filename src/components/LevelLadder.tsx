import { motion } from 'motion/react';
import { Crown, Check, ChevronLeft, Trophy, Sparkles } from 'lucide-react';
import { LadderLevel } from '../types';

export const LADDER_LEVELS: LadderLevel[] = [
  { level: 12, linesRequired: 12, points: 100000, formattedPoints: '100,000', label: 'FULL HOUSE' },
  { level: 11, linesRequired: 11, points: 45000, formattedPoints: '45,000' },
  { level: 10, linesRequired: 10, points: 25000, formattedPoints: '25,000' },
  { level: 9, linesRequired: 9, points: 16000, formattedPoints: '16,000' },
  { level: 8, linesRequired: 8, points: 10000, formattedPoints: '10,000' },
  { level: 7, linesRequired: 7, points: 6000, formattedPoints: '6,000' },
  { level: 6, linesRequired: 6, points: 3500, formattedPoints: '3,500' },
  { level: 5, linesRequired: 5, points: 2000, formattedPoints: '2,000' },
  { level: 4, linesRequired: 4, points: 1000, formattedPoints: '1,000' },
  { level: 3, linesRequired: 3, points: 500, formattedPoints: '500' },
  { level: 2, linesRequired: 2, points: 250, formattedPoints: '250' },
  { level: 1, linesRequired: 1, points: 100, formattedPoints: '100' },
];

interface LevelLadderProps {
  currentLines: number;
}

export function LevelLadder({ currentLines }: LevelLadderProps) {
  const currentLevel = Math.min(12, Math.max(0, currentLines));

  return (
    <aside
      id="level-ladder-panel"
      aria-label="12-Level Prize Ladder"
      className="flex flex-col h-full w-28 sm:w-36 md:w-40 rounded-2xl border-2 border-zinc-300 bg-zinc-100 p-1.5 sm:p-2 shadow-md select-none justify-between shrink-0"
    >
      {/* Header with Title & Level Counter */}
      <div
        id="ladder-header"
        className="flex items-center justify-between px-1 sm:px-1.5 py-0.5 sm:py-1 mb-1 border-b border-zinc-200"
      >
        <div className="flex items-center gap-1">
          <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 shrink-0" />
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-zinc-700">
            Levels
          </span>
        </div>
        <div className="text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-zinc-200/90 text-zinc-700 tabular-nums">
          {currentLevel}/12
        </div>
      </div>

      {/* 12 Level Rows (12 at top to 1 at bottom) */}
      <div
        id="ladder-rungs-list"
        role="list"
        className="relative flex flex-col flex-1 justify-between gap-0.5 sm:gap-1"
      >
        {LADDER_LEVELS.map((item) => {
          const isCurrent = currentLevel === item.level;
          const isPassed = currentLevel > item.level;
          const isTopJackpot = item.level === 12;

          return (
            <div
              key={`ladder-level-${item.level}`}
              role="listitem"
              id={`ladder-level-${item.level}`}
              aria-label={`Level ${item.level}: ${item.formattedPoints} points ${
                isCurrent ? '(Current Level)' : isPassed ? '(Completed)' : ''
              }`}
              className={`relative flex items-center justify-between rounded-lg px-1 sm:px-1.5 py-0.5 transition-all text-[10px] sm:text-xs leading-tight ${
                isCurrent
                  ? isTopJackpot
                    ? 'bg-amber-400 text-zinc-950 font-black ring-2 ring-amber-500 shadow-sm'
                    : 'bg-amber-400 text-zinc-950 font-extrabold ring-2 ring-amber-500 shadow-xs'
                  : isPassed
                  ? 'bg-emerald-100 text-emerald-900 font-semibold border border-emerald-300/80'
                  : isTopJackpot
                  ? 'bg-amber-50 text-amber-900 border border-amber-200 font-bold'
                  : 'bg-white text-zinc-600 border border-zinc-200/90 font-medium'
              }`}
            >
              {/* Level indicator / Badge */}
              <div className="flex items-center gap-1 z-10">
                {isPassed ? (
                  <span className="flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500 text-white shrink-0">
                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                  </span>
                ) : isTopJackpot ? (
                  <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600 shrink-0 animate-pulse" />
                ) : (
                  <span
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center rounded-full text-[8px] sm:text-[9px] font-black shrink-0 ${
                      isCurrent
                        ? 'bg-zinc-950 text-white'
                        : 'bg-zinc-200 text-zinc-600'
                    }`}
                  >
                    {item.level}
                  </span>
                )}
                <span className="hidden md:inline text-[9px] font-bold text-zinc-500 uppercase">
                  {item.level === 12 ? 'MAX' : `L${item.level}`}
                </span>
              </div>

              {/* Point Value */}
              <span
                className={`tabular-nums font-black text-right z-10 ${
                  isCurrent
                    ? 'text-zinc-950 text-[10px] sm:text-xs'
                    : isPassed
                    ? 'text-emerald-700'
                    : isTopJackpot
                    ? 'text-amber-700 font-extrabold'
                    : 'text-zinc-700'
                }`}
              >
                {item.formattedPoints}
              </span>

              {/* Upgrading Active Marker indicator */}
              {isCurrent && (
                <motion.div
                  layoutId="active-level-marker"
                  transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  className="absolute -left-2 sm:-left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-20"
                >
                  <div className="flex items-center bg-zinc-950 text-amber-300 pl-1 pr-1 sm:pr-1.5 py-0.5 rounded-full shadow-md text-[8px] sm:text-[9px] font-black tracking-tighter gap-0.5">
                    <ChevronLeft className="w-3 h-3 animate-pulse text-amber-400 stroke-[3]" />
                    <span className="hidden sm:inline font-bold">UP</span>
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Ladder Base / Status Banner */}
      <div
        id="ladder-footer"
        className="mt-1 pt-1 border-t border-zinc-200 flex items-center justify-center text-center"
      >
        {currentLevel === 12 ? (
          <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black text-amber-600 animate-bounce">
            <Sparkles className="w-3 h-3" />
            <span>MAX PRIZE!</span>
          </div>
        ) : currentLevel > 0 ? (
          <div className="text-[9px] sm:text-[10px] font-bold text-emerald-600 truncate">
            Level {currentLevel} Reached
          </div>
        ) : (
          <div className="text-[8px] sm:text-[9px] font-semibold text-zinc-400">
            Complete lines to climb
          </div>
        )}
      </div>
    </aside>
  );
}
