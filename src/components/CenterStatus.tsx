import { Volume2, VolumeX, RotateCcw, Trophy, Sparkles, Crown } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface CenterStatusProps {
  score: number;
  completedLines: number;
  spinsLeft: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onNewGame: () => void;
  hasSuperWild: boolean;
  activeWildCols: Set<number>;
  isSpinning: boolean;
  isAutoSpin: boolean;
}

export function CenterStatus({
  score,
  completedLines,
  spinsLeft,
  soundEnabled,
  onToggleSound,
  onNewGame,
  hasSuperWild,
  activeWildCols,
  isSpinning,
  isAutoSpin,
}: CenterStatusProps) {
  const hasWild = activeWildCols.size > 0;

  return (
    <section
      id="center-game-status"
      aria-label="Game Status and Information"
      className="w-full max-w-[min(90vw,55vh,440px)] flex flex-col items-center gap-2 select-none"
    >
      {/* Fixed height status/instruction slot - guaranteed zero layout shift */}
      <div className="w-full h-8 flex items-center justify-center">
        {hasSuperWild ? (
          <div
            id="center-prompt-banner"
            className="w-full h-full bg-purple-600 text-white px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs animate-bounce"
          >
            <Crown className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {isAutoSpin ? 'JOKER! Auto-picking best cell...' : 'JOKER ACTIVE! Tap ANY unmarked number'}
            </span>
          </div>
        ) : hasWild ? (
          <div
            id="center-prompt-banner"
            className="w-full h-full bg-amber-500 text-zinc-950 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs animate-bounce"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {isAutoSpin ? 'WILD! Auto-picking best cell...' : 'WILD ACTIVE! Tap an unmarked number in column'}
            </span>
          </div>
        ) : isSpinning ? (
          <div
            id="center-prompt-banner"
            className="w-full h-full bg-zinc-100 border border-zinc-300 text-zinc-600 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-zinc-400 animate-ping" />
            <span>Spinning reels...</span>
          </div>
        ) : (
          <div
            id="center-prompt-banner"
            className="w-full h-full bg-zinc-50 border border-zinc-200/80 text-zinc-400 px-3 rounded-xl font-medium text-xs flex items-center justify-center"
          >
            <span>Match numbers on the 5x5 grid to complete lines</span>
          </div>
        )}
      </div>

      {/* Center stats and action bar */}
      <div
        id="center-stats-bar"
        className="w-full h-10 flex items-center justify-between gap-2 px-1"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Score pill with tabular numbers */}
          <div
            id="score-display"
            className="flex items-center gap-1.5 bg-zinc-100 border border-zinc-300 px-2.5 sm:px-3 py-1 rounded-xl shadow-2xs"
          >
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold text-zinc-400 leading-none">Score</span>
              <span className="text-xs sm:text-sm font-extrabold text-zinc-900 leading-tight tabular-nums min-w-[3.5rem]">
                {score.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Lines completed pill with tabular numbers */}
          <div
            id="lines-display"
            className="flex items-center gap-1.5 bg-zinc-100 border border-zinc-300 px-2.5 sm:px-3 py-1 rounded-xl shadow-2xs"
          >
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold text-zinc-400 leading-none">Lines</span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-600 leading-tight tabular-nums min-w-[2.5rem]">
                {completedLines}/12
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons (Sound & Reset) */}
        <div className="flex items-center gap-2">
          <button
            id="sound-toggle-btn"
            type="button"
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            onClick={() => {
              soundFx.enabled = !soundEnabled;
              onToggleSound();
            }}
            className="p-1.5 sm:p-2 rounded-xl border border-zinc-300 bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            id="new-game-btn"
            type="button"
            aria-label="Reset Game"
            onClick={onNewGame}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl border border-zinc-300 bg-zinc-100 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </section>
  );
}
