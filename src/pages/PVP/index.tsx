import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Modal, message } from 'antd';
import { Clock, LogOut, User as UserIcon, Handshake, Flag, Undo2, Swords, Trophy } from 'lucide-react';
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
import { MoveHistory } from '@/components/PVE/MoveHistory';
import { BoardSettings } from '@/components/PVE/BoardSettings';
import socketService, {
  type MoveMadeData,
  type MatchEndedData,
  type MatchFoundData,
} from '@/services/socket.service';
import { useAuthStore } from '@/store/auth.store';
import { useUserProfile } from '@/hooks/useUser';
import { useMatchStore } from '@/store/match.store';
import type { BoardType, PieceStyle } from '@/types/ai';

interface PvpPageProps {
  initialMatchDataOverride?: MatchFoundData | null;
  onMatchEndComplete?: () => void;
}

export const PvpPage: React.FC<PvpPageProps> = ({
  initialMatchDataOverride,
  onMatchEndComplete,
}) => {
  const { matchId: paramMatchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const authUser = useAuthStore((state) => state.user);
  const { data: profileData } = useUserProfile();
  const { setActiveMatch, clearActiveMatch } = useMatchStore();

  const currentUserId = useMemo(() => {
    if (authUser?.id) return authUser.id;
    if ((authUser as unknown as { userId?: string })?.userId) {
      return (authUser as unknown as { userId?: string }).userId!;
    }
    if ((profileData as unknown as { userId?: string })?.userId) {
      return (profileData as unknown as { userId?: string }).userId!;
    }
    if (profileData?.user?.id) return profileData.user.id;
    return '';
  }, [authUser, profileData]);

  const currentUsername = useMemo(() => {
    if (authUser?.username) return authUser.username;
    if ((profileData as unknown as { username?: string })?.username) {
      return (profileData as unknown as { username?: string }).username!;
    }
    if (profileData?.user?.username) return profileData.user.username;
    return '';
  }, [authUser, profileData]);

  const routerMatchData = (initialMatchDataOverride || location.state) as MatchFoundData | null;
  const matchId = paramMatchId || routerMatchData?.matchId || '';

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

  const [autoExitSeconds, setAutoExitSeconds] = useState<number | null>(null);

  const isRedPlayer = useMemo(() => {
    if (matchData.redPlayerId && currentUserId && matchData.redPlayerId === currentUserId) return true;
    if (matchData.redUsername && currentUsername && matchData.redUsername === currentUsername) return true;
    if (matchData.blackPlayerId && currentUserId && matchData.blackPlayerId === currentUserId) return false;
    if (matchData.blackUsername && currentUsername && matchData.blackUsername === currentUsername) return false;
    return true;
  }, [matchData, currentUserId, currentUsername]);

  const playerSide: 'red' | 'black' = isRedPlayer ? 'red' : 'black';

  const [boardType, setBoardType] = useState<BoardType>('wood');
  const [pieceStyle, setPieceStyle] = useState<PieceStyle>('classic');

  const [boardState, setBoardState] = useState<BoardGrid>(() => fenToBoard(matchData.fen).board);
  const [turn, setTurn] = useState<'red' | 'black'>('red');
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [gameResult, setGameResult] = useState<'VICTORY' | 'DEFEAT' | 'DRAW' | null>(null);
  const [matchDuration, setMatchDuration] = useState<number>(0);
  
  // Track opponent draw offer
  const [drawOfferReceived, setDrawOfferReceived] = useState<boolean>(false);
  // Track opponent undo request
  const [undoOfferReceived, setUndoOfferReceived] = useState<boolean>(false);

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
        setMoveHistory((prev) => [...prev, { from, to, piece, moveStr }]);
      }
    }
  }, []);

  useEffect(() => {
    if (gameResult) return;
    const timer = setInterval(() => {
      setMatchDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [gameResult]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (!matchId) return;

    const socket = socketService.connect();
    const roomId = `match_${matchId}`;
    socketService.joinRoom(roomId);
    socketService.getMatchInfo(matchId);

    setActiveMatch({
      matchId,
      redPlayerId: matchData.redPlayerId,
      redUsername: matchData.redUsername,
      blackPlayerId: matchData.blackPlayerId,
      blackUsername: matchData.blackUsername,
      fen: matchData.fen,
    });

    const handleMatchInfo = (info: any) => {
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
      
      if (info.startedAt) {
        setMatchDuration(Math.floor((Date.now() - info.startedAt) / 1000));
      }
    };

    const handleMoveMade = (data: MoveMadeData) => {
      if (data.playerId !== currentUserId) {
        applyOpponentMove(data.moveStr, data.fen);
      }
    };

    const handleMatchEnded = (data: MatchEndedData) => {
      if (data.reason === 'draw_agreed' || data.reason === 'stalemate' || !data.winnerId) {
        setGameResult('DRAW');
        setAutoExitSeconds(6);
        message.info('Ván đấu kết thúc hòa.');
      } else {
        const isWinner = data.winnerId === currentUserId;
        setGameResult(isWinner ? 'VICTORY' : 'DEFEAT');
        setAutoExitSeconds(6);

        if (isWinner) {
          message.success('Chúc mừng! Bạn giành chiến thắng!');
        } else {
          message.info('Ván đấu kết thúc. Bạn đã thua cuộc.');
        }
      }
    };
    
    const handleDrawOffered = (data: { offeredBy: string }) => {
      if (data.offeredBy !== currentUserId) {
        setDrawOfferReceived(true);
      }
    };
    
    const handleDrawDeclined = () => {
      message.info('Đối thủ đã từ chối lời cầu hòa.');
    };

    const handleUndoRequested = (data: { requestedBy: string }) => {
      if (data.requestedBy !== currentUserId) {
        setUndoOfferReceived(true);
      }
    };

    const handleUndoDeclined = () => {
      message.info('Đối thủ không đồng ý cho đi lại.');
    };

    const handleUndoAccepted = (data: { deletedCount: number; fen: string }) => {
      const { board, turn: newTurn } = fenToBoard(data.fen);
      setBoardState(board);
      setTurn(newTurn);
      setSelectedPos(null);
      setValidMoves([]);
      setMoveHistory(prev => prev.slice(0, Math.max(0, prev.length - data.deletedCount)));
      setLastMove(null); // Clear last move highlight
      message.success('Xin đi lại thành công!');
    };

    socket.on('match_info', handleMatchInfo);
    socket.on('move_made', handleMoveMade);
    socket.on('match_ended', handleMatchEnded);
    socket.on('draw_offered', handleDrawOffered);
    socket.on('draw_declined', handleDrawDeclined);
    socket.on('undo_requested', handleUndoRequested);
    socket.on('undo_declined', handleUndoDeclined);
    socket.on('undo_accepted', handleUndoAccepted);

    return () => {
      socket.off('match_info', handleMatchInfo);
      socket.off('move_made', handleMoveMade);
      socket.off('match_ended', handleMatchEnded);
      socket.off('draw_offered', handleDrawOffered);
      socket.off('draw_declined', handleDrawDeclined);
      socket.off('undo_requested', handleUndoRequested);
      socket.off('undo_declined', handleUndoDeclined);
      socket.off('undo_accepted', handleUndoAccepted);
      socketService.leaveRoom(roomId);
    };
  }, [matchId, currentUserId, applyOpponentMove, setActiveMatch, matchData.redPlayerId, matchData.redUsername, matchData.blackPlayerId, matchData.blackUsername, matchData.fen]);

  // Handle Draw Offer Modal Effect
  useEffect(() => {
    if (drawOfferReceived && !gameResult) {
      Modal.confirm({
        title: 'Đối thủ cầu hòa',
        content: `Đối thủ đã đề nghị một kết quả hòa cho ván đấu này. Bạn có đồng ý không?`,
        okText: 'Đồng ý',
        cancelText: 'Từ chối',
        onOk: () => {
          socketService.respondDraw(matchId, true);
          setDrawOfferReceived(false);
        },
        onCancel: () => {
          socketService.respondDraw(matchId, false);
          setDrawOfferReceived(false);
        }
      });
    }
  }, [drawOfferReceived, matchId, gameResult]);

  // Handle Undo Offer Modal Effect
  useEffect(() => {
    if (undoOfferReceived && !gameResult) {
      Modal.confirm({
        title: 'Đối thủ xin đi lại',
        content: `Đối thủ muốn xin đi lại. Bạn có đồng ý không?`,
        okText: 'Đồng ý',
        cancelText: 'Từ chối',
        onOk: () => {
          socketService.respondUndo(matchId, true);
          setUndoOfferReceived(false);
        },
        onCancel: () => {
          socketService.respondUndo(matchId, false);
          setUndoOfferReceived(false);
        }
      });
    }
  }, [undoOfferReceived, matchId, gameResult]);

  useEffect(() => {
    if (autoExitSeconds === null) return;
    if (autoExitSeconds <= 0) {
      clearActiveMatch();
      if (onMatchEndComplete) onMatchEndComplete();
      else navigate('/dashboard');
      return;
    }
    const timer = setTimeout(() => {
      setAutoExitSeconds((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [autoExitSeconds, navigate, clearActiveMatch, onMatchEndComplete]);

  const handleSquareClick = (pos: Position) => {
    if (gameResult) return;

    if (turn !== playerSide) {
      const activePlayerName = turn === 'red' ? matchData.redUsername : matchData.blackUsername;
      message.warning(`Đang là lượt đi của ${activePlayerName} (${turn === 'red' ? 'Phe Đỏ' : 'Phe Đen'})!`);
      return;
    }

    const clickedPiece = boardState[pos.row][pos.col];
    const clickedColor = getPieceColor(clickedPiece);

    if (clickedColor === turn) {
      setSelectedPos(pos);
      setValidMoves(getLegalMoves(boardState, pos));
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

        setMoveHistory((prev) => [...prev, { from, to, piece: movingPiece, captured: capturedPiece, moveStr }]);

        if (matchId) {
          socketService.sendMove(matchId, nextFen, moveStr);
        }
        
        // Local Checkmate Verification
        const gameState = checkGameState(nextBoard, nextTurn);
        if (gameState === 'CHECKMATE' || gameState === 'KING_CAPTURED' || gameState === 'STALEMATE') {
          if (matchId) {
            socketService.sendGameEnded(matchId, gameState);
          }
        }
      } else {
        setSelectedPos(null);
        setValidMoves([]);
      }
    }
  };

  const handleConfirmResign = () => {
    Modal.confirm({
      title: 'Xác nhận Đầu Hàng?',
      content: 'Bạn sẽ lập tức bị xử thua trong ván đấu này.',
      okText: 'Đầu Hàng',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => {
        if (matchId) socketService.resignMatch(matchId);
      },
    });
  };

  const handleOfferDraw = () => {
    if (matchId) {
      socketService.offerDraw(matchId);
      message.success('Đã gửi lời cầu hòa đến đối thủ.');
    }
  };

  const handleRequestUndo = () => {
    if (matchId) {
      if (moveHistory.length === 0) {
        message.warning('Chưa có nước đi nào để xin đi lại!');
        return;
      }
      socketService.requestUndo(matchId);
      message.success('Đã xin đi lại. Đang chờ đối thủ đồng ý...');
    }
  };

  const redUsername = matchData.redUsername;
  const blackUsername = matchData.blackUsername;

  return (
    <div className="w-full min-h-screen bg-[#fcf9f8] text-[#1b1c1c] pb-16 md:pb-8">
      {/* Top Banner Header */}
      <div className="w-full bg-[#f6f3f2] border-b border-[#d4c3be] px-4 sm:px-8 md:px-16 py-5 shadow-xs">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#442a22] flex items-center gap-3">
              <Swords className="w-7 h-7 text-[#ba1a1a]" />
              Trận Đấu Xếp Hạng
            </h1>
            <p className="text-xs sm:text-sm text-[#504441] mt-1 font-sans">
              Mã trận: <span className="font-mono font-bold">{matchId?.substring(0, 10)}...</span>
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={handleConfirmResign} className="px-4 py-2 bg-white hover:bg-stone-100 text-[#b71c1c] font-bold text-xs rounded-xl border border-[#d4c3be] flex items-center gap-1.5 cursor-pointer shadow-xs">
              <LogOut className="w-4 h-4" /> <span>THOÁT TRẬN</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto w-full px-4 sm:px-8 md:px-16 py-6 space-y-8">
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Turn Indicator with Players (Consistent with Private Room) */}
          <div className="bg-white border border-[#d4c3be] rounded-2xl p-6 shadow-xs flex justify-between items-center px-4 sm:px-12">
            {/* Red Player */}
            <div className={`flex flex-col items-center transition-all duration-300 ${turn === 'red' ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`}>
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mb-2 shadow-sm border border-red-200">
                <UserIcon className="w-6 h-6" />
              </div>
              <span className="text-red-700 font-bold text-sm">{redUsername}</span>
              {playerSide === 'red' && <span className="text-[10px] bg-red-700 text-white px-2 py-0.5 rounded-full mt-1">BẠN</span>}
            </div>
            
            <div className="flex flex-col items-center">
              <div className="px-6 py-2 bg-[#fcf9f8] border border-[#d4c3be] rounded-xl text-center shadow-inner">
                <span className="text-[11px] font-bold text-[#504441] block mb-1">LƯỢT ĐI HIỆN TẠI</span>
                <span className={`text-base font-black font-serif uppercase ${turn === 'red' ? 'text-red-700' : 'text-stone-900'}`}>
                  {turn === 'red' ? '🔴 BÊN ĐỎ' : '⚫ BÊN ĐEN'}
                </span>
              </div>
              <div className="mt-3 text-xs font-bold text-stone-500 font-mono flex items-center gap-1.5 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
                <Clock className="w-3.5 h-3.5 text-stone-600" /> {formatTime(matchDuration)}
              </div>
            </div>

            {/* Black Player */}
            <div className={`flex flex-col items-center transition-all duration-300 ${turn === 'black' ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`}>
              <div className="w-12 h-12 rounded-full bg-stone-200 text-stone-900 flex items-center justify-center mb-2 shadow-sm border border-stone-300">
                <UserIcon className="w-6 h-6" />
              </div>
              <span className="text-stone-900 font-bold text-sm">{blackUsername}</span>
              {playerSide === 'black' && <span className="text-[10px] bg-stone-900 text-white px-2 py-0.5 rounded-full mt-1">BẠN</span>}
            </div>
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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
            </div>
            <div className="lg:col-span-5 space-y-6">
              <MoveHistory history={moveHistory} />
              
              {/* Controls - Same as Private Room */}
              <div className="w-full grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={handleRequestUndo}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#ffffff] hover:bg-[#f4efe6] text-[#442a22] font-bold text-sm rounded-xl border border-[#d4c3be] shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Undo2 className="w-4 h-4" />
                  <span>Xin Đi Lại</span>
                </button>
                <button
                  type="button"
                  onClick={handleOfferDraw}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#ffffff] hover:bg-[#f4efe6] text-[#442a22] font-bold text-sm rounded-xl border border-[#d4c3be] shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Handshake className="w-4 h-4" />
                  <span>Cầu Hòa</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirmResign}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#fdf2f2] hover:bg-[#fde8e8] text-[#b71c1c] font-bold text-sm rounded-xl border border-[#f8b4b4] shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Flag className="w-4 h-4" />
                  <span>Đầu Hàng</span>
                </button>
              </div>

              <BoardSettings
                selectedBoard={boardType}
                selectedPieceStyle={pieceStyle}
                playerSide={playerSide}
                onSelectBoard={setBoardType}
                onSelectPieceStyle={setPieceStyle}
                hideSideSelection={true}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Result Modal - Styled like Private Room's finish screen */}
      {gameResult && (
        <Modal
          open={!!gameResult}
          footer={null}
          closable={false}
          centered
          width={600}
        >
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <Trophy className={`w-20 h-20 mb-4 ${gameResult === 'VICTORY' ? 'text-amber-500' : gameResult === 'DEFEAT' ? 'text-stone-400' : 'text-emerald-500'}`} />
            <h2 className="text-3xl font-black font-serif text-[#442a22] mb-2 uppercase">Kết Quả Ván Đấu</h2>
            
            <div className="mt-6 text-2xl font-bold">
              {gameResult === 'VICTORY' ? (
                <span className="text-emerald-600">🎉 Bạn đã chiến thắng!</span>
              ) : gameResult === 'DEFEAT' ? (
                <span className="text-red-600">Thật đáng tiếc, bạn đã thua.</span>
              ) : (
                <span className="text-amber-600">Ván đấu hòa!</span>
              )}
            </div>

            <p className="text-sm text-stone-600 mt-4">
              {gameResult === 'VICTORY'
                ? 'Tuyệt vời! Bạn nhận được điểm ELO đánh giá.'
                : gameResult === 'DEFEAT'
                ? 'Ván đấu kết thúc. Bạn bị trừ điểm ELO.'
                : 'Hai bên bất phân thắng bại. Không thay đổi ELO.'}
            </p>

            {autoExitSeconds !== null && (
              <p className="text-sm font-semibold text-[#442a22] mt-6 bg-[#fcf9f8] py-2 px-4 rounded-xl border border-[#d4c3be]">
                Tự động về Sảnh Đấu sau {autoExitSeconds} giây...
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                clearActiveMatch();
                if (onMatchEndComplete) onMatchEndComplete();
                else navigate('/dashboard');
              }}
              className="mt-8 w-full max-w-[250px] bg-[#361e15] hover:bg-[#26140e] text-white font-bold py-3.5 rounded-xl shadow-md cursor-pointer transition-all"
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
