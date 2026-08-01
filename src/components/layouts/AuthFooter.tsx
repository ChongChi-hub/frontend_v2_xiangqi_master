import React from 'react';

export const AuthFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#eeeae3] border-t border-[#e2dcd0] px-8 py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600 gap-4 z-10">
      <div className="flex flex-col sm:flex-row items-baseline gap-2">
        <span className="font-serif font-bold text-sm text-[#361e15]">Xiangqi Master</span>
        <span>© 2026 Xiangqi Master. All rights reserved.</span>
      </div>
      <div className="flex items-center gap-6 font-medium text-gray-600">
        <a href="#privacy" className="hover:text-[#361e15] transition-colors">
          Privacy Policy
        </a>
        <a href="#terms" className="hover:text-[#361e15] transition-colors">
          Terms of Service
        </a>
        <a href="#help" className="hover:text-[#361e15] transition-colors">
          Help Center
        </a>
      </div>
    </footer>
  );
};
