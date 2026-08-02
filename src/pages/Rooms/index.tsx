import React, { useState } from 'react';
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
  RotateCcw,
  Swords,
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
  formatUciMove,
} from '@/utils/xiangqi';
import { XiangqiBoard } from '@/components/PVE/XiangqiBoard';
import { BoardControls } from '@/components/PVE/BoardControls';
import { MoveHistory } from '@/components/PVE/MoveHistory';
import { BoardSettings } from '@/components/PVE/BoardSettings';
import socketService from '@/services/socket.service';
import type { BoardType, PieceStyle } from '@/types/ai';

interface SeriesScore {
  playerWins: number;
  opponentWins: number;
  draws: number;
}

export const RoomsPage: React.FC = () => {
  // Navigation & Room View State
  const [isInMatch, setIsInMatch] = useState<boolean>(false);
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);

  // Room Creation Settings
  const [totalRounds, setTotalRounds] = useState<number>(3); // 1, 3, 5, 7 hiệp
  const [timeControl, setTimeControl] = useState<number>(15); // minutes
  const [side, setSide] = useState<'random' | 'red' | 'black'>('random');
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Join Room State
  const [inputRoomCode, setInputRoomCode] = useState<string>('');
  const [isJoining, setIsJoining] = useState<boolean>(false);

  // Series Match State
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [score, setScore] = useState<SeriesScore>({
    playerWins: 0,
    opponentWins: 0,
    draws: 0,
  });

  // Board & Customizing State
  const [boardType, setBoardType] = useState<BoardType>('wood');
  const [pieceStyle, setPieceStyle] = useState<PieceStyle>('classic');
  const [playerSide, setPlayerSide] = useState<'red' | 'black'>('red');

  // Game Board Logic State
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

  // 1. Generate new private room
  const handleCreateRoom = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setCreatedRoomCode(code);
    const chosenSide = side === 'random' ? (Math.random() > 0.5 ? 'red' : 'black') : side;
    setPlayerSide(chosenSide);
    socketService.joinRoom(`room_${code}`);
    message.success(`Đã khởi tạo phòng riêng #${code} (${totalRounds} hiệp)!`);
  };

  const handleCopyCode = () => {
    if (!createdRoomCode) return;
    navigator.clipboard.writeText(createdRoomCode);
    setIsCopied(true);
    message.success('Đã sao chép mã phòng!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCancelCreatedRoom = () => {
    if (createdRoomCode) {
      socketService.leaveRoom(`room_${createdRoomCode}`);
    }
    setCreatedRoomCode(null);
    message.info('Đã hủy phòng riêng.');
  };

  // 2. Start game directly inside the Room page
  const handleEnterMatchLobby = (code: string) => {
    setActiveRoomCode(code);
    setIsInMatch(true);
    setCurrentRound(1);
    setScore({ playerWins: 0, opponentWins: 0, draws: 0 });

    const { board } = fenToBoard(INITIAL_FEN);
    setBoardState(board);
    setFenHistory([INITIAL_FEN]);
    setMoveHistory([]);
    setTurn('red');
    setSelectedPos(null);
    setValidMoves([]);
    setLastMove(null);
  };

  // 3. Join Room by Code
  const handleJoinRoom = () => {
    const trimmedCode = inputRoomCode.trim();
    if (!trimmedCode || trimmedCode.length < 4) {
      message.warning('Vui lòng nhập mã phòng hợp lệ (6 chữ số)!');
      return;
    }

    setIsJoining(true);
    socketService.joinRoom(`room_${trimmedCode}`);
    message.loading({
      content: `Đang kết nối vào phòng #${trimmedCode}...`,
      key: 'join_room_page',
    });

    setTimeout(() => {
      setIsJoining(false);
      message.success({
        content: `Đã kết nối thành công vào phòng #${trimmedCode}! Ván đấu bắt đầu.`,
        key: 'join_room_page',
      });
      handleEnterMatchLobby(trimmedCode);
    }, 1000);
  };

  // 4. Host enters own room to test/play
  const handleHostEnterOwnRoom = () => {
    if (!createdRoomCode) return;
    handleEnterMatchLobby(createdRoomCode);
  };

  // 5. Handle Square Clicks on In-Room Board
  const handleSquareClick = (pos: Position) => {
    const clickedPiece = boardState[pos.row][pos.col];
    const clickedColor = getPieceColor(clickedPiece);

    // Select piece belonging to current turn player
    if (clickedColor === turn) {
      setSelectedPos(pos);
      const moves = getLegalMoves(boardState, pos);
      setValidMoves(moves);
      return;
    }

    // Execute Move
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

        const nextTurn = turn === 'red' ? 'black' : 'red';
        const nextFen = boardToFen(nextBoard, nextTurn);
        setFenHistory((prev) => [...prev, nextFen]);
        setTurn(nextTurn);
      } else {
        setSelectedPos(null);
        setValidMoves([]);
      }
    }
  };

  // 6. Handle Undo Move
  const handleUndo = () => {
    if (fenHistory.length <= 1) {
      message.info('Không thể đi lại thêm nữa!');
      return;
    }

    const newFenHistory = fenHistory.slice(0, fenHistory.length - 1);
    const newMoveHistory = moveHistory.slice(0, moveHistory.length - 1);

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
    setTurn((prev) => (prev === 'red' ? 'black' : 'red'));
    setSelectedPos(null);
    setValidMoves([]);
    setLastMove(prevLastMove);
    setHintMove(null);
    message.success('Đã hoàn tác 1 nước đi!');
  };

  // 7. Handle Exit Match with Confirmation Modal
  const handleConfirmExitMatch = () => {
    Modal.confirm({
      title: 'Xác nhận thoát trận đấu?',
      content:
        'Bạn có chắc chắn muốn thoát khỏi ván đấu trong phòng riêng không? Thoát trận khi ván đấu chưa kết thúc có thể bị tính thua.',
      okText: 'Thoát ngay',
      cancelText: 'Ở lại ván đấu',
      okButtonProps: { danger: true },
      onOk: () => {
        if (activeRoomCode) {
          socketService.leaveRoom(`room_${activeRoomCode}`);
        }
        setIsInMatch(false);
        setActiveRoomCode(null);
        setCreatedRoomCode(null);
        setInputRoomCode('');
        message.info('Đã rời khỏi phòng đấu riêng.');
      },
    });
  };

  // 8. Next Round in Series
  const handleNextRound = () => {
    if (currentRound >= totalRounds) {
      message.info('Trận đấu chuỗi số hiệp đã hoàn thành!');
      return;
    }
    setCurrentRound((prev) => prev + 1);
    const { board } = fenToBoard(INITIAL_FEN);
    setBoardState(board);
    setFenHistory([INITIAL_FEN]);
    setMoveHistory([]);
    setTurn('red');
    setSelectedPos(null);
    setValidMoves([]);
    setLastMove(null);
    message.success(`Bắt đầu Hiệp ${currentRound + 1}/${totalRounds}!`);
  };

  return (
    <div className="w-full min-h-screen bg-[#fcf9f8] text-[#1b1c1c] pb-16 md:pb-8">
      {/* Top Banner Header */}
      <div className="w-full bg-[#f6f3f2] border-b border-[#d4c3be] px-4 sm:px-8 md:px-16 py-5 shadow-xs">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#442a22] flex items-center gap-3">
              <Lock className="w-7 h-7 text-[#361e15]" />
              Phòng Riêng Trực Tuyến
            </h1>
            <p className="text-xs sm:text-sm text-[#504441] mt-1 font-sans">
              Tạo phòng riêng tư hoặc nhập mã để thi đấu trực tiếp với bạn bè qua mạng Internet.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-[#e4e2e1] px-3.5 py-1.5 rounded-lg border border-[#d4c3be]">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="text-xs font-bold text-[#442a22]">
              {isInMatch ? `Đang thi đấu (Mã #${activeRoomCode})` : 'Socket.io Internet Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto w-full px-4 sm:px-8 md:px-16 py-6 space-y-8">
        {!isInMatch ? (
          /* ================= VIEW 1: ROOM CREATION & JOIN HUB ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Create Private Room (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-[#d4c3be] rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-center gap-3 border-b border-[#f0eded] pb-4">
                <div className="w-10 h-10 rounded-full bg-[#361e15] flex items-center justify-center text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold text-[#442a22]">
                    Tạo Phòng Riêng Mới
                  </h2>
                  <p className="text-xs text-[#504441]">
                    Cấu hình số hiệp thi đấu, thời gian và chia sẻ mã cho bạn bè.
                  </p>
                </div>
              </div>

              {!createdRoomCode ? (
                <div className="space-y-6">
                  {/* Total Rounds Option */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#442a22] font-serif flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-[#361e15]" />
                      <span>Số hiệp thi đấu (Tỷ số trận đấu)</span>
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { rounds: 1, label: '1 Hiệp (Đơn)' },
                        { rounds: 3, label: '3 Hiệp (Chạm 2)' },
                        { rounds: 5, label: '5 Hiệp (Chạm 3)' },
                        { rounds: 7, label: '7 Hiệp (Chạm 4)' },
                      ].map((item) => (
                        <button
                          key={`rounds-${item.rounds}`}
                          type="button"
                          onClick={() => setTotalRounds(item.rounds)}
                          className={`py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            totalRounds === item.rounds
                              ? 'bg-[#361e15] text-white border-[#361e15] shadow-xs'
                              : 'bg-[#fcf9f8] text-[#504441] border-[#d4c3be] hover:bg-[#f6f3f2]'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Control Options */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#442a22] font-serif flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#361e15]" />
                      <span>Thời gian mỗi hiệp</span>
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {[5, 10, 15, 30].map((mins) => (
                        <button
                          key={`room-time-${mins}`}
                          type="button"
                          onClick={() => setTimeControl(mins)}
                          className={`py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            timeControl === mins
                              ? 'bg-[#361e15] text-white border-[#361e15] shadow-xs'
                              : 'bg-[#fcf9f8] text-[#504441] border-[#d4c3be] hover:bg-[#f6f3f2]'
                          }`}
                        >
                          {mins} phút
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Side Selection */}
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
                          side === 'random'
                            ? 'bg-[#361e15] text-white border-[#361e15]'
                            : 'bg-[#fcf9f8] text-[#504441] border-[#d4c3be]'
                        }`}
                      >
                        Ngẫu nhiên
                      </button>
                      <button
                        type="button"
                        onClick={() => setSide('red')}
                        className={`py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          side === 'red'
                            ? 'bg-red-800 text-white border-red-800'
                            : 'bg-[#fcf9f8] text-red-900 border-[#d4c3be]'
                        }`}
                      >
                        Cầm Đỏ (Đi trước)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSide('black')}
                        className={`py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          side === 'black'
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-[#fcf9f8] text-stone-900 border-[#d4c3be]'
                        }`}
                      >
                        Cầm Đen (Đi sau)
                      </button>
                    </div>
                  </div>

                  {/* Create Action Button */}
                  <button
                    type="button"
                    onClick={handleCreateRoom}
                    className="w-full bg-[#361e15] hover:bg-[#26140e] text-white font-bold py-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 text-sm mt-4"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>TẠO PHÒNG VÀ LẤY MÃ KHAI CUỘC</span>
                  </button>
                </div>
              ) : (
                /* Waiting Lobby Active */
                <div className="bg-[#fcf9f8] border-2 border-dashed border-[#361e15]/40 rounded-2xl p-8 text-center space-y-5">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto animate-bounce">
                    <Users className="w-7 h-7" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#504441] font-serif">Mã phòng riêng của bạn ({totalRounds} hiệp):</p>
                    <div className="text-4xl font-mono font-black text-[#361e15] tracking-widest my-3 select-all">
                      #{createdRoomCode}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="bg-[#361e15] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs hover:bg-[#26140e] cursor-pointer transition-all"
                    >
                      {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{isCopied ? 'Đã sao chép mã!' : 'Sao chép mã phòng'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleHostEnterOwnRoom}
                      className="bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs hover:bg-emerald-800 cursor-pointer transition-all"
                    >
                      <Swords className="w-4 h-4" />
                      <span>Vào Bàn Cờ Đấu Ngay</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelCreatedRoom}
                      className="bg-white border border-[#d4c3be] text-[#504441] hover:bg-red-50 hover:text-red-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Hủy phòng
                    </button>
                  </div>

                  <div className="pt-4 border-t border-[#d4c3be]/60 flex items-center justify-center gap-2 text-xs text-[#504441]">
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
                    <span>Đang chờ đối thủ nhập mã trên bất kỳ mạng Internet nào...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Join Room Panel (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-[#d4c3be] rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-3 border-b border-[#f0eded] pb-4">
                  <div className="w-10 h-10 rounded-full bg-[#5d4037] flex items-center justify-center text-white">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-[#442a22]">
                      Tham Gia Bằng Mã Phòng
                    </h2>
                    <p className="text-xs text-[#504441]">
                      Nhập mã phòng 6 chữ số để vào bàn cờ thi đấu ngay.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#442a22] font-serif mb-2">
                      Mã phòng (6 chữ số)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 839201"
                      maxLength={6}
                      value={inputRoomCode}
                      onChange={(e) => setInputRoomCode(e.target.value)}
                      className="w-full bg-[#f4f2ee] text-[#1b1c1c] text-center font-mono text-2xl font-bold rounded-xl py-3 border border-[#d4c3be] focus:border-[#361e15] focus:bg-white focus:outline-none tracking-widest transition-all"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleJoinRoom}
                    disabled={isJoining}
                    className="w-full bg-[#361e15] hover:bg-[#26140e] text-white font-bold py-3.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 text-sm disabled:opacity-70"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isJoining ? 'Đang kết nối...' : 'VÀO BÀN CỜ ĐẤU NGAY'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ================= VIEW 2: LIVE IN-ROOM MATCH ARENA ================= */
          <div className="space-y-6">
            {/* Top Match Bar: Series Scoreboard & Controls */}
            <div className="w-full bg-white border border-[#d4c3be] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Room Code & Round Counter */}
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 bg-[#361e15] text-white rounded-lg font-mono font-bold text-sm">
                  Phòng #{activeRoomCode}
                </div>
                <div className="text-sm font-serif font-bold text-[#442a22]">
                  Hiệp {currentRound} / {totalRounds} hiệp
                </div>
              </div>

              {/* Series Scoreboard Indicator */}
              <div className="flex items-center gap-6 bg-[#fcf9f8] px-6 py-2 rounded-xl border border-[#d4c3be]">
                <div className="text-center">
                  <span className="block text-[11px] font-bold text-red-700 font-serif">
                    Chủ phòng (Đỏ)
                  </span>
                  <span className="text-2xl font-black text-red-700 font-mono">
                    {score.playerWins}
                  </span>
                </div>

                <div className="text-xs font-bold text-[#504441]">
                  <span>Hòa: {score.draws}</span>
                </div>

                <div className="text-center">
                  <span className="block text-[11px] font-bold text-stone-900 font-serif">
                    Đối thủ (Đen)
                  </span>
                  <span className="text-2xl font-black text-stone-900 font-mono">
                    {score.opponentWins}
                  </span>
                </div>
              </div>

              {/* Exit Match Action Button */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleNextRound}
                  className="px-4 py-2 bg-[#f4efe6] hover:bg-[#e4d3bd] text-[#442a22] font-semibold text-xs rounded-xl border border-[#d4c3be] flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Hiệp tiếp theo</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmExitMatch}
                  className="px-4 py-2 bg-[#fdf2f2] hover:bg-[#fde8e8] text-[#b71c1c] font-bold text-xs rounded-xl border border-[#f8b4b4] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>THOÁT TRẬN</span>
                </button>
              </div>
            </div>

            {/* In-Room Arena Layout (Xiangqi Board on Left, History & Settings on Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Xiangqi Board & Controls */}
              <div className="lg:col-span-7 space-y-6">
                <XiangqiBoard
                  board={boardState}
                  selectedPos={selectedPos}
                  validMoves={validMoves}
                  lastMove={lastMove}
                  hintMove={hintMove}
                  onSquareClick={handleSquareClick}
                  boardType={boardType}
                  pieceStyle={pieceStyle}
                />

                <BoardControls
                  onUndo={handleUndo}
                  onHint={() => message.info('Tính năng gợi ý tạm khóa ở phòng thi đấu trực tiếp')}
                  onResign={handleConfirmExitMatch}
                  onRestart={() => handleEnterMatchLobby(activeRoomCode || '123456')}
                  canUndo={fenHistory.length > 1}
                />
              </div>

              {/* Right Column: Move History & Board Settings */}
              <div className="lg:col-span-5 space-y-6">
                <MoveHistory history={moveHistory} />

                <BoardSettings
                  selectedBoard={boardType}
                  selectedPieceStyle={pieceStyle}
                  playerSide={playerSide}
                  onSelectBoard={(b) => setBoardType(b)}
                  onSelectPieceStyle={(s) => setPieceStyle(s)}
                  onSelectSide={(s) => setPlayerSide(s)}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RoomsPage;
