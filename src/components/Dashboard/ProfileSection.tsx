import React from 'react';
import type { UserProfile } from '@/types/user';
import type { User } from '@/types/auth';
import { getTitleFromElo } from '@/types/user';
import { useAuthStore } from '@/store/auth.store';
import { StatCard } from '@/components/ui/StatCard';
import { AvatarBadge } from '@/components/ui/AvatarBadge';
import { Star } from 'lucide-react';

interface ProfileSectionProps {
  user?: UserProfile | User | null;
  isLoading?: boolean;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  user,
  isLoading,
}) => {
  const authStoreUser = useAuthStore((state) => state.user);

  if (isLoading && !authStoreUser) {
    return (
      <section className="bg-[#f6f3f2] border border-[#d4c3be] rounded-xl p-6 relative overflow-hidden animate-pulse">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="w-28 h-28 rounded-full bg-[#e4e2e1]" />
          <div className="flex-1 space-y-3 w-full text-center md:text-left">
            <div className="h-8 bg-[#e4e2e1] rounded-md w-48 mx-auto md:mx-0" />
            <div className="h-6 bg-[#e4e2e1] rounded-full w-36 mx-auto md:mx-0" />
            <div className="h-14 bg-[#e4e2e1] rounded-lg w-full max-w-sm" />
          </div>
        </div>
      </section>
    );
  }

  // Prioritize API profile user, fallback to auth store user, then fallback name
  const username = user?.username || authStoreUser?.username || 'Kỳ Thủ';
  const eloScore = user?.eloScore ?? (authStoreUser as any)?.eloScore ?? 1850;
  const winMatches = user?.winMatches ?? (authStoreUser as any)?.winMatches ?? 120;
  const loseMatches = user?.loseMatches ?? (authStoreUser as any)?.loseMatches ?? 45;
  const drawMatches = user?.drawMatches ?? (authStoreUser as any)?.drawMatches ?? 15;
  const title = getTitleFromElo(eloScore);

  return (
    <section className="bg-[#f6f3f2] border border-[#d4c3be] rounded-xl p-6 relative overflow-hidden shadow-xs">
      {/* Texture Background */}
      <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none bg-[radial-gradient(#d4c3be_0.5px,transparent_0.5px)] [background-size:24px_24px]" />

      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 relative z-10">
        <AvatarBadge size="xl" isOnline borderClass="border-[#442a22]" />

        <div className="flex-1 text-center md:text-left">
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#442a22] mb-1">
            {username}
          </h3>

          <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
            <span className="bg-[#005313] text-[#ffffff] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-2xs">
              <Star className="w-3.5 h-3.5 fill-current text-yellow-300" />
              ELO: {eloScore}
            </span>
            <span className="text-[#504441] text-sm font-semibold font-sans">
              {title}
            </span>
          </div>

          {/* Stats Summary Grid */}
          <div className="grid grid-cols-3 gap-2 bg-white/70 backdrop-blur-xs rounded-lg p-2.5 border border-[#d4c3be]/40 max-w-sm mx-auto md:mx-0">
            <StatCard label="Thắng" value={winMatches} variant="primary" />
            <StatCard label="Thua" value={loseMatches} variant="error" />
            <StatCard label="Hòa" value={drawMatches} variant="neutral" hasRightBorder={false} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileSection;
