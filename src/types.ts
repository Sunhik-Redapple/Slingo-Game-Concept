export type ReelSymbolType = 'number' | 'wild' | 'super_wild' | 'coin' | 'free_spin';

export interface ReelOutcome {
  type: ReelSymbolType;
  value?: number; // 1 to 70 when type === 'number'
  label?: string;
}

export interface GridCellData {
  id: string;
  row: number;
  col: number;
  index: number;
  value: number;
  isMarked: boolean;
  markedBy?: string;
  isPartOfWinningLine?: boolean;
}

export interface LineWin {
  id: string;
  type: 'row' | 'col' | 'diag-main' | 'diag-anti';
  indices: number[];
  name: string;
}

export interface GameState {
  spinsLeft: number;
  score: number;
  completedLines: number;
  isSpinning: boolean;
  reelOutcomes: (ReelOutcome | null)[];
  pendingWildCol: number | null; // If a wild needs selection
  pendingSuperWild: boolean;
  hasWonFullHouse: boolean;
}
