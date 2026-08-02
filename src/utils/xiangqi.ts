export type PieceType = 'K' | 'A' | 'B' | 'N' | 'R' | 'C' | 'P' | 'k' | 'a' | 'b' | 'n' | 'r' | 'c' | 'p';
export type PieceColor = 'red' | 'black';

export interface Position {
  row: number; // 0..9 (0 is top rank 9, 9 is bottom rank 0)
  col: number; // 0..8 (0 is 'a', 8 is 'i')
}

export interface MoveRecord {
  from: Position;
  to: Position;
  piece: PieceType;
  captured?: PieceType | null;
  moveStr: string;
}

export type BoardGrid = (PieceType | null)[][];

export const INITIAL_FEN = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1';

export const getPieceColor = (piece: PieceType | null): PieceColor | null => {
  if (!piece) return null;
  return piece === piece.toUpperCase() ? 'red' : 'black';
};

export const getPieceName = (piece: PieceType | null): string => {
  if (!piece) return '';
  switch (piece) {
    case 'K': return '帥';
    case 'k': return '將';
    case 'A': return '仕';
    case 'a': return '士';
    case 'B': return '相';
    case 'b': return '象';
    case 'N': return '傌';
    case 'n': return '馬';
    case 'R': return '俥';
    case 'r': return '車';
    case 'C': return '炮';
    case 'c': return '包';
    case 'P': return '兵';
    case 'p': return '卒';
    default: return '';
  }
};

// Convert FEN string to 10x9 2D Board grid
export const fenToBoard = (fen: string): { board: BoardGrid; turn: PieceColor } => {
  const parts = fen.trim().split(/\s+/);
  const boardStr = parts[0] || 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR';
  const turnStr = parts[1] || 'w';

  const rows = boardStr.split('/');
  const board: BoardGrid = Array.from({ length: 10 }, () => Array(9).fill(null));

  for (let r = 0; r < Math.min(10, rows.length); r++) {
    const rowStr = rows[r];
    let c = 0;
    for (let i = 0; i < rowStr.length; i++) {
      const char = rowStr[i];
      if (/\d/.test(char)) {
        c += parseInt(char, 10);
      } else if (c < 9) {
        board[r][c] = char as PieceType;
        c++;
      }
    }
  }

  const turn: PieceColor = turnStr === 'b' ? 'black' : 'red';
  return { board, turn };
};

// Convert 10x9 2D Board grid to FEN string
export const boardToFen = (board: BoardGrid, turn: PieceColor = 'red'): string => {
  const fenRows: string[] = [];

  for (let r = 0; r < 10; r++) {
    let rowFen = '';
    let emptyCount = 0;

    for (let c = 0; c < 9; c++) {
      const piece = board[r][c];
      if (!piece) {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          rowFen += emptyCount.toString();
          emptyCount = 0;
        }
        rowFen += piece;
      }
    }
    if (emptyCount > 0) {
      rowFen += emptyCount.toString();
    }
    fenRows.push(rowFen);
  }

  const turnChar = turn === 'black' ? 'b' : 'w';
  return `${fenRows.join('/')} ${turnChar} - - 0 1`;
};

// Convert Position to UCI string (e.g. {row: 7, col: 7} -> "h2")
export const posToUciCoord = (pos: Position): string => {
  const colChar = String.fromCharCode('a'.charCodeAt(0) + pos.col);
  const rowChar = (9 - pos.row).toString();
  return `${colChar}${rowChar}`;
};

// Convert UCI coord string (e.g. "h2") to Position
export const uciCoordToPos = (coord: string): Position | null => {
  if (coord.length < 2) return null;
  const col = coord.charCodeAt(0) - 'a'.charCodeAt(0);
  const row = 9 - parseInt(coord[1], 10);
  if (col < 0 || col > 8 || row < 0 || row > 9 || isNaN(row)) return null;
  return { row, col };
};

// Convert full UCI move string (e.g. "h2e2") to Position pair
export const parseUciMove = (moveStr: string): { from: Position; to: Position } | null => {
  if (!moveStr || moveStr.length < 4) return null;
  const from = uciCoordToPos(moveStr.substring(0, 2));
  const to = uciCoordToPos(moveStr.substring(2, 4));
  if (!from || !to) return null;
  return { from, to };
};

// Convert Position pair to UCI move string (e.g. "h2e2")
export const formatUciMove = (from: Position, to: Position): string => {
  return `${posToUciCoord(from)}${posToUciCoord(to)}`;
};

// Legal move generator for Xiangqi
export const getLegalMoves = (board: BoardGrid, pos: Position): Position[] => {
  const piece = board[pos.row][pos.col];
  if (!piece) return [];

  const color = getPieceColor(piece);
  const moves: Position[] = [];
  const { row: r, col: c } = pos;

  const isInsideBoard = (nr: number, nc: number) => nr >= 0 && nr <= 9 && nc >= 0 && nc <= 8;
  const isOpponentOrEmpty = (nr: number, nc: number) => {
    if (!isInsideBoard(nr, nc)) return false;
    const destPiece = board[nr][nc];
    return !destPiece || getPieceColor(destPiece) !== color;
  };

  const isPalace = (nr: number, nc: number, pColor: PieceColor) => {
    if (nc < 3 || nc > 5) return false;
    if (pColor === 'red') return nr >= 7 && nr <= 9;
    return nr >= 0 && nr <= 2;
  };

  const upperPiece = piece.toUpperCase();

  switch (upperPiece) {
    case 'K': {
      // King: 1 step orthogonal in Palace
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (color && isPalace(nr, nc, color) && isOpponentOrEmpty(nr, nc)) {
          moves.push({ row: nr, col: nc });
        }
      }
      break;
    }
    case 'A': {
      // Advisor: 1 step diagonal in Palace
      const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (color && isPalace(nr, nc, color) && isOpponentOrEmpty(nr, nc)) {
          moves.push({ row: nr, col: nc });
        }
      }
      break;
    }
    case 'B': {
      // Elephant: 2 steps diagonal, no river crossing, blocked by eye
      const dirs = [[-2, -2], [-2, 2], [2, -2], [2, 2]];
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        const eyeR = r + dr / 2;
        const eyeC = c + dc / 2;

        if (isInsideBoard(nr, nc) && !board[eyeR][eyeC] && isOpponentOrEmpty(nr, nc)) {
          // Check river
          if (color === 'red' && nr >= 5) {
            moves.push({ row: nr, col: nc });
          } else if (color === 'black' && nr <= 4) {
            moves.push({ row: nr, col: nc });
          }
        }
      }
      break;
    }
    case 'N': {
      // Knight: L-shape, blocked by leg
      const movesConfig = [
        { dr: -2, dc: -1, legR: -1, legC: 0 },
        { dr: -2, dc: 1, legR: -1, legC: 0 },
        { dr: 2, dc: -1, legR: 1, legC: 0 },
        { dr: 2, dc: 1, legR: 1, legC: 0 },
        { dr: -1, dc: -2, legR: 0, legC: -1 },
        { dr: 1, dc: -2, legR: 0, legC: -1 },
        { dr: -1, dc: 2, legR: 0, legC: 1 },
        { dr: 1, dc: 2, legR: 0, legC: 1 },
      ];
      for (const m of movesConfig) {
        const nr = r + m.dr;
        const nc = c + m.dc;
        const legR = r + m.legR;
        const legC = c + m.legC;

        if (isInsideBoard(nr, nc) && !board[legR][legC] && isOpponentOrEmpty(nr, nc)) {
          moves.push({ row: nr, col: nc });
        }
      }
      break;
    }
    case 'R': {
      // Rook: Straight lines any distance
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of dirs) {
        let step = 1;
        while (true) {
          const nr = r + dr * step;
          const nc = c + dc * step;
          if (!isInsideBoard(nr, nc)) break;
          const destPiece = board[nr][nc];
          if (!destPiece) {
            moves.push({ row: nr, col: nc });
          } else {
            if (getPieceColor(destPiece) !== color) {
              moves.push({ row: nr, col: nc });
            }
            break; // Stop at first piece
          }
          step++;
        }
      }
      break;
    }
    case 'C': {
      // Cannon: Straight lines, captures by jumping over 1 piece
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of dirs) {
        let step = 1;
        let screenFound = false;

        while (true) {
          const nr = r + dr * step;
          const nc = c + dc * step;
          if (!isInsideBoard(nr, nc)) break;
          const destPiece = board[nr][nc];

          if (!screenFound) {
            if (!destPiece) {
              moves.push({ row: nr, col: nc });
            } else {
              screenFound = true; // First piece act as screen
            }
          } else {
            if (destPiece) {
              if (getPieceColor(destPiece) !== color) {
                moves.push({ row: nr, col: nc });
              }
              break; // Stop after first piece behind screen
            }
          }
          step++;
        }
      }
      break;
    }
    case 'P': {
      // Pawn: 1 step forward, after river 1 step sideways
      const forwardDr = color === 'red' ? -1 : 1;
      const passedRiver = color === 'red' ? r <= 4 : r >= 5;

      // Forward move
      const nr = r + forwardDr;
      if (isInsideBoard(nr, c) && isOpponentOrEmpty(nr, c)) {
        moves.push({ row: nr, col: c });
      }

      // Sideways moves if across river
      if (passedRiver) {
        for (const dc of [-1, 1]) {
          const nc = c + dc;
          if (isInsideBoard(r, nc) && isOpponentOrEmpty(r, nc)) {
            moves.push({ row: r, col: nc });
          }
        }
      }
      break;
    }
  }

  return moves;
};

// Check if game is over (King is missing)
export const checkGameOver = (board: BoardGrid): 'red' | 'black' | null => {
  let redKingFound = false;
  let blackKingFound = false;

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 'K') redKingFound = true;
      if (board[r][c] === 'k') blackKingFound = true;
    }
  }

  if (!redKingFound) return 'black'; // Red lost King
  if (!blackKingFound) return 'red'; // Black lost King

  return null;
};
