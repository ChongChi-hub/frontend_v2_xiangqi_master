import api from './api';

export interface DashboardStats {
  totalUsers: number;
  totalMatches: number;
  activeMatches: number;
  activeRooms: number;
  topPlayers: Array<{
    id: string;
    username: string;
    eloScore: number;
    winMatches: number;
  }>;
}

export interface UserItem {
  id: string;
  username: string;
  email: string;
  eloScore: number;
  winMatches: number;
  loseMatches: number;
  drawMatches: number;
  role: string;
  createdAt: string;
}

export interface MatchItem {
  id: string;
  redPlayerId: string;
  blackPlayerId: string;
  winnerId: string | null;
  status: string;
  timeControl: number;
  createdAt: string;
  endedAt: string | null;
  redPlayer: { username: string };
  blackPlayer: { username: string };
  _count: { moves: number };
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [key: string]: T[] | Pagination;
    pagination: Pagination;
  };
}

export interface BotSetting {
  id: string;
  difficulty: string;
  depth: number;
  movetime: number;
  updatedAt: string;
}

export const adminService = {
  getDashboardStats: async () => {
    const response = await api.get<{ success: boolean; data: DashboardStats }>('/admin/stats');
    return response.data.data;
  },
  getUsersList: async (page = 1, limit = 10) => {
    const response = await api.get<PaginatedResponse<UserItem>>(`/admin/users?page=${page}&limit=${limit}`);
    return {
      users: response.data.data.users as UserItem[],
      pagination: response.data.data.pagination
    };
  },
  getMatchesList: async (page = 1, limit = 10) => {
    const response = await api.get<PaginatedResponse<MatchItem>>(`/admin/matches?page=${page}&limit=${limit}`);
    return {
      matches: response.data.data.matches as MatchItem[],
      pagination: response.data.data.pagination
    };
  },
  getBotSettings: async () => {
    const response = await api.get<{ success: boolean; data: BotSetting[] }>('/admin/bot-settings');
    return response.data.data;
  },
  updateBotSetting: async (difficulty: string, depth: number, movetime: number) => {
    const response = await api.put<{ success: boolean; data: BotSetting }>(`/admin/bot-settings/${difficulty}`, {
      depth,
      movetime
    });
    return response.data.data;
  }
};
