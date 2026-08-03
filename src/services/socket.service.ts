import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
  : 'http://localhost:3579';

export interface MatchFoundData {
  matchId: string;
  redPlayerId: string;
  redUsername?: string;
  blackPlayerId: string;
  blackUsername?: string;
  fen: string;
}

export interface MoveMadeData {
  playerId: string;
  fen: string;
  moveStr: string;
}

export interface MatchEndedData {
  winnerId: string;
  reason: string;
}

class SocketService {
  private socket: Socket | null = null;
  private currentToken: string | null = null;

  public connect(): Socket {
    const token = useAuthStore.getState().token;

    // Disconnect stale socket if token has changed (e.g. user logged out or switched accounts)
    if (this.socket && this.currentToken !== token) {
      console.log('[SocketService] Token changed or account switched. Disconnecting stale socket...');
      this.disconnect();
    }

    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    this.currentToken = token;
    this.socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('[SocketService] Connected to Xiangqi Server with socket:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('[SocketService] Connection Error:', error);
    });

    return this.socket;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      console.log('[SocketService] Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.currentToken = null;
    }
  }

  public findMatch(): void {
    const socket = this.connect();
    console.log('[SocketService] Emitting find_match...');
    socket.emit('find_match');
  }

  public cancelFindMatch(): void {
    if (this.socket) {
      console.log('[SocketService] Emitting cancel_find_match...');
      this.socket.emit('cancel_find_match');
    }
  }

  public joinRoom(roomId: string): void {
    const socket = this.connect();
    console.log(`[SocketService] Emitting join_room for ${roomId}...`);
    socket.emit('join_room', roomId);
  }

  public leaveRoom(roomId: string): void {
    if (this.socket) {
      console.log(`[SocketService] Emitting leave_room for ${roomId}...`);
      this.socket.emit('leave_room', roomId);
    }
  }

  public getMatchInfo(matchId: string): void {
    const socket = this.connect();
    console.log(`[SocketService] Emitting get_match_info for match ${matchId}...`);
    socket.emit('get_match_info', { matchId });
  }

  // --- Private Room Methods ---

  public createPrivateRoom(settings: { totalRounds: number; hostSide: 'random' | 'red' | 'black' }): void {
    const socket = this.connect();
    console.log('[SocketService] Emitting create_private_room...', settings);
    socket.emit('create_private_room', settings);
  }

  public joinPrivateRoom(roomCode: string): void {
    const socket = this.connect();
    console.log(`[SocketService] Emitting join_private_room for ${roomCode}...`);
    socket.emit('join_private_room', { roomCode });
  }

  public cancelPrivateRoom(roomCode: string): void {
    if (this.socket) {
      console.log(`[SocketService] Emitting cancel_private_room for ${roomCode}...`);
      this.socket.emit('cancel_private_room', { roomCode });
    }
  }

  public leavePrivateRoom(roomCode: string): void {
    if (this.socket) {
      console.log(`[SocketService] Emitting leave_private_room for ${roomCode}...`);
      this.socket.emit('leave_private_room', { roomCode });
    }
  }

  public sendPrivateMove(roomCode: string, fen: string, moveStr: string, nextTurn: 'red' | 'black'): void {
    if (this.socket) {
      console.log(`[SocketService] Emitting private_make_move for room ${roomCode}: ${moveStr}`);
      this.socket.emit('private_make_move', { roomCode, fen, moveStr, nextTurn });
    }
  }

  public sendPrivateGameEnded(roomCode: string, winnerId: string | null, reason: string): void {
    if (this.socket) {
      this.socket.emit('private_game_ended', { roomCode, winnerId, reason });
    }
  }

  public offerPrivateDraw(roomCode: string): void {
    if (this.socket) {
      this.socket.emit('offer_draw', { roomCode });
    }
  }

  public respondPrivateDraw(roomCode: string, accept: boolean): void {
    if (this.socket) {
      this.socket.emit('respond_draw', { roomCode, accept });
    }
  }

  public resignPrivateMatch(roomCode: string): void {
    if (this.socket) {
      this.socket.emit('resign_private_match', { roomCode });
    }
  }

  public readyNextPrivateRound(roomCode: string): void {
    if (this.socket) {
      this.socket.emit('ready_next_round', { roomCode });
    }
  }

  // --- End Private Room Methods ---

  public sendMove(matchId: string, fen: string, moveStr: string, timeCost: number = 0): void {
    if (this.socket) {
      console.log(`[SocketService] Emitting make_move for match ${matchId}: ${moveStr}`);
      this.socket.emit('make_move', { matchId, fen, moveStr, timeCost });
    }
  }

  public resignMatch(matchId: string): void {
    if (this.socket) {
      console.log(`[SocketService] Emitting resign for match ${matchId}`);
      this.socket.emit('resign', { matchId });
    }
  }

  public sendGameEnded(matchId: string, gameState: string): void {
    if (this.socket) {
      this.socket.emit('game_ended', { matchId, gameState });
    }
  }

  public offerDraw(matchId: string): void {
    if (this.socket) {
      this.socket.emit('offer_draw', { matchId });
    }
  }

  public respondDraw(matchId: string, accept: boolean): void {
    if (this.socket) {
      this.socket.emit('respond_draw', { matchId, accept });
    }
  }

  public requestUndo(matchId: string): void {
    if (this.socket) {
      this.socket.emit('request_undo', { matchId });
    }
  }

  public respondUndo(matchId: string, accept: boolean): void {
    if (this.socket) {
      this.socket.emit('respond_undo', { matchId, accept });
    }
  }
}

export const socketService = new SocketService();
export default socketService;
