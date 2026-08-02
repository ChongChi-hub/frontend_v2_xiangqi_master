import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { userService } from '@/services/user.service';
import { Trophy, Swords, Medal, Camera, Loader2, Target } from 'lucide-react';
import { message, Progress } from 'antd';
import { getTitleFromElo } from '@/types/user';
import type { UserProfile } from '@/types/user';

export const ProfilePage: React.FC = () => {
  const { user, setAuth, token } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getUserProfile();
        setProfile(data.user);
        
        // Update user store if needed
        if (user && token) {
          setAuth({
            ...user,
            avatarUrl: data.user.avatarUrl,
            eloScore: data.user.eloScore,
            winMatches: data.user.winMatches,
            loseMatches: data.user.loseMatches,
            drawMatches: data.user.drawMatches
          }, token);
        }
      } catch (error) {
        message.error('Không thể tải thông tin hồ sơ');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn file hình ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const data = await userService.uploadAvatar(file);
      message.success(data.message);
      
      // Update local state
      if (profile) {
        setProfile({ ...profile, avatarUrl: data.avatarUrl });
      }
      if (user && token) {
        setAuth({ ...user, avatarUrl: data.avatarUrl }, token);
      }
    } catch (error) {
      message.error('Tải ảnh lên thất bại');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 text-[#5d4037] animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const title = getTitleFromElo(profile.eloScore);
  const winRate = profile.winRate || 0;
  
  const defaultAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVLUPKIj0KjoGE_BZ9ByvSZYW22KVP3THcqzHjv3JxYambXnO8AcIBkMKh5RgxEdUA1XXkZ-wysXcPQYg3NSicB-lluggL3sJo-fZOaqcnRMUXODnfdsXlUbSHXQyMXFKo891lakr9vQzq15IXV_jUfjD57mkQ7W9nTcdmA6l1dr-x7rdgdLx4xwQYI0Hpx0FgBy1JDPjAfbdIwh8XDB2sRGldGY9pj1Z1UHJT05uxV2HA1TVP6Cm2';

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-up">
      {/* Header Section */}
      <div className="bg-white rounded-2xl p-8 border border-[#e0dad0] shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
        {/* Background Decorative */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#f9f7f2] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 opacity-60"></div>
        
        {/* Avatar Upload */}
        <div className="relative group">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#e4e2dd] overflow-hidden bg-white shadow-md transition-transform group-hover:scale-105">
            <img 
              src={profile.avatarUrl || defaultAvatar} 
              alt={profile.username} 
              className="w-full h-full object-cover" 
            />
          </div>
          
          <label 
            className="absolute bottom-0 right-0 w-10 h-10 bg-[#361e15] rounded-full border-2 border-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-[#4a2c20] transition-colors"
            title="Đổi ảnh đại diện"
          >
            {isUploading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Camera className="w-4 h-4 text-white" />}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarUpload} 
              disabled={isUploading}
            />
          </label>
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f9f7f2] border border-[#e4e2dd] text-xs font-semibold text-[#5d4037] mb-4">
            <Medal className="w-4 h-4" />
            <span>{title}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#361e15] mb-2">
            {profile.username}
          </h1>
          <p className="text-gray-500">{profile.email}</p>
        </div>

        {/* ELO Display */}
        <div className="flex flex-col items-center justify-center p-6 bg-[#fcf9f8] rounded-2xl border border-[#e4e2dd] min-w-[160px] z-10">
          <Trophy className="w-8 h-8 text-[#d4af37] mb-2" />
          <span className="text-3xl font-black text-[#361e15]">{profile.eloScore}</span>
          <span className="text-sm font-semibold text-gray-500">Điểm ELO</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#e0dad0] shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-green-50/50 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
          <Swords className="w-8 h-8 text-green-600 mb-3 relative z-10" />
          <span className="text-3xl font-bold text-gray-800 relative z-10">{profile.winMatches}</span>
          <span className="text-sm text-gray-500 font-semibold relative z-10">Thắng</span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#e0dad0] shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-orange-50/50 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
          <Target className="w-8 h-8 text-orange-500 mb-3 relative z-10" />
          <span className="text-3xl font-bold text-gray-800 relative z-10">{profile.drawMatches}</span>
          <span className="text-sm text-gray-500 font-semibold relative z-10">Hoà</span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#e0dad0] shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-red-50/50 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
          <Swords className="w-8 h-8 text-red-500 mb-3 relative z-10 transform scale-x-[-1]" />
          <span className="text-3xl font-bold text-gray-800 relative z-10">{profile.loseMatches}</span>
          <span className="text-sm text-gray-500 font-semibold relative z-10">Thua</span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#e0dad0] shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
          <Progress type="circle" percent={winRate} size={80} strokeColor="#5d4037" className="mb-2 relative z-10" />
          <span className="text-sm text-gray-500 font-semibold relative z-10 mt-2">Tỉ lệ thắng</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
