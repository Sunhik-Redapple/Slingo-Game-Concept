import { Volume2, VolumeX, RotateCcw, Trophy } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface GameHeaderProps {
  score: number;
  completedLines: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onNewGame: () => void;
}

export function GameHeader({
  score,
  completedLines,
  soundEnabled,
  onToggleSound,
  onNewGame,
}: GameHeaderProps) {
  return (
    <header
      id="game-header"
      className="w-full max-w-[min(90vw,55vh,440px)] flex items-center justify-between gap-2 px-1"
    >
      <div className="flex items-center gap-3">
        {/* Score pill */}
        <div
          id="score-display"
          className="flex items-center gap-1.5 bg-zinc-100 border border-zinc-300 px-3 py-1 rounded-xl shadow-2xs"
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-zinc-400 leading-none">Score</span>
            <span className="text-sm sm:text-base font-extrabold text-zinc-900 leading-tight">
              {score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Lines completed pill */}
        <div
          id="lines-display"
          className="flex items-center gap-1.5 bg-zinc-100 border border-zinc-300 px-3 py-1 rounded-xl shadow-2xs"
        >
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-zinc-400 leading-none">Lines</span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-600 leading-tight">
              {completedLines}/12
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Sound toggle button */}
        <button
          id="sound-toggle-btn"
          type="button"
          aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          onClick={() => {
            soundFx.enabled = !soundEnabled;
            onToggleSound();
          }}
          className="p-2 rounded-xl border border-zinc-300 bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 transition-colors cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* New Game Button */}
        <button
          id="new-game-btn"
          type="button"
          aria-label="New Game"
          onClick={onNewGame}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-300 bg-zinc-100 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </header>
  );
}
