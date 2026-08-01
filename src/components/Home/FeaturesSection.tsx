import React from 'react';
import { GraduationCap, Swords, Trophy } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: GraduationCap,
      title: 'Học Cờ từ Cơ Bản',
      description:
        'Hệ thống bài giảng từ nhập môn đến nâng cao. Phân tích các thế trận kinh điển như Bình Phong Mã, Pháo Đầu.',
    },
    {
      icon: Swords,
      title: 'Thách Đấu Kỳ Thủ',
      description:
        'Tìm kiếm đối thủ ngang sức trong giây lát. Hệ thống xếp hạng công bằng và chuyên nghiệp.',
    },
    {
      icon: Trophy,
      title: 'Giải Đấu Hàng Tuần',
      description:
        'Tham gia các giải đấu mở rộng, tranh tài cùng hàng ngàn kỳ thủ và giành những giải thưởng hấp dẫn.',
    },
  ];

  return (
    <section id="features" className="w-full py-16 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#361e15]">
          Tính Năng Tuyệt Vời
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-2">
          Mọi công cụ bạn cần để trở thành cao thủ Cờ Tướng thực thụ.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-[#efece6] hover:bg-[#e8e4dc] border border-[#e2dcd0] rounded-2xl p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#e3ded4] group-hover:bg-[#361e15] group-hover:text-white text-[#361e15] flex items-center justify-center mb-6 transition-all">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#361e15] mb-3">{item.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
