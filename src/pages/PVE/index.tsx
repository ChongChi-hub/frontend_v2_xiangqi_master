import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import {
  type BoardGrid,
  type Position,
  type MoveRecord,
  INITIAL_FEN,
  fenToBoard,
  boardToFen,
  getPieceColor,
  getLegalMoves,
  formatUciMove,
  parseUciMove,
} from '@/utils/xiangqi';
import { XiangqiBoard } from '@/components/PVE/XiangqiBoard';
import { EvaluationBar } from '@/components/PVE/EvaluationBar';
import { BoardControls } from '@/components/PVE/BoardControls';
import { MoveHistory } from '@/components/PVE/MoveHistory';
import { DifficultySelector } from '@/components/PVE/DifficultySelector';
import { BoardSettings } from '@/components/PVE/BoardSettings';
import aiService from '@/services/ai.service';
import userService from '@/services/user.service';
import type { AIDifficultyLevel, BoardType } from '@/types/ai';

export const PvePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlDifficulty = searchParams.get('difficulty') as AIDifficultyLevel | null;

  const [difficulty, setDifficulty] = useState<AIDifficultyLevel>(
    urlDifficulty || 'apprentice'
  );
  const [boardType, setBoardType] = useState<BoardType>('wood');
  const [playerSide, setPlayerSide] = useState<'red' | 'black'>('red');

  // Game state
  const [fenHistory, setFenHistory] = useState<string[]>([INITIAL_FEN]);
  const [boardState, setBoardState] = useState<BoardGrid>(
    () => fenToBoard(INITIAL_FEN).board
  );
  const [turn, setTurn] = useState<'red' | 'black'>('red');
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);
  const [hintMove, setHintMove] = useState<{ from: Position; to: Position } | null>(null);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [evaluationScore, setEvaluationScore] = useState<number>(0.0);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [isHintLoading, setIsHintLoading] = useState<boolean>(false);
  const [matchStatus, setMatchStatus] = useState<'playing' | 'win' | 'lose' | 'draw'>('playing');
  const [clientMatchId, setClientMatchId] = useState<string>(() => crypto.randomUUID());

  const handleMatchEnd = async (result: 'win' | 'lose' | 'draw') => {
    if (matchStatus !== 'playing') return;
    setMatchStatus(result);
    
    try {
      const res = await userService.savePveMatch({
        difficulty,
        result,
        playerSide,
        clientMatchId,
      });
      if (res.reward > 0) {
        message.success(`Bạn đã thắng! Nhận được ${res.reward} ELO`);
      } else if (result === 'lose') {
        message.error('Bạn đã thua!');
      } else {
        message.info('Ván cờ hòa!');
      }
    } catch (err) {
      console.error('Lỗi lưu kết quả trận đấu:', err);
    }
  };

  // Trigger Pikafish AI move
  const makeAiMove = async (currentFen: string) => {
    setIsAiThinking(true);
    try {
      const res = await aiService.getAIMove({
        fen: currentFen,
        difficulty,
      });

      if (res.evaluationScore !== undefined) {
        setEvaluationScore(res.evaluationScore);
      }

      if (res.bestMove) {
        const parsed = parseUciMove(res.bestMove);
        if (parsed) {
          const { from, to } = parsed;
          setBoardState((prevBoard) => {
            const nextBoard = prevBoard.map((row) => [...row]);
            const piece = nextBoard[from.row][from.col];
            const destPiece = nextBoard[to.row][to.col];
            nextBoard[to.row][to.col] = piece;
            nextBoard[from.row][from.col] = null;

            if (piece) {
              const moveRec: MoveRecord = {
                from,
                to,
                piece,
                captured: destPiece,
                moveStr: res.bestMove,
              };
              setMoveHistory((prev) => [...prev, moveRec]);
              const newFen = boardToFen(nextBoard, 'red');
              setFenHistory((prev) => [...prev, newFen]);
            }
            if (destPiece === 'K' || destPiece === 'k') {
              handleMatchEnd('lose');
            }
            return nextBoard;
          });

          setLastMove({ from, to });
          setTurn(playerSide);
        } else {
          // parseUciMove returned null (e.g., "(none)"), AI has no moves
          handleMatchEnd('win');
        }
      } else {
        handleMatchEnd('win');
      }
    } catch (err) {
      console.error('Error fetching AI move:', err);
      message.error('Không thể kết nối Pikafish Engine AI');
    } finally {
      setIsAiThinking(false);
    }
  };

  // Handle Square Clicks by Player
  const handleSquareClick = (pos: Position) => {
    if (isAiThinking || turn !== playerSide || matchStatus !== 'playing') return;

    const clickedPiece = boardState[pos.row][pos.col];
    const clickedColor = getPieceColor(clickedPiece);

    // Clicked on own piece -> select and highlight legal moves
    if (clickedColor === playerSide) {
      setSelectedPos(pos);
      const moves = getLegalMoves(boardState, pos);
      setValidMoves(moves);
      return;
    }

    // Clicked on valid target square -> execute player move
    if (selectedPos) {
      const isValid = validMoves.some((m) => m.row === pos.row && m.col === pos.col);
      if (isValid) {
        const from = selectedPos;
        const to = pos;
        const moveStr = formatUciMove(from, to);
        const movingPiece = boardState[from.row][from.col];
        const capturedPiece = boardState[to.row][to.col];

        if (!movingPiece) return;

        // Execute Move
        const nextBoard = boardState.map((row) => [...row]);
        nextBoard[to.row][to.col] = movingPiece;
        nextBoard[from.row][from.col] = null;

        setBoardState(nextBoard);
        setLastMove({ from, to });
        setSelectedPos(null);
        setValidMoves([]);
        setHintMove(null);

        const moveRec: MoveRecord = {
          from,
          to,
          piece: movingPiece,
          captured: capturedPiece,
          moveStr,
        };
        setMoveHistory((prev) => [...prev, moveRec]);

        const nextFen = boardToFen(nextBoard, playerSide === 'red' ? 'black' : 'red');
        setFenHistory((prev) => [...prev, nextFen]);
        setTurn(playerSide === 'red' ? 'black' : 'red');

        if (capturedPiece === 'K' || capturedPiece === 'k') {
          handleMatchEnd('win');
        } else {
          // Request AI move
          makeAiMove(nextFen);
        }
      } else {
        setSelectedPos(null);
        setValidMoves([]);
      }
    }
  };

  // Handle AI Hint Request
  const handleHint = async () => {
    if (isAiThinking || isHintLoading) return;

    const currentFen = boardToFen(boardState, turn);
    setIsHintLoading(true);

    try {
      const res = await aiService.getAIHint({
        fen: currentFen,
        difficulty,
      });

      if (res.suggestedMove) {
        const parsed = parseUciMove(res.suggestedMove);
        if (parsed) {
          setHintMove(parsed);
          message.info({
            content: res.explanation || `Gợi ý nước đi: ${res.suggestedMove}`,
            duration: 4,
          });
        }
      }
    } catch {
      message.error('Không thể lấy gợi ý từ Pikafish AI');
    } finally {
      setIsHintLoading(false);
    }
  };

  // Handle Undo Move (reverts 2 moves: Player + AI)
  const handleUndo = () => {
    if (fenHistory.length <= 2 || isAiThinking) return;

    const newFenHistory = fenHistory.slice(0, fenHistory.length - 2);
    const newMoveHistory = moveHistory.slice(0, moveHistory.length - 2);

    const prevFen = newFenHistory[newFenHistory.length - 1];
    const { board } = fenToBoard(prevFen);

    setFenHistory(newFenHistory);
    setMoveHistory(newMoveHistory);
    setBoardState(board);
    setTurn('red');
    setSelectedPos(null);
    setValidMoves([]);
    setLastMove(null);
    setHintMove(null);
    message.success('Đã đi lại 1 nước!');
  };

  // Handle Restart Match
  const handleRestart = (newSide?: 'red' | 'black') => {
    const side = newSide ?? playerSide;
    const { board } = fenToBoard(INITIAL_FEN);
    setBoardState(board);
    setFenHistory([INITIAL_FEN]);
    setMoveHistory([]);
    setTurn('red');
    setSelectedPos(null);
    setValidMoves([]);
    setLastMove(null);
    setHintMove(null);
    setEvaluationScore(0.0);
    setMatchStatus('playing');
    setClientMatchId(crypto.randomUUID());
    
    if (side === 'black') {
      makeAiMove(INITIAL_FEN);
    }
    
    if (!newSide) {
      message.success('Đã khởi tạo lại bàn cờ mới!');
    } else {
      message.success(`Đã đổi sang phe ${side === 'red' ? 'Đỏ' : 'Đen'}!`);
    }
  };

  const handleSideChange = (side: 'red' | 'black') => {
    setPlayerSide(side);
    handleRestart(side);
  };

  // Handle Resign
  const handleResign = () => {
    if (matchStatus !== 'playing') return;
    handleMatchEnd('lose');
  };

  return (
    <div className="w-full flex flex-col bg-[#fcf9f8] min-h-screen text-[#1b1c1c] pb-12">
      {/* Top Banner Header */}
      <div className="w-full bg-[#f6f3f2] border-b border-[#d4c3be] px-4 sm:px-8 md:px-16 py-5 shadow-xs">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#442a22]">
              Đấu Với Pikafish AI
            </h1>
            <p className="text-xs sm:text-sm text-[#504441] mt-1 font-sans">
              Trải nghiệm Pikafish Engine NNUE - Trí tuệ nhân tạo Cờ Tướng đỉnh cao.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-[#e4e2e1] px-3.5 py-1.5 rounded-lg border border-[#d4c3be]">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-[#442a22]">Pikafish AVX2 Active</span>
          </div>
        </div>
      </div>

      {/* Main Content Arena */}
      <main className="max-w-[1400px] mx-auto w-full px-4 sm:px-8 md:px-12 py-6 space-y-8 flex-1">
        {/* Top Control Bar: Difficulty Selector */}
        <DifficultySelector
          selectedDifficulty={difficulty}
          onSelect={(level) => setDifficulty(level)}
        />

        {/* Game Layout (Grid 12 cols: Board on 7 cols, Side panel on 5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Main Column: Xiangqi Board & Action Buttons (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <EvaluationBar
              score={evaluationScore}
              difficulty={difficulty}
              playerSide={playerSide}
              turn={turn}
              isThinking={isAiThinking}
            />

            <XiangqiBoard
              board={boardState}
              selectedPos={selectedPos}
              validMoves={validMoves}
              lastMove={lastMove}
              hintMove={hintMove}
              onSquareClick={handleSquareClick}
              boardType={boardType}
              playerSide={playerSide}
              isAiThinking={isAiThinking}
            />

            <BoardControls
              onUndo={handleUndo}
              onHint={handleHint}
              onResign={handleResign}
              onRestart={handleRestart}
              canUndo={fenHistory.length > 2}
              isAiThinking={isAiThinking}
              isHintLoading={isHintLoading}
            />
          </div>

          {/* Right Column: Move History & Board Settings (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <MoveHistory history={moveHistory} />

            <BoardSettings
              selectedBoard={boardType}
              playerSide={playerSide}
              onSelectBoard={(b) => setBoardType(b)}
              onSelectSide={(s) => handleSideChange(s)}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PvePage;
