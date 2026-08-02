import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
  : 'http://localhost:3579';

class SocketService {
  private socket: Socket | null = null;

  public connect(): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const token = useAuthStore.getState().token;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
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
    socket.emit('find_match');
  }

  public cancelFindMatch(): void {
    if (this.socket) {
      this.socket.emit('cancel_find_match');
    }
  }

  public joinRoom(roomId: string): void {
    const socket = this.connect();
    socket.emit('join_room', roomId);
  }

  public leaveRoom(roomId: string): void {
    if (this.socket) {
      this.socket.emit('leave_room', roomId);
    }
  }
}

export const socketService = new SocketService();
export default socketService;
