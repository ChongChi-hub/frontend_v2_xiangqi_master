import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, ArrowRight } from 'lucide-react';
import { message } from 'antd';
import { useLoginMutation } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

// Zod validation schema strictly typed
const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Tên đăng nhập không được để trống')
    .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  password: z
    .string()
    .min(1, 'Mật khẩu không được để trống')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(
      {
        username: data.username,
        password: data.password,
        rememberMe: data.rememberMe,
      },
      {
        onSuccess: (res) => {
          message.success(res.message || 'Đăng nhập thành công!');
          if (res.user && res.token) {
            setAuth(res.user, res.token);
          }
          navigate('/');
        },
        onError: (err: any) => {
          const errorMsg =
            err?.response?.data?.error ||
            err?.response?.data?.message ||
            'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!';
          message.error(errorMsg);
        },
      }
    );
  };

  return (
    <div className="flex-1 flex items-center justify-center w-full px-4 py-8 xiangqi-master-bg">
      <div className="max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-xl border border-[#e5dfd5] flex flex-col md:flex-row my-4">
        {/* Left Column: Brand Showcase */}
        <div className="md:w-5/12 bg-[#ebe7e0] p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
          <div>
            {/* Top Circle Icon with Chinese Piece '將' */}
            <div className="w-14 h-14 rounded-full border-2 border-[#361e15] bg-[#ebe7e0] flex items-center justify-center text-2xl font-black text-[#361e15] shadow-xs mb-8">
              將
            </div>

            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-[#361e15] leading-snug">
              Chinh phục bàn cờ. Khai phóng tư duy.
            </h1>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed mt-4">
              Chào mừng bạn quay trở lại với đấu trường Xiangqi Master. Tiếp tục những trận cờ đỉnh cao và thăng hạng cùng cộng đồng.
            </p>
          </div>

          {/* Bottom Avatars Stack */}
          <div className="mt-12 pt-6 border-t border-[#d8d3c8]">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-[#ebe7e0] object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                  alt="Kỳ thủ"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-[#ebe7e0] object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                  alt="Kỳ thủ"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-[#ebe7e0] object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                  alt="Kỳ thủ"
                />
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#361e15] text-[10px] font-bold text-white ring-2 ring-[#ebe7e0]">
                  +2k
                </div>
              </div>
              <span className="text-xs font-medium text-gray-700">
                Hơn 2,000 kỳ thủ đang sẵn sàng thách đấu.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Login Form */}
        <div className="md:w-7/12 bg-white p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-3xl font-serif font-bold text-gray-900">Đăng Nhập</h2>
            <p className="text-xs text-gray-500 mt-1">
              Nhập thông tin tài khoản để truy cập hệ thống
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Field 1: Username */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tên đăng nhập hoặc Email
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="xiangqi_master_123"
                  {...register('username')}
                  className="w-full bg-[#f4f2ee] text-gray-800 text-sm rounded-xl pl-10 pr-4 py-3 border border-transparent focus:border-[#361e15] focus:bg-white focus:outline-none transition-all"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
              )}
            </div>

            {/* Field 2: Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full bg-[#f4f2ee] text-gray-800 text-sm rounded-xl pl-10 pr-4 py-3 border border-transparent focus:border-[#361e15] focus:bg-white focus:outline-none transition-all"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900 select-none">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="rounded border-gray-300 text-[#361e15] focus:ring-[#361e15] w-4 h-4"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <a href="#forgot" className="font-medium text-[#361e15] hover:underline">
                Quên mật khẩu?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-[#361e15] hover:bg-[#26140e] active:bg-[#1a0c09] text-white font-bold py-3.5 rounded-xl shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-sm disabled:opacity-70 mt-3"
            >
              <span>{loginMutation.isPending ? 'Đang xử lý...' : 'Đăng Nhập Ngay'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer link to Register */}
          <p className="mt-6 text-center text-xs text-gray-600 border-t border-gray-100 pt-4">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-bold text-[#361e15] hover:underline">
              Đăng ký ngay tại đây
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
