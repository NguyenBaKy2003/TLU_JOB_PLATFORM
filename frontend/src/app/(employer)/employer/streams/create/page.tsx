"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Radio,
  Briefcase,
  Users,
  Clock,
  Plus,
  Trash2,
  ArrowLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import type {
  SessionType,
  CreateSessionRequest,
} from "@/domain/models/LiveStream";
import { LiveStreamRepository } from "@/infrastructure/repositories/LiveStreamRepository";
import { LiveStreamService } from "@/application/services/LiveStreamService";

const service = new LiveStreamService(new LiveStreamRepository());

// ─── Step indicator ───────────────────────────────────────────
function Step({
  n,
  label,
  active,
  done,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
          done
            ? "bg-slate-800 text-white"
            : active
            ? "bg-slate-800 text-white"
            : "bg-slate-100 text-slate-400"
        }`}
      >
        {done ? "✓" : n}
      </div>
      <span
        className={`text-sm font-medium hidden sm:block ${
          active ? "text-slate-800" : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Form Field wrapper ───────────────────────────────────────
function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <Info className="w-3 h-3" />
          {hint}
        </p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────
function Input({
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      {...props}
      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder:text-slate-300 outline-none transition-all focus:ring-2 focus:ring-slate-800/10 focus:border-slate-400 ${
        error
          ? "border-red-300 bg-red-50"
          : "border-slate-200 bg-white hover:border-slate-300"
      } ${props.className ?? ""}`}
    />
  );
}

function Textarea({
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      {...props}
      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder:text-slate-300 outline-none transition-all focus:ring-2 focus:ring-slate-800/10 focus:border-slate-400 resize-none ${
        error
          ? "border-red-300 bg-red-50"
          : "border-slate-200 bg-white hover:border-slate-300"
      } ${props.className ?? ""}`}
    />
  );
}

// ─── Session Type Selector ────────────────────────────────────
function TypeSelector({
  value,
  onChange,
}: {
  value: SessionType;
  onChange: (v: SessionType) => void;
}) {
  const options: {
    type: SessionType;
    icon: React.ElementType;
    label: string;
    desc: string;
  }[] = [
    {
      type: "JOB_FAIR",
      icon: Briefcase,
      label: "Job Fair",
      desc: "Giới thiệu công ty, nhiều vị trí, nhiều viewer",
    },
    {
      type: "INTERVIEW",
      icon: Users,
      label: "Phỏng vấn trực tiếp",
      desc: "Phỏng vấn 1-1 hoặc nhóm nhỏ với interview slots",
    },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map(({ type, icon: Icon, label, desc }) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={`p-4 rounded-xl border-2 text-left transition-all hover:border-slate-400 ${
            value === type
              ? "border-slate-800 bg-slate-50"
              : "border-slate-200 bg-white"
          }`}
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
              value === type ? "bg-slate-800" : "bg-slate-100"
            }`}
          >
            <Icon
              className={`w-4 h-4 ${
                value === type ? "text-white" : "text-slate-500"
              }`}
            />
          </div>
          <p
            className={`font-semibold text-sm mb-0.5 ${
              value === type ? "text-slate-800" : "text-slate-600"
            }`}
          >
            {label}
          </p>
          <p className="text-xs text-slate-400">{desc}</p>
        </button>
      ))}
    </div>
  );
}

// ─── Interview Slots Builder ──────────────────────────────────
interface SlotInput {
  startTime: string;
  durationMinutes: number;
}

function InterviewSlotsBuilder({
  slots,
  onChange,
}: {
  slots: SlotInput[];
  onChange: (slots: SlotInput[]) => void;
}) {
  const addSlot = () => {
    const last = slots[slots.length - 1];
    // Default: 30 phút sau slot cuối
    const defaultTime = last
      ? new Date(new Date(last.startTime).getTime() + 30 * 60000)
          .toISOString()
          .slice(0, 16)
      : new Date(Date.now() + 60 * 60000).toISOString().slice(0, 16);
    onChange([...slots, { startTime: defaultTime, durationMinutes: 30 }]);
  };

  const updateSlot = (i: number, patch: Partial<SlotInput>) => {
    const next = [...slots];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  const removeSlot = (i: number) => {
    onChange(slots.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-3">
      {slots.map((slot, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
        >
          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
            {i + 1}
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                Thời gian
              </label>
              <input
                type="datetime-local"
                value={slot.startTime}
                onChange={(e) => updateSlot(i, { startTime: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white outline-none focus:border-slate-400"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                Thời lượng
              </label>
              <select
                value={slot.durationMinutes}
                onChange={(e) =>
                  updateSlot(i, { durationMinutes: Number(e.target.value) })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white outline-none focus:border-slate-400"
              >
                {[15, 20, 30, 45, 60, 90].map((m) => (
                  <option key={m} value={m}>
                    {m} phút
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeSlot(i)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addSlot}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-sm hover:border-slate-300 hover:text-slate-500 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Thêm slot phỏng vấn
      </button>
    </div>
  );
}

// ─── Review Summary ───────────────────────────────────────────
function ReviewStep({ data }: { data: Partial<CreateSessionRequest> }) {
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-xl p-4 space-y-3">
        {[
          { label: "Tiêu đề", value: data.title },
          {
            label: "Loại phiên",
            value: data.sessionType === "JOB_FAIR" ? "Job Fair" : "Phỏng vấn",
          },
          {
            label: "Thời gian",
            value: data.scheduledAt
              ? new Date(data.scheduledAt).toLocaleString("vi-VN")
              : "—",
          },
          { label: "Mô tả", value: data.description || "—" },
        ].map(({ label, value }) => (
          <div key={label} className="flex gap-3">
            <span className="text-xs text-slate-400 w-24 flex-shrink-0 pt-0.5">
              {label}
            </span>
            <span className="text-sm text-slate-700 font-medium">{value}</span>
          </div>
        ))}
      </div>
      {data.sessionType === "INTERVIEW" && data.interviewSlots?.length ? (
        <div>
          <p className="text-xs text-slate-400 mb-2">
            {data.interviewSlots.length} interview slots
          </p>
          <div className="space-y-2">
            {data.interviewSlots.map((slot, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg"
              >
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {new Date(slot.startTime).toLocaleString("vi-VN")} —{" "}
                {slot.durationMinutes} phút
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────
export default function CreateStreamPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: info, 2: slots, 3: review
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<{
    title: string;
    description: string;
    sessionType: SessionType;
    scheduledAt: string;
    slots: SlotInput[];
  }>({
    title: "",
    description: "",
    sessionType: "JOB_FAIR",
    scheduledAt: new Date(Date.now() + 24 * 60 * 60000).toISOString().slice(0, 16),
    slots: [],
  });

  const set = (key: keyof typeof form, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Vui lòng nhập tiêu đề";
    if (form.title.length > 200) errs.title = "Tối đa 200 ký tự";
    if (!form.scheduledAt) errs.scheduledAt = "Vui lòng chọn thời gian";
    if (new Date(form.scheduledAt) <= new Date())
      errs.scheduledAt = "Thời gian phải ở tương lai";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && form.sessionType === "INTERVIEW" && form.slots.length === 0) {
      setErrors({ slots: "Thêm ít nhất 1 slot phỏng vấn" });
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const req: CreateSessionRequest = {
        title: form.title,
        description: form.description,
        sessionType: form.sessionType,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        interviewSlots:
          form.sessionType === "INTERVIEW" ? form.slots : undefined,
      };
      const session = await service.createSession(req);
      router.push(`/employer/streams/${session.id}`);
    } catch {
      setErrors({ submit: "Có lỗi xảy ra, vui lòng thử lại" });
      setLoading(false);
    }
  };

  const STEPS = ["Thông tin", "Cài đặt", "Xác nhận"];
  const maxStep = form.sessionType === "INTERVIEW" ? 3 : 3;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => (step > 1 ? setStep((s) => s - 1) : router.back())}
            className="p-2 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center gap-3">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <Step
                  n={i + 1}
                  label={label}
                  active={step === i + 1}
                  done={step > i + 1}
                />
                {i < STEPS.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-slate-300 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">
            {step === 1 && "Tạo phiên stream mới"}
            {step === 2 &&
              (form.sessionType === "INTERVIEW"
                ? "Cài đặt interview slots"
                : "Cài đặt thêm")}
            {step === 3 && "Xem lại & xác nhận"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {step === 1 && "Điền thông tin cơ bản cho phiên tuyển dụng trực tiếp"}
            {step === 2 &&
              (form.sessionType === "INTERVIEW"
                ? "Tạo các khung giờ phỏng vấn cho ứng viên"
                : "Cài đặt tuỳ chọn bổ sung")}
            {step === 3 && "Kiểm tra lại thông tin trước khi tạo"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          {/* Step 1: Basic info */}
          {step === 1 && (
            <>
              <Field label="Loại phiên stream" required>
                <TypeSelector
                  value={form.sessionType}
                  onChange={(v) => set("sessionType", v)}
                />
              </Field>
              <Field label="Tiêu đề" required error={errors.title}>
                <Input
                  placeholder="Ví dụ: Job Fair tháng 7 - Tìm kiếm Developer"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  error={!!errors.title}
                  maxLength={200}
                />
                <p className="text-xs text-right text-slate-300">
                  {form.title.length}/200
                </p>
              </Field>
              <Field
                label="Mô tả"
                hint="Giới thiệu ngắn về nội dung phiên stream"
              >
                <Textarea
                  placeholder="Công ty chúng tôi đang tuyển dụng vị trí..."
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={4}
                />
              </Field>
              <Field
                label="Thời gian bắt đầu"
                required
                error={errors.scheduledAt}
                hint="Có thể bắt đầu sớm hơn 30 phút"
              >
                <Input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => set("scheduledAt", e.target.value)}
                  error={!!errors.scheduledAt}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </Field>
            </>
          )}

          {/* Step 2: Slots (interview) or skip (job fair) */}
          {step === 2 && form.sessionType === "INTERVIEW" && (
            <Field
              label="Interview Slots"
              hint="Mỗi slot là một khung giờ phỏng vấn riêng"
              error={errors.slots}
            >
              <InterviewSlotsBuilder
                slots={form.slots}
                onChange={(slots) => set("slots", slots)}
              />
            </Field>
          )}

          {step === 2 && form.sessionType === "JOB_FAIR" && (
            <div className="py-8 text-center text-slate-400">
              <Briefcase className="w-10 h-10 mx-auto mb-3 text-slate-200" />
              <p className="text-sm">Job Fair không cần cài đặt slots</p>
              <p className="text-xs mt-1">
                Ứng viên có thể apply trực tiếp trong khi stream
              </p>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && <ReviewStep data={{ ...form }} />}

          {/* Error */}
          {errors.submit && (
            <p className="text-sm text-red-500 text-center">{errors.submit}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 bg-slate-800 text-white text-sm font-semibold py-3 rounded-xl hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                Tiếp theo
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-slate-800 text-white text-sm font-semibold py-3 rounded-xl hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Radio className="w-4 h-4" />
                    Tạo phiên stream
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}