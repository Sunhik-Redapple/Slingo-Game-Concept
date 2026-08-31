/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { GridCellData, ReelOutcome, LineWin } from './types';
import { NumberGrid } from './components/NumberGrid';
import { SlotMachine } from './components/SlotMachine';
import { CenterStatus } from './components/CenterStatus';
import { soundFx } from './utils/audio';

const INITIAL_SPINS = 10;
const GRID_SIZE = 5;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

// Generate column-distributed numbers from 1 to 70
function generateGrid(): number[] {
  const gridNumbers: number[] = new Array(TOTAL_CELLS).fill(0);
  const colRanges = [
    { min: 1, max: 14 },
    { min: 15, max: 28 },
    { min: 29, max: 42 },
    { min: 43, max: 56 },
    { min: 57, max: 70 },
  ];

  for (let col = 0; col < 5; col++) {
    const { min, max } = colRanges[col];
    const pool = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    // Shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const chosen = pool.slice(0, 5).sort((a, b) => a - b);
    for (let row = 0; row < 5; row++) {
      gridNumbers[row * 5 + col] = chosen[row];
    }
  }

  return gridNumbers;
}

// Generate reel outcome for a column
function getRandomReelOutcome(col: number): ReelOutcome {
  const roll = Math.random();

  // 6% chance for Wild (allows choosing any in this column)
  if (roll < 0.06) {
    return { type: 'wild', label: 'WILD' };
  }
  // 3% chance for Super Wild Joker (allows choosing any on whole grid)
  if (roll < 0.09) {
    return { type: 'super_wild', label: 'JOKER' };
  }
  // 4% chance for +1 Free Spin
  if (roll < 0.13) {
    return { type: 'free_spin', label: '+1 SPIN' };
  }
  // 4% chance for Instant Coin Bonus
  if (roll < 0.17) {
    return { type: 'coin', label: 'COIN' };
  }

  // Otherwise, a random number in this column's range (1-70 partitioned)
  const colRanges = [
    { min: 1, max: 14 },
    { min: 15, max: 28 },
    { min: 29, max: 42 },
    { min: 43, max: 56 },
    { min: 57, max: 70 },
  ];
  const { min, max } = colRanges[col];
  const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;

  return {
    type: 'number',
    value: randomNum,
  };
}

// Calculate 12 winning lines
function checkWinningLines(markedIndices: Set<number>): LineWin[] {
  const lines: LineWin[] = [];

  // Rows
  for (let r = 0; r < 5; r++) {
    const indices = [r * 5, r * 5 + 1, r * 5 + 2, r * 5 + 3, r * 5 + 4];
    if (indices.every((idx) => markedIndices.has(idx))) {
      lines.push({ id: `row-${r}`, type: 'row', indices, name: `Row ${r + 1}` });
    }
  }

  // Columns
  for (let c = 0; c < 5; c++) {
    const indices = [c, c + 5, c + 10, c + 15, c + 20];
    if (indices.every((idx) => markedIndices.has(idx))) {
      lines.push({ id: `col-${c}`, type: 'col', indices, name: `Col ${c + 1}` });
    }
  }

  // Diagonals
  const diag1 = [0, 6, 12, 18, 24];
  if (diag1.every((idx) => markedIndices.has(idx))) {
    lines.push({ id: 'diag-main', type: 'diag-main', indices: diag1, name: 'Main Diagonal' });
  }

  const diag2 = [4, 8, 12, 16, 20];
  if (diag2.every((idx) => markedIndices.has(idx))) {
    lines.push({ id: 'diag-anti', type: 'diag-anti', indices: diag2, name: 'Anti Diagonal' });
  }

  return lines;
}

// Evaluates candidate unmarked cells and returns the best strategic block (completing or advancing lines)
function findBestCellToMark(
  candidateIndices: number[],
  markedIndices: Set<number>
): number | null {
  if (candidateIndices.length === 0) return null;

  const allLines: number[][] = [
    // 5 rows
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24],
    // 5 columns
    [0, 5, 10, 15, 20],
    [1, 6, 11, 16, 21],
    [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23],
    [4, 9, 14, 19, 24],
    // 2 diagonals
    [0, 6, 12, 18, 24],
    [4, 8, 12, 16, 20],
  ];

  let bestIndex = candidateIndices[0];
  let maxScore = -1;

  for (const idx of candidateIndices) {
    let score = 0;
    const linesThroughCell = allLines.filter((line) => line.includes(idx));
    for (const line of linesThroughCell) {
      const markedCount = line.filter((c) => markedIndices.has(c)).length;
      if (markedCount === 4) {
        // Immediate line win
        score += 1000;
      } else if (markedCount === 3) {
        score += 100;
      } else if (markedCount === 2) {
        score += 25;
      } else if (markedCount === 1) {
        score += 8;
      } else {
        score += 2;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestIndex = idx;
    }
  }

  return bestIndex;
}

export default function App() {
  const [gridNumbers, setGridNumbers] = useState<number[]>(generateGrid);
  const [markedIndices, setMarkedIndices] = useState<Set<number>>(new Set());
  const [spinsLeft, setSpinsLeft] = useState<number>(INITIAL_SPINS);
  const [score, setScore] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isAutoSpin, setIsAutoSpin] = useState<boolean>(false);
  const [reelOutcomes, setReelOutcomes] = useState<(ReelOutcome | null)[]>([null, null, null, null, null]);
  const [matchedCols, setMatchedCols] = useState<boolean[]>([false, false, false, false, false]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeWildCols, setActiveWildCols] = useState<Set<number>>(new Set());
  const [hasSuperWild, setHasSuperWild] = useState<boolean>(false);
  const [knownLineIds, setKnownLineIds] = useState<Set<string>>(new Set());
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const stoppedReelsCount = useRef(0);
  const autoSpinTimeoutRef = useRef<number | null>(null);

  // Compute winning lines and update winning cell visual highlights
  const completedLines = checkWinningLines(markedIndices);
  const winningIndices = new Set(completedLines.flatMap((l) => l.indices));

  // Detect newly completed lines and celebrate
  useEffect(() => {
    const newLines = completedLines.filter((l) => !knownLineIds.has(l.id));
    if (newLines.length > 0) {
      soundFx.playLineWin();
      try {
        confetti({
          particleCount: 50 * newLines.length,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
      setScore((s) => s + newLines.length * 1000);
      setKnownLineIds(new Set(completedLines.map((l) => l.id)));
    }
  }, [completedLines, knownLineIds]);

  // Restart / Reset game
  const handleNewGame = useCallback(() => {
    if (autoSpinTimeoutRef.current) {
      clearTimeout(autoSpinTimeoutRef.current);
      autoSpinTimeoutRef.current = null;
    }
    setGridNumbers(generateGrid());
    setMarkedIndices(new Set());
    setSpinsLeft(INITIAL_SPINS);
    setScore(0);
    setIsSpinning(false);
    setIsAutoSpin(false);
    setReelOutcomes([null, null, null, null, null]);
    setMatchedCols([false, false, false, false, false]);
    setActiveWildCols(new Set());
    setHasSuperWild(false);
    setKnownLineIds(new Set());
    setIsGameOver(false);
  }, []);

  // Spin the 1x5 slot reels
  const handleSpin = useCallback(() => {
    if (isSpinning || spinsLeft <= 0) return;

    setIsSpinning(true);
    setSpinsLeft((prev) => prev - 1);
    setMatchedCols([false, false, false, false, false]);
    setActiveWildCols(new Set());
    setHasSuperWild(false);
    stoppedReelsCount.current = 0;

    // Generate outcome for each reel
    const newOutcomes = [
      getRandomReelOutcome(0),
      getRandomReelOutcome(1),
      getRandomReelOutcome(2),
      getRandomReelOutcome(3),
      getRandomReelOutcome(4),
    ];
    setReelOutcomes(newOutcomes);
  }, [isSpinning, spinsLeft]);

  // Toggle Auto Spin mode
  const handleToggleAutoSpin = useCallback(() => {
    setIsAutoSpin((prev) => {
      const next = !prev;
      if (next && !isSpinning && spinsLeft > 0 && activeWildCols.size === 0 && !hasSuperWild) {
        // Trigger first spin immediately
        handleSpin();
      }
      return next;
    });
  }, [isSpinning, spinsLeft, activeWildCols.size, hasSuperWild, handleSpin]);

  // Called when each individual reel finishes its spin animation
  const handleReelStopped = useCallback((colIndex: number) => {
    stoppedReelsCount.current += 1;

    // When all 5 reels have stopped spinning
    if (stoppedReelsCount.current === 5) {
      setIsSpinning(false);

      // Process reel matches and special symbols
      setReelOutcomes((currentOutcomes) => {
        let addedScore = 0;
        let bonusSpins = 0;
        const newMarked = new Set(markedIndices);
        const newMatchedCols = [false, false, false, false, false];
        const newWildCols = new Set<number>();
        let gotSuperWild = false;
        let matchedAny = false;

        currentOutcomes.forEach((outcome, col) => {
          if (!outcome) return;

          if (outcome.type === 'coin') {
            addedScore += 500;
          } else if (outcome.type === 'free_spin') {
            bonusSpins += 1;
            soundFx.playMatchSound();
          } else if (outcome.type === 'wild') {
            newWildCols.add(col);
            soundFx.playWildSound();
          } else if (outcome.type === 'super_wild') {
            gotSuperWild = true;
            soundFx.playWildSound();
          } else if (outcome.type === 'number' && outcome.value !== undefined) {
            // Check if column has this number
            for (let row = 0; row < 5; row++) {
              const idx = row * 5 + col;
              if (gridNumbers[idx] === outcome.value && !newMarked.has(idx)) {
                newMarked.add(idx);
                newMatchedCols[col] = true;
                addedScore += 100;
                matchedAny = true;
              }
            }
          }
        });

        if (matchedAny) {
          soundFx.playMatchSound();
        }

        setMarkedIndices(newMarked);
        setMatchedCols(newMatchedCols);
        setActiveWildCols(newWildCols);
        setHasSuperWild(gotSuperWild);

        const currentSpinsLeft = spinsLeft - 1 + bonusSpins;
        if (bonusSpins > 0) {
          setSpinsLeft((s) => s + bonusSpins);
        }
        if (addedScore > 0) {
          setScore((s) => s + addedScore);
        }

        // Check for game over condition
        if (currentSpinsLeft <= 0 && newWildCols.size === 0 && !gotSuperWild) {
          setIsGameOver(true);
          setIsAutoSpin(false);
        }

        return currentOutcomes;
      });
    }
  }, [gridNumbers, markedIndices, spinsLeft]);

  // Handle cell click (e.g. for Wild / Super Wild picking or testing)
  const handleCellClick = useCallback((index: number) => {
    const col = index % 5;
    const isUnmarked = !markedIndices.has(index);

    if (isUnmarked && (activeWildCols.has(col) || hasSuperWild)) {
      const nextMarked = new Set(markedIndices);
      nextMarked.add(index);
      setMarkedIndices(nextMarked);
      setScore((s) => s + 200);
      soundFx.playMatchSound();

      let remainingWilds = activeWildCols.size;
      let remainingSuperWild = hasSuperWild;

      if (hasSuperWild) {
        setHasSuperWild(false);
        remainingSuperWild = false;
      } else if (activeWildCols.has(col)) {
        const nextWilds = new Set(activeWildCols);
        nextWilds.delete(col);
        setActiveWildCols(nextWilds);
        remainingWilds = nextWilds.size;
      }

      // If no more wild picks and no spins left, trigger game over
      if (spinsLeft <= 0 && remainingWilds === 0 && !remainingSuperWild) {
        setIsGameOver(true);
        setIsAutoSpin(false);
      }
    }
  }, [markedIndices, activeWildCols, hasSuperWild, spinsLeft]);

  // Auto-pick best strategic cell during Wild or Joker conditions in Auto Spin mode
  useEffect(() => {
    if (!isAutoSpin || isSpinning || isGameOver) return;

    if (hasSuperWild) {
      const timer = window.setTimeout(() => {
        const candidates: number[] = [];
        for (let i = 0; i < 25; i++) {
          if (!markedIndices.has(i)) candidates.push(i);
        }
        const bestIdx = findBestCellToMark(candidates, markedIndices);
        if (bestIdx !== null) {
          handleCellClick(bestIdx);
        } else {
          // Entire board is marked (full house!)
          setHasSuperWild(false);
        }
      }, 450);
      return () => clearTimeout(timer);
    }

    if (activeWildCols.size > 0) {
      const timer = window.setTimeout(() => {
        const col = Array.from(activeWildCols)[0];
        const candidates: number[] = [];
        for (let r = 0; r < 5; r++) {
          const idx = r * 5 + col;
          if (!markedIndices.has(idx)) candidates.push(idx);
        }
        const bestIdx = findBestCellToMark(candidates, markedIndices);
        if (bestIdx !== null) {
          handleCellClick(bestIdx);
        } else {
          // Entire column is already marked, clear this wild
          const nextWilds = new Set(activeWildCols);
          nextWilds.delete(col);
          setActiveWildCols(nextWilds);
        }
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [isAutoSpin, isSpinning, isGameOver, hasSuperWild, activeWildCols, markedIndices, handleCellClick]);

  // Auto-Spin orchestration effect
  useEffect(() => {
    if (autoSpinTimeoutRef.current) {
      clearTimeout(autoSpinTimeoutRef.current);
      autoSpinTimeoutRef.current = null;
    }

    if (
      isAutoSpin &&
      !isSpinning &&
      spinsLeft > 0 &&
      activeWildCols.size === 0 &&
      !hasSuperWild &&
      !isGameOver
    ) {
      autoSpinTimeoutRef.current = window.setTimeout(() => {
        handleSpin();
      }, 650);
    }

    return () => {
      if (autoSpinTimeoutRef.current) {
        clearTimeout(autoSpinTimeoutRef.current);
      }
    };
  }, [isAutoSpin, isSpinning, spinsLeft, activeWildCols.size, hasSuperWild, isGameOver, handleSpin]);

  // Check if a cell is selectable for a Wild
  const isCellSelectable = (cell: GridCellData) => {
    if (cell.isMarked) return false;
    if (hasSuperWild) return true;
    return activeWildCols.has(cell.col);
  };

  // Prepare cell objects
  const cells: GridCellData[] = gridNumbers.map((value, index) => {
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    return {
      id: `grid-cell-${row}-${col}`,
      row,
      col,
      index,
      value,
      isMarked: markedIndices.has(index),
      isPartOfWinningLine: winningIndices.has(index),
    };
  });

  return (
    <main
      id="main-canvas"
      className="flex min-h-screen w-full flex-col items-center justify-center gap-3 sm:gap-4 bg-white p-3 sm:p-5 select-none"
    >
      {/* 5x5 Number Grid (Top) */}
      <NumberGrid
        cells={cells}
        onCellClick={handleCellClick}
        isCellSelectable={isCellSelectable}
        highlightCols={Array.from({ length: 5 }, (_, c) => activeWildCols.has(c) || hasSuperWild)}
      />

      {/* Center Game Status & Information */}
      <CenterStatus
        score={score}
        completedLines={completedLines.length}
        spinsLeft={spinsLeft}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onNewGame={handleNewGame}
        hasSuperWild={hasSuperWild}
        activeWildCols={activeWildCols}
        isSpinning={isSpinning}
        isAutoSpin={isAutoSpin}
      />

      {/* 1x5 Slot Machine (Bottom) */}
      <SlotMachine
        isSpinning={isSpinning}
        reelOutcomes={reelOutcomes}
        spinsLeft={spinsLeft}
        onSpin={handleSpin}
        onReelStopped={handleReelStopped}
        matchedCols={matchedCols}
        canSpin={spinsLeft > 0 && activeWildCols.size === 0 && !hasSuperWild}
        isAutoSpin={isAutoSpin}
        onToggleAutoSpin={handleToggleAutoSpin}
      />

      {/* Game Over Modal / Card */}
      {isGameOver && (
        <div
          id="game-over-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl border border-zinc-200">
            <h2 className="text-2xl font-black text-zinc-900">Game Over!</h2>
            <p className="mt-1 text-sm text-zinc-500">You used all your spins.</p>

            <div className="my-5 flex justify-center gap-4 rounded-xl bg-zinc-100 p-3">
              <div>
                <div className="text-[11px] font-bold uppercase text-zinc-400">Final Score</div>
                <div className="text-xl font-black text-zinc-900">{score.toLocaleString()}</div>
              </div>
              <div className="w-[1px] bg-zinc-300" />
              <div>
                <div className="text-[11px] font-bold uppercase text-zinc-400">Lines Made</div>
                <div className="text-xl font-black text-emerald-600">{completedLines.length}/12</div>
              </div>
            </div>

            <button
              id="play-again-btn"
              type="button"
              onClick={handleNewGame}
              className="w-full rounded-xl bg-zinc-900 py-3 font-bold text-white hover:bg-zinc-800 cursor-pointer transition-colors shadow-sm"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
