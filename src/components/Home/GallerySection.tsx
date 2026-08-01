import React from 'react';
import xiangqiBg from '@/assets/images/xiangqi_bg.png';

export const GallerySection: React.FC = () => {
  return (
    <section className="w-full py-12 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Large Featured Card */}
        <div className="md:col-span-2 relative h-72 rounded-3xl overflow-hidden shadow-lg group">
          <img
            src={xiangqiBg}
            alt="Quân cờ gỗ thủ công"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 flex flex-col justify-end">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-200">
              Cổ Điển & Tinh Tế
            </span>
            <h3 className="text-2xl font-serif font-bold text-white mt-1">
              Quân Cờ Gỗ Thủ Công
            </h3>
          </div>
        </div>

        {/* Card 2: Two players playing */}
        <div className="relative h-72 rounded-3xl overflow-hidden shadow-lg group">
          <img
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80"
            alt="Đối chiến mọi lúc"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 flex flex-col justify-end">
            <h3 className="text-xl font-serif font-bold text-white">Đối Chiến Mọi Lúc</h3>
          </div>
        </div>

        {/* Card 3: Tablet board */}
        <div className="relative h-72 rounded-3xl overflow-hidden shadow-lg group">
          <img
            src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&q=80"
            alt="Bàn cờ số"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 flex flex-col justify-end">
            <h3 className="text-xl font-serif font-bold text-white">Bàn Cờ Số</h3>
          </div>
        </div>
      </div>
    </section>
  );
};
