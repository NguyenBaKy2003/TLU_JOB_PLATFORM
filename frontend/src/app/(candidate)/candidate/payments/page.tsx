"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CreditCard, Clock, CheckCircle, XCircle, RefreshCw,
  Eye, ExternalLink, Loader2, Receipt, Wallet,
} from "lucide-react";
import { CandidatePaymentService } from "@/application/services/CandidatePaymentService";
import { CandidatePaymentRepository } from "@/infrastructure/repositories/CandidatePaymentRepository";
import { CandidateFilterBar, type CandidateFilterParams } from "@/presentation/components/candidate/CandidateFilterBar";
import { Pagination } from "@/presentation/components/common/Pagination";
import type { CandidatePayment, PaymentStatus } from "@/domain/models/CandidatePayment";
import { extractErrorMessage } from "@/lib/extractErrorMessage";
import { useToast } from "@/presentation/components/ui/toast";

const paymentService = new CandidatePaymentService(new CandidatePaymentRepository());

const STATUS_TABS = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ thanh toán" },
  { value: "SUCCESS", label: "Thành công" },
  { value: "FAILED", label: "Thất bại" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
];

const statusIconMap: Record<PaymentStatus, React.ReactNode> = {
  PENDING:  <Clock size={16} className="text-amber-500" />,
  SUCCESS:  <CheckCircle size={16} className="text-green-500" />,
  FAILED:   <XCircle size={16} className="text-red-500" />,
  REFUNDED: <RefreshCw size={16} className="text-blue-500" />,
};

export default function CandidatePaymentsPage() {
  const toast = useToast();

  const [payments, setPayments]           = useState<CandidatePayment[]>([]);
  const [loading, setLoading]             = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages]       = useState(0);

  const [activeStatus, setActiveStatus]   = useState("");
  const [currentPage, setCurrentPage]     = useState(1);
  const [pageSize, setPageSize]           = useState(10);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [filters, setFilters]             = useState<CandidateFilterParams>({
    keyword: "", appliedAtFrom: "", appliedAtTo: "",
  });
  const [selectedPayment, setSelectedPayment] = useState<CandidatePayment | null>(null);
  const [detailLoading, setDetailLoading]     = useState(false);

  // ─── Fetch — tất cả filter đẩy xuống backend 

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await paymentService.getMyPayments({
        status:   activeStatus ? (activeStatus as PaymentStatus) : undefined,
        keyword:  filters.keyword   || undefined,
        fromDate: filters.appliedAtFrom || undefined,
        toDate:   filters.appliedAtTo   || undefined,
        page:     currentPage - 1,
        size:     pageSize,
      });

      setPayments(data.content);
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages);
    } catch (err) {
      toast.error("Lỗi", extractErrorMessage(err, "Không thể tải lịch sử thanh toán"));
    } finally {
      setLoading(false);
    }
  }, [activeStatus, currentPage, pageSize, filters]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  // ─── Handlers ────

  const handleStatusChange = (value: string) => { setActiveStatus(value); setCurrentPage(1); };
  const handleFilter = (params: CandidateFilterParams) => { setFilters(params); setCurrentPage(1); };
  const handlePageChange = (page: number) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const handleViewDetail = async (paymentId: string) => {
    setDetailLoading(true);
    try {
      setSelectedPayment(await paymentService.getMyPaymentDetail(paymentId));
    } catch (err) {
      toast.error("Lỗi", extractErrorMessage(err, "Không thể tải chi tiết giao dịch"));
    } finally {
      setDetailLoading(false);
    }
  };

const handleRetryPayment = async (payment: CandidatePayment) => {
  if (retryingId) return;
  setRetryingId(payment.id);
  try {
    await paymentService.retryAndRedirect(payment.id);
  } catch (err) {
    toast.error("Lỗi", extractErrorMessage(err, "Không thể tạo lại giao dịch thanh toán"));
  } finally {
    setRetryingId(null);
  }
};
  // ─── Render ────────

  return (
    <div className=" mx-auto ">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-blue-100 rounded-xl">
            <Wallet size={22} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lịch sử thanh toán</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Theo dõi các giao dịch mua gói dịch vụ của bạn
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-6">
        <CandidateFilterBar
          statusTabs={STATUS_TABS}
          activeStatus={activeStatus}
          onStatusChange={handleStatusChange}
          searchPlaceholder="Tìm theo mã gói, mã giao dịch..."
          showDateRange
          onFilter={handleFilter}
          pageSizeOptions={[5, 10, 20, 50]}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          loading={loading}
        />
      </div>

      {/* Payments List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Receipt size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeStatus
              ? `Không có giao dịch ${STATUS_TABS.find(t => t.value === activeStatus)?.label.toLowerCase()}`
              : "Chưa có giao dịch nào"}
          </h3>
          <p className="text-gray-500">
            Các giao dịch mua gói dịch vụ sẽ hiển thị ở đây
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 
                hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: Info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Status Icon */}
                  <div className={`p-2 rounded-xl shrink-0 ${
                    payment.status === "SUCCESS" ? "bg-green-100" :
                    payment.status === "FAILED" ? "bg-red-100" :
                    payment.status === "PENDING" ? "bg-amber-100" :
                    "bg-blue-100"
                  }`}>
                    {statusIconMap[payment.status] || <CreditCard size={16} />}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {payment.subscription?.planName || payment.planCode || "Gói dịch vụ"}
                      </h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                        payment.status === "SUCCESS" ? "bg-green-50 text-green-700 border-green-200" :
                        payment.status === "FAILED" ? "bg-red-50 text-red-700 border-red-200" :
                        payment.status === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        {payment.statusLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <CreditCard size={12} />
                        {paymentService.getGatewayLabel(payment.gateway)}
                      </span>
                      {payment.gatewayTransactionId && (
                        <span className="truncate max-w-[180px]">
                          #{payment.gatewayTransactionId}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {paymentService.formatDate(payment.createdAt)}
                      </span>
                    </div>

                    {payment.failureReason && (
                      <p className="text-xs text-red-500 mt-1.5 line-clamp-1">
                        {payment.failureReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Amount + Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {payment.amountFormatted || paymentService.formatAmount(payment.amount)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleViewDetail(payment.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 
                        transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>

                   {paymentService.canRetryPayment(payment) && (
  <button
    onClick={() => handleRetryPayment(payment)}
    disabled={!!retryingId}
    className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 
      transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    title="Thanh toán lại"
  >
    {retryingId === payment.id
      ? <Loader2 size={16} className="animate-spin" />
      : <ExternalLink size={16} />}
  </button>
)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-gray-500">
              Hiển thị {payments.length} / {totalElements} giao dịch
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              showFirstLast
            />
          </div>
        </div>
      )}

      {/* ─── Detail Modal ──────────────────────── */}
      {selectedPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e => {
            if (e.target === e.currentTarget) setSelectedPayment(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Chi tiết giao dịch</h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XCircle size={18} className="text-gray-400" />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {/* Status */}
                <div className={`flex items-center gap-3 p-4 rounded-xl ${
                  selectedPayment.status === "SUCCESS" ? "bg-green-50" :
                  selectedPayment.status === "FAILED" ? "bg-red-50" :
                  selectedPayment.status === "PENDING" ? "bg-amber-50" :
                  "bg-blue-50"
                }`}>
                  <div className="p-2 rounded-lg bg-white">
                    {statusIconMap[selectedPayment.status] || <CreditCard size={20} />}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{selectedPayment.statusLabel}</div>
                    <div className="text-2xl font-bold text-gray-900 mt-0.5">
                      {selectedPayment.amountFormatted || paymentService.formatAmount(selectedPayment.amount)}
                    </div>
                  </div>
                </div>

                {/* Transaction Info */}
                <div className="space-y-3">
                  <DetailRow label="Mã giao dịch" value={selectedPayment.id} mono />
                  <DetailRow label="Mã gói" value={selectedPayment.planCode} mono />
                  <DetailRow label="Cổng thanh toán" value={paymentService.getGatewayLabel(selectedPayment.gateway)} />
                  {selectedPayment.gatewayOrderCode && (
                    <DetailRow label="Mã đơn hàng" value={selectedPayment.gatewayOrderCode} mono />
                  )}
                  {selectedPayment.gatewayTransactionId && (
                    <DetailRow label="Mã giao dịch cổng" value={selectedPayment.gatewayTransactionId} mono />
                  )}
                  <DetailRow label="Ngày tạo" value={paymentService.formatDate(selectedPayment.createdAt)} />
                  {selectedPayment.completedAt && (
                    <DetailRow label="Ngày hoàn tất" value={paymentService.formatDate(selectedPayment.completedAt)} />
                  )}
                  {selectedPayment.failureReason && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">Lý do thất bại</label>
                      <p className="text-sm text-red-600 mt-0.5">{selectedPayment.failureReason}</p>
                    </div>
                  )}
                </div>

                {/* Subscription Info */}
              {selectedPayment.subscription && (
  <div className="border-t border-gray-100 pt-4 mt-4">
    <h4 className="text-sm font-semibold text-gray-900 mb-3">
      Thông tin gói dịch vụ
    </h4>
    <div className="space-y-2">
      <DetailRow label="Tên gói"  value={selectedPayment.subscription.planName} />
      <DetailRow label="Mô tả"    value={selectedPayment.subscription.planDescription || "—"} />
      <DetailRow label="Thời hạn" value={`${selectedPayment.subscription.durationDays} ngày`} />
      <DetailRow
        label="Giá tháng"
        value={paymentService.formatAmount(selectedPayment.subscription.priceMonthly)}
      />

      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="text-xs text-gray-500">
          <span className="font-medium">Đơn ứng tuyển:</span>{" "}
          {paymentService.formatQuota(selectedPayment.subscription.applicationLimit)}
        </div>
        <div className="text-xs text-gray-500">
          <span className="font-medium">Đẩy CV:</span>{" "}
          {paymentService.formatQuota(selectedPayment.subscription.cvBoostLimit)}
        </div>
        <div className="text-xs text-gray-500">
          <span className="font-medium">Tạo CV:</span>{" "}
          {paymentService.formatQuota(selectedPayment.subscription.cvCreateLimit)}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {selectedPayment.subscription.aiCvWriter && (
          <FeatureBadge label="AI CV Writer" />
        )}
        {selectedPayment.subscription.premiumTemplateAccess && (
          <FeatureBadge label="Template Premium" />
        )}
      </div>
    </div>
  </div>
)}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedPayment(null)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium
                      text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Đóng
                  </button>
                 {paymentService.canRetryPayment(selectedPayment) && (
  <button
    onClick={() => handleRetryPayment(selectedPayment)}
    disabled={!!retryingId}
    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium
      hover:bg-blue-700 transition-colors flex items-center justify-center gap-2
      disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {retryingId === selectedPayment.id
      ? <Loader2 size={16} className="animate-spin" />
      : <ExternalLink size={16} />}
    Thanh toán lại
  </button>
)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <label className="text-xs font-medium text-gray-500 shrink-0">{label}</label>
      <span className={`text-sm text-gray-900 text-right break-all ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function FeatureBadge({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-medium px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
      {label}
    </span>
  );
}