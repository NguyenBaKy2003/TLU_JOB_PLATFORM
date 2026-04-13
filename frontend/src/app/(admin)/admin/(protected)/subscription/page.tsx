// src/app/(admin)/admin/subscription/page.tsx
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { PlanFormModal }               from "@/presentation/components/admin/subscription/PlanFormModal";
import { PlanTable }                   from "@/presentation/components/admin/subscription/PlanTable";
import { PlanTableSkeleton }           from "@/presentation/components/admin/subscription/PlanTableSkeleton";
import { PlanTabHeader }               from "@/presentation/components/admin/subscription/PlanTabHeader";
import { SubscriptionListTab }         from "@/presentation/components/admin/subscription/SubscriptionListTab";
import { SubStatCards }                from "@/presentation/components/admin/subscription/SubStatCards";
import { AdminSubscriptionService }    from "@/application/services/AdminSubscriptionService";
import { AdminSubscriptionRepository } from "@/infrastructure/repositories/AdminSubscriptionRepository";
import type { SubscriptionPlan }       from "@/domain/models/CompanySubscription";
import type {
  PlanPayload, AdminSubscriptionRow,
}                                      from "@/domain/repositories/IAdminSubscriptionRepository";
import { extractErrorMessage }         from "@/lib/extractErrorMessage";
import { useToast }                    from "@/presentation/components/ui/toast";

// ── Singleton ─────────────────────────────────────────────────────────────────

const service = new AdminSubscriptionService(new AdminSubscriptionRepository());

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = "plans" | "subscriptions";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminSubscriptionPage() {
  const toast = useToast();

  // ── State ─────────────────────────────────────────────────────────────────

  const [tab,         setTab]         = useState<Tab>("plans");

  // Plans
  const [plans,       setPlans]       = useState<SubscriptionPlan[]>([]);
  const [plansLoading,setPlansLoading]= useState(true);
  const [togglingId,  setTogglingId]  = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | "new" | null>(null);

  // Subscriptions
  const [subs,        setSubs]        = useState<AdminSubscriptionRow[]>([]);
  const [totalSubs,   setTotalSubs]   = useState(0);
  const [subsPages,   setSubsPages]   = useState(1);
  const [subsPage,    setSubsPage]    = useState(0);
  const [subsLoading, setSubsLoading] = useState(false);
  const [subsStatus,  setSubsStatus]  = useState("");

  const plansLoaded = useRef(false);
  const subsLoaded  = useRef(false);

  // ── Loaders ───────────────────────────────────────────────────────────────

  const loadPlans = useCallback(async () => {
    setPlansLoading(true);
    try {
      setPlans(await service.getAllPlans());
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally {
      setPlansLoading(false);
    }
  }, [toast]);

  const loadSubs = useCallback(async (page: number, status: string) => {
    setSubsLoading(true);
    try {
      const res = await service.listSubscriptions(page, 20, status || undefined);
      setSubs(res.content);
      setTotalSubs(res.totalElements);
      setSubsPages(res.totalPages);
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally {
      setSubsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (plansLoaded.current) return;
    plansLoaded.current = true;
    loadPlans();
  }, [loadPlans]);

  useEffect(() => {
    if (tab !== "subscriptions") return;
    if (!subsLoaded.current) {
      subsLoaded.current = true;
      loadSubs(0, "");
    }
  }, [tab, loadSubs]);

  // ── Plan handlers ─────────────────────────────────────────────────────────

  const handleSavePlan = useCallback(async (payload: PlanPayload) => {
    try {
      if (editingPlan === "new") {
        const created = await service.createPlan(payload);
        setPlans(prev => [created, ...prev]);
        toast.success("Đã tạo", `Gói "${payload.name}" đã được tạo.`);
      } else if (editingPlan) {
        const updated = await service.updatePlan(editingPlan.id, payload);
        setPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
        toast.success("Đã cập nhật", `Gói "${payload.name}" đã được cập nhật.`);
      }
      setEditingPlan(null);
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
      throw e; // PlanFormModal cần rethrow để giữ spinner
    }
  }, [editingPlan, toast]);

  const handleToggle = useCallback(async (plan: SubscriptionPlan) => {
    setTogglingId(plan.id);
    try {
      const updated = await service.toggleActive(plan);
      setPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
      toast.success(
        updated.active ? "Đã bật" : "Đã tắt",
        `Gói "${plan.name}" đã được ${updated.active ? "kích hoạt" : "vô hiệu hóa"}.`,
      );
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally {
      setTogglingId(null);
    }
  }, [toast]);

  // ── Subscription handlers ─────────────────────────────────────────────────

  const handleStatusChange = (status: string) => {
    setSubsStatus(status);
    setSubsPage(0);
    subsLoaded.current = false; // force reload
    loadSubs(0, status);
  };

  const handleSubsPageChange = (page: number) => {
    setSubsPage(page);
    loadSubs(page, subsStatus);
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">

      {/* Stats row */}
      <SubStatCards plans={plans} totalSubs={totalSubs} />

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(["plans", "subscriptions"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === t
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}>
            {t === "plans" ? "Danh sách gói" : "Subscriptions"}
          </button>
        ))}
      </div>

      {/* ── Tab: Plans ─────────────────────────────────────────── */}
      {tab === "plans" && (
        <div className="flex flex-col gap-4">
          <PlanTabHeader
            count={plans.length}
            onCreate={() => setEditingPlan("new")}
          />
          {plansLoading
            ? <PlanTableSkeleton />
            : <PlanTable
                plans={plans}
                togglingId={togglingId}
                onEdit={plan => setEditingPlan(plan)}
                onToggle={handleToggle}
                formatPrice={n => service.formatPrice(n)}
              />
          }
        </div>
      )}

      {/* ── Tab: Subscriptions ─────────────────────────────────── */}
      {tab === "subscriptions" && (
        <SubscriptionListTab
          subs={subs}
          loading={subsLoading}
          totalSubs={totalSubs}
          subsPages={subsPages}
          subsPage={subsPage}
          subsStatus={subsStatus}
          formatPrice={n => service.formatPrice(n)}
          onStatusChange={handleStatusChange}
          onPageChange={handleSubsPageChange}
        />
      )}

      {/* Plan form modal */}
      {editingPlan !== null && (
        <PlanFormModal
          plan={editingPlan === "new" ? undefined : editingPlan}
          onSave={handleSavePlan}
          onCancel={() => setEditingPlan(null)}
        />
      )}
    </div>
  );
}