import Link from "next/link";

export function ResetSuccessState() {
  return (
    <div className="w-full max-w-[340px] mx-auto text-center">
      <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
             stroke="#16a34a" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Đặt lại thành công!</h2>
      <p className="text-[16px] text-gray-500 mb-6">
        Mật khẩu mới của bạn đã được lưu.<br />
        Đang chuyển hướng về trang đăng nhập...
      </p>
      <Link
        href="/auth/login"
        className="inline-block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-[16px] font-semibold rounded-lg transition-colors text-center"
      >
        Đăng nhập ngay
      </Link>
    </div>
  );
}