"use client";
// src/presentation/pages/CandidateSubscriptionPage.tsx
// Chỉ handleConfirmPayment thay đổi — nhận gateway từ PaymentModal

import { useState, useEffect, useRef, useCallback }           from "react";
import { AlertCircle, X }                                      from "lucide-react";
import { CandidatePlanCard }                                   from "@/presentation/components/subscription/CandidatePlanCard";
import { CandidateCurrentSubscriptionCard }                    from "@/presentation/components/subscription/CandidateCurrentSubscriptionCard";
import { PaymentModal }                                        from "@/presentation/components/subscription/PaymentModal";
import { CandidateSubscriptionService }                        from "@/application/services/CandidateSubscriptionService";
import { CandidateSubscriptionRepository }                     from "@/infrastructure/repositories/CandidateSubscriptionRepository";
import type {
  CandidateSubscriptionPlan,
  CandidateSubscription,
  CandidateQuotaResult,
} from "@/domain/models/CandidateSubscription";
import type { SubscriptionPlan, PaymentGateway } from "@/domain/models/CompanySubscription";
import { extractErrorMessage }                                 from "@/lib/extractErrorMessage";
import { useToast }                                            from "@/presentation/components/ui/toast";

const service = new CandidateSubscriptionService(new CandidateSubscriptionRepository());

function formatPrice(n: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency", currency: "VND", maximumFractionDigits: 0,
  }).format(n);
}

function yearlyDiscount(plan: CandidateSubscriptionPlan): number {
  if (!plan.priceMonthly || !plan.priceYearly) return 0;
  const monthly12 = plan.priceMonthly * 12;
  return monthly12 > 0 ? Math.round(((monthly12 - plan.priceYearly) / monthly12) * 100) : 0;
}

function extractOrderId(message: string): string | null {
  const match = message.match(/:\s*([A-Z0-9-]+)\./);
  return match?.[1] ?? null;
}

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

function PendingOrderBanner({ orderId, onDismiss }: { orderId: string; onDismiss: () => void }) {
  return (
    <div className="flex items-start gap-3 px-5 py-4 rounded-2xl border mb-6 bg-amber-50 border-amber-200 text-amber-900">
      <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-[16px] font-semibold">Bạn có đơn hàng đang chờ thanh toán</p>
        <p className="text-xs mt-0.5 opacity-80">
          Mã đơn: <span className="font-mono font-bold tracking-wide">{orderId}</span>.
          Vui lòng hoàn tất thanh toán hoặc chờ đơn hết hạn trước khi tạo đơn mới.
        </p>
      </div>
      <button onClick={onDismiss} className="text-amber-400 hover:text-amber-600 transition-colors shrink-0">
        <X size={16} />
      </button>
    </div>
  );
}

function toSubscriptionPlan(p: CandidateSubscriptionPlan): SubscriptionPlan {
  return {
    id: p.id, code: p.code, name: p.name, description: p.description,
    priceMonthly: p.priceMonthly, priceYearly: p.priceYearly,
    jobPostLimit: 0, featuredJobLimit: 0, cvViewLimit: 0,
    aiFeatures: p.aiCvWriter, analyticsAccess: p.profileAnalytics,
    durationDays: p.durationDays, active: p.active, free: p.free,
  } as unknown as SubscriptionPlan;
}

export default function CandidateSubscriptionPage() {
  const toast = useToast();
  const [plans,          setPlans]          = useState<CandidateSubscriptionPlan[]>([]);
  const [currentSub,     setCurrentSub]     = useState<CandidateSubscription | null>(null);
  const [quota,          setQuota]          = useState<CandidateQuotaResult | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [yearly,         setYearly]         = useState(false);
  const [selectedId,     setSelectedId]     = useState<string | null>(null);
  const [showModal,      setShowModal]      = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const hasLoaded = useRef(false);

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
      setQuota(quotaData ?? null);
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

  const handleSelectPlan = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan || plan.priceMonthly === 0) return;
    setSelectedId(planId);
    setShowModal(true);
  };

  // ── handleConfirmPayment nhận gateway từ PaymentModal ──────────────────────
  const handleConfirmPayment = useCallback(async (gateway: PaymentGateway) => {
    if (!selectedId) return;
    try {
      const result = await service.purchase({ planId: selectedId, yearly, gateway });
      window.location.href = result.paymentUrl;   // redirect đến cổng được chọn
    } catch (e: any) {
      setShowModal(false);
      if (e?.errorCode === "PENDING_ORDER_EXISTS") {
        toast.warning("Đơn hàng chờ thanh toán", "Vui lòng hoàn tất đơn cũ trước khi tạo đơn mới.");
        setPendingOrderId(extractOrderId(e?.message ?? "") ?? "N/A");
        return;
      }
      toast.error("Thanh toán thất bại", extractErrorMessage(e, "Có lỗi xảy ra, vui lòng thử lại."));
    }
  }, [selectedId, yearly, toast]);

  const selectedPlan  = plans.find(p => p.id === selectedId) ?? null;
  const currentPlanId = currentSub?.planId ?? null;

  return (
    <div className="mx-auto">
      {pendingOrderId && (
        <PendingOrderBanner orderId={pendingOrderId} onDismiss={() => setPendingOrderId(null)} />
      )}

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Chọn gói phù hợp</h2>
            <div className="flex items-center gap-3">
              <span className={`text-[16px] ${!yearly ? "font-semibold text-gray-900" : "text-gray-400"}`}>
                Hàng tháng
              </span>
              <button
                onClick={() => setYearly(v => !v)}
                className={`relative w-12 h-6 rounded-full transition-colors ${yearly ? "bg-violet-600" : "bg-gray-200"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${yearly ? "translate-x-6" : "translate-x-0"}`} />
              </button>
              <span className={`text-[16px] ${yearly ? "font-semibold text-gray-900" : "text-gray-400"}`}>
                Hàng năm
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-violet-100 text-violet-700 rounded-full">-20%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <PlanSkeleton key={i} />)
              : plans.map(plan => (
                <CandidatePlanCard
                  key={plan.id}
                  plan={plan}
                  yearly={yearly}
                  selected={selectedId === plan.id}
                  current={currentPlanId === plan.id}
                  onSelect={() => handleSelectPlan(plan.id)}
                  formatPrice={formatPrice}
                  discount={yearlyDiscount(plan)}
                />
              ))
            }
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
            <p className="text-xs text-gray-500 text-center">
              Tất cả gói đều bao gồm hỗ trợ email và truy cập vào hàng nghìn tin tuyển dụng.{" "}
              <a href="/pricing#compare" className="text-violet-600 hover:underline">Xem so sánh đầy đủ</a>.
            </p>
          </div>
        </div>

        <div className="w-full xl:w-72 xl:shrink-0 xl:sticky xl:top-6">
          {currentSub ? (
            <CandidateCurrentSubscriptionCard sub={currentSub} quota={quota} />
          ) : !loading && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🎯</span>
              </div>
              <p className="text-[16px] font-semibold text-gray-800 mb-1">Chưa có gói dịch vụ</p>
              <p className="text-xs text-gray-400">Nâng cấp để tăng cơ hội tìm việc của bạn.</p>
            </div>
          )}
        </div>
      </div>

      {showModal && selectedPlan && (
        <PaymentModal
          plan={toSubscriptionPlan(selectedPlan)}
          yearly={yearly}
          formatPrice={formatPrice}
          discount={yearlyDiscount(selectedPlan)}
          onConfirm={handleConfirmPayment}   // ← nhận (gateway) => Promise<void>
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}