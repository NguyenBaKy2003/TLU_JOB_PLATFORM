import type { ICandidatePaymentRepository, PaymentSearchParams } from "@/domain/repositories/ICandidatePaymentRepository";
import type { CandidatePayment, PaymentListResponse, PaymentStatus } from "@/domain/models/CandidatePayment";

export class CandidatePaymentService {

  constructor(private readonly repo: ICandidatePaymentRepository) {}

  getMyPayments(params: PaymentSearchParams): Promise<PaymentListResponse> {
    return this.repo.getMyPayments(params);
  }

  getMyPaymentDetail(id: string): Promise<CandidatePayment> {
    if (!id) throw new Error("ID giao dịch không được để trống");
    return this.repo.getMyPaymentDetail(id);
  }

  // ─── Formatting Helpers (giữ nguyên) ──────────────────────────────

  formatDate(dateStr: string | null): string {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  getStatusLabel(status: PaymentStatus): string {
    const labels: Record<PaymentStatus, string> = {
      PENDING: "Chờ thanh toán", SUCCESS: "Thành công",
      FAILED: "Thất bại", REFUNDED: "Đã hoàn tiền",
    };
    return labels[status] || status;
  }

  getStatusColor(status: PaymentStatus): string {
    const colors: Record<PaymentStatus, string> = {
      PENDING: "bg-amber-50 text-amber-700 border-amber-200",
      SUCCESS: "bg-green-50 text-green-700 border-green-200",
      FAILED:  "bg-red-50 text-red-700 border-red-200",
      REFUNDED:"bg-blue-50 text-blue-700 border-blue-200",
    };
    return colors[status] || "";
  }

  formatAmount(amount: number): string {
    if (amount === 0) return "Miễn phí";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency", currency: "VND", maximumFractionDigits: 0,
    }).format(amount);
  }

  formatQuota(value: number): string {
    return value === -1 ? "Không giới hạn" : value?.toLocaleString();
  }

  getGatewayLabel(gateway: string): string {
    const gateways: Record<string, string> = {
      VNPAY: "VNPay", MOMO: "Momo", ZALOPAY: "ZaloPay",
      BANK_TRANSFER: "Chuyển khoản", INTERNAL: "Nội bộ",
    };
    return gateways[gateway] || gateway;
  }

  canRetryPayment(payment: CandidatePayment): boolean {
    return payment.status === "PENDING" || payment.status === "FAILED";
  }

  getPaymentUrl(payment: CandidatePayment): string | null {
    if (payment.gateway === "VNPAY" && payment.gatewayOrderCode) {
      return `/api/v1/payment/vnpay/pay?orderCode=${payment.gatewayOrderCode}`;
    }
    return null;
  }
}