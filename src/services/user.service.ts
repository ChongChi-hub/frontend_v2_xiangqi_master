import apiClient from '@/services/api';
import type { UserProfile, LeaderboardResponse } from '@/types/user';

export const userService = {
  /**
   * Lấy thông tin cá nhân của người chơi (yêu cầu Token)
   */
  async getUserProfile(): Promise<{ user: UserProfile }> {
    const response = await apiClient.get<{ user: UserProfile }>('/users/profile');
    return response.data;
  },

  /**
   * Lấy danh sách bảng xếp hạng ELO động
   */
  async getLeaderboard(page = 1, limit = 10): Promise<LeaderboardResponse> {
    const response = await apiClient.get<LeaderboardResponse>('/users/leaderboard', {
      params: { page, limit },
    });
    return response.data;
  },
};

export default userService;
