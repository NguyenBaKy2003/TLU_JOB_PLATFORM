"use client";

// Shared component — used by both:
//   /app/employer/payment-failure/PaymentFailureClient.tsx
//   /app/candidate/payment-failure/PaymentFailureClient.tsx

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, RefreshCw, MessageCircle, ArrowLeft, AlertTriangle } from "lucide-react";

// ─── VNPay error codes 
const VNPAY_REASON_MAP: Record<string, { title: string; desc: string }> = {
  "07": { title: "Giao dịch bị nghi ngờ gian lận",    desc: "Ngân hàng từ chối giao dịch do phát hiện dấu hiệu bất thường. Vui lòng liên hệ ngân hàng hoặc thử thẻ khác." },
  "09": { title: "Thẻ chưa đăng ký Internet Banking",  desc: "Thẻ của bạn chưa được đăng ký dịch vụ thanh toán trực tuyến. Vui lòng liên hệ ngân hàng để kích hoạt." },
  "10": { title: "Xác thực thông tin thẻ thất bại",    desc: "Bạn đã nhập sai thông tin thẻ quá 3 lần. Vui lòng thử lại sau." },
  "11": { title: "Đã hết thời gian thanh toán",        desc: "Phiên thanh toán đã hết hạn. Vui lòng tạo đơn hàng mới và thanh toán trong vòng 15 phút." },
  "12": { title: "Thẻ bị khóa",                        desc: "Tài khoản thẻ của bạn đang bị khóa. Vui lòng liên hệ ngân hàng để được hỗ trợ." },
  "13": { title: "Sai mật khẩu OTP",                   desc: "Mật khẩu xác thực OTP không đúng. Vui lòng thực hiện lại giao dịch." },
  "24": { title: "Khách hàng hủy giao dịch",           desc: "Bạn đã hủy giao dịch. Bạn có thể thử lại bất cứ lúc nào." },
  "51": { title: "Tài khoản không đủ số dư",           desc: "Số dư không đủ để thực hiện giao dịch. Vui lòng nạp thêm tiền hoặc dùng thẻ khác." },
  "65": { title: "Vượt hạn mức giao dịch",             desc: "Tài khoản của bạn đã vượt quá hạn mức giao dịch trong ngày." },
  "75": { title: "Ngân hàng đang bảo trì",             desc: "Ngân hàng thanh toán đang trong thời gian bảo trì. Vui lòng thử lại sau ít phút." },
  "79": { title: "Sai mật khẩu quá số lần quy định",   desc: "Bạn đã nhập sai mật khẩu thanh toán quá nhiều lần. Vui lòng liên hệ ngân hàng." },
  "99": { title: "Lỗi không xác định",                 desc: "Đã có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại hoặc liên hệ hỗ trợ." },
};

// ─── MoMo result codes 
// resultCode=0 là thành công; các mã dưới đây là thất bại
const MOMO_REASON_MAP: Record<string, { title: string; desc: string }> = {
  "1":    { title: "Giao dịch thất bại",               desc: "Giao dịch không thành công. Vui lòng thử lại." },
  "2":    { title: "Giao dịch bị từ chối",              desc: "MoMo từ chối giao dịch. Kiểm tra hạn mức hoặc liên hệ MoMo." },
  "3":    { title: "Giao dịch chưa hoàn tất",           desc: "Giao dịch chưa được xử lý xong. Vui lòng kiểm tra lại trong giây lát." },
  "4":    { title: "Giao dịch đã được hoàn tiền",       desc: "Số tiền đã được hoàn về tài khoản của bạn." },
  "7":    { title: "Giao dịch bị nghi ngờ gian lận",   desc: "MoMo phát hiện dấu hiệu bất thường và tạm khóa giao dịch." },
  "8":    { title: "Đã hủy hoàn tiền",                  desc: "Yêu cầu hoàn tiền đã bị hủy." },
  "9":    { title: "Hoàn tiền bị từ chối",              desc: "Yêu cầu hoàn tiền không được chấp nhận." },
  "10":   { title: "Hệ thống đang bảo trì",             desc: "MoMo đang bảo trì. Vui lòng thử lại sau ít phút." },
  "11":   { title: "Truy cập bị từ chối",               desc: "Không có quyền thực hiện giao dịch này." },
  "12":   { title: "Phiên bản API không hỗ trợ",        desc: "Lỗi hệ thống. Vui lòng liên hệ hỗ trợ." },
  "13":   { title: "Xác thực merchant thất bại",        desc: "Lỗi xác thực phía hệ thống. Vui lòng liên hệ hỗ trợ." },
  "20":   { title: "Yêu cầu không hợp lệ",              desc: "Dữ liệu giao dịch không hợp lệ. Vui lòng thử lại." },
  "21":   { title: "Số tiền không hợp lệ",              desc: "Giá trị giao dịch không được hỗ trợ." },
  "22":   { title: "amount không hợp lệ",               desc: "Số tiền nằm ngoài giới hạn cho phép của MoMo." },
  "23":   { title: "Trùng orderId",                     desc: "Đơn hàng đã tồn tại. Vui lòng tạo đơn mới." },
  "24":   { title: "Khách hàng hủy giao dịch",          desc: "Bạn đã hủy giao dịch. Bạn có thể thử lại bất cứ lúc nào." },
  "25":   { title: "orderId không tồn tại",             desc: "Không tìm thấy đơn hàng. Vui lòng liên hệ hỗ trợ." },
  "26":   { title: "orderId đã được xác nhận",          desc: "Đơn hàng này đã được thanh toán trước đó." },
  "27":   { title: "Giao dịch đang được xử lý",         desc: "Vui lòng chờ hệ thống xử lý hoặc thử lại sau." },
  "28":   { title: "Số điện thoại không đủ điều kiện",  desc: "Tài khoản MoMo không đáp ứng điều kiện giao dịch." },
  "29":   { title: "Hạn mức giao dịch bị vượt",         desc: "Số tiền vượt quá hạn mức giao dịch được phép." },
  "30":   { title: "Token không hợp lệ",                desc: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại MoMo." },
  "31":   { title: "requestId không hợp lệ",            desc: "Lỗi hệ thống. Vui lòng thử lại." },
  "32":   { title: "requestType không hỗ trợ",          desc: "Phương thức thanh toán không được hỗ trợ." },
  "33":   { title: "Mã QR hết hạn",                     desc: "Mã QR đã hết hiệu lực. Vui lòng tạo giao dịch mới." },
  "34":   { title: "orderId không hợp lệ",              desc: "Mã đơn hàng không hợp lệ. Vui lòng thử lại." },
  "35":   { title: "accessKey không hợp lệ",            desc: "Lỗi cấu hình hệ thống. Vui lòng liên hệ hỗ trợ." },
  "36":   { title: "Khách hàng không hoạt động",        desc: "Tài khoản MoMo chưa được kích hoạt." },
  "37":   { title: "Số điện thoại không tồn tại",       desc: "Không tìm thấy tài khoản MoMo liên kết." },
  "38":   { title: "Dịch vụ bị hạn chế",               desc: "Dịch vụ hiện không khả dụng với tài khoản của bạn." },
  "39":   { title: "Giao dịch bị khóa",                 desc: "Tài khoản MoMo tạm thời bị hạn chế. Vui lòng liên hệ MoMo." },
  "40":   { title: "Quá giới hạn giao dịch trong ngày", desc: "Bạn đã đạt giới hạn giao dịch trong ngày. Thử lại vào ngày mai." },
  "41":   { title: "Giao dịch bị trùng lặp",            desc: "Giao dịch giống hệt đã được thực hiện gần đây." },
  "42":   { title: "Chữ ký không hợp lệ",              desc: "Lỗi bảo mật. Vui lòng thử lại hoặc liên hệ hỗ trợ." },
  "43":   { title: "ipnUrl không hợp lệ",               desc: "Lỗi cấu hình hệ thống. Vui lòng liên hệ hỗ trợ." },
  "44":   { title: "extraData không hợp lệ",            desc: "Lỗi dữ liệu giao dịch. Vui lòng liên hệ hỗ trợ." },
  "45":   { title: "Không đủ số dư",                    desc: "Ví MoMo không đủ số dư. Vui lòng nạp thêm tiền." },
  "47":   { title: "Sản phẩm không tồn tại",            desc: "Gói dịch vụ không tồn tại. Vui lòng liên hệ hỗ trợ." },
  "98":   { title: "Giao dịch hết hạn",                 desc: "Phiên thanh toán đã hết hạn. Vui lòng tạo đơn hàng mới." },
  "99":   { title: "Lỗi không xác định",                desc: "Đã có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ hỗ trợ." },
  "1000": { title: "Giao dịch đã khởi tạo",             desc: "Đang chờ xác nhận thanh toán." },
  "1001": { title: "Không đủ số dư ví",                 desc: "Ví MoMo không đủ số dư để thực hiện giao dịch." },
  "1002": { title: "Ngân hàng từ chối",                 desc: "Tổ chức phát hành thẻ từ chối giao dịch." },
  "1003": { title: "Giao dịch đã bị hủy",               desc: "Giao dịch đã bị hủy bởi hệ thống." },
  "1004": { title: "Số tiền vượt hạn mức",              desc: "Số tiền giao dịch vượt quá hạn mức cho phép." },
  "1005": { title: "URL hết hạn hoặc không hợp lệ",     desc: "Link thanh toán đã hết hạn. Vui lòng tạo đơn mới." },
  "1006": { title: "Khách hàng từ chối xác nhận",       desc: "Bạn đã từ chối xác nhận giao dịch." },
  "1007": { title: "Tài khoản bị khóa",                 desc: "Tài khoản MoMo đang bị tạm khóa. Vui lòng liên hệ MoMo." },
  "1017": { title: "Đơn hàng bị hủy bởi merchant",     desc: "Giao dịch đã bị hủy từ phía hệ thống." },
  "1026": { title: "Giao dịch bị hạn chế",              desc: "Loại giao dịch này bị hạn chế với tài khoản của bạn." },
  "1080": { title: "Hoàn tiền thất bại",                desc: "Không thể hoàn tiền do lỗi giao dịch gốc." },
  "1081": { title: "Hoàn tiền bị từ chối",              desc: "Ngân hàng từ chối yêu cầu hoàn tiền." },
  "2001": { title: "Liên kết không tồn tại",            desc: "Tài khoản không có liên kết thanh toán." },
  "2007": { title: "Liên kết chưa được kích hoạt",      desc: "Phương thức thanh toán chưa được kích hoạt." },
  "2019": { title: "requestType không hợp lệ với liên kết", desc: "Phương thức thanh toán không tương thích." },
  "2029": { title: "Tài khoản liên kết bị hạn chế",    desc: "Tài khoản ngân hàng liên kết đang bị hạn chế." },
  "3001": { title: "Phương thức thanh toán không hỗ trợ", desc: "Ngân hàng hoặc ví không được hỗ trợ cho giao dịch này." },
  "3002": { title: "Phạm vi thanh toán bị giới hạn",   desc: "Phạm vi thanh toán của tài khoản bị giới hạn." },
  "3003": { title: "Vượt giới hạn hoàn tiền",          desc: "Số tiền hoàn vượt quá giới hạn cho phép." },
  "3004": { title: "Không thể hoàn tiền cho binding",  desc: "Loại liên kết không hỗ trợ hoàn tiền." },
  "4001": { title: "Giao dịch bị giới hạn",             desc: "Tài khoản chưa được xác minh đầy đủ (KYC)." },
  "4010": { title: "Xác thực OTP thất bại",             desc: "OTP không đúng. Vui lòng thực hiện lại giao dịch." },
  "4011": { title: "OTP hết hạn",                       desc: "Mã OTP đã hết hiệu lực. Vui lòng thử lại." },
  "4100": { title: "Khách hàng chưa đăng nhập",        desc: "Vui lòng đăng nhập tài khoản MoMo để tiếp tục." },
};

// ─── ZaloPay return codes ─────────────────────────
// return_code=1 là thành công
const ZALOPAY_REASON_MAP: Record<string, { title: string; desc: string }> = {
  "2":   { title: "Giao dịch thất bại",                desc: "ZaloPay không thể xử lý giao dịch. Vui lòng thử lại." },
  "3":   { title: "Giao dịch chưa hoàn tất",           desc: "Giao dịch chưa được xác nhận. Vui lòng kiểm tra lại." },
  "-1":  { title: "Lỗi hệ thống",                      desc: "Hệ thống ZaloPay gặp sự cố. Vui lòng thử lại sau." },
  "-2":  { title: "Đơn hàng không tồn tại",            desc: "Không tìm thấy đơn hàng trên ZaloPay." },
  "-3":  { title: "Đơn hàng đã được thanh toán",       desc: "Đơn hàng này đã được thanh toán thành công trước đó." },
  "-4":  { title: "Đơn hàng đã hết hạn",               desc: "Đơn hàng đã quá thời gian thanh toán. Vui lòng tạo đơn mới." },
  "-5":  { title: "Đơn hàng đã bị hủy",                desc: "Đơn hàng đã bị hủy. Vui lòng tạo giao dịch mới." },
  "-6":  { title: "Không đủ số dư",                    desc: "Tài khoản ZaloPay không đủ số dư." },
  "-7":  { title: "Người dùng từ chối thanh toán",     desc: "Bạn đã từ chối xác nhận giao dịch." },
  "-8":  { title: "Giao dịch vượt hạn mức",            desc: "Số tiền vượt quá giới hạn giao dịch của ZaloPay." },
  "-9":  { title: "Tài khoản bị hạn chế",              desc: "Tài khoản ZaloPay chưa đủ điều kiện. Vui lòng xác thực tài khoản." },
  "-10": { title: "Chữ ký không hợp lệ",               desc: "Lỗi bảo mật giao dịch. Vui lòng liên hệ hỗ trợ." },
  "-11": { title: "appid không hợp lệ",                desc: "Lỗi cấu hình hệ thống. Vui lòng liên hệ hỗ trợ." },
  "-12": { title: "Tham số không hợp lệ",              desc: "Dữ liệu giao dịch lỗi. Vui lòng thử lại." },
  "-13": { title: "Trùng app_trans_id",                desc: "Đơn hàng đã tồn tại. Vui lòng tạo đơn mới." },
  "-14": { title: "app_trans_id không hợp lệ",         desc: "Mã giao dịch không hợp lệ. Vui lòng thử lại." },
  "-15": { title: "Ứng dụng không hoạt động",          desc: "Dịch vụ tạm thời bị tắt. Vui lòng liên hệ hỗ trợ." },
  "-16": { title: "Ứng dụng không được kích hoạt ATM", desc: "Tài khoản chưa được kích hoạt thanh toán thẻ ATM." },
  "-17": { title: "Ứng dụng không được kích hoạt CC",  desc: "Tài khoản chưa được kích hoạt thanh toán thẻ tín dụng." },
  "-18": { title: "Giao dịch đang chờ xử lý",          desc: "Vui lòng chờ hệ thống xác nhận giao dịch." },
  "99":  { title: "Lỗi không xác định",                desc: "Đã có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ hỗ trợ." },
};

type Gateway = "VNPAY" | "MOMO" | "ZALOPAY";

function getReasonMap(gateway: Gateway) {
  switch (gateway) {
    case "MOMO":    return MOMO_REASON_MAP;
    case "ZALOPAY": return ZALOPAY_REASON_MAP;
    default:        return VNPAY_REASON_MAP;
  }
}

function resolveReason(raw: string | null, gateway: Gateway): { title: string; desc: string } {
  if (!raw) return { title: "Thanh toán thất bại", desc: "Đã có lỗi xảy ra trong quá trình xử lý giao dịch." };
  const map = getReasonMap(gateway);
  return map[raw] ?? {
    title: "Thanh toán thất bại",
    desc: decodeURIComponent(raw).length < 100
      ? decodeURIComponent(raw)
      : "Đã có lỗi xảy ra trong quá trình xử lý giao dịch.",
  };
}

const GATEWAY_LABEL: Record<Gateway, string> = {
  VNPAY:   "VNPay",
  MOMO:    "MoMo",
  ZALOPAY: "ZaloPay",
};

function Tip({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-[16px] text-gray-500">
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
      {text}
    </li>
  );
}

interface Props {
  /** href for the "Thử lại" button */
  redirectBase: string;
  /** href for the back-to-home link */
  homeHref: string;
}

export function PaymentFailureClient({ redirectBase, homeHref }: Props) {
  const searchParams = useSearchParams();
  const raw     = searchParams.get("reason");
  const gwParam = (searchParams.get("gateway") ?? "VNPAY").toUpperCase() as Gateway;
  const gateway: Gateway = ["VNPAY", "MOMO", "ZALOPAY"].includes(gwParam) ? gwParam : "VNPAY";

  const { title, desc } = resolveReason(raw, gateway);
  const reasonMap = getReasonMap(gateway);
  const hasKnownCode = !!raw && !!reasonMap[raw];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 px-4 py-12 flex items-center justify-center">
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-red-100 opacity-30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-orange-100 opacity-30 blur-3xl" />
      </div>

      <div className="max-w-md w-full space-y-4">
        {/* Main card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-8 py-10 text-center">
          <div className="relative flex items-center justify-center w-24 h-24 mx-auto mb-6">
            <span className="absolute inset-0 rounded-full bg-red-50" />
            <XCircle size={52} strokeWidth={1.5} className="relative text-red-400 drop-shadow-sm" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">{title}</h1>
          <p className="text-[16px] text-gray-500 leading-relaxed max-w-xs mx-auto">{desc}</p>

          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            {/* Gateway badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-500 text-xs font-semibold">
              Cổng: {GATEWAY_LABEL[gateway]}
            </div>
            {/* Error code badge — chỉ hiện khi có mã lỗi đã biết */}
            {hasKnownCode && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 text-red-500 text-xs font-mono font-bold">
                <AlertTriangle size={11} /> Mã lỗi: {raw}
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Gợi ý xử lý</p>
          <ul className="space-y-2">
            <Tip text="Kiểm tra số dư và hạn mức giao dịch của tài khoản." />
            <Tip text="Đảm bảo tài khoản / thẻ đã được kích hoạt thanh toán trực tuyến." />
            <Tip text="Thử lại với phương thức thanh toán khác (VNPay / MoMo / ZaloPay)." />
            <Tip text="Nếu vẫn thất bại, liên hệ ngân hàng hoặc ví điện tử phát hành." />
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={redirectBase}
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

        {/* Back */}
        <div className="text-center pb-2">
          <Link href={homeHref} className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={12} /> Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}