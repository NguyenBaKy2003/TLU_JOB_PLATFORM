"use client";
import { useState, useEffect }    from "react";
import { useParams, useRouter }   from "next/navigation";
import { ArrowLeft, RotateCcw }   from "lucide-react";
import { AdminPaymentService }    from "@/application/services/AdminPaymentService";
import { AdminPaymentRepository } from "@/infrastructure/repositories/AdminPaymentRepository";
import { PaymentStatusBadge }     from "@/presentation/components/payment/PaymentStatusBadge";
import { RefundModal }            from "@/presentation/components/payment/RefundModal";
import { useToast }               from "@/presentation/components/ui/toast";
import { extractErrorMessage }    from "@/lib/extractErrorMessage";
import type { AdminPayment }      from "@/domain/models/AdminPayment";

const service = new AdminPaymentService(new AdminPaymentRepository());

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-400 w-36 shrink-0">{label}</span>
      <span className="text-sm text-gray-800 text-right">{value}</span>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
      p-6 animate-pulse flex flex-col gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex justify-between items-center
          py-3 border-b border-gray-50">
          <div className="h-3 bg-gray-100 rounded w-28" />
          <div className="h-3 bg-gray-100 rounded w-36" />
        </div>
      ))}
    </div>
  );
}

export default function AdminPaymentDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();
  const toast   = useToast();

  const [payment,     setPayment]     = useState<AdminPayment | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [showRefund,  setShowRefund]  = useState(false);

  useEffect(() => {
    service.getById(id)
      .then(setPayment)
      .catch(e => toast.error("Lỗi", extractErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [id, toast]);

  const handleRefund = async (reason: string) => {
    const updated = await service.refund(id, reason);
    setPayment(updated);
    toast.success("Thành công", "Giao dịch đã được đánh dấu hoàn tiền.");
  };

  const canRefund = payment?.status === "SUCCESS";

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl
            border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Chi tiết giao dịch</h1>
          <p className="text-xs text-gray-400 font-mono">{id}</p>
        </div>
        {payment && (
          <div className="ml-auto flex items-center gap-2">
            <PaymentStatusBadge status={payment.status} />
            {canRefund && (
              <button
                onClick={() => setShowRefund(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                  text-purple-600 bg-purple-50 hover:bg-purple-100
                  rounded-lg transition-colors"
              >
                <RotateCcw size={13} />
                Hoàn tiền
              </button>
            )}
          </div>
        )}
      </div>

      {/* Detail card */}
      {loading || !payment ? <DetailSkeleton /> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <DetailRow label="Mã giao dịch"
            value={<code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{payment.id}</code>} />
          <DetailRow label="Công ty"
            value={payment.companyName} />
          <DetailRow label="Số tiền"
            value={
              <span className="font-semibold text-gray-900">
                {payment.amount.toLocaleString("vi-VN", {
                  style: "currency", currency: payment.currency,
                })}
              </span>
            } />
          <DetailRow label="Cổng thanh toán"
            value={payment.gateway ?? "—"} />
          <DetailRow label="Trạng thái"
            value={<PaymentStatusBadge status={payment.status} />} />
          {payment.reason && (
            <DetailRow label="Lý do"
              value={<span className="text-gray-500 italic">{payment.reason}</span>} />
          )}
          <DetailRow label="Ngày tạo"
            value={new Date(payment.createdAt).toLocaleString("vi-VN")} />
          {payment.updatedAt && (
            <DetailRow label="Cập nhật lúc"
              value={new Date(payment.updatedAt).toLocaleString("vi-VN")} />
          )}
        </div>
      )}

      {showRefund && (
        <RefundModal
          paymentId={id}
          onClose={() => setShowRefund(false)}
          onConfirm={handleRefund}
        />
      )}
    </div>
  );
}