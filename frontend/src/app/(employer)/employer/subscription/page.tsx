"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { AlertCircle, X }                from "lucide-react";
import { PlanCard }                      from "@/presentation/components/subscription/PlanCard";
import { PaymentModal }                  from "@/presentation/components/subscription/PaymentModal";
import { CurrentSubscriptionCard }       from "@/presentation/components/subscription/CurrentSubscriptionCard";
import { CompanySubscriptionService }    from "@/application/services/CompanySubscriptionService";
import { CompanySubscriptionRepository } from "@/infrastructure/repositories/CompanySubscriptionRepository";
import type {
  SubscriptionPlan,
  CompanySubscription,
  QuotaResult,
} from "@/domain/models/CompanySubscription";
import { extractErrorMessage }           from "@/lib/extractErrorMessage";
import { useToast }                      from "@/presentation/components/ui/toast";

const service = new CompanySubscriptionService(new CompanySubscriptionRepository());

// ── Skeleton ──────────────

function PlanSkeleton() {
  return (
    <div className="rounded-2xl border-2 border-gray-100 bg-white p-6 animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
      <div className="h-8 bg-gray-100 rounded w-2/3 mb-5" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-3 bg-gray-100 rounded w-full mb-2" />
      ))}
    </div>
  );
}

// ── Pending order banner ──

function PendingOrderBanner({
  orderId,
  onDismiss,
}: {
  orderId: string;
  onDismiss: () => void;
}) {
  return (
    <div className="flex items-start gap-3 px-5 py-4 rounded-2xl border mb-6 bg-amber-50 border-amber-200 text-amber-900">
      <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">Bạn có đơn hàng đang chờ thanh toán</p>
        <p className="text-xs mt-0.5 opacity-80">
          Mã đơn:{" "}
          <span className="font-mono font-bold tracking-wide">{orderId}</span>.
          Vui lòng hoàn tất thanh toán hoặc chờ đơn hết hạn trước khi tạo đơn mới.
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="text-amber-400 hover:text-amber-600 transition-colors shrink-0"
        aria-label="Đóng thông báo"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// ── Helpers 

function extractOrderId(message: string): string | null {
  const match = message.match(/:\s*([A-Z0-9-]+)\./);
  return match?.[1] ?? null;
}

// ── Page ───

export default function SubscriptionPage() {
  const toast = useToast();

  const [plans,          setPlans]          = useState<SubscriptionPlan[]>([]);
  const [currentSub,     setCurrentSub]     = useState<CompanySubscription | null>(null);
  const [quota,          setQuota]          = useState<QuotaResult | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [yearly,         setYearly]         = useState(false);
  const [selectedId,     setSelectedId]     = useState<string | null>(null);
  const [showModal,      setShowModal]      = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  const hasLoaded = useRef(false);

  // ── Load ──────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [plansData, subData, quotaData] = await Promise.all([
        service.getPlans(),
        service.getMySubscription().catch(() => null),
        service.getMyQuota().catch(() => null),
      ]);
      setPlans(plansData);
      setCurrentSub(subData);
      setQuota(quotaData);
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e, "Không thể tải thông tin gói dịch vụ"));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    loadData();
  }, [loadData]);

  // ── Handlers ──────────

  const handleSelectPlan = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    if (plan.priceMonthly === 0) return;
    setSelectedId(planId);
    setShowModal(true);
  };

  const handleConfirmPayment = useCallback(async () => {
    if (!selectedId) return;
    try {
      await service.purchaseAndRedirect(selectedId, yearly);
    } catch (e: any) {
      setShowModal(false);

      if (e?.errorCode === "PENDING_ORDER_EXISTS") {
        toast.warning(
          "Đơn hàng chờ thanh toán",
          "Vui lòng hoàn tất đơn cũ trước khi tạo đơn mới."
        );
        const orderId = extractOrderId(e?.message ?? "") ?? "N/A";
        setPendingOrderId(orderId);
        return;
      }

      toast.error("Thanh toán thất bại", extractErrorMessage(e, "Có lỗi xảy ra, vui lòng thử lại."));
    }
  }, [selectedId, yearly, toast]);

  // ── Derived ───────────

  const selectedPlan  = plans.find(p => p.id === selectedId) ?? null;
  const currentPlanId = currentSub?.planId ?? null;

  // ──────

  return (
    <div className="mx-auto">

      {/* ── Pending order banner ───────────── */}
      {pendingOrderId && (
        <PendingOrderBanner
          orderId={pendingOrderId}
          onDismiss={() => setPendingOrderId(null)}
        />
      )}

      <div className="flex flex-col xl:flex-row gap-6 items-start">

        {/* ── Left: plans ────── */}
        <div className="flex-1 min-w-0">

          {/* Billing toggle */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Chọn gói phù hợp</h2>
            <div className="flex items-center gap-3">
              <span className={`text-sm ${!yearly ? "font-semibold text-gray-900" : "text-gray-400"}`}>
                Hàng tháng
              </span>
              <button
                onClick={() => setYearly(v => !v)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  yearly ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm
                  transition-transform ${yearly ? "translate-x-6" : "translate-x-0"}`} />
              </button>
              <span className={`text-sm ${yearly ? "font-semibold text-gray-900" : "text-gray-400"}`}>
                Hàng năm
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold
                  bg-green-100 text-green-700 rounded-full">
                  -20%
                </span>
              </span>
            </div>
          </div>

          {/* Plan grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <PlanSkeleton key={i} />)
              : plans.map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  yearly={yearly}
                  selected={selectedId === plan.id}
                  current={currentPlanId === plan.id}
                  onSelect={() => handleSelectPlan(plan.id)}
                  formatPrice={n => service.formatPrice(n)}
                  discount={service.yearlyDiscount(plan)}
                />
              ))
            }
          </div>

          {/* Feature comparison note */}
          <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
            <p className="text-xs text-gray-500 text-center">
              Tất cả gói đều bao gồm hỗ trợ email và truy cập vào ứng viên đã đăng ký.
              Xem <a href="/pricing#compare" className="text-blue-600 hover:underline">so sánh đầy đủ</a>.
            </p>
          </div>
        </div>

        {/* ── Right: current subscription ───── */}
        <div className="w-full xl:w-72 xl:shrink-0 xl:sticky xl:top-6">
          {currentSub ? (
            <CurrentSubscriptionCard sub={currentSub} quota={quota} />
          ) : !loading && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">📦</span>
              </div>
              <p className="text-sm font-semibold text-gray-800 mb-1">Chưa có gói dịch vụ</p>
              <p className="text-xs text-gray-400">Chọn một gói bên trái để bắt đầu đăng tin.</p>
            </div>
          )}
        </div>

      </div>

      {/* ── Payment confirmation modal ─────── */}
      {showModal && selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          yearly={yearly}
          formatPrice={n => service.formatPrice(n)}
          discount={service.yearlyDiscount(selectedPlan)}
          onConfirm={handleConfirmPayment}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}