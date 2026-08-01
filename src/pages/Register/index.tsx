import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { message } from 'antd';
import { useRegisterMutation } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

// Zod validation schema
const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Họ và tên không được để trống')
      .min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
    email: z
      .string()
      .min(1, 'Email không được để trống')
      .email('Email không hợp lệ'),
    username: z
      .string()
      .min(1, 'Tên đăng nhập không được để trống')
      .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
    password: z
      .string()
      .min(1, 'Mật khẩu không được để trống')
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận lại mật khẩu'),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: 'Bạn phải đồng ý với điều khoản dịch vụ',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không trùng khớp',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const registerMutation = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(
      {
        fullName: data.fullName,
        username: data.username,
        email: data.email,
        password: data.password,
        agreeTerms: data.agreeTerms,
      },
      {
        onSuccess: (res) => {
          message.success(res.message || 'Đăng ký tài khoản thành công!');
          if (res.user && res.token) {
            setAuth(res.user, res.token);
          }
          navigate('/login');
        },
        onError: (err: any) => {
          const errorMsg =
            err?.response?.data?.error ||
            err?.response?.data?.message ||
            'Đăng ký thất bại. Vui lòng thử lại sau!';
          message.error(errorMsg);
        },
      }
    );
  };

  return (
    <div className="flex-1 flex items-center justify-center w-full px-4 py-8 xiangqi-master-bg">
      <div className="max-w-5xl w-full bg-white rounded-3xl overflow-hidden shadow-xl border border-[#e5dfd5] flex flex-col md:flex-row my-4">
        {/* Left Column: Brand Showcase */}
        <div className="md:w-5/12 bg-[#ebe7e0] p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
          <div>
            {/* Top Circle Icon with Chinese Piece '帥' */}
            <div className="w-14 h-14 rounded-full border-2 border-[#361e15] bg-[#ebe7e0] flex items-center justify-center text-2xl font-black text-[#361e15] shadow-xs mb-8">
              帥
            </div>

            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-[#361e15] leading-snug">
              Nâng tầm trí tuệ qua từng nước cờ.
            </h1>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed mt-4">
              Tham gia cộng đồng kỳ thủ Xiangqi lớn nhất, nơi truyền thống gặp gỡ công nghệ đỉnh cao.
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
                Hơn 2,000 người chơi đang trực tuyến.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Register Form */}
        <div className="md:w-7/12 bg-white p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-3xl font-serif font-bold text-gray-900">Tạo Tài Khoản</h2>
            <p className="text-xs text-gray-500 mt-1">
              Bắt đầu hành trình chinh phục những nước cờ đỉnh cao
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Field 1: Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Họ và Tên
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  {...register('fullName')}
                  className="w-full bg-[#f4f2ee] text-gray-800 text-sm rounded-xl pl-10 pr-4 py-3 border border-transparent focus:border-[#361e15] focus:bg-white focus:outline-none transition-all"
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            {/* Field 2: Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="vi-du@email.com"
                  {...register('email')}
                  className="w-full bg-[#f4f2ee] text-gray-800 text-sm rounded-xl pl-10 pr-4 py-3 border border-transparent focus:border-[#361e15] focus:bg-white focus:outline-none transition-all"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Field 3: Username */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tên đăng nhập
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

            {/* Row: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Xác nhận
                </label>
                <div className="relative flex items-center">
                  <ShieldCheck className="absolute left-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    className="w-full bg-[#f4f2ee] text-gray-800 text-sm rounded-xl pl-10 pr-4 py-3 border border-transparent focus:border-[#361e15] focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Agree Terms Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer text-xs text-gray-600 select-none">
                <input
                  type="checkbox"
                  {...register('agreeTerms')}
                  className="rounded border-gray-300 text-[#361e15] focus:ring-[#361e15] w-4 h-4 mt-0.5"
                />
                <span>
                  Tôi đồng ý với <strong className="text-gray-900">Điều khoản dịch vụ</strong> và{' '}
                  <strong className="text-gray-900">Chính sách bảo mật</strong> của Xiangqi Master.
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="mt-1 text-xs text-red-600">{errors.agreeTerms.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full bg-[#361e15] hover:bg-[#26140e] active:bg-[#1a0c09] text-white font-bold py-3.5 rounded-xl shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-sm disabled:opacity-70 mt-3"
            >
              <span>{registerMutation.isPending ? 'Đang đăng ký...' : 'Đăng Ký Ngay'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer link to Login */}
          <p className="mt-6 text-center text-xs text-gray-600 border-t border-gray-100 pt-4">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-bold text-[#361e15] hover:underline">
              Đăng nhập tại đây
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
