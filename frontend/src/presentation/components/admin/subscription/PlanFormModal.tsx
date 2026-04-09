// src/presentation/components/admin/subscription/PlanFormModal.tsx
"use client";
import { useState, useEffect }         from "react";
import { X, Check, Infinity }          from "lucide-react";
import type { SubscriptionPlan }       from "@/domain/models/CompanySubscription";
import { PlanPayload } from "@/domain/repositories/IAdminSubscriptionRepository";

const inputCls = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 " +
  "placeholder:text-gray-300 text-gray-800 transition-all";

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

// ── Limit input (-1 = unlimited) ──────────────────────────────────────────────

function LimitInput({ label, value, onChange }: {
  label: string; value: number; onChange: (v: number) => void;
}) {
  const isUnlimited = value === -1;
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-700">{label}</label>
      <div className="flex gap-2">
        <input
          type="number" min={-1}
          value={isUnlimited ? "" : value}
          disabled={isUnlimited}
          onChange={e => onChange(Number(e.target.value))}
          placeholder="0"
          className={inputCls + (isUnlimited ? " opacity-40" : "")}
        />
        <button
          type="button"
          onClick={() => onChange(isUnlimited ? 0 : -1)}
          title="Không giới hạn"
          className={`shrink-0 px-3 rounded-xl border text-xs font-semibold transition-all ${
            isUnlimited
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-gray-200 text-gray-500 hover:border-blue-300"
          }`}
        >
          <Infinity size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────

function ToggleRow({ label, desc, checked, onChange }: {
  label: string; desc: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
          checked ? "bg-blue-500" : "bg-gray-200"
        }`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm
          transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

// ── Default form ──────────────────────────────────────────────────────────────

const DEFAULT: PlanPayload = {
  code: "", name: "", description: "",
  priceMonthly: 0, priceYearly: 0,
  jobPostLimit: 5, featuredJobLimit: 0, cvViewLimit: 0,
  aiFeatures: false, analyticsAccess: false,
  durationDays: 30,
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  plan?:     SubscriptionPlan;  // undefined = tạo mới
  onSave:    (payload: PlanPayload) => Promise<void>;
  onCancel:  () => void;
}

export function PlanFormModal({ plan, onSave, onCancel }: Props) {
  const isEdit = !!plan;
  const [form, setForm] = useState<PlanPayload>(
    plan
      ? {
          code:             plan.code,
          name:             plan.name,
          description:      plan.description ?? "",
          priceMonthly:     plan.priceMonthly,
          priceYearly:      plan.priceYearly,
          jobPostLimit:     plan.jobPostLimit,
          featuredJobLimit: plan.featuredJobLimit,
          cvViewLimit:      plan.cvViewLimit,
          aiFeatures:       plan.aiFeatures,
          analyticsAccess:  plan.analyticsAccess,
          durationDays:     plan.durationDays,
        }
      : DEFAULT,
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof PlanPayload, string>>>({});

  const set = <K extends keyof PlanPayload>(key: K, val: PlanPayload[K]) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.code.trim())  e.code = "Vui lòng nhập code";
    if (!form.name.trim())  e.name = "Vui lòng nhập tên gói";
    if (form.durationDays < 1) e.durationDays = "Phải ≥ 1 ngày";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try { await onSave(form); }
    catch {}
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10
      bg-black/30 backdrop-blur-sm overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">
            {isEdit ? `Chỉnh sửa gói: ${plan.name}` : "Tạo gói mới"}
          </h3>
          <button onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-6">

          {/* ── Thông tin cơ bản ──────────────────────────── */}
          <section>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Thông tin cơ bản
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Mã gói (code)" required>
                <input value={form.code}
                  onChange={e => set("code", e.target.value.toUpperCase())}
                  disabled={isEdit}
                  placeholder="FREE / BASIC / PRO / ENTERPRISE"
                  className={inputCls + (isEdit ? " opacity-60" : "")} />
                {errors.code && <p className="text-[11px] text-red-500">{errors.code}</p>}
              </Field>
              <Field label="Tên gói" required>
                <input value={form.name} onChange={e => set("name", e.target.value)}
                  placeholder="Gói Cơ Bản" className={inputCls} />
                {errors.name && <p className="text-[11px] text-red-500">{errors.name}</p>}
              </Field>
              <div className="sm:col-span-2">
                <Field label="Mô tả gói">
                  <textarea value={form.description ?? ""}
                    onChange={e => set("description", e.target.value)}
                    placeholder="Phù hợp cho doanh nghiệp vừa và nhỏ..."
                    rows={2}
                    className={inputCls + " resize-none"} />
                </Field>
              </div>
            </div>
          </section>

          {/* ── Giá ──────────────────────────────────────── */}
          <section>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Giá (VND — nhập 0 cho gói miễn phí)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Giá tháng" hint="0 = Miễn phí">
                <input type="number" min={0} value={form.priceMonthly}
                  onChange={e => set("priceMonthly", Number(e.target.value))}
                  className={inputCls} />
              </Field>
              <Field label="Giá năm" hint="Thường giảm ~20%">
                <input type="number" min={0} value={form.priceYearly}
                  onChange={e => set("priceYearly", Number(e.target.value))}
                  className={inputCls} />
              </Field>
              <Field label="Thời hạn (ngày)" required>
                <input type="number" min={1} value={form.durationDays}
                  onChange={e => set("durationDays", Number(e.target.value))}
                  className={inputCls} />
                {errors.durationDays && <p className="text-[11px] text-red-500">{errors.durationDays}</p>}
              </Field>
            </div>
          </section>

          {/* ── Quota ─────────────────────────────────────── */}
          <section>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Quota (<Infinity size={10} className="inline" /> = không giới hạn, dùng -1)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <LimitInput label="Số tin đăng"
                value={form.jobPostLimit}
                onChange={v => set("jobPostLimit", v)} />
              <LimitInput label="Số tin nổi bật"
                value={form.featuredJobLimit}
                onChange={v => set("featuredJobLimit", v)} />
              <LimitInput label="Lượt xem CV"
                value={form.cvViewLimit}
                onChange={v => set("cvViewLimit", v)} />
            </div>
          </section>

          {/* ── Tính năng nâng cao ────────────────────────── */}
          <section className="flex flex-col gap-4 p-4 bg-gray-50 rounded-2xl">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Tính năng nâng cao
            </p>
            <ToggleRow
              label="AI Features"
              desc="Gợi ý ứng viên, phân tích JD bằng AI"
              checked={form.aiFeatures}
              onChange={v => set("aiFeatures", v)}
            />
            <ToggleRow
              label="Analytics Access"
              desc="Thống kê hiệu suất tin đăng, báo cáo nâng cao"
              checked={form.analyticsAccess}
              onChange={v => set("analyticsAccess", v)}
            />
          </section>

          {/* ── Actions ──────────────────────────────────── */}
          <div className="flex gap-2 pt-1">
            <button onClick={onCancel} disabled={saving}
              className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100
                rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors">
              Hủy
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm
                font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800
                disabled:opacity-50 transition-colors">
              {saving
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Check size={15} />}
              {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo gói"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}