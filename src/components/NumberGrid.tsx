import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { GridCellData } from '../types';

interface NumberGridProps {
  cells: GridCellData[];
  onCellClick: (index: number) => void;
  isCellSelectable: (cell: GridCellData) => boolean;
  highlightCols: boolean[];
}

export function NumberGrid({
  cells,
  onCellClick,
  isCellSelectable,
  highlightCols,
}: NumberGridProps) {
  return (
    <div
      id="grid-5x5-wrapper"
      className="flex-1 flex flex-col items-center justify-center min-w-0"
    >
      <div
        id="grid-5x5"
        role="grid"
        aria-label="5 by 5 Number Grid"
        className="grid aspect-square w-full grid-cols-5 grid-rows-5 gap-1 rounded-2xl border-2 border-zinc-300 bg-zinc-100 p-1.5 sm:p-2.5 md:p-3 shadow-md select-none"
      >
        {cells.map((cell) => {
          const selectable = isCellSelectable(cell);
          const colIsActive = highlightCols[cell.col];

          return (
            <motion.button
              type="button"
              key={cell.id}
              id={cell.id}
              role="gridcell"
              aria-rowindex={cell.row + 1}
              aria-colindex={cell.col + 1}
              aria-label={`Cell ${cell.value}, ${cell.isMarked ? 'Marked' : 'Unmarked'}`}
              disabled={!selectable && cell.isMarked}
              onClick={() => onCellClick(cell.index)}
              whileHover={selectable ? { scale: 1.06 } : {}}
              whileTap={selectable ? { scale: 0.95 } : {}}
              className={`relative flex aspect-square items-center justify-center rounded-lg font-bold text-sm sm:text-lg md:text-xl transition-all duration-200 ${
                cell.isMarked
                  ? cell.isPartOfWinningLine
                    ? 'bg-amber-400 text-zinc-950 font-black shadow-xs ring-2 ring-amber-500 scale-[0.98]'
                    : 'bg-emerald-500 text-white shadow-xs scale-[0.98]'
                  : selectable
                  ? 'bg-amber-100 text-amber-900 border-2 border-dashed border-amber-400 animate-pulse cursor-pointer'
                  : colIsActive
                  ? 'bg-zinc-50 text-zinc-900 border border-zinc-300 hover:bg-zinc-100'
                  : 'bg-white text-zinc-800 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              {/* Value display */}
              <span className="relative z-10">{cell.value}</span>

              {/* Marked Indicator Badge */}
              {cell.isMarked && (
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg pointer-events-none"
                >
                  <Check className="w-4 h-4 sm:w-6 sm:h-6 stroke-[3] text-white/90 drop-shadow-xs" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
