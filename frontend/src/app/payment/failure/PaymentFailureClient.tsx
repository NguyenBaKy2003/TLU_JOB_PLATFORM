"use client";

import { useSearchParams }                                          from "next/navigation";
import Link                                                         from "next/link";
import { XCircle, RefreshCw, MessageCircle, ArrowLeft, AlertTriangle } from "lucide-react";

// ── Reason map ────────────

const REASON_MAP: Record<string, { title: string; desc: string }> = {
  "07": { title: "Giao dịch bị nghi ngờ gian lận",        desc: "Ngân hàng từ chối giao dịch do phát hiện dấu hiệu bất thường. Vui lòng liên hệ ngân hàng hoặc thử thẻ khác." },
  "09": { title: "Thẻ chưa đăng ký Internet Banking",      desc: "Thẻ của bạn chưa được đăng ký dịch vụ thanh toán trực tuyến. Vui lòng liên hệ ngân hàng để kích hoạt." },
  "10": { title: "Xác thực thông tin thẻ thất bại",        desc: "Bạn đã nhập sai thông tin thẻ quá 3 lần. Vui lòng thử lại sau." },
  "11": { title: "Đã hết thời gian thanh toán",            desc: "Phiên thanh toán đã hết hạn. Vui lòng tạo đơn hàng mới và thanh toán trong vòng 15 phút." },
  "12": { title: "Thẻ bị khóa",                            desc: "Tài khoản thẻ của bạn đang bị khóa. Vui lòng liên hệ ngân hàng để được hỗ trợ." },
  "13": { title: "Sai mật khẩu OTP",                       desc: "Mật khẩu xác thực OTP không đúng. Vui lòng thực hiện lại giao dịch." },
  "24": { title: "Khách hàng hủy giao dịch",               desc: "Bạn đã hủy giao dịch. Bạn có thể thử lại bất cứ lúc nào." },
  "51": { title: "Tài khoản không đủ số dư",               desc: "Số dư trong tài khoản không đủ để thực hiện giao dịch. Vui lòng nạp thêm tiền hoặc dùng thẻ khác." },
  "65": { title: "Vượt hạn mức giao dịch",                 desc: "Tài khoản của bạn đã vượt quá hạn mức giao dịch trong ngày." },
  "75": { title: "Ngân hàng đang bảo trì",                 desc: "Ngân hàng thanh toán đang trong thời gian bảo trì. Vui lòng thử lại sau ít phút." },
  "79": { title: "Sai mật khẩu quá số lần quy định",       desc: "Bạn đã nhập sai mật khẩu thanh toán quá nhiều lần. Vui lòng liên hệ ngân hàng." },
  "99": { title: "Lỗi không xác định",                     desc: "Đã có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại hoặc liên hệ hỗ trợ." },
};

function resolveReason(raw: string | null): { title: string; desc: string } {
  if (!raw) return { title: "Thanh toán thất bại", desc: "Đã có lỗi xảy ra trong quá trình xử lý giao dịch." };
  return (
    REASON_MAP[raw] ?? {
      title: "Thanh toán thất bại",
      desc: decodeURIComponent(raw).length < 100
        ? decodeURIComponent(raw)
        : "Đã có lỗi xảy ra trong quá trình xử lý giao dịch.",
    }
  );
}

// ── Tip item ──────────────

function Tip({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-[16px] text-gray-500">
      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
      {text}
    </li>
  );
}

// Named export — được import vào page.tsx (Server Component)
export function PaymentFailureClient() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("reason");
  const { title, desc } = resolveReason(raw);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 px-4 py-12 flex items-center justify-center">

      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-red-100 opacity-30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-orange-100 opacity-30 blur-3xl" />
      </div>

      <div className="max-w-md w-full space-y-4">

        {/* Main card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-8 py-10 text-center">

          {/* Icon */}
          <div className="relative flex items-center justify-center w-24 h-24 mx-auto mb-6">
            <span className="absolute inset-0 rounded-full bg-red-50" />
            <XCircle size={52} strokeWidth={1.5} className="relative text-red-400 drop-shadow-sm" />
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">
            {title}
          </h1>
          <p className="text-[16px] text-gray-500 leading-relaxed max-w-xs mx-auto">
            {desc}
          </p>

          {/* Error code badge */}
          {raw && REASON_MAP[raw] && (
            <div className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 text-red-500 text-xs font-mono font-bold">
              <AlertTriangle size={11} />
              Mã lỗi: {raw}
            </div>
          )}
        </div>

        {/* Tips card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Gợi ý xử lý
          </p>
          <ul className="space-y-2">
            <Tip text="Kiểm tra số dư và hạn mức giao dịch của thẻ." />
            <Tip text="Đảm bảo thẻ đã được kích hoạt thanh toán trực tuyến." />
            <Tip text="Thử lại với thẻ khác hoặc phương thức thanh toán khác." />
            <Tip text="Nếu vẫn thất bại, liên hệ ngân hàng phát hành thẻ." />
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/employer/subscription"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-blue-600 text-white text-[16px] font-bold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm shadow-blue-200"
          >
            <RefreshCw size={15} /> Thử lại
          </Link>
          <a
            href="mailto:support@jobplatform.vn"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white border border-gray-200 text-gray-700 text-[16px] font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            <MessageCircle size={15} /> Liên hệ hỗ trợ
          </a>
        </div>

        {/* Back link */}
        <div className="text-center pb-2">
          <Link
            href="/employer/dashboard"
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={12} /> Về trang chủ
          </Link>
        </div>

      </div>
    </div>
  );
}