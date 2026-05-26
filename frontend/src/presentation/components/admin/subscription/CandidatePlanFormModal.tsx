"use client";
import { useState } from "react";
import { X, Check, Infinity } from "lucide-react";
import type { CandidateSubscriptionPlan } from "@/domain/models/CandidateSubscription";
import type { CandidatePlanPayload } from "@/domain/models/CandidateSubscription";

const inputCls =
  "w-full px-3 py-2.5 text-[16px] border border-gray-200 rounded-xl bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 " +
  "placeholder:text-gray-300 text-gray-800 transition-all";

// ── Plan code constants khớp với backend PlanCode.java ──
const CANDIDATE_PLAN_CODES = ["FREE_CANDIDATE", "PRO", "PREMIUM"] as const;

// ── Field wrapper ─────────
function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

// ── Limit input (-1 = unlimited) ─
function LimitInput({
  label,
  value,
  onChange,
  allowUnlimited = true,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  allowUnlimited?: boolean;
}) {
  const isUnlimited = value === -1;
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-700">{label}</label>
      <div className="flex gap-2">
        <input
          type="number"
          min={allowUnlimited ? -1 : 0}
          value={isUnlimited ? "" : value}
          disabled={isUnlimited}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder="0"
          className={inputCls + (isUnlimited ? " opacity-40" : "")}
        />
        {allowUnlimited && (
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
        )}
      </div>
    </div>
  );
}

// ── Toggle ─
function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[16px] font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
          checked ? "bg-blue-500" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm
          transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}

// ── Toggle nhỏ (checkbox style) ─
function ToggleSmall({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-[16px] text-gray-700">{label}</span>
    </label>
  );
}

// ── Code Selector ─────────
function CodeSelector({
  value,
  onChange,
  disabled,
  codes,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  codes: readonly string[];
}) {
  const [showCustom, setShowCustom] = useState(
    value !== "" && !codes.includes(value as any)
  );

  const selectValue = codes.includes(value as any)
    ? value
    : showCustom
    ? "__custom__"
    : "";

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-700">
        Mã gói (code)<span className="text-red-500 ml-0.5">*</span>
      </label>

      <select
        value={selectValue}
        onChange={(e) => {
          const val = e.target.value;
          if (val === "__custom__") {
            setShowCustom(true);
            if (codes.includes(value as any)) onChange("");
          } else {
            setShowCustom(false);
            onChange(val);
          }
        }}
        disabled={disabled}
        className={inputCls + (disabled ? " opacity-60" : "")}
      >
        <option value="">-- Chọn code --</option>
        {codes.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
        <option value="__custom__">Khác (tự nhập)...</option>
      </select>

      {showCustom && !disabled && (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="Nhập code tùy chỉnh (vd: CUSTOM_PLAN)..."
          autoFocus
          className={inputCls + " mt-1"}
        />
      )}

      {showCustom && !disabled && (
        <p className="text-[11px] text-gray-400">
          Chỉ dùng CHỮ HOA và dấu gạch dưới, ví dụ: ENTERPRISE_PLUS
        </p>
      )}
    </div>
  );
}

// ── Default form ──────────
const DEFAULT: CandidatePlanPayload = {
  code: "",
  name: "",
  description: "",
  priceMonthly: null,
  priceYearly: null,
  applicationLimit: 5,
  cvBoostLimit: 0,
  cvCreateLimit: 1,
  aiCvWriter: false,
  premiumTemplateAccess: false,
  durationDays: null,
  free: true,
  active: true,
};

// ── Props ──
interface Props {
  plan?: CandidateSubscriptionPlan;
  onSave: (payload: CandidatePlanPayload) => Promise<void>;
  onCancel: () => void;
}

export function CandidatePlanFormModal({ plan, onSave, onCancel }: Props) {
  const isEdit = !!plan;
  const [form, setForm] = useState<CandidatePlanPayload>(
    plan
      ? {
          code: plan.code,
          name: plan.name,
          description: plan.description ?? "",
          priceMonthly: plan.priceMonthly ?? null,
          priceYearly: plan.priceYearly ?? null,
          applicationLimit: plan.applicationLimit,
          cvBoostLimit: plan.cvBoostLimit,
          cvCreateLimit: plan.cvCreateLimit,
          aiCvWriter: plan.aiCvWriter,
          premiumTemplateAccess: plan.premiumTemplateAccess,
          durationDays: plan.durationDays ?? null,
          active: plan.active,
          free: plan.free,
        }
      : DEFAULT
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CandidatePlanPayload, string>>
  >({});

  const set = <K extends keyof CandidatePlanPayload>(
    key: K,
    val: CandidatePlanPayload[K]
  ) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.code.trim()) e.code = "Vui lòng chọn hoặc nhập code";
    if (!form.name.trim()) e.name = "Vui lòng nhập tên gói";

    if (form.free) {
      if (form.priceMonthly != null && form.priceMonthly > 0)
        e.priceMonthly = "Gói miễn phí phải có giá = null";
      if (form.durationDays != null)
        e.durationDays = "Gói miễn phí không có thời hạn (để trống)";
    } else {
      if (form.priceMonthly == null || form.priceMonthly < 0)
        e.priceMonthly = "Gói trả phí phải có giá theo tháng";
      if (!form.durationDays || form.durationDays < 1)
        e.durationDays = "Phải ≥ 1 ngày";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave(form);
    } catch {}
    finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10
      bg-black/30 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-[16px] font-semibold text-gray-800">
            {isEdit
              ? `Chỉnh sửa gói Candidate: ${plan?.name}`
              : "Tạo gói Candidate mới"}
          </h3>
          <button
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-6">
          {/* ── Thông tin cơ bản ───────────── */}
          <section>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Thông tin cơ bản
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CodeSelector
                value={form.code}
                onChange={(v) => set("code", v)}
                disabled={isEdit}
                codes={CANDIDATE_PLAN_CODES}
              />
              {errors.code && (
                <p className="text-[11px] text-red-500">{errors.code}</p>
              )}
              <Field label="Tên gói" required>
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Gói Chuyên Nghiệp"
                  className={inputCls}
                />
                {errors.name && (
                  <p className="text-[11px] text-red-500">{errors.name}</p>
                )}
              </Field>
              <div className="sm:col-span-2">
                <Field label="Mô tả gói">
                  <textarea
                    value={form.description ?? ""}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Dành cho ứng viên muốn tăng cơ hội việc làm..."
                    rows={2}
                    className={inputCls + " resize-none"}
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* ── Giá + Free toggle ────────── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Giá (VND)
              </p>
              <ToggleSmall
                label="Gói miễn phí"
                checked={form.free}
                onChange={(v) => {
                  set("free", v);
                  if (v) {
                    // BE yêu cầu: free plan → price = null, durationDays = null
                    set("priceMonthly", null);
                    set("priceYearly", null);
                    set("durationDays", null);
                  } else {
                    set("priceMonthly", 0);
                    set("priceYearly", 0);
                    set("durationDays", 30);
                  }
                }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field
                label="Giá tháng"
                hint={form.free ? "Không áp dụng (gói miễn phí)" : undefined}
              >
                <input
                  type="number"
                  min={0}
                  value={form.priceMonthly ?? ""}
                  onChange={(e) =>
                    set(
                      "priceMonthly",
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  disabled={form.free}
                  placeholder={form.free ? "—" : "99000"}
                  className={inputCls + (form.free ? " opacity-40" : "")}
                />
                {errors.priceMonthly && (
                  <p className="text-[11px] text-red-500">
                    {errors.priceMonthly}
                  </p>
                )}
              </Field>
              <Field label="Giá năm" hint="Thường giảm ~20%">
                <input
                  type="number"
                  min={0}
                  value={form.priceYearly ?? ""}
                  onChange={(e) =>
                    set(
                      "priceYearly",
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  disabled={form.free}
                  placeholder={form.free ? "—" : "899000"}
                  className={inputCls + (form.free ? " opacity-40" : "")}
                />
              </Field>
              <Field label="Thời hạn (ngày)" required={!form.free}>
                <input
                  type="number"
                  min={1}
                  value={form.durationDays ?? ""}
                  onChange={(e) =>
                    set(
                      "durationDays",
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  disabled={form.free}
                  placeholder={form.free ? "Vĩnh viễn" : "30"}
                  className={inputCls + (form.free ? " opacity-40" : "")}
                />
                {errors.durationDays && (
                  <p className="text-[11px] text-red-500">
                    {errors.durationDays}
                  </p>
                )}
              </Field>
            </div>
          </section>

          {/* ── Quota cho Candidate ───────── */}
          <section>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Quota (
              <Infinity size={10} className="inline" /> = không giới hạn, dùng
              -1)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <LimitInput
                label="Lượt ứng tuyển/tháng"
                value={form.applicationLimit}
                onChange={(v) => set("applicationLimit", v)}
              />
              <LimitInput
                label="Lượt đẩy CV/tháng"
                value={form.cvBoostLimit}
                onChange={(v) => set("cvBoostLimit", v)}
                allowUnlimited={false}
              />
              <LimitInput
                label="Số CV có thể tạo"
                value={form.cvCreateLimit}
                onChange={(v) => set("cvCreateLimit", v)}
              />
            </div>
          </section>

          {/* ── Tính năng nâng cao ─────────── */}
          <section className="flex flex-col gap-4 p-4 bg-gray-50 rounded-2xl">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Tính năng nâng cao
            </p>
            <ToggleRow
              label="AI CV Writer"
              desc="Tạo và tối ưu CV bằng AI, gợi ý từ khóa phù hợp theo JD — chỉ PREMIUM"
              checked={form.aiCvWriter}
              onChange={(v) => set("aiCvWriter", v)}
            />
            <ToggleRow
              label="Template Premium"
              desc="Được dùng các template CV cao cấp khi tạo CV online"
              checked={form.premiumTemplateAccess}
              onChange={(v) => set("premiumTemplateAccess", v)}
            />
          </section>

          {/* ── Trạng thái ─────────── */}
          <section className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div>
              <p className="text-[16px] font-medium text-gray-800">Kích hoạt gói</p>
              <p className="text-xs text-gray-400">
                Gói sẽ hiện ra cho ứng viên khi đang active
              </p>
            </div>
            <button
              type="button"
              onClick={() => set("active", !form.active)}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                form.active ? "bg-blue-500" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm
                transition-transform ${form.active ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
          </section>

          {/* ── Actions ────── */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onCancel}
              disabled={saving}
              className="flex-1 py-2.5 text-[16px] font-medium text-gray-600 bg-gray-100
                rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[16px]
                font-semibold text-white bg-blue-500 rounded-xl hover:bg-blue-800
                disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check size={15} />
              )}
              {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo gói"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}