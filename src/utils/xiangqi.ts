// Types & Utilities for Xiangqi (Chinese Chess)

export type PieceColor = 'red' | 'black';

// Pieces representation:
// Red: 'r_k' (King), 'r_a' (Advisor), 'r_b' (Elephant), 'r_n' (Knight), 'r_r' (Rook), 'r_c' (Cannon), 'r_p' (Pawn)
// Black: 'b_k', 'b_a', 'b_b', 'b_n', 'b_r', 'b_c', 'b_p'
export type PieceType = 'K' | 'A' | 'B' | 'N' | 'R' | 'C' | 'P';
export type Piece = string; // e.g. 'r_k', 'b_p' or null

export type BoardGrid = (Piece | null)[][];

export interface Position {
  row: number; // 0..9 (0 is top/Black home, 9 is bottom/Red home)
  col: number; // 0..8
}

export interface MoveRecord {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece | null;
  moveStr: string; // UCI format e.g., "h2e2"
}

// Initial FEN for Xiangqi
export const INITIAL_FEN = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1';

// Convert FEN character to internal piece string
const charToPieceMap: Record<string, string> = {
  R: 'r_r', N: 'r_n', B: 'r_b', A: 'r_a', K: 'r_k', C: 'r_c', P: 'r_p',
  r: 'b_r', n: 'b_n', b: 'b_b', a: 'b_a', k: 'b_k', c: 'b_c', p: 'b_p',
};

// Convert internal piece string to FEN character
const pieceToCharMap: Record<string, string> = {
  r_r: 'R', r_n: 'N', r_b: 'B', r_a: 'A', r_k: 'K', r_c: 'C', r_p: 'P',
  b_r: 'r', b_n: 'n', b_b: 'b', b_a: 'a', b_k: 'k', b_c: 'c', b_p: 'p',
};

// Helper: Parse FEN to BoardGrid
export const fenToBoard = (fen: string = INITIAL_FEN): { board: BoardGrid; turn: PieceColor } => {
  const parts = fen.trim().split(/\s+/);
  const boardStr = parts[0] || 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR';
  const turnChar = parts[1] || 'w';

  const rows = boardStr.split('/');
  const board: BoardGrid = Array(10)
    .fill(null)
    .map(() => Array(9).fill(null));

  for (let r = 0; r < 10; r++) {
    const rowStr = rows[r] || '9';
    let c = 0;
    for (let i = 0; i < rowStr.length; i++) {
      const ch = rowStr[i];
      if (/\d/.test(ch)) {
        c += parseInt(ch, 10);
      } else {
        board[r][c] = charToPieceMap[ch] || null;
        c++;
      }
    }
  }

  const turn: PieceColor = turnChar === 'w' || turnChar === 'r' ? 'red' : 'black';
  return { board, turn };
};

// Helper: Convert BoardGrid to FEN
export const boardToFen = (board: BoardGrid, turn: PieceColor = 'red'): string => {
  const fenRows: string[] = [];

  for (let r = 0; r < 10; r++) {
    let emptyCount = 0;
    let rowFen = '';

    for (let c = 0; c < 9; c++) {
      const piece = board[r][c];
      if (!piece) {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          rowFen += emptyCount.toString();
          emptyCount = 0;
        }
        rowFen += pieceToCharMap[piece] || '';
      }
    }

    if (emptyCount > 0) {
      rowFen += emptyCount.toString();
    }
    fenRows.push(rowFen);
  }

  const fenTurn = turn === 'red' ? 'w' : 'b';
  return `${fenRows.join('/')} ${fenTurn} - - 0 1`;
};

// Helper: Get Classic Chinese Character name of piece for traditional board rendering
export const getPieceChineseName = (piece: Piece | null): string => {
  if (!piece) return '';
  const pieceCharMap: Record<string, string> = {
    r_k: '帥',
    r_a: '仕',
    r_b: '相',
    r_n: '傌',
    r_r: '俥',
    r_c: '炮',
    r_p: '兵',
    b_k: '將',
    b_a: '士',
    b_b: '象',
    b_n: '馬',
    b_r: '車',
    b_c: '砲',
    b_p: '卒',
  };
  return pieceCharMap[piece] || '';
};

// Helper: Get Vietnamese display name of piece
export const getPieceName = (piece: Piece | null): string => {
  if (!piece) return '';
  const type = piece.split('_')[1];
  switch (type?.toUpperCase()) {
    case 'K': return 'Tướng';
    case 'A': return 'Sĩ';
    case 'B': return 'Tượng';
    case 'N': return 'Mã';
    case 'R': return 'Xe';
    case 'C': return 'Pháo';
    case 'P': return 'Tốt';
    default: return '';
  }
};

// Helper: Extract color of a piece
export const getPieceColor = (piece: Piece | null): PieceColor | null => {
  if (!piece) return null;
  if (piece.startsWith('r_')) return 'red';
  if (piece.startsWith('b_')) return 'black';
  return null;
};

// Helper: Extract type of piece ('K', 'A', 'B', 'N', 'R', 'C', 'P')
export const getPieceType = (piece: Piece | null): PieceType | null => {
  if (!piece) return null;
  const t = piece.split('_')[1];
  return t ? (t.toUpperCase() as PieceType) : null;
};

// Helper: Check inside board
export const isInsideBoard = (r: number, c: number): boolean => {
  return r >= 0 && r <= 9 && c >= 0 && c <= 8;
};

// Find King position
export const findKing = (board: BoardGrid, color: PieceColor): Position | null => {
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const piece = board[r][c];
      if (piece && getPieceColor(piece) === color && getPieceType(piece) === 'K') {
        return { row: r, col: c };
      }
    }
  }
  return null;
};

// Check if Kings are facing each other with no pieces between them (Flying Kings)
export const areKingsFacing = (board: BoardGrid): boolean => {
  const redKing = findKing(board, 'red');
  const blackKing = findKing(board, 'black');

  if (!redKing || !blackKing) return false;
  if (redKing.col !== blackKing.col) return false;

  const minR = Math.min(redKing.row, blackKing.row);
  const maxR = Math.max(redKing.row, blackKing.row);

  for (let r = minR + 1; r < maxR; r++) {
    if (board[r][redKing.col] !== null) {
      return false; // Piece blocking
    }
  }

  return true; // Flying Kings violation!
};

// Pseudo-legal move generator
export const getPseudoLegalMoves = (board: BoardGrid, pos: Position): Position[] => {
  const piece = board[pos.row][pos.col];
  if (!piece) return [];

  const color = getPieceColor(piece);
  const type = getPieceType(piece);
  if (!color || !type) return [];

  const moves: Position[] = [];
  const { row: r, col: c } = pos;

  const isOpponentOrEmpty = (nr: number, nc: number) => {
    const destPiece = board[nr][nc];
    if (!destPiece) return true;
    return getPieceColor(destPiece) !== color;
  };

  switch (type) {
    case 'K': {
      // Palace boundaries: Red [7..9, 3..5], Black [0..2, 3..5]
      const minR = color === 'red' ? 7 : 0;
      const maxR = color === 'red' ? 9 : 2;
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= minR && nr <= maxR && nc >= 3 && nc <= 5 && isOpponentOrEmpty(nr, nc)) {
          moves.push({ row: nr, col: nc });
        }
      }
      break;
    }
    case 'A': {
      // Palace diagonals: Red [7..9, 3..5], Black [0..2, 3..5]
      const minR = color === 'red' ? 7 : 0;
      const maxR = color === 'red' ? 9 : 2;
      const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= minR && nr <= maxR && nc >= 3 && nc <= 5 && isOpponentOrEmpty(nr, nc)) {
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
            break;
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
              screenFound = true;
            }
          } else {
            if (destPiece) {
              if (getPieceColor(destPiece) !== color) {
                moves.push({ row: nr, col: nc });
              }
              break;
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

      const nr = r + forwardDr;
      if (isInsideBoard(nr, c) && isOpponentOrEmpty(nr, c)) {
        moves.push({ row: nr, col: c });
      }

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

// Check if King of given color is currently under attack
export const isKingInCheck = (board: BoardGrid, color: PieceColor): boolean => {
  const kingPos = findKing(board, color);
  if (!kingPos) return true; // King captured!

  const opponentColor: PieceColor = color === 'red' ? 'black' : 'red';

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const piece = board[r][c];
      if (piece && getPieceColor(piece) === opponentColor) {
        const moves = getPseudoLegalMoves(board, { row: r, col: c });
        if (moves.some((m) => m.row === kingPos.row && m.col === kingPos.col)) {
          return true;
        }
      }
    }
  }

  return false;
};

// Strict legal move generator (Filters out moves that expose King or cause Flying Kings)
export const getLegalMoves = (board: BoardGrid, pos: Position): Position[] => {
  const piece = board[pos.row][pos.col];
  if (!piece) return [];

  const color = getPieceColor(piece);
  if (!color) return [];

  const pseudoMoves = getPseudoLegalMoves(board, pos);
  const strictMoves: Position[] = [];

  for (const move of pseudoMoves) {
    // Simulate move
    const testBoard = board.map((row) => [...row]);
    testBoard[move.row][move.col] = piece;
    testBoard[pos.row][pos.col] = null;

    // Check if King is safe & Kings are not facing each other
    if (!areKingsFacing(testBoard) && !isKingInCheck(testBoard, color)) {
      strictMoves.push(move);
    }
  }

  return strictMoves;
};

// Check if color has ANY strict legal moves left
export const hasAnyLegalMoves = (board: BoardGrid, color: PieceColor): boolean => {
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const piece = board[r][c];
      if (piece && getPieceColor(piece) === color) {
        const moves = getLegalMoves(board, { row: r, col: c });
        if (moves.length > 0) return true;
      }
    }
  }
  return false;
};

// Check Game Over State: returns 'CHECKMATE' | 'STALEMATE' | 'KING_CAPTURED' | null
export const checkGameState = (
  board: BoardGrid,
  currentTurn: PieceColor
): 'CHECKMATE' | 'STALEMATE' | 'KING_CAPTURED' | null => {
  const redKing = findKing(board, 'red');
  const blackKing = findKing(board, 'black');

  if (!redKing || !blackKing) {
    return 'KING_CAPTURED';
  }

  const inCheck = isKingInCheck(board, currentTurn);
  const canMove = hasAnyLegalMoves(board, currentTurn);

  if (!canMove) {
    return inCheck ? 'CHECKMATE' : 'STALEMATE';
  }

  return null;
};

// UCI notation conversion helpers: "h2e2" <-> Position
export const formatUciMove = (from: Position, to: Position): string => {
  const colToChar = (c: number) => String.fromCharCode(97 + c);
  const rowToChar = (r: number) => (9 - r).toString();

  return `${colToChar(from.col)}${rowToChar(from.row)}${colToChar(to.col)}${rowToChar(to.row)}`;
};

export const parseUciMove = (uci: string): { from: Position; to: Position } | null => {
  if (!uci || uci.length < 4) return null;

  const charToCol = (ch: string) => ch.charCodeAt(0) - 97;
  const charToRow = (ch: string) => 9 - parseInt(ch, 10);

  const fromCol = charToCol(uci[0]);
  const fromRow = charToRow(uci[1]);
  const toCol = charToCol(uci[2]);
  const toRow = charToRow(uci[3]);

  if (isInsideBoard(fromRow, fromCol) && isInsideBoard(toRow, toCol)) {
    return {
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
    };
  }

  return null;
};
