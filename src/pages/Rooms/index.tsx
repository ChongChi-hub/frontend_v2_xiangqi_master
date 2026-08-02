import React, { useState, useEffect } from 'react';
import { Modal, message } from 'antd';
import {
  Lock,
  Sparkles,
  Copy,
  Check,
  LogIn,
  Clock,
  Shield,
  Users,
  Radio,
  LogOut,
  Trophy,
  User as UserIcon,
  Flag,
  Handshake,
  CheckCircle2,
} from 'lucide-react';
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
import socketService, { type MoveMadeData } from '@/services/socket.service';
import { useAuthStore } from '@/store/auth.store';
import { useUserProfile } from '@/hooks/useUser';
import { useQueryClient } from '@tanstack/react-query';
import type { BoardType, PieceStyle } from '@/types/ai';

export interface PrivateRoomState {
  roomCode: string;
  hostId: string;
  hostUsername: string;
  guestId: string | null;
  guestUsername: string | null;
  settings: { totalRounds: number; hostSide: string };
  state: {
    status: 'WAITING' | 'PLAYING' | 'BETWEEN_ROUNDS' | 'FINISHED' | 'CLOSED';
    currentRound: number;
    score: { host: number; guest: number; draws: number };
    hostReady: boolean;
    guestReady: boolean;
    hostAssignedSide: 'red' | 'black' | null;
    guestAssignedSide: 'red' | 'black' | null;
    currentFen: string;
    turn: 'red' | 'black';
    drawOfferBy: string | null;
  };
}

export const RoomsPage: React.FC = () => {
  const authUser = useAuthStore((state) => state.user);
  const { data: profileData } = useUserProfile();

  const currentUsername =
    (profileData as unknown as { username?: string })?.username ||
    profileData?.user?.username ||
    authUser?.username ||
    'Kỳ Thủ';

  const authUserId = authUser?.id || (authUser as any)?.userId;
  const queryClient = useQueryClient();

  // --- SSOT State ---
  const [roomState, setRoomState] = useState<PrivateRoomState | null>(null);

  // Join Room State
  const [inputRoomCode, setInputRoomCode] = useState<string>('');
  const [isJoining, setIsJoining] = useState<boolean>(false);

  // Room Creation Settings
  const [totalRounds, setTotalRounds] = useState<number>(3);

  const [side, setSide] = useState<'random' | 'red' | 'black'>('random');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Board Local State (Driven by SSOT)
  const [boardType, setBoardType] = useState<BoardType>('wood');
  const [pieceStyle, setPieceStyle] = useState<PieceStyle>('classic');
  
  const [boardState, setBoardGrid] = useState<BoardGrid>(fenToBoard(INITIAL_FEN).board);
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const isHost = roomState ? String(roomState.hostId) === String(authUserId) : false;
  const playerSide = isHost ? roomState?.state.hostAssignedSide : roomState?.state.guestAssignedSide;
  const hostName = roomState?.hostUsername || (isHost ? currentUsername : 'Kỳ Thủ');
  const guestName = roomState?.guestUsername || (!isHost ? currentUsername : 'Đối thủ');

  const opponentUsername = isHost ? guestName : hostName;

  const redUsername = roomState?.state.hostAssignedSide === 'red' ? hostName : guestName;
  const blackUsername = roomState?.state.hostAssignedSide === 'black' ? hostName : guestName;
  
  const redScore = roomState?.state.hostAssignedSide === 'red' ? roomState?.state.score.host : roomState?.state.score.guest;
  const blackScore = roomState?.state.hostAssignedSide === 'black' ? roomState?.state.score.host : roomState?.state.score.guest;

  const playerScore = isHost ? (roomState?.state.score.host ?? 0) : (roomState?.state.score.guest ?? 0);
  const opponentScore = isHost ? (roomState?.state.score.guest ?? 0) : (roomState?.state.score.host ?? 0);
  
  const isPlayerReady = isHost ? roomState?.state.hostReady : roomState?.state.guestReady;
  const isOpponentReady = isHost ? roomState?.state.guestReady : roomState?.state.hostReady;

  // 1. Sync Board with SSOT Fen
  useEffect(() => {
    if (roomState?.state.currentFen) {
      const { board } = fenToBoard(roomState.state.currentFen);
      setBoardGrid(board);
      
      // If fen resets (new round), clear local move history
      if (roomState.state.currentFen === INITIAL_FEN) {
        setMoveHistory([]);
        setLastMove(null);
        setSelectedPos(null);
        setValidMoves([]);
      }
    }
  }, [roomState?.state.currentFen, roomState?.state.currentRound]);

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (roomState?.state.status === 'PLAYING' && roomState.state.roundStartedAt) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - roomState.state.roundStartedAt!) / 1000));
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [roomState?.state.status, roomState?.state.roundStartedAt]);

  // 2. Socket Listeners
  useEffect(() => {
    const socket = socketService.connect();

    const handleStateUpdate = (room: PrivateRoomState) => {
      setRoomState(room);
      setIsJoining(false);

      if (room.state.status === 'CLOSED') {
        message.warning('Phòng đã bị đóng.');
        setRoomState(null);
        setInputRoomCode('');
        
        // Invalidate queries to refresh history, ELO, leaderboard
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        queryClient.invalidateQueries({ queryKey: ['userHistory'] });
        queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      } else if (room.state.status === 'BETWEEN_ROUNDS' || room.state.status === 'FINISHED') {
        // Also invalidate to show updated match history immediately when round ends
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        queryClient.invalidateQueries({ queryKey: ['userHistory'] });
        queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      }
    };

    const handleError = (data: { message: string }) => {
      setIsJoining(false);
      message.error(data.message);
    };

    const handleMoveMade = (data: MoveMadeData) => {
      const parsed = parseUciMove(data.moveStr);
      if (parsed) {
        setLastMove({ from: parsed.from, to: parsed.to });
        
        // Ensure we record the move history visually if not already captured by local click
        setBoardGrid((prevBoard) => {
          const piece = prevBoard[parsed.from.row][parsed.from.col];
          if (piece) {
            setMoveHistory((prev) => [
              ...prev,
              { from: parsed.from, to: parsed.to, piece, moveStr: data.moveStr },
            ]);
          }
          const newBoard = prevBoard.map(row => [...row]);
          newBoard[parsed.to.row][parsed.to.col] = piece;
          newBoard[parsed.from.row][parsed.from.col] = null;
          return newBoard; 
        });
      }
    };

    socket.on('private_room_state_update', handleStateUpdate);
    socket.on('private_room_error', handleError);
    socket.on('private_room_created', (data: { roomCode: string }) => {
      message.destroy('create_room');
      message.success(`Tạo phòng #${data.roomCode} thành công!`);
    });
    socket.on('private_room_cancelled', () => {
      message.warning('Phòng đấu đã bị hủy.');
      setRoomState(null);
    });
    socket.on('move_made', handleMoveMade);

    return () => {
      socket.off('private_room_state_update', handleStateUpdate);
      socket.off('private_room_error', handleError);
      socket.off('private_room_created');
      socket.off('private_room_cancelled');
      socket.off('move_made', handleMoveMade);
    };
  }, []);

  // 3. Draw Offer Modal Listener
  useEffect(() => {
    if (roomState?.state.status === 'PLAYING' && roomState.state.drawOfferBy && roomState.state.drawOfferBy !== authUserId) {
      Modal.confirm({
        title: 'Đối thủ cầu hòa',
        content: `${opponentUsername} đã đề nghị một kết quả hòa cho ván đấu này. Bạn có đồng ý không?`,
        okText: 'Đồng ý',
        cancelText: 'Từ chối',
        onOk: () => {
          socketService.respondPrivateDraw(roomState.roomCode, true);
        },
        onCancel: () => {
          socketService.respondPrivateDraw(roomState.roomCode, false);
        }
      });
    }
  }, [roomState?.state.drawOfferBy, roomState?.state.status, authUserId, opponentUsername, roomState?.roomCode]);


  // 4. Check url for roomCode if redirected from Dashboard
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('join');
    if (code && !roomState) {
      setInputRoomCode(code);
      socketService.joinPrivateRoom(code);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [roomState]);


  // --- Actions ---

  const handleCreateRoom = () => {
    socketService.createPrivateRoom({ totalRounds, hostSide: side });
    message.loading({ content: 'Đang tạo phòng...', key: 'create_room' });
  };

  const handleJoinRoom = () => {
    const trimmedCode = inputRoomCode.trim();
    if (!trimmedCode || trimmedCode.length < 4) {
      message.warning('Vui lòng nhập mã phòng hợp lệ!');
      return;
    }
    setIsJoining(true);
    socketService.joinPrivateRoom(trimmedCode);
  };

  const handleCancelRoom = () => {
    if (roomState?.roomCode) {
      socketService.cancelPrivateRoom(roomState.roomCode);
    }
    setRoomState(null);
  };

  const handleLeaveRoom = () => {
    Modal.confirm({
      title: 'Xác nhận rời phòng đấu?',
      content: 'Bạn có chắc chắn muốn rời khỏi phòng đấu này không? Toàn bộ tiến trình sẽ bị mất.',
      okText: 'Thoát phòng',
      cancelText: 'Ở lại',
      okButtonProps: { danger: true },
      onOk: () => {
        if (roomState?.roomCode) {
          socketService.leavePrivateRoom(roomState.roomCode);
        }
        setRoomState(null);
      },
    });
  };

  const handleSquareClick = (pos: Position) => {
    if (roomState?.state.status !== 'PLAYING') return;

    const turn = roomState.state.turn;
    if (turn !== playerSide) {
      message.warning(`Đang là lượt đi của đối thủ (${turn === 'red' ? 'Phe Đỏ' : 'Phe Đen'})!`);
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

        setBoardGrid(nextBoard);
        setLastMove({ from, to });
        setSelectedPos(null);
        setValidMoves([]);

        const moveRec: MoveRecord = { from, to, piece: movingPiece, captured: capturedPiece, moveStr };
        setMoveHistory((prev) => [...prev, moveRec]);

        // Emit move to SSOT
        socketService.sendPrivateMove(roomState.roomCode, nextFen, moveStr, nextTurn);

        // Local Checkmate verification to emit end game
        const gameState = checkGameState(nextBoard, nextTurn);
        if (gameState === 'CHECKMATE' || gameState === 'KING_CAPTURED' || gameState === 'STALEMATE') {
          // If we made the move that resulted in this, we are the winner
          socketService.sendPrivateGameEnded(roomState.roomCode, authUserId || null, gameState);
        }
      } else {
        setSelectedPos(null);
        setValidMoves([]);
      }
    }
  };

  const handleResign = () => {
    Modal.confirm({
      title: 'Xác nhận Đầu Hàng?',
      content: 'Bạn sẽ lập tức bị xử thua trong ván đấu này.',
      okText: 'Đầu Hàng',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => {
        socketService.resignPrivateMatch(roomState!.roomCode);
      },
    });
  };

  const handleOfferDraw = () => {
    socketService.offerPrivateDraw(roomState!.roomCode);
    message.success('Đã gửi lời cầu hòa đến đối thủ.');
  };

  const handleReadyNextRound = () => {
    socketService.readyNextPrivateRound(roomState!.roomCode);
  };


  // --- Render Helpers ---

  const renderLobby = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Create Private Room */}
      <div className="lg:col-span-7 bg-white border border-[#d4c3be] rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-[#f0eded] pb-4">
          <div className="w-10 h-10 rounded-full bg-[#361e15] flex items-center justify-center text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold text-[#442a22]">Tạo Phòng Riêng Mới</h2>
            <p className="text-xs text-[#504441]">Cấu hình số hiệp thi đấu, thời gian và nhận mã phòng 6 chữ số.</p>
          </div>
        </div>

        {(!roomState || roomState.state.status !== 'WAITING' || !isHost) ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#442a22] font-serif flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#361e15]" />
                <span>Số hiệp thi đấu (Tỷ số trận đấu)</span>
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[1, 3, 5, 7].map((rounds) => (
                  <button
                    key={`rounds-${rounds}`}
                    type="button"
                    onClick={() => setTotalRounds(rounds)}
                    className={`py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      totalRounds === rounds
                        ? 'bg-[#361e15] text-white border-[#361e15] shadow-xs'
                        : 'bg-[#fcf9f8] text-[#504441] border-[#d4c3be] hover:bg-[#f6f3f2]'
                    }`}
                  >
                    {rounds} Hiệp
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#442a22] font-serif flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#361e15]" />
                <span>Chọn phe ban đầu</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSide('random')}
                  className={`py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    side === 'random' ? 'bg-[#361e15] text-white border-[#361e15]' : 'bg-[#fcf9f8] text-[#504441] border-[#d4c3be]'
                  }`}
                >Ngẫu nhiên</button>
                <button
                  type="button"
                  onClick={() => setSide('red')}
                  className={`py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    side === 'red' ? 'bg-red-800 text-white border-red-800' : 'bg-[#fcf9f8] text-red-900 border-[#d4c3be]'
                  }`}
                >Cầm Đỏ</button>
                <button
                  type="button"
                  onClick={() => setSide('black')}
                  className={`py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    side === 'black' ? 'bg-stone-900 text-white border-stone-900' : 'bg-[#fcf9f8] text-stone-900 border-[#d4c3be]'
                  }`}
                >Cầm Đen</button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateRoom}
              className="w-full bg-[#361e15] hover:bg-[#26140e] text-white font-bold py-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 text-sm mt-4"
            >
              <Sparkles className="w-4 h-4" />
              <span>TẠO PHÒNG VÀ LẤY MÃ</span>
            </button>
          </div>
        ) : (
          <div className="bg-[#fcf9f8] border-2 border-dashed border-[#361e15]/40 rounded-2xl p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto animate-bounce">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#504441] font-serif">Mã phòng riêng ({roomState.settings.totalRounds} hiệp):</p>
              <div className="text-4xl font-mono font-black text-[#361e15] tracking-widest my-3 select-all">
                #{roomState.roomCode}
              </div>
              <p className="text-xs text-stone-600">Gửi mã này cho bạn bè. Ván đấu sẽ tự động bắt đầu khi họ nhập mã!</p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(roomState.roomCode);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                  message.success('Đã sao chép mã phòng!');
                }}
                className="bg-[#361e15] text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer hover:bg-[#26140e]"
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? 'Đã sao chép!' : 'Sao chép mã'}</span>
              </button>
              <button
                type="button"
                onClick={handleCancelRoom}
                className="bg-white border border-[#d4c3be] text-[#504441] hover:bg-red-50 hover:text-red-700 px-4 py-3 rounded-xl text-xs font-bold cursor-pointer"
              >
                Hủy phòng
              </button>
            </div>
            <div className="text-xs text-amber-600 animate-pulse font-bold mt-4">
              Đang chờ đối thủ nhập mã...
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Join Room */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white border border-[#d4c3be] rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-[#f0eded] pb-4">
            <div className="w-10 h-10 rounded-full bg-[#5d4037] flex items-center justify-center text-white">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#442a22]">Tham Gia Bằng Mã</h2>
              <p className="text-xs text-[#504441]">Nhập mã phòng 6 chữ số để vào bàn cờ.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Ví dụ: 839201"
                maxLength={6}
                value={inputRoomCode}
                onChange={(e) => setInputRoomCode(e.target.value)}
                className="w-full bg-[#f4f2ee] text-[#1b1c1c] text-center font-mono text-2xl font-bold rounded-xl py-3 border border-[#d4c3be] focus:border-[#361e15] focus:outline-none tracking-widest"
              />
            </div>
            <button
              type="button"
              onClick={handleJoinRoom}
              disabled={isJoining || roomState?.state.status === 'WAITING'}
              className="w-full bg-[#361e15] hover:bg-[#26140e] text-white font-bold py-3.5 rounded-xl shadow-md cursor-pointer flex justify-center gap-2 text-sm disabled:opacity-70"
            >
              <LogIn className="w-4 h-4" />
              <span>{isJoining ? 'Đang kết nối...' : 'VÀO BÀN CỜ NGAY'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveArena = () => (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Top Bar: Score & Controls */}
      <div className="w-full bg-white border border-[#d4c3be] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-[#361e15] text-white rounded-lg font-mono font-bold text-sm">#{roomState!.roomCode}</div>
          <div className="text-sm font-serif font-bold text-[#442a22]">
            Hiệp {roomState!.state.currentRound} / {roomState!.settings.totalRounds}
          </div>
        </div>

        <div className="flex items-center gap-6 bg-[#fcf9f8] px-6 py-2 rounded-xl border border-[#d4c3be]">
          <div className="text-center">
            <span className="block text-[11px] font-bold text-red-700">{redUsername}</span>
            <span className="text-2xl font-black text-red-700 font-mono">{redScore}</span>
          </div>
          <div className="text-xs font-bold text-[#504441]">Hòa: {roomState!.state.score.draws}</div>
          <div className="text-center">
            <span className="block text-[11px] font-bold text-stone-900">{blackUsername}</span>
            <span className="text-2xl font-black text-stone-900 font-mono">{blackScore}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleLeaveRoom} className="px-4 py-2 bg-white hover:bg-stone-100 text-stone-600 font-bold text-xs rounded-xl border border-[#d4c3be] flex items-center gap-1.5 cursor-pointer shadow-xs">
            <LogOut className="w-4 h-4" /> <span>Thoát Phòng</span>
          </button>
        </div>
      </div>

      {/* Turn Indicator with Players */}
      {roomState!.state.status === 'PLAYING' && (
        <div className="bg-white border border-[#d4c3be] rounded-2xl p-6 shadow-xs flex justify-between items-center px-4 sm:px-12">
           {/* Red Player Avatar & Name */}
           <div className={`flex flex-col items-center transition-all duration-300 ${roomState!.state.turn === 'red' ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`}>
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mb-2 shadow-sm border border-red-200">
                <UserIcon className="w-6 h-6" />
              </div>
              <span className="text-red-700 font-bold text-sm">{redUsername}</span>
              {playerSide === 'red' && <span className="text-[10px] bg-red-700 text-white px-2 py-0.5 rounded-full mt-1">BẠN</span>}
           </div>
           
           <div className="flex flex-col items-center">
             <div className="px-6 py-2 bg-[#fcf9f8] border border-[#d4c3be] rounded-xl text-center shadow-inner">
               <span className="text-[11px] font-bold text-[#504441] block mb-1">LƯỢT ĐI HIỆN TẠI</span>
               <span className={`text-base font-black font-serif uppercase ${roomState!.state.turn === 'red' ? 'text-red-700' : 'text-stone-900'}`}>
                  {roomState!.state.turn === 'red' ? '🔴 BÊN ĐỎ' : '⚫ BÊN ĐEN'}
               </span>
             </div>
             <div className="mt-3 text-xs font-bold text-stone-500 font-mono flex items-center gap-1.5 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
               <Clock className="w-3.5 h-3.5 text-stone-600" /> 
               {Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}:{ (elapsedSeconds % 60).toString().padStart(2, '0') }
             </div>
           </div>

           {/* Black Player Avatar & Name */}
           <div className={`flex flex-col items-center transition-all duration-300 ${roomState!.state.turn === 'black' ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`}>
              <div className="w-12 h-12 rounded-full bg-stone-200 text-stone-900 flex items-center justify-center mb-2 shadow-sm border border-stone-300">
                <UserIcon className="w-6 h-6" />
              </div>
              <span className="text-stone-900 font-bold text-sm">{blackUsername}</span>
              {playerSide === 'black' && <span className="text-[10px] bg-stone-900 text-white px-2 py-0.5 rounded-full mt-1">BẠN</span>}
           </div>
        </div>
      )}

      {/* Main Layout */}
      {roomState!.state.status === 'PLAYING' ? (
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
              playerSide={playerSide || 'red'}
            />
          </div>
          <div className="lg:col-span-5 space-y-6">
            <MoveHistory history={moveHistory} />
            <div className="w-full grid grid-cols-2 gap-3">
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
                onClick={handleResign}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#fdf2f2] hover:bg-[#fde8e8] text-[#b71c1c] font-bold text-sm rounded-xl border border-[#f8b4b4] shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Flag className="w-4 h-4" />
                <span>Đầu Hàng</span>
              </button>
            </div>
            <BoardSettings
              selectedBoard={boardType}
              selectedPieceStyle={pieceStyle}
              playerSide={playerSide || 'red'}
              onSelectBoard={setBoardType}
              onSelectPieceStyle={setPieceStyle}
              hideSideSelection={true}
            />
          </div>
        </div>
      ) : roomState!.state.status === 'BETWEEN_ROUNDS' ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#d4c3be] rounded-2xl shadow-xs">
           <Trophy className="w-16 h-16 text-amber-500 mb-4" />
           <h2 className="text-2xl font-black font-serif text-[#442a22] mb-2">Chuẩn Bị Hiệp Tiếp Theo</h2>
           <p className="text-sm text-stone-600 mb-8">Vui lòng xác nhận sẵn sàng để bắt đầu hiệp {roomState!.state.currentRound + 1}. Hai bên sẽ đổi phe.</p>
           
           <div className="flex gap-8 mb-8">
              <div className="text-center">
                 <div className="font-bold text-lg">{currentUsername} (Bạn)</div>
                 <div className={`mt-2 text-sm font-bold ${isPlayerReady ? 'text-emerald-600' : 'text-amber-600'}`}>
                   {isPlayerReady ? '✓ Sẵn sàng' : '... Đang chờ'}
                 </div>
              </div>
              <div className="text-center">
                 <div className="font-bold text-lg">{opponentUsername}</div>
                 <div className={`mt-2 text-sm font-bold ${isOpponentReady ? 'text-emerald-600' : 'text-amber-600'}`}>
                   {isOpponentReady ? '✓ Sẵn sàng' : '... Đang chờ'}
                 </div>
              </div>
           </div>

           {!isPlayerReady ? (
             <button onClick={handleReadyNextRound} className="bg-[#361e15] hover:bg-[#26140e] text-white px-8 py-3 rounded-xl font-bold cursor-pointer shadow-md flex items-center gap-2">
               <CheckCircle2 className="w-5 h-5" /> Xác Nhận Sẵn Sàng
             </button>
           ) : (
             <div className="px-8 py-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-bold flex items-center gap-2">
               <CheckCircle2 className="w-5 h-5" /> Bạn đã sẵn sàng. Chờ đối thủ...
             </div>
           )}
        </div>
      ) : roomState!.state.status === 'FINISHED' ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#d4c3be] rounded-2xl shadow-xs">
           <Trophy className="w-20 h-20 text-amber-500 mb-4" />
           <h2 className="text-3xl font-black font-serif text-[#442a22] mb-2">CHUỖI TRẬN KẾT THÚC</h2>
           
           <div className="text-center mt-6">
             <span className="text-4xl font-black text-red-700">{playerScore}</span>
             <span className="text-2xl font-bold text-stone-400 mx-4">-</span>
             <span className="text-4xl font-black text-stone-900">{opponentScore}</span>
           </div>
           
           <div className="mt-8 text-xl font-bold">
             {playerScore > opponentScore ? (
               <span className="text-emerald-600">🎉 Bạn là người chiến thắng chung cuộc!</span>
             ) : playerScore < opponentScore ? (
               <span className="text-red-600">Thật đáng tiếc, bạn đã thua chung cuộc.</span>
             ) : (
               <span className="text-amber-600">Tỉ số hòa chung cuộc!</span>
             )}
           </div>

           <button onClick={handleLeaveRoom} className="mt-12 bg-[#361e15] hover:bg-[#26140e] text-white px-8 py-3 rounded-xl font-bold cursor-pointer shadow-md">
             Rời Phòng & Quay Lại Sảnh
           </button>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#fcf9f8] text-[#1b1c1c] pb-16 md:pb-8">
      <div className="w-full bg-[#f6f3f2] border-b border-[#d4c3be] px-4 sm:px-8 md:px-16 py-5 shadow-xs">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#442a22] flex items-center gap-3">
              <Lock className="w-7 h-7 text-[#361e15]" />
              Phòng Riêng Trực Tuyến
            </h1>
            <p className="text-xs sm:text-sm text-[#504441] mt-1 font-sans">
              Hệ thống phòng riêng BO3/BO5. Kết quả đồng bộ trực tiếp máy chủ.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-[#e4e2e1] px-3.5 py-1.5 rounded-lg border border-[#d4c3be]">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="text-xs font-bold text-[#442a22]">
              {(roomState && roomState.state.status !== 'WAITING') ? `Đang trong phòng #${roomState.roomCode}` : 'Socket Connected'}
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto w-full px-4 sm:px-8 md:px-16 py-6 space-y-8">
        {(!roomState || roomState.state.status === 'WAITING') ? renderLobby() : renderActiveArena()}
      </main>
    </div>
  );
};

export default RoomsPage;
