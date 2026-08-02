import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Modal, message } from 'antd';
import { Swords, LogOut, Shield, User as UserIcon } from 'lucide-react';
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
import { BoardControls } from '@/components/PVE/BoardControls';
import { MoveHistory } from '@/components/PVE/MoveHistory';
import { BoardSettings } from '@/components/PVE/BoardSettings';
import socketService, {
  type MoveMadeData,
  type MatchEndedData,
  type MatchFoundData,
} from '@/services/socket.service';
import { useAuthStore } from '@/store/auth.store';
import { useUserProfile } from '@/hooks/useUser';
import type { BoardType, PieceStyle } from '@/types/ai';

export const PvpPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const authUser = useAuthStore((state) => state.user);
  const { data: profileData } = useUserProfile();

  // Extract User ID safely across all backend payload schemas
  const currentUserId =
    (profileData as unknown as { userId?: string })?.userId ||
    profileData?.user?.id ||
    (profileData?.user as unknown as { userId?: string })?.userId ||
    authUser?.id ||
    (authUser as unknown as { userId?: string })?.userId ||
    '';

  // Initial match data passed via router navigation state
  const routerMatchData = location.state as MatchFoundData | null;

  // Real-time Match Details State
  const [matchData, setMatchData] = useState<{
    redPlayerId: string;
    redUsername: string;
    blackPlayerId: string;
    blackUsername: string;
    fen: string;
  }>({
    redPlayerId: routerMatchData?.redPlayerId || '',
    redUsername: routerMatchData?.redUsername || 'Kỳ thủ Đỏ',
    blackPlayerId: routerMatchData?.blackPlayerId || '',
    blackUsername: routerMatchData?.blackUsername || 'Kỳ thủ Đen',
    fen: routerMatchData?.fen || INITIAL_FEN,
  });

  // Auto-redirect timer state
  const [autoExitSeconds, setAutoExitSeconds] = useState<number | null>(null);

  // Player side determination (Red vs Black)
  const isRedPlayer = matchData.redPlayerId && currentUserId
    ? matchData.redPlayerId === currentUserId
    : matchData.blackPlayerId && currentUserId
    ? matchData.blackPlayerId !== currentUserId
    : true; // Default Red if undetermined

  const playerSide: 'red' | 'black' = isRedPlayer ? 'red' : 'black';

  // Board display settings
  const [boardType, setBoardType] = useState<BoardType>('wood');
  const [pieceStyle, setPieceStyle] = useState<PieceStyle>('classic');

  // Interactive Game State
  const [boardState, setBoardState] = useState<BoardGrid>(
    () => fenToBoard(matchData.fen).board
  );
  const [turn, setTurn] = useState<'red' | 'black'>('red');
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [gameResult, setGameResult] = useState<string | null>(null);

  // Apply opponent's move reliably without closure stale state
  const applyOpponentMove = useCallback((moveStr: string, newFen: string) => {
    const { board, turn: nextTurn } = fenToBoard(newFen);
    const parsed = parseUciMove(moveStr);

    setBoardState(board);
    setTurn(nextTurn);
    setSelectedPos(null);
    setValidMoves([]);

    if (parsed) {
      const { from, to } = parsed;
      setLastMove({ from, to });

      const piece = board[to.row][to.col];
      if (piece) {
        setMoveHistory((prev) => [
          ...prev,
          {
            from,
            to,
            piece,
            moveStr,
          },
        ]);
      }
    }
  }, []);

  // Connect socket room & listen for match info, moves & match end
  useEffect(() => {
    if (!matchId) return;

    const socket = socketService.connect();
    const roomId = `match_${matchId}`;
    socketService.joinRoom(roomId);
    socketService.getMatchInfo(matchId);

    const handleMatchInfo = (info: {
      matchId: string;
      redPlayerId: string;
      redUsername: string;
      blackPlayerId: string;
      blackUsername: string;
      fen: string;
    }) => {
      console.log('[PvpPage] Received match_info:', info);
      setMatchData({
        redPlayerId: info.redPlayerId,
        redUsername: info.redUsername,
        blackPlayerId: info.blackPlayerId,
        blackUsername: info.blackUsername,
        fen: info.fen,
      });

      const { board, turn: fenTurn } = fenToBoard(info.fen);
      setBoardState(board);
      setTurn(fenTurn);
    };

    const handleMoveMade = (data: MoveMadeData) => {
      if (data.playerId !== currentUserId) {
        applyOpponentMove(data.moveStr, data.fen);
      }
    };

    const handleMatchEnded = (data: MatchEndedData) => {
      const isWinner = data.winnerId === currentUserId;
      setGameResult(isWinner ? 'VICTORY' : 'DEFEAT');
      setAutoExitSeconds(4); // Start 4-second auto exit countdown

      if (isWinner) {
        message.success('Chúc mừng! Đối thủ đã rời trận/nhận thua. Bạn giành chiến thắng!');
      } else {
        message.info('Ván đấu kết thúc. Bạn đã thoát trận hoặc thua cuộc.');
      }
    };

    socket.on('match_info', handleMatchInfo);
    socket.on('move_made', handleMoveMade);
    socket.on('match_ended', handleMatchEnded);

    return () => {
      socket.off('match_info', handleMatchInfo);
      socket.off('move_made', handleMoveMade);
      socket.off('match_ended', handleMatchEnded);
      socketService.leaveRoom(roomId);
    };
  }, [matchId, currentUserId, applyOpponentMove]);

  // Auto exit countdown effect
  useEffect(() => {
    if (autoExitSeconds === null) return;

    if (autoExitSeconds <= 0) {
      navigate('/dashboard');
      return;
    }

    const timer = setTimeout(() => {
      setAutoExitSeconds((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoExitSeconds, navigate]);

  // Handle Square Clicks
  const handleSquareClick = (pos: Position) => {
    if (gameResult) return;

    // Only allow moving on your turn
    if (turn !== playerSide) {
      const activePlayerName = turn === 'red' ? matchData.redUsername : matchData.blackUsername;
      message.warning(`Đang là lượt đi của ${activePlayerName} (${turn === 'red' ? 'Phe Đỏ' : 'Phe Đen'})!`);
      return;
    }

    const clickedPiece = boardState[pos.row][pos.col];
    const clickedColor = getPieceColor(clickedPiece);

    if (clickedColor === turn) {
      setSelectedPos(pos);
      const moves = getLegalMoves(boardState, pos);
      setValidMoves(moves);
      return;
    }

    if (selectedPos) {
      const isValid = validMoves.some((m) => m.row === pos.row && m.col === pos.col);
      if (isValid) {
        const from = selectedPos;
        const to = pos;
        const moveStr = formatUciMove(from, to);
        const movingPiece = boardState[from.row][from.col];
        const capturedPiece = boardState[to.row][to.col];

        if (!movingPiece) return;

        const nextBoard = boardState.map((row) => [...row]);
        nextBoard[to.row][to.col] = movingPiece;
        nextBoard[from.row][from.col] = null;

        const nextTurn = turn === 'red' ? 'black' : 'red';
        const nextFen = boardToFen(nextBoard, nextTurn);

        setBoardState(nextBoard);
        setTurn(nextTurn);
        setLastMove({ from, to });
        setSelectedPos(null);
        setValidMoves([]);

        const moveRec: MoveRecord = {
          from,
          to,
          piece: movingPiece,
          captured: capturedPiece,
          moveStr,
        };
        setMoveHistory((prev) => [...prev, moveRec]);

        // Send move to server over socket
        if (matchId) {
          socketService.sendMove(matchId, nextFen, moveStr);
        }
      } else {
        setSelectedPos(null);
        setValidMoves([]);
      }
    }
  };

  // Resign match with confirmation modal
  const handleConfirmResign = () => {
    Modal.confirm({
      title: 'Xác nhận đầu hàng & thoát trận?',
      content:
        'Bạn có chắc chắn muốn nhận thua và thoát khỏi trận đấu xếp hạng này không? Điểm ELO của bạn sẽ bị trừ 30 điểm.',
      okText: 'Nhận thua & Thoát',
      cancelText: 'Tiếp tục đấu',
      okButtonProps: { danger: true },
      onOk: () => {
        if (matchId) {
          socketService.resignMatch(matchId);
        }
        message.info('Đã chịu thua trận đấu.');
        navigate('/dashboard');
      },
    });
  };

  return (
    <div className="w-full min-h-screen bg-[#fcf9f8] text-[#1b1c1c] pb-16 md:pb-8">
      {/* Top Banner Header */}
      <div className="w-full bg-[#f6f3f2] border-b border-[#d4c3be] px-4 sm:px-8 md:px-16 py-5 shadow-xs">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ba1a1a] flex items-center justify-center text-white">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-serif font-bold text-[#442a22]">
                Trận Đấu Trực Tuyến PvP
              </h1>
              <p className="text-xs text-[#504441]">
                Mã trận: <span className="font-mono font-bold">{matchId?.substring(0, 10)}...</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirmResign}
            className="px-4 py-2 bg-[#fdf2f2] hover:bg-[#fde8e8] text-[#b71c1c] font-bold text-xs rounded-xl border border-[#f8b4b4] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>THOÁT TRẬN / NHẬN THUA</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="max-w-[1400px] mx-auto w-full px-4 sm:px-8 md:px-16 py-6 space-y-6">
        {/* Match Header Information Card: Left is RED, Right is BLACK */}
        <div className="bg-white border border-[#d4c3be] rounded-2xl p-5 shadow-xs flex items-center justify-around gap-4 text-center">
          {/* Left Side: RED Player */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 border border-red-800 flex items-center justify-center text-red-800 font-bold">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="block text-xs font-bold text-red-800 font-serif">BÊN ĐỎ (Đi trước)</span>
              <span className="text-sm font-bold text-[#442a22]">
                {matchData.redUsername} {isRedPlayer ? '⭐️ (Bạn)' : ''}
              </span>
            </div>
          </div>

          {/* Turn Status Badge */}
          <div className="px-4 py-2 bg-[#fcf9f8] border border-[#d4c3be] rounded-xl flex flex-col items-center">
            <span className="text-[11px] font-bold text-[#504441]">LƯỢT ĐI HIỆN TẠI</span>
            <span
              className={`text-sm font-black font-serif uppercase tracking-wider ${
                turn === 'red' ? 'text-red-700' : 'text-stone-900'
              }`}
            >
              {turn === 'red' ? '🔴 BÊN ĐỎ' : '⚫ BÊN ĐEN'}
              {turn === playerSide ? ' (Lượt của bạn)' : ' (Lượt đối thủ)'}
            </span>
          </div>

          {/* Right Side: BLACK Player */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="block text-xs font-bold text-stone-900 font-serif">BÊN ĐEN (Đi sau)</span>
              <span className="text-sm font-bold text-[#442a22]">
                {matchData.blackUsername} {!isRedPlayer ? '⭐️ (Bạn)' : ''}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-stone-900 border border-stone-900 flex items-center justify-center text-white font-bold">
              <UserIcon className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Board Arena */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Xiangqi Board (Oriented for playerSide) */}
          <div className="lg:col-span-7 space-y-6">
            <XiangqiBoard
              board={boardState}
              selectedPos={selectedPos}
              validMoves={validMoves}
              lastMove={lastMove}
              hintMove={null}
              onSquareClick={handleSquareClick}
              boardType={boardType}
              pieceStyle={pieceStyle}
              playerSide={playerSide}
            />

            <BoardControls
              onUndo={() => message.info('Không thể xin đi lại trong trận đấu xếp hạng trực tuyến!')}
              onHint={() => message.info('Không thể dùng gợi ý AI trong trận đấu người với người!')}
              onResign={handleConfirmResign}
              onRestart={() => message.info('Trận đấu đang diễn ra')}
              canUndo={false}
            />
          </div>

          {/* Right Column: Move History & Board Settings (Hide side selection in PvP mode) */}
          <div className="lg:col-span-5 space-y-6">
            <MoveHistory history={moveHistory} />

            <BoardSettings
              selectedBoard={boardType}
              selectedPieceStyle={pieceStyle}
              playerSide={playerSide}
              onSelectBoard={(b) => setBoardType(b)}
              onSelectPieceStyle={(s) => setPieceStyle(s)}
              hideSideSelection={true}
            />
          </div>
        </div>
      </main>

      {/* Result Modal with Auto-Exit Countdown */}
      {gameResult && (
        <Modal
          open={!!gameResult}
          footer={null}
          closable={false}
          centered
          width={400}
        >
          <div className="text-center py-4 space-y-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                gameResult === 'VICTORY'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              <Shield className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-serif font-bold text-[#442a22]">
              {gameResult === 'VICTORY' ? 'CHIẾN THẮNG RỰC RỠ! 🎉' : 'BẠN ĐÃ THẤT BẠI'}
            </h2>

            <p className="text-xs text-[#504441]">
              {gameResult === 'VICTORY'
                ? 'Đối thủ đã thoát trận / nhận thua! Bạn giành chiến thắng và nhận +30 ELO!'
                : 'Ván đấu đã kết thúc. Bạn bị trừ -30 ELO.'}
            </p>

            {autoExitSeconds !== null && (
              <p className="text-xs font-semibold text-emerald-700">
                Tự động về Sảnh Đấu sau {autoExitSeconds} giây...
              </p>
            )}

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full bg-[#361e15] hover:bg-[#26140e] text-white font-bold py-3 rounded-xl shadow-md cursor-pointer transition-all text-xs"
            >
              Trở về Sảnh Đấu Ngay
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PvpPage;
