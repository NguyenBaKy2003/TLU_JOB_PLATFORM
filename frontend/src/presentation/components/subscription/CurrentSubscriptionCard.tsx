// src/presentation/components/subscription/CurrentSubscriptionCard.tsx
import { CalendarDays, Zap, BarChart2, Eye, CheckCircle2 } from "lucide-react";
import type { CompanySubscription, QuotaResult } from "@/domain/models/CompanySubscription";
import { formatQuota, quotaPercent } from "@/domain/models/CompanySubscription";

function QuotaBar({ label, icon, quota }: {
  label: string;
  icon: React.ReactNode;
  quota: { limit: number; used: number; unlimited?: boolean } | undefined | null;
}) {
  if (!quota) return null;

  const isUnlimited = quota.unlimited === true || quota.limit === -1;
  const pct         = isUnlimited ? 0 : quotaPercent(quota);
  const color       = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-yellow-400" : "bg-blue-500";

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="text-gray-400">{icon}</span>
          {label}
        </div>
        <span className="text-xs font-semibold text-gray-700">
          {isUnlimited ? "∞" : formatQuota(quota)}
        </span>
      </div>

      {isUnlimited ? (
        <p className="text-[11px] text-green-600 font-medium">Không giới hạn</p>
      ) : (
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${color}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

interface Props {
  sub:   CompanySubscription;
  quota: QuotaResult | null;
}

export function CurrentSubscriptionCard({ sub, quota }: Props) {
  // ── Expiry ────────────────────────────────────────────────────────────────
  // expiresAt có thể không có trong một số response → fallback graceful
  const expiresAt    = sub.expiresAt ? new Date(sub.expiresAt) : null;
  const daysRemaining =
    quota?.daysRemaining ??
    (expiresAt
      ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 86_400_000))
      : null);

  const isExpiringSoon = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 7;

  // ── Quota: ưu tiên từ QuotaResult, fallback về field trong sub ────────────
  const jobPostQuota    = quota?.jobPostQuota    ?? sub.jobPostQuota    ?? null;
  const featuredJobQuota = quota?.featuredJobQuota ?? sub.featuredJobQuota ?? null;
  const cvViewQuota     = quota?.cvViewQuota     ?? sub.cvViewQuota     ?? null;

  // ── Status label ──────────────────────────────────────────────────────────
  const statusMap: Record<string, { label: string; className: string }> = {
    ACTIVE:   { label: "Đang hoạt động", className: "bg-green-50 text-green-700 border-green-200" },
    EXPIRED:  { label: "Đã hết hạn",     className: "bg-red-50   text-red-600   border-red-200"   },
    PENDING:  { label: "Chờ kích hoạt",  className: "bg-amber-50 text-amber-700 border-amber-200" },
    CANCELLED:{ label: "Đã huỷ",         className: "bg-gray-100 text-gray-500  border-gray-200"  },
  };
  const statusStyle = statusMap[sub.status] ?? {
    label: sub.status,
    className: "bg-gray-100 text-gray-500 border-gray-200",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Gói đang sử dụng</p>
          <h2 className="text-lg font-bold text-gray-900">{sub.planCode}</h2>
        </div>
        <div className={`px-3 py-1 text-xs font-bold rounded-full border ${statusStyle.className}`}>
          {statusStyle.label}
        </div>
      </div>

      {/* ── Expiry ─────────────────────────────────────────── */}
      <div className={`flex items-center gap-2 mb-5 px-3 py-2.5 rounded-xl ${
        isExpiringSoon
          ? "bg-red-50 border border-red-100"
          : "bg-gray-50"
      }`}>
        <CalendarDays size={14} className={isExpiringSoon ? "text-red-500" : "text-gray-400"} />
        <div>
          {daysRemaining !== null ? (
            <>
              <p className={`text-xs font-semibold ${isExpiringSoon ? "text-red-600" : "text-gray-700"}`}>
                {isExpiringSoon
                  ? `⚠️ Còn ${daysRemaining} ngày — sắp hết hạn!`
                  : `Còn ${daysRemaining} ngày sử dụng`}
              </p>
              {expiresAt && (
                <p className="text-[11px] text-gray-400">
                  Hết hạn: {expiresAt.toLocaleDateString("vi-VN")}
                </p>
              )}
            </>
          ) : (
            <p className="text-xs text-gray-500">Chưa có thông tin hết hạn</p>
          )}
        </div>
      </div>

      {/* ── Quota bars ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <QuotaBar label="Tin đăng"    icon={<Zap size={12} />}       quota={jobPostQuota} />
        <QuotaBar label="Tin nổi bật" icon={<BarChart2 size={12} />} quota={featuredJobQuota} />
        <QuotaBar label="Lượt xem CV" icon={<Eye size={12} />}       quota={cvViewQuota} />
      </div>

      {/* ── Features ───────────────────────────────────────── */}
      <div className="flex gap-4 mt-5 pt-4 border-t border-gray-50">
        <div className={`flex items-center gap-1.5 text-xs font-medium ${
          sub.aiFeatures ? "text-blue-600" : "text-gray-300 line-through"
        }`}>
          <Zap size={12} /> AI Features
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-medium ${
          sub.analyticsAccess ? "text-blue-600" : "text-gray-300 line-through"
        }`}>
          <BarChart2 size={12} /> Analytics
        </div>
      </div>

    </div>
  );
}