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

  public connect(): Socket {
    const token = useAuthStore.getState().token;

    if (this.socket && this.socket.connected) {
      // Update token in auth if changed
      if (token) {
        this.socket.auth = { token };
      }
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('[SocketService] Connected to Xiangqi Server:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[SocketService] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[SocketService] Connection Error:', error);
    });

    return this.socket;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
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
}

export const socketService = new SocketService();
export default socketService;
