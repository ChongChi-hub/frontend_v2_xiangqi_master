import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="w-full py-12 md:py-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
      {/* Left Text Content */}
      <div className="md:w-1/2 space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eeeae3] border border-[#e0dad0] text-xs font-semibold text-[#4a2c20]">
          <Sparkles className="w-3.5 h-3.5 text-[#361e15]" />
          <span>Nền tảng Cờ Tướng hàng đầu Việt Nam</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-[#361e15] leading-[1.15]">
          Khai Phóng Trí Tuệ
          <br />
          Cùng <em className="italic text-[#6b3e2e]">Kỳ Đài</em>
        </h1>

        <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-lg">
          Trải nghiệm sự diệu kỳ cổ điển của Cờ Tướng trong một giao diện hiện đại. Nơi hội tụ của những bậc kỳ sư, nơi mỗi nước đi là một tác phẩm nghệ thuật.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link
            to="/register"
            className="bg-[#361e15] hover:bg-[#26140e] text-white font-bold px-7 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm"
          >
            <span>Chơi Ngay</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="bg-[#efece6] hover:bg-[#e4e0d7] text-[#361e15] font-semibold px-7 py-3.5 rounded-xl border border-[#ded8cb] transition-all text-sm"
          >
            Tìm Hiểu Thêm
          </a>
        </div>
      </div>

      {/* Right Xiangqi Board Graphic Frame */}
      <div className="md:w-1/2 w-full flex items-center justify-center">
        <div className="relative w-full max-w-md aspect-square bg-[#f9f7f2] rounded-3xl p-6 shadow-2xl border-4 border-[#361e15] flex flex-col justify-between">
          {/* Grid Graphic */}
          <div className="w-full h-full border-2 border-[#8c7462]/40 rounded-xl relative flex items-center justify-center bg-[#fdfcf9] shadow-inner">
            {/* Board Grid Lines */}
            <div className="absolute inset-4 grid grid-cols-8 grid-rows-9 border border-[#8c7462]/30">
              {Array.from({ length: 72 }).map((_, i) => (
                <div key={i} className="border border-[#8c7462]/20" />
              ))}
            </div>

            {/* River label */}
            <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-around text-xs font-serif italic text-[#8c7462]/60 px-8">
              <span>SỞ HÀ</span>
              <span>HÁN GIỚI</span>
            </div>

            {/* Center Piece Duet Demonstration */}
            <div className="relative z-10 flex items-center justify-center gap-6">
              <div className="w-14 h-14 rounded-full bg-[#fdfcf9] border-2 border-red-700 shadow-md flex items-center justify-center text-2xl font-black text-red-700">
                帥
              </div>
              <div className="w-14 h-14 rounded-full bg-[#361e15] border-2 border-[#1a0c09] shadow-md flex items-center justify-center text-2xl font-black text-white">
                將
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
