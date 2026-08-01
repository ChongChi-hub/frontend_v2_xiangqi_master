import { useQuery } from '@tanstack/react-query';
import userService from '@/services/user.service';
import { AUTH_TOKEN_KEY } from '@/config/constants';

export const useUserProfile = () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  return useQuery({
    queryKey: ['userProfile'],
    queryFn: () => userService.getUserProfile(),
    enabled: !!token,
    staleTime: 1000 * 60 * 3, // 3 minutes cache
    retry: 1,
  });
};

export const useLeaderboard = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['leaderboard', page, limit],
    queryFn: () => userService.getLeaderboard(page, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    retry: 1,
  });
};
