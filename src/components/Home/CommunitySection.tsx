import React from 'react';

export const CommunitySection: React.FC = () => {
  return (
    <section id="community" className="w-full py-10 px-6 max-w-7xl mx-auto">
      <div className="bg-[#361e15] rounded-3xl p-10 md:p-14 text-white relative overflow-hidden shadow-2xl">
        {/* Subtle background overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />

        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
            Cộng đồng sôi động
          </h2>

          <p className="text-xs sm:text-sm text-amber-100/80 mt-3 leading-relaxed">
            Tham gia cùng hàng ngàn kỳ thủ từ khắp nơi trên thế giới. Chia sẻ kinh nghiệm, thảo luận về những thế cờ hay.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex -space-x-3">
              <img
                className="inline-block h-10 w-10 rounded-full ring-2 ring-[#361e15] object-cover"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                alt="Kỳ thủ"
              />
              <img
                className="inline-block h-10 w-10 rounded-full ring-2 ring-[#361e15] object-cover"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                alt="Kỳ thủ"
              />
              <img
                className="inline-block h-10 w-10 rounded-full ring-2 ring-[#361e15] object-cover"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                alt="Kỳ thủ"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Hơn 2,000 người đang trực tuyến</p>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400 mt-0.5">
                ● ĐÃ SẴN SÀNG THÁCH ĐẤU
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
