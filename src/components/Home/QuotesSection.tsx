import React from 'react';

export const QuotesSection: React.FC = () => {
  const quotes = [
    {
      text: '"Kỳ giả, dịch dã. Dịch giả, biến dã."',
      author: 'Cờ là sự biến đổi. Theo thời thế mà biến hóa.',
    },
    {
      text: '"Nhất thất túc thành thiên cổ hận."',
      author: 'Một nước sai lầm hận nghìn thu. Thương vong chỉ vì nước cờ sai lầm.',
    },
    {
      text: '"Quan kỳ bất ngữ chân quân tử."',
      author: 'Xem cờ không nói mới thực là bậc quân tử.',
    },
    {
      text: '"Lạc tử vô hồi."',
      author: 'Hạ quân không hồi hạ.',
    },
    {
      text: '"Phục hổ tàng long, kỳ cao nhất xích."',
      author: 'Cao nhân giấu mặt, cờ cao một bậc.',
    },
    {
      text: '"Kỳ phùng địch thủ."',
      author: 'Gặp được đối thủ xứng tầm là niềm hạnh phúc của kỳ thủ.',
    },
  ];

  return (
    <section className="w-full py-16 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#361e15]">
          Trí Tuệ Từ Tiền Nhân
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-2">
          Những câu ngôn ngữ bất hủ kết tinh hoa nghệ thuật Cờ Tướng qua hàng ngàn năm.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quotes.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#efece6] border border-[#e2dcd0] rounded-2xl p-7 relative flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            {/* Big quote mark icon in corner */}
            <span className="absolute top-4 right-6 text-5xl font-serif text-[#d8d1c3]/80 select-none">
              ”
            </span>

            <div>
              <h3 className="text-lg font-serif font-bold text-[#361e15] pr-6">{item.text}</h3>
              <p className="text-xs text-gray-600 italic mt-3 leading-relaxed">{item.author}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
