import {
  CalendarDays, FileText, TrendingUp,
  Cpu, LayoutTemplate, BarChart2,
} from "lucide-react";
import type {
  CandidateSubscription,
  CandidateQuotaResult,
  CandidateQuota,
} from "@/domain/models/CandidateSubscription";

// ── Quota bar ─────────────────────────────────────────────────────────────────

function QuotaBar({
  label,
  icon,
  quota,
}: {
  label: string;
  icon: React.ReactNode;
  quota: CandidateQuota | undefined | null;
}) {
  if (!quota) return null;

  const isUnlimited = quota.limit === -1;
  const pct =
    isUnlimited
      ? 0
      : quota.limit > 0
      ? Math.min(100, (quota.used / quota.limit) * 100)
      : 0;
  const color =
    pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-yellow-400" : "bg-violet-500";

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="text-gray-400">{icon}</span>
          {label}
        </div>
        <span className="text-xs font-semibold text-gray-700">
          {isUnlimited ? "∞" : `${quota.used}/${quota.limit}`}
        </span>
      </div>

      {isUnlimited ? (
        <p className="text-[11px] text-emerald-600 font-medium">
          Không giới hạn
        </p>
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

// ── Feature chip ──────────────────────────────────────────────────────────────

function FeatureChip({
  active,
  label,
  icon,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 text-xs font-medium ${
        active ? "text-violet-600" : "text-gray-300 line-through"
      }`}
    >
      {icon} {label}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  sub: CandidateSubscription;
  quota: CandidateQuotaResult | null;
}

export function CandidateCurrentSubscriptionCard({ sub, quota }: Props) {
  const expiresAt = sub.expiresAt ? new Date(sub.expiresAt) : null;
  const daysRemaining = expiresAt
    ? Math.max(
        0,
        Math.ceil((expiresAt.getTime() - Date.now()) / 86_400_000)
      )
    : null;

  const isExpiringSoon =
    daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 7;

  // Quota: ưu tiên từ QuotaResult (fresh), fallback về sub fields
  const applicationQuota = quota?.applicationQuota ?? sub.applicationQuota ?? null;
  const cvBoostQuota     = quota?.cvBoostQuota     ?? sub.cvBoostQuota     ?? null;
  const cvCreateQuota    = quota?.cvCreateQuota    ?? sub.cvCreateQuota    ?? null;

  const statusMap: Record<string, { label: string; className: string }> = {
    ACTIVE:    { label: "Đang hoạt động", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    EXPIRED:   { label: "Đã hết hạn",     className: "bg-red-50    text-red-600    border-red-200"      },
    PENDING:   { label: "Chờ kích hoạt",  className: "bg-amber-50  text-amber-700  border-amber-200"    },
    CANCELLED: { label: "Đã huỷ",         className: "bg-gray-100  text-gray-500   border-gray-200"     },
    FAILED:    { label: "Thất bại",        className: "bg-red-50    text-red-600    border-red-200"      },
  };
  const statusStyle =
    statusMap[sub.status] ?? {
      label: sub.status,
      className: "bg-gray-100 text-gray-500 border-gray-200",
    };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Gói đang sử dụng</p>
          <h2 className="text-lg font-bold text-gray-900">{sub.planCode}</h2>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {sub.yearly ? "Chu kỳ hàng năm" : "Chu kỳ hàng tháng"}
          </p>
        </div>
        <div
          className={`px-3 py-1 text-xs font-bold rounded-full border shrink-0 ${statusStyle.className}`}
        >
          {statusStyle.label}
        </div>
      </div>

      {/* Expiry */}
      <div
        className={`flex items-center gap-2 mb-5 px-3 py-2.5 rounded-xl ${
          isExpiringSoon ? "bg-red-50 border border-red-100" : "bg-gray-50"
        }`}
      >
        <CalendarDays
          size={14}
          className={isExpiringSoon ? "text-red-500" : "text-gray-400"}
        />
        <div>
          {daysRemaining !== null ? (
            <>
              <p
                className={`text-xs font-semibold ${
                  isExpiringSoon ? "text-red-600" : "text-gray-700"
                }`}
              >
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
            <p className="text-xs text-gray-500">Vĩnh viễn</p>
          )}
        </div>
      </div>

      {/* Quota bars */}
      <div className="flex flex-col gap-4">
        <QuotaBar
          label="Ứng tuyển"
          icon={<FileText size={12} />}
          quota={applicationQuota}
        />
        <QuotaBar
          label="CV Boost"
          icon={<TrendingUp size={12} />}
          quota={cvBoostQuota}
        />
        <QuotaBar
          label="Tạo CV online"
          icon={<BarChart2 size={12} />}
          quota={cvCreateQuota}
        />
      </div>

      {/* Feature chips */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mt-5 pt-4 border-t border-gray-50">
        <FeatureChip
          active={sub.aiCvWriter}
          label="AI viết CV"
          icon={<Cpu size={11} />}
        />
        <FeatureChip
          active={sub.premiumTemplateAccess}
          label="Template premium"
          icon={<LayoutTemplate size={11} />}
        />
      </div>
    </div>
  );
}