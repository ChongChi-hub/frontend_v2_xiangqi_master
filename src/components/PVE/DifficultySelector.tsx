import React from 'react';
import type { AIDifficultyLevel, AIDifficultyOption } from '@/types/ai';
import { User, Brain, Bot, Cpu, Award } from 'lucide-react';

interface DifficultySelectorProps {
  selectedDifficulty: AIDifficultyLevel;
  onSelect: (difficulty: AIDifficultyLevel) => void;
}

const DIFFICULTY_OPTIONS: AIDifficultyOption[] = [
  {
    id: 'beginner',
    title: 'Nhập môn',
    description: 'Học cách di chuyển các quân cờ.',
    iconName: 'person',
  },
  {
    id: 'apprentice',
    title: 'Tập sự',
    description: 'Hiểu về các nước chiếu và ăn quân.',
    iconName: 'psychology',
  },
  {
    id: 'intermediate',
    title: 'Trung cấp',
    description: 'Thử thách với các chiến thuật cơ bản.',
    iconName: 'smart_toy',
  },
  {
    id: 'master',
    title: 'Cao thủ',
    description: 'Đòi hỏi sự tập trung và tính toán sâu.',
    iconName: 'memory',
  },
  {
    id: 'grandmaster',
    title: 'Đại kiện tướng',
    description: 'Trí tuệ nhân tạo cấp độ tối thượng.',
    iconName: 'workspace_premium',
    isSpecial: true,
  },
];

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  selectedDifficulty,
  onSelect,
}) => {
  const renderLucideIcon = (id: AIDifficultyLevel, isSpecial?: boolean) => {
    const iconClass = isSpecial ? 'w-10 h-10 text-[#d4ada1]' : 'w-10 h-10 text-[#442a22]';
    switch (id) {
      case 'beginner':
        return <User className={iconClass} />;
      case 'apprentice':
        return <Brain className={iconClass} />;
      case 'intermediate':
        return <Bot className={iconClass} />;
      case 'master':
        return <Cpu className={iconClass} />;
      case 'grandmaster':
        return <Award className={iconClass} />;
      default:
        return <User className={iconClass} />;
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#d4c3be] pb-2 gap-1">
        <h3 className="text-2xl font-serif font-bold text-[#442a22]">Chọn độ khó</h3>
        <p className="text-sm text-[#5e5e5b]">Chọn đối thủ phù hợp với trình độ của bạn</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {DIFFICULTY_OPTIONS.map((option) => {
          const isSelected = selectedDifficulty === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={`group relative bg-[#ffffff] border p-6 rounded-xl transition-all hover:shadow-lg flex flex-col items-center text-center space-y-4 cursor-pointer outline-none ${
                isSelected
                  ? 'border-[#442a22] ring-2 ring-[#442a22] ring-offset-2 shadow-md bg-[#fefcfb]'
                  : 'border-[#d4c3be] hover:border-[#827470]'
              }`}
            >
              <div
                className={`w-20 h-20 rounded-full border flex items-center justify-center group-hover:scale-110 transition-transform ${
                  option.isSpecial
                    ? 'bg-[#5d4037] border-[#d4c3be]'
                    : isSelected
                    ? 'bg-[#f0eded] border-[#442a22]'
                    : 'bg-[#f0eded] border-[#d4c3be]'
                }`}
              >
                {renderLucideIcon(option.id, option.isSpecial)}
              </div>

              <div>
                <p className="text-base font-bold text-[#442a22] font-serif">{option.title}</p>
                <p className="text-xs text-[#5e5e5b] mt-1 leading-relaxed">{option.description}</p>
              </div>

              {isSelected && (
                <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#4CAF50] rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default DifficultySelector;
