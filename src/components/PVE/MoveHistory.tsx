import React from 'react';
import { History } from 'lucide-react';
import { type MoveRecord, getPieceName } from '@/utils/xiangqi';

interface MoveHistoryProps {
  history: MoveRecord[];
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({ history }) => {
  return (
    <div className="w-full bg-[#ffffff] border border-[#d4c3be] rounded-xl overflow-hidden shadow-xs flex flex-col h-full max-h-[350px]">
      <div className="bg-[#eae7e7] px-4 py-3 border-b border-[#d4c3be] flex items-center gap-2">
        <History className="w-4 h-4 text-[#442a22]" />
        <h3 className="font-serif font-bold text-sm text-[#442a22]">
          Lịch sử nước đi ({history.length})
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
        {history.length === 0 ? (
          <div className="text-center text-[#504441] py-8 italic font-sans">
            Chưa có nước đi nào. Hãy đi nước đầu tiên (Đỏ đi trước).
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5 font-mono">
            {history.map((record, index) => {
              const pieceName = getPieceName(record.piece);
              const isRed = record.piece === record.piece.toUpperCase();
              return (
                <div
                  key={`move-${index}`}
                  className={`px-2.5 py-1.5 rounded-md flex items-center justify-between border ${
                    isRed
                      ? 'bg-red-50/60 border-red-200 text-red-900'
                      : 'bg-stone-100 border-stone-200 text-stone-900'
                  }`}
                >
                  <span className="font-bold">
                    #{index + 1} {pieceName}
                  </span>
                  <span className="font-semibold text-[11px] opacity-80">
                    {record.moveStr}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoveHistory;
