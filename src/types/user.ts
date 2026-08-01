export interface UserProfile {
  id: string;
  username: string;
  email: string;
  eloScore: number;
  winMatches: number;
  loseMatches: number;
  drawMatches: number;
  role: 'PLAYER' | 'ADMIN';
  createdAt: string;
}

export interface LeaderboardItem {
  id: string;
  username: string;
  eloScore: number;
  winMatches: number;
  loseMatches: number;
  drawMatches: number;
  rank?: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardItem[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Helper để lấy Danh hiệu dựa trên chỉ số ELO
 */
export const getTitleFromElo = (elo: number): string => {
  if (elo >= 2400) return 'Đại kiện tướng Quốc tế';
  if (elo >= 2000) return 'Đại kiện tướng';
  if (elo >= 1800) return 'Kiện tướng';
  if (elo >= 1500) return 'Cao thủ';
  if (elo >= 1200) return 'Tập sự';
  return 'Nhập môn';
};
