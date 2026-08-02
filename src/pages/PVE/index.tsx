import React, { useState } from 'react';
import { Modal, message } from 'antd';
import { Cpu, RotateCcw, Shield, Play } from 'lucide-react';
import {
  type BoardGrid,
  type Position,
  type MoveRecord,
  INITIAL_FEN,
  fenToBoard,
  boardToFen,
  getPieceColor,
  getLegalMoves,
  checkGameState,
  formatUciMove,
  parseUciMove,
} from '@/utils/xiangqi';
import { XiangqiBoard } from '@/components/PVE/XiangqiBoard';
import { BoardControls } from '@/components/PVE/BoardControls';
import { MoveHistory } from '@/components/PVE/MoveHistory';
import { BoardSettings } from '@/components/PVE/BoardSettings';
import aiService from '@/services/ai.service';
import userService from '@/services/user.service';
import type { AIDifficultyLevel, BoardType, PieceStyle } from '@/types/ai';

export const PvePage: React.FC = () => {
  // Game Setup & Status
  const [matchStatus, setMatchStatus] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [difficulty, setDifficulty] = useState<AIDifficultyLevel>('intermediate');
  const [playerSide, setPlayerSide] = useState<'red' | 'black'>('red');
  const [boardType, setBoardType] = useState<BoardType>('wood');
  const [pieceStyle, setPieceStyle] = useState<PieceStyle>('classic');

  // Match Metadata
  const [matchId, setMatchId] = useState<string>('');
  const [gameResult, setGameResult] = useState<'win' | 'lose' | 'draw' | null>(null);

  // Board State
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

  // Loading States
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Initialize new match
  const handleStartMatch = (diff: AIDifficultyLevel = difficulty, side: 'red' | 'black' = playerSide) => {
    setMatchId('pve_match');
    setDifficulty(diff);
    setPlayerSide(side);
    setMatchStatus('playing');
    setGameResult(null);

    const { board } = fenToBoard(INITIAL_FEN);
    setBoardState(board);
    setFenHistory([INITIAL_FEN]);
    setMoveHistory([]);
    setTurn('red');
    setSelectedPos(null);
    setValidMoves([]);
    setLastMove(null);
    setHintMove(null);

    // If player is Black, AI moves first as Red
    if (side === 'black') {
      makeAiMove(INITIAL_FEN);
    }
  };

  // AI Move Handler
  const makeAiMove = async (currentFen: string) => {
    setIsAiThinking(true);
    try {
      const res = await aiService.getAIMove({
        fen: currentFen,
        difficulty,
      });

      if (res && res.bestMove) {
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
              const newFen = boardToFen(nextBoard, playerSide);
              setFenHistory((prev) => [...prev, newFen]);

              // Checkmate Check after AI move
              const gameState = checkGameState(nextBoard, playerSide);
              if (gameState === 'CHECKMATE' || gameState === 'KING_CAPTURED' || gameState === 'STALEMATE') {
                setTimeout(() => handleMatchEnd('lose'), 100);
              }
            }
            return nextBoard;
          });

          setLastMove({ from, to });
          setTurn(playerSide);
        } else {
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

        const aiSide: 'red' | 'black' = playerSide === 'red' ? 'black' : 'red';
        const nextFen = boardToFen(nextBoard, aiSide);

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
        setFenHistory((prev) => [...prev, nextFen]);
        setTurn(aiSide);

        // Checkmate Check after Player move
        const gameState = checkGameState(nextBoard, aiSide);
        if (gameState === 'CHECKMATE' || gameState === 'KING_CAPTURED' || gameState === 'STALEMATE') {
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

  // Handle Match Completion
  const handleMatchEnd = async (result: 'win' | 'lose' | 'draw') => {
    setMatchStatus('ended');
    setGameResult(result);

    try {
      await userService.savePveMatch({
        difficulty,
        result,
        playerSide,
        clientMatchId: matchId || `pve_${Date.now()}`,
        timeControl: 15,
        initialFen: INITIAL_FEN,
      });
    } catch (err) {
      console.error('Failed to save PVE match history:', err);
    }
  };

  // Handle Undo Move
  const handleUndo = () => {
    if (isAiThinking || fenHistory.length <= 2) {
      message.info('Không thể đi lại thêm nữa!');
      return;
    }

    const newFenHistory = fenHistory.slice(0, fenHistory.length - 2);
    const newMoveHistory = moveHistory.slice(0, moveHistory.length - 2);

    const prevFen = newFenHistory[newFenHistory.length - 1];
    const { board } = fenToBoard(prevFen);

    const prevLastMove =
      newMoveHistory.length > 0
        ? {
            from: newMoveHistory[newMoveHistory.length - 1].from,
            to: newMoveHistory[newMoveHistory.length - 1].to,
          }
        : null;

    setFenHistory(newFenHistory);
    setMoveHistory(newMoveHistory);
    setBoardState(board);
    setTurn(playerSide);
    setSelectedPos(null);
    setValidMoves([]);
    setLastMove(prevLastMove);
    setHintMove(null);
    message.success('Đã đi lại 1 nước!');
  };

  // Handle Hint Request
  const handleHint = async () => {
    if (isAiThinking || turn !== playerSide || matchStatus !== 'playing') return;

    try {
      const currentFen = fenHistory[fenHistory.length - 1] || INITIAL_FEN;
      const hint = await aiService.getAIHint({
        fen: currentFen,
        difficulty: 'master',
      });

      if (hint && hint.suggestedMove) {
        const parsed = parseUciMove(hint.suggestedMove);
        if (parsed) {
          setHintMove(parsed);
          message.success(`Gợi ý AI: Nước đi ${hint.suggestedMove}`);
        }
      }
    } catch (err) {
      console.error('Hint error:', err);
      message.error('Không thể lấy gợi ý AI');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#fcf9f8] text-[#1b1c1c] pb-16 md:pb-8">
      {/* Top Banner Header */}
      <div className="w-full bg-[#f6f3f2] border-b border-[#d4c3be] px-4 sm:px-8 md:px-16 py-6 shadow-xs">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#442a22] flex items-center gap-3">
              <Cpu className="w-8 h-8 text-[#361e15]" />
              Đấu Với Máy (AI Pikafish Engine)
            </h1>
            <p className="text-xs sm:text-sm text-[#504441] mt-1 font-sans">
              Luyện tập cờ Tướng với Pikafish AI thế hệ mới. Đấu tập nâng cao trình độ (Không tính ELO).
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <main className="max-w-[1400px] mx-auto w-full px-4 sm:px-8 md:px-16 py-6 space-y-8">
        {matchStatus === 'idle' ? (
          /* Start Screen Setup Card */
          <div className="max-w-2xl mx-auto bg-white border border-[#d4c3be] rounded-2xl p-8 shadow-md text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#361e15] flex items-center justify-center mx-auto text-white">
              <Cpu className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-[#442a22]">
                Bắt Đầu Trận Đấu Với AI
              </h2>
              <p className="text-xs text-[#504441] mt-1">
                Lựa chọn mức độ thử thách và phe cờ ban đầu.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold text-[#442a22]">Cấp Độ AI</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as AIDifficultyLevel)}
                  className="w-full bg-[#fcf9f8] border border-[#d4c3be] rounded-xl px-3 py-2 text-xs font-bold text-[#442a22]"
                >
                  <option value="beginner">Tập sự (Dễ)</option>
                  <option value="apprentice">Kỳ thủ (Vừa)</option>
                  <option value="intermediate">Thành thạo (Khó)</option>
                  <option value="master">Kiện tướng (Rất khó)</option>
                  <option value="grandmaster">Đại kiện tướng (Cực khó)</option>
                </select>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-xs font-bold text-[#442a22]">Chọn Phe</label>
                <select
                  value={playerSide}
                  onChange={(e) => setPlayerSide(e.target.value as 'red' | 'black')}
                  className="w-full bg-[#fcf9f8] border border-[#d4c3be] rounded-xl px-3 py-2 text-xs font-bold text-[#442a22]"
                >
                  <option value="red">Cầm Đỏ (Đi trước)</option>
                  <option value="black">Cầm Đen (Đi sau)</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleStartMatch()}
              className="w-full bg-[#361e15] hover:bg-[#26140e] text-white font-bold py-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>VÀO BÀN CỜ ĐẤU TẬP NGAY</span>
            </button>
          </div>
        ) : (
          /* Live Match Board Arena */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Board & Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Turn Status Banner */}
              <div className="bg-white border border-[#d4c3be] rounded-2xl p-4 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-3.5 h-3.5 rounded-full ${
                      turn === playerSide ? 'bg-emerald-600 animate-ping' : 'bg-amber-500'
                    }`}
                  />
                  <span className="text-xs sm:text-sm font-bold font-serif text-[#442a22]">
                    {isAiThinking
                      ? '🤖 Pikafish Engine AI đang suy tính nước đi...'
                      : turn === playerSide
                      ? '🟢 Đến lượt bạn! Hãy di chuyển cờ.'
                      : '⏳ Đang chờ Pikafish AI đi cờ...'}
                  </span>
                </div>

                <div className="px-3 py-1 bg-[#fcf9f8] border border-[#d4c3be] rounded-lg text-xs font-bold text-[#504441]">
                  Cấp độ: <span className="uppercase text-[#361e15]">{difficulty}</span>
                </div>
              </div>

              <XiangqiBoard
                board={boardState}
                selectedPos={selectedPos}
                validMoves={validMoves}
                lastMove={lastMove}
                hintMove={hintMove}
                onSquareClick={handleSquareClick}
                boardType={boardType}
                pieceStyle={pieceStyle}
                playerSide={playerSide}
              />

              <BoardControls
                onUndo={handleUndo}
                onHint={handleHint}
                onResign={() => handleMatchEnd('lose')}
                onRestart={() => handleStartMatch()}
                canUndo={fenHistory.length > 2 && !isAiThinking}
              />
            </div>

            {/* Right Column: Move History & Board Settings (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <MoveHistory history={moveHistory} />

              <BoardSettings
                selectedBoard={boardType}
                selectedPieceStyle={pieceStyle}
                playerSide={playerSide}
                onSelectBoard={(b) => setBoardType(b)}
                onSelectPieceStyle={(s) => setPieceStyle(s)}
                onSelectSide={(s) => {
                  setPlayerSide(s);
                  handleStartMatch(difficulty, s);
                }}
                hideSideSelection={false}
              />
            </div>
          </div>
        )}
      </main>

      {/* Result Modal */}
      {matchStatus === 'ended' && gameResult && (
        <Modal open={true} footer={null} closable={false} centered width={400}>
          <div className="text-center py-4 space-y-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                gameResult === 'win'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              <Shield className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-serif font-bold text-[#442a22]">
              {gameResult === 'win'
                ? 'CHIẾN THẮNG BẤT NGỜ! 🎉'
                : gameResult === 'lose'
                ? 'BẠN ĐÃ THẤT BẠI'
                : 'HÒA CỜ'}
            </h2>

            <p className="text-xs text-[#504441]">
              {gameResult === 'win'
                ? 'Chúc mừng! Bạn đã đánh bại AI Pikafish Engine (Trận đấu tập không tính điểm ELO xếp hạng).'
                : 'Rất tiếc! Bạn đã thất bại trước AI Pikafish Engine (Không bị trừ điểm ELO).'}
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleStartMatch()}
                className="flex-1 bg-[#361e15] hover:bg-[#26140e] text-white font-bold py-3 rounded-xl shadow-md cursor-pointer transition-all text-xs flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Chơi Lại Trận Mới</span>
              </button>

              <button
                type="button"
                onClick={() => setMatchStatus('idle')}
                className="flex-1 bg-white border border-[#d4c3be] hover:bg-stone-50 text-[#442a22] font-bold py-3 rounded-xl shadow-xs cursor-pointer transition-all text-xs"
              >
                Về Màn Hình Đấu Tập
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PvePage;
