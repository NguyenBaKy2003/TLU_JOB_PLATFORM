import Link from "next/link";

export function InvalidTokenState() {
  return (
    <div className="w-full max-w-[340px] mx-auto text-center">
      <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
             stroke="#ef4444" strokeWidth="2.5">
          <line x1="18" y1="6"  x2="6"  y2="18" />
          <line x1="6"  y1="6"  x2="18" y2="18" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Link không hợp lệ</h2>
      <p className="text-sm text-gray-500 mb-6">
        Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.<br />
        Vui lòng yêu cầu gửi lại.
      </p>
      <Link
        href="/auth/forgot-password"
        className="inline-block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors text-center"
      >
        Gửi lại yêu cầu
      </Link>
    </div>
  );
}