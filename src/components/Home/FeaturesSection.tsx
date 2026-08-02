import React from 'react';
import { Target, Users, Cpu, Trophy } from 'lucide-react';

const FEATURES = [
  {
    icon: <Target className="w-8 h-8 text-[#ba1a1a]" />,
    title: 'Hệ thống ELO Tinh Chuẩn',
    description: 'Thi đấu và thăng hạng qua hệ thống tính điểm ELO chuẩn quốc tế, vinh danh những kỳ thủ xứng đáng nhất.',
    delay: 'delay-100'
  },
  {
    icon: <Cpu className="w-8 h-8 text-[#5d4037]" />,
    title: 'AI Bot Thách Thức',
    description: 'Rèn luyện kỹ năng với Pikafish - Trí tuệ nhân tạo cờ tướng hàng đầu, sẵn sàng thử thách bạn ở mọi cấp độ.',
    delay: 'delay-200'
  },
  {
    icon: <Users className="w-8 h-8 text-[#4a2c20]" />,
    title: 'Phòng Đấu Tùy Chỉnh',
    description: 'Tạo phòng riêng tư, thiết lập luật chơi và thời gian để giao lưu cùng bạn bè một cách trọn vẹn nhất.',
    delay: 'delay-300'
  },
  {
    icon: <Trophy className="w-8 h-8 text-[#8c7462]" />,
    title: 'Giải Đấu & Xếp Hạng',
    description: 'Tham gia các kỳ đài, tích lũy điểm số và ghi danh vào bảng vàng của những kỳ sư xuất chúng.',
    delay: 'delay-400'
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="w-full py-16 md:py-24 px-6 max-w-7xl mx-auto border-t border-[#d4c3be]/40">
      <div className="text-center space-y-4 mb-16 animate-fade-up">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#361e15]">
          Tinh Hoa Hội Tụ
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Mỗi tính năng đều được chế tác tỉ mỉ nhằm mang lại trải nghiệm cờ tướng trực tuyến hoàn hảo nhất.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {FEATURES.map((feature, index) => (
          <div 
            key={index} 
            className={`group bg-white rounded-2xl p-6 border border-[#e0dad0] shadow-sm hover:shadow-xl hover:border-[#8c7462]/30 transition-all duration-300 hover:-translate-y-1 cursor-default animate-fade-up ${feature.delay}`}
          >
            <div className="w-14 h-14 rounded-xl bg-[#fcf9f8] border border-[#e0dad0] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              {feature.icon}
            </div>
            <h3 className="text-lg font-bold text-[#361e15] mb-3">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
