// src/app/(admin)/admin/subscription/page.tsx
// Page đơn giản — layout được xử lý bởi src/app/(admin)/layout.tsx
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Pencil, Power, Infinity,
  Users, DollarSign, Zap, BarChart2,
  CheckCircle2, XCircle, AlertCircle,
} from "lucide-react";
import { PlanFormModal }               from "@/presentation/components/admin/subscription/PlanFormModal";
import { AdminSubscriptionService }    from "@/application/services/AdminSubscriptionService";
import { AdminSubscriptionRepository } from "@/infrastructure/repositories/AdminSubscriptionRepository";
import type { SubscriptionPlan }       from "@/domain/models/CompanySubscription";
import { extractErrorMessage }         from "@/lib/extractErrorMessage";
import { useToast }                    from "@/presentation/components/ui/toast";
import { AdminSubscriptionRow, PlanPayload } from "@/domain/repositories/IAdminSubscriptionRepository";
import { Pagination } from "@/presentation/components/common/Pagination";

const service = new AdminSubscriptionService(new AdminSubscriptionRepository());

// ── Sub-components ─────────────────────────────────────────────────────────────

function LimitCell({ value }: { value: number }) {
  return value === -1
    ? <span className="flex items-center gap-1 text-blue-600 font-semibold text-sm"><Infinity size={14} /> Unlimited</span>
    : <span className="text-sm text-gray-800 font-semibold">{value.toLocaleString()}</span>;
}

function FeatureIcon({ enabled }: { enabled: boolean }) {
  return enabled
    ? <CheckCircle2 size={16} className="text-green-500 mx-auto" />
    : <XCircle      size={16} className="text-gray-300 mx-auto" />;
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string | number; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function PlanRow({ plan, onEdit, onToggle, formatPrice, toggling }: {
  plan: SubscriptionPlan; onEdit:()=>void; onToggle:()=>void;
  formatPrice:(n:number)=>string; toggling:boolean;
}) {
  return (
    <tr className={`border-b border-gray-50 transition-colors ${
      plan.active ? "hover:bg-gray-50/60" : "opacity-50 bg-gray-50/40 hover:bg-gray-100/60"}`}>
      <td className="px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md">{plan.code}</span>
            {!plan.active && <span className="text-[10px] text-red-500 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full font-semibold">Tắt</span>}
          </div>
          <p className="text-sm font-semibold text-gray-900">{plan.name}</p>
          {plan.description && <p className="text-[11px] text-gray-400 truncate max-w-[180px]">{plan.description}</p>}
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-gray-900">{formatPrice(plan.priceMonthly)}<span className="text-gray-400 font-normal text-[11px]">/tháng</span></p>
        <p className="text-xs text-gray-500">{formatPrice(plan.priceYearly)}<span className="text-gray-400">/năm</span></p>
      </td>
      <td className="px-5 py-4 text-sm text-gray-700">{plan.durationDays} ngày</td>
      <td className="px-5 py-4"><LimitCell value={plan.jobPostLimit} /></td>
      <td className="px-5 py-4"><LimitCell value={plan.featuredJobLimit} /></td>
      <td className="px-5 py-4"><LimitCell value={plan.cvViewLimit} /></td>
      <td className="px-5 py-4 text-center"><FeatureIcon enabled={plan.aiFeatures} /></td>
      <td className="px-5 py-4 text-center"><FeatureIcon enabled={plan.analyticsAccess} /></td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5">
          <button onClick={onEdit} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={14} /></button>
          <button onClick={onToggle} disabled={toggling}
            className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${
              plan.active ? "text-gray-400 hover:text-red-500 hover:bg-red-50" : "text-gray-400 hover:text-green-600 hover:bg-green-50"}`}>
            {toggling
              ? <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin block" />
              : <Power size={14} />}
          </button>
        </div>
      </td>
    </tr>
  );
}

const SUB_STATUS_STYLES: Record<string, string> = {
  ACTIVE:"bg-green-50 text-green-700 border-green-200", EXPIRED:"bg-yellow-50 text-yellow-700 border-yellow-200",
  CANCELLED:"bg-gray-100 text-gray-600 border-gray-200", FAILED:"bg-red-50 text-red-600 border-red-200",
  PENDING:"bg-blue-50 text-blue-600 border-blue-200",
};

function SubRow({ sub, formatPrice }: { sub: AdminSubscriptionRow; formatPrice:(n:number)=>string }) {
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
      <td className="px-5 py-3.5"><p className="text-sm font-medium text-gray-900">{sub.companyName}</p><p className="text-[11px] text-gray-400">{sub.companyId.slice(0,8)}…</p></td>
      <td className="px-5 py-3.5"><span className="px-2 py-0.5 text-[11px] font-bold bg-gray-100 text-gray-700 rounded-md">{sub.planCode}</span></td>
      <td className="px-5 py-3.5"><span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${SUB_STATUS_STYLES[sub.status] ?? "bg-gray-100 text-gray-600"}`}>{sub.status}</span></td>
      <td className="px-5 py-3.5 text-xs text-gray-600">{new Date(sub.startedAt).toLocaleDateString("vi-VN")}</td>
      <td className="px-5 py-3.5 text-xs text-gray-600">{new Date(sub.expiresAt).toLocaleDateString("vi-VN")}</td>
      <td className="px-5 py-3.5 text-sm font-semibold text-blue-600">{formatPrice(sub.amount)}</td>
    </tr>
  );
}

function TableSkeleton({ cols, rows }: { cols: number[]; rows: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-5 py-4 border-b border-gray-50">
          {cols.map((w, j) => <div key={j} className="h-4 bg-gray-100 rounded" style={{ width: w }} />)}
        </div>
      ))}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

type Tab = "plans" | "subscriptions";

export default function AdminSubscriptionPage() {
  const toast = useToast();

  const [tab,         setTab]         = useState<Tab>("plans");
  const [plans,       setPlans]       = useState<SubscriptionPlan[]>([]);
  const [subs,        setSubs]        = useState<AdminSubscriptionRow[]>([]);
  const [totalSubs,   setTotalSubs]   = useState(0);
  const [subsPages,   setSubsPages]   = useState(1);
  const [subsPage,    setSubsPage]    = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [togglingId,  setTogglingId]  = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | "new" | null>(null);
  const [subsStatus,  setSubsStatus]  = useState("");
  const hasLoaded = useRef(false);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try { setPlans(await service.getAllPlans()); }
    catch (e) { toast.error("Lỗi", extractErrorMessage(e)); }
    finally { setLoading(false); }
  }, [toast]);

  const loadSubs = useCallback(async (page = 0, status = "") => {
    setLoading(true);
    try {
      const res = await service.listSubscriptions(page, 20, status || undefined);
      setSubs(res.content); setTotalSubs(res.totalElements); setSubsPages(res.totalPages);
    } catch (e) { toast.error("Lỗi", extractErrorMessage(e)); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    loadPlans();
  }, [loadPlans]);

  useEffect(() => {
    if (tab === "subscriptions") loadSubs(subsPage, subsStatus);
  }, [tab, subsPage, subsStatus, loadSubs]);

  const handleSavePlan = useCallback(async (payload: PlanPayload) => {
    try {
      if (editingPlan === "new") {
        const created = await service.createPlan(payload);
        setPlans(prev => [created, ...prev]);
        toast.success("Đã tạo", `Gói ${payload.name} đã được tạo.`);
      } else if (editingPlan) {
        const updated = await service.updatePlan(editingPlan.id, payload);
        setPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
        toast.success("Đã cập nhật", `Gói ${payload.name} đã được cập nhật.`);
      }
      setEditingPlan(null);
    } catch (e) { toast.error("Lỗi", extractErrorMessage(e)); throw e; }
  }, [editingPlan, toast]);

  const handleToggle = useCallback(async (plan: SubscriptionPlan) => {
    setTogglingId(plan.id);
    try {
      const updated = await service.toggleActive(plan.id);
      setPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
      toast.success(updated.active ? "Đã bật" : "Đã tắt",
        `Gói ${plan.name} đã được ${updated.active ? "kích hoạt" : "vô hiệu hóa"}.`);
    } catch (e) { toast.error("Lỗi", extractErrorMessage(e)); }
    finally { setTogglingId(null); }
  }, [toast]);

  const activePlans   = plans.filter(p => p.active).length;
  const freePlanCount = plans.filter(p => p.priceMonthly === 0).length;

  return (
    <div className="flex flex-col gap-6">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<DollarSign size={18} className="text-blue-600"   />} label="Tổng gói"      value={plans.length}              color="bg-blue-50"   />
        <StatCard icon={<Zap        size={18} className="text-green-600"  />} label="Đang active"   value={activePlans}               color="bg-green-50"  />
        <StatCard icon={<Users      size={18} className="text-purple-600" />} label="Subscriptions" value={totalSubs.toLocaleString()} color="bg-purple-50" />
        <StatCard icon={<BarChart2  size={18} className="text-amber-600"  />} label="Gói miễn phí"  value={freePlanCount}             color="bg-amber-50"  />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(["plans", "subscriptions"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {t === "plans" ? "Danh sách gói" : "Subscriptions"}
          </button>
        ))}
      </div>

      {/* Plans tab */}
      {tab === "plans" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500"><strong className="text-gray-800">{plans.length}</strong> gói dịch vụ</p>
            <button onClick={() => setEditingPlan("new")}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white
                text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-sm">
              <Plus size={16} /> Tạo gói mới
            </button>
          </div>

          {loading ? <TableSkeleton cols={[100,80,60,60,60,60,40,40,40]} rows={4} /> : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-gray-50">
                      {["Gói","Giá","Thời hạn","Tin đăng","Tin nổi bật","Xem CV","AI","Analytics",""].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {plans.length === 0
                      ? <tr><td colSpan={9} className="px-5 py-16 text-center text-sm text-gray-400">Chưa có gói nào</td></tr>
                      : plans.map(plan => (
                          <PlanRow key={plan.id} plan={plan}
                            onEdit={() => setEditingPlan(plan)}
                            onToggle={() => handleToggle(plan)}
                            formatPrice={n => service.formatPrice(n)}
                            toggling={togglingId === plan.id} />
                        ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subscriptions tab */}
      {tab === "subscriptions" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-500" />
            <p>Cần endpoint <code className="font-mono text-xs bg-amber-100 px-1 py-0.5 rounded">GET /api/v1/admin/subscriptions</code> từ backend.</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={subsStatus}
              onChange={e => { setSubsStatus(e.target.value); setSubsPage(0); }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
              <option value="">Tất cả trạng thái</option>
              {["ACTIVE","EXPIRED","CANCELLED","FAILED","PENDING"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <p className="text-xs text-gray-500"><strong className="text-gray-800">{totalSubs.toLocaleString()}</strong> subscriptions</p>
          </div>
          {loading ? <TableSkeleton cols={[120,60,70,80,80,60]} rows={5} /> : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-50">
                      {["Công ty","Gói","Trạng thái","Bắt đầu","Hết hạn","Số tiền"].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subs.length === 0
                      ? <tr><td colSpan={6} className="px-5 py-16 text-center text-sm text-gray-400">Không có subscription nào</td></tr>
                      : subs.map(sub => <SubRow key={sub.id} sub={sub} formatPrice={n => service.formatPrice(n)} />)
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {subsPages > 1 && (
            <div className="flex justify-center">
              <Pagination current={subsPage + 1} total={subsPages} onChange={p => setSubsPage(p - 1)} />
            </div>
          )}
        </div>
      )}

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