"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2, ArrowRight, Calendar, FileText,
  Rocket, LayoutGrid, Sparkles,
  Coins, Home, Loader2, Package,
  Zap, Star, Crown, ChevronRight
} from "lucide-react";
import { CandidateSubscriptionService } from "@/application/services/CandidateSubscriptionService";
import { CandidateSubscriptionRepository } from "@/infrastructure/repositories/CandidateSubscriptionRepository";
import type { CandidateSubscription, CandidateQuotaResult } from "@/domain/models/CandidateSubscription";

const service = new CandidateSubscriptionService(new CandidateSubscriptionRepository());

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ── Sub-components ────

function AnimatedCheck() {
  return (
    <div className="relative flex items-center justify-center w-20 h-20 mx-auto mb-6">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full opacity-10 animate-pulse" />
      <div className="absolute inset-0 border-2 border-emerald-200 rounded-full animate-[ping_2s_ease-out_infinite]" />
      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
        <CheckCircle2 size={32} strokeWidth={2} className="text-white animate-[scale-up_0.5s_ease-out]" />
      </div>
    </div>
  );
}

function QuotaBar({
  label,
  used,
  limit,
  icon,
  color = "blue",
}: {
  label: string;
  used: number;
  limit: number;
  icon: React.ReactNode;
  color?: "blue" | "purple" | "amber" | "emerald";
}) {
  const unlimited = limit === -1 || limit === 2147483647;
  const pct = unlimited ? 100 : limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const countLabel = unlimited ? "∞" : `${used}/${limit}`;

  const colorMap = {
    blue: { bg: "bg-blue-50", icon: "text-blue-500", bar: "bg-gradient-to-r from-blue-400 to-blue-500", text: "text-blue-600" },
    purple: { bg: "bg-purple-50", icon: "text-purple-500", bar: "bg-gradient-to-r from-purple-400 to-purple-500", text: "text-purple-600" },
    amber: { bg: "bg-amber-50", icon: "text-amber-500", bar: "bg-gradient-to-r from-amber-400 to-amber-500", text: "text-amber-600" },
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-500", bar: "bg-gradient-to-r from-emerald-400 to-emerald-500", text: "text-emerald-600" },
  };

  const colors = unlimited ? colorMap.emerald : colorMap[color];

  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0 group hover:bg-gray-50/50 -mx-2 px-2 rounded-lg transition-colors">
      <div className={`w-9 h-9 rounded-xl ${colors.bg} flex items-center justify-center ${colors.icon} shrink-0 transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-700">{label}</span>
          <span className={`text-xs font-semibold ${colors.text} tabular-nums`}>{countLabel}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${unlimited ? "bg-gradient-to-r from-emerald-300 to-emerald-400" : colors.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function FeatureBadge({ active, label, icon }: { active: boolean; label: string; icon: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-300 ${
      active
        ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 text-emerald-700 shadow-sm shadow-emerald-100/50"
        : "bg-gray-50 border-gray-100 text-gray-400 opacity-60"
    }`}>
      <span className={active ? "text-emerald-500" : "text-gray-300"}>{icon}</span>
      {label}
      {active && <Sparkles size={12} className="ml-auto text-emerald-400" />}
    </div>
  );
}

function ReceiptRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 group hover:bg-gray-50/50 -mx-2 px-2 rounded-lg transition-colors">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-gray-900" : "text-gray-700"} tabular-nums`}>{value}</span>
    </div>
  );
}

// ── Page ──────────────

export default function CandidatePaymentSuccessPage() {
  const [sub, setSub] = useState<CandidateSubscription | null>(null);
  const [quota, setQuota] = useState<CandidateQuotaResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [subData, quotaData] = await Promise.all([
          service.getMySubscription(),
          service.getMyQuota().catch(() => null),
        ]);
        setSub(subData);
        setQuota(quotaData);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 animate-pulse">
              <Loader2 size={28} className="animate-spin text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-500 font-medium">Đang tải thông tin đơn hàng…</p>
        </div>
      </div>
    );
  }

  if (error || !sub) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 p-10 max-w-md w-full text-center shadow-xl shadow-gray-200/50">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
            <Package size={28} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Không tìm thấy thông tin gói</h2>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">Giao dịch đã được ghi nhận. Vui lòng kiểm tra trong phần quản lý gói.</p>
          <Link
            href="/candidate/subscription"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 active:scale-95"
          >
            Xem gói dịch vụ <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  // Map quota từ API response
  const applyRemaining  = quota?.applicationsRemaining ?? 0;
  const applyLimit      = applyRemaining === 2147483647 ? -1 : applyRemaining;
  const boostRemaining  = quota?.cvBoostsRemaining ?? 0;
  const cvCreateLimit   = quota?.cvCreateLimit ?? -1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 px-4 py-10">
      <div className="max-w-lg mx-auto space-y-5">

        {/* Header Card */}
        <div className="relative bg-white rounded-3xl border border-gray-100 px-8 py-10 text-center shadow-xl shadow-gray-200/50 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-50" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full opacity-50 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-50 blur-3xl" />

          <div className="relative">
            <AnimatedCheck />
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Thanh toán thành công!</h1>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
              Gói <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md">{sub.planCode}</span> đã được kích hoạt.
              Bắt đầu nâng cao hồ sơ của bạn ngay hôm nay.
            </p>
            <div className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-sm font-medium border border-blue-100">
              <Calendar size={14} />
              <span>Còn <span className="font-bold">{quota?.daysLeft ?? 0}</span> ngày sử dụng</span>
            </div>
          </div>
        </div>

        {/* Receipt Card */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-lg shadow-gray-200/30">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 flex items-center justify-between border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Hóa đơn</p>
              <p className="font-bold text-gray-900 mt-1 text-lg">
                #{sub.currentPaymentId?.slice(-8).toUpperCase() ?? "—"}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
              <CheckCircle2 size={12} /> Đã thanh toán
            </span>
          </div>
          <div className="px-6 py-3">
            <ReceiptRow label="Gói dịch vụ"    value={sub.planCode}                             highlight />
            <ReceiptRow label="Chu kỳ"          value={sub.yearly ? "Hàng năm" : "Hàng tháng"} />
            <ReceiptRow label="Ngày kích hoạt"  value={formatDate(sub.startedAt)}               />
            <ReceiptRow label="Ngày hết hạn"    value={formatDate(sub.expiresAt)}               />
            <ReceiptRow label="Thời hạn còn lại" value={`${quota?.daysLeft ?? 0} ngày`}         />
          </div>
        </div>

        {/* Quota Card */}
        <div className="bg-white rounded-3xl border border-gray-100 px-6 py-5 shadow-lg shadow-gray-200/30">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full" />
            <h3 className="text-base font-semibold text-gray-800">Hạn mức sử dụng</h3>
          </div>
          <QuotaBar label="Ứng tuyển" used={0}  limit={applyLimit}    icon={<FileText size={16} />} color="blue" />
          <QuotaBar label="CV Boost"  used={0}  limit={boostRemaining} icon={<Rocket size={16} />} color="purple" />
          <QuotaBar label="Tạo CV"    used={0}  limit={cvCreateLimit}  icon={<FileText size={16} />} color="amber" />
        </div>

        {/* Features Card */}
        <div className="bg-white rounded-3xl border border-gray-100 px-6 py-5 shadow-lg shadow-gray-200/30">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full" />
            <h3 className="text-base font-semibold text-gray-800">Tính năng đi kèm</h3>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            <FeatureBadge active={quota?.aiCvWriter ?? false}             label="AI viết CV"              icon={<Zap size={14} />} />
            <FeatureBadge active={quota?.premiumTemplateAccess ?? false}  label="Template premium"        icon={<Crown size={14} />} />
            <FeatureBadge active={quota?.canApply ?? false}               label="Nộp đơn không giới hạn"   icon={<Star size={14} />} />
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            href="/candidate/profile"
            className="group relative flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all active:scale-95 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            Cập nhật hồ sơ <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/candidate/subscription"
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white border-2 border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-0.5 transition-all active:scale-95 shadow-sm"
          >
            <Home size={16} /> Quản lý gói
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center pb-8">
          <p className="text-xs text-gray-400">
            Cần hỗ trợ? Liên hệ{" "}
            <a href="mailto:support@jobplatform.vn" className="text-blue-600 font-medium hover:text-blue-700 underline underline-offset-2 transition-colors">
              support@jobplatform.vn
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}