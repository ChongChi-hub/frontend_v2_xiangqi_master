import apiClient from '@/services/api';
import type { UserProfile, LeaderboardResponse } from '@/types/user';

export const userService = {
  /**
   * Lấy thông tin cá nhân của người chơi (yêu cầu Token)
   */
  async getUserProfile(): Promise<{ user: UserProfile }> {
    const response = await apiClient.get<any>('/users/profile');
    return {
      user: {
        id: response.data.userId,
        ...response.data,
      },
    };
  },

  /**
   * Lấy danh sách bảng xếp hạng ELO động
   */
  async getLeaderboard(page = 1, limit = 10): Promise<LeaderboardResponse> {
    const response = await apiClient.get<any>('/users/leaderboard', {
      params: { page, limit },
    });
    return {
      leaderboard: response.data.data || [],
      pagination: {
        total: response.data.total,
        page: response.data.page,
        limit,
        totalPages: response.data.totalPages,
      }
    };
  },
  /**
   * Lưu kết quả trận đấu PVE
   */
  async savePveMatch(data: {
    difficulty: string;
    result: 'win' | 'lose' | 'draw';
    playerSide: 'red' | 'black';
    clientMatchId: string;
    timeControl?: number;
    initialFen?: string;
  }): Promise<{ message: string; reward: number }> {
    const response = await apiClient.post<{ message: string; reward: number }>('/users/pve-match', data);
    return response.data;
  },
  
  /**
   * Upload Avatar
   */
  async uploadAvatar(file: File): Promise<{ message: string; avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await apiClient.post<{ message: string; avatarUrl: string }>('/users/upload-avatar', formData, {
      transformRequest: [(data, headers) => {
        // Xoá Content-Type mặc định để trình duyệt tự động set multipart/form-data KÈM boundary
        delete headers['Content-Type'];
        return data;
      }],
    });
    return response.data;
  },
};

export default userService;
