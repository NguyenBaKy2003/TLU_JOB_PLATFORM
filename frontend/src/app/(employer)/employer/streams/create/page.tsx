// components/stream/employer/create/CreateStreamPage.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Radio, Briefcase, Loader } from "lucide-react";
import type { SessionType, CreateSessionRequest } from "@/domain/models/LiveStream";
import { LiveStreamRepository } from "@/infrastructure/repositories/LiveStreamRepository";
import { LiveStreamService } from "@/application/services/LiveStreamService";
import { StepIndicator } from "@/presentation/components/stream/employer/create/StepIndicator";
import { Field } from "@/presentation/components/stream/employer/create/Field";
import { TypeSelector } from "@/presentation/components/stream/employer/create/TypeSelector";
import { Input } from "@/presentation/components/stream/employer/create/Input";
import { Textarea } from "@/presentation/components/stream/employer/create/Textarea";
import { InterviewSlotsBuilder } from "@/presentation/components/stream/employer/create/InterviewSlotsBuilder";
import { ReviewStep } from "@/presentation/components/stream/employer/create/ReviewStep";

const service = new LiveStreamService(new LiveStreamRepository());

const STEPS = ["Thông tin", "Cài đặt", "Xác nhận"];

export default function CreateStreamPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    title: "",
    description: "",
    sessionType: "JOB_FAIR" as SessionType,
    scheduledAt: new Date(Date.now() + 24 * 60 * 60000).toISOString().slice(0, 16),
    slots: [] as SlotInput[],
  });

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((prev) => { const { [key]: _, ...rest } = prev; return rest; });
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Vui lòng nhập tiêu đề";
    if (form.title.length > 200) errs.title = "Tối đa 200 ký tự";
    if (!form.scheduledAt) errs.scheduledAt = "Vui lòng chọn thời gian";
    if (new Date(form.scheduledAt) <= new Date()) errs.scheduledAt = "Thời gian phải ở tương lai";
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
        interviewSlots: form.sessionType === "INTERVIEW" ? form.slots : undefined,
      };
      const session = await service.createSession(req);
      router.push(`/employer/streams/${session.id}`);
    } catch {
      setErrors({ submit: "Có lỗi xảy ra, vui lòng thử lại" });
      setLoading(false);
    }
  };

  const isInterview = form.sessionType === "INTERVIEW";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => (step > 1 ? setStep((s) => s - 1) : router.back())}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <StepIndicator steps={STEPS} currentStep={step} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">
            {step === 1 && "Tạo phiên stream mới"}
            {step === 2 && (isInterview ? "Cài đặt interview slots" : "Cài đặt thêm")}
            {step === 3 && "Xem lại & xác nhận"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {step === 1 && "Điền thông tin cơ bản cho phiên tuyển dụng trực tiếp"}
            {step === 2 && (isInterview
              ? "Tạo các khung giờ phỏng vấn cho ứng viên"
              : "Cài đặt tuỳ chọn bổ sung"
            )}
            {step === 3 && "Kiểm tra lại thông tin trước khi tạo"}
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          {/* Step 1: Basic info */}
          {step === 1 && (
            <>
              <Field label="Loại phiên stream" required>
                <TypeSelector value={form.sessionType} onChange={(v) => updateField("sessionType", v)} />
              </Field>

              <Field label="Tiêu đề" required error={errors.title}>
                <Input
                  placeholder="Ví dụ: Job Fair tháng 7 - Tìm kiếm Developer"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  error={!!errors.title}
                  maxLength={200}
                />
                <p className="text-xs text-right text-slate-300 mt-1">{form.title.length}/200</p>
              </Field>

              <Field label="Mô tả" hint="Giới thiệu ngắn về nội dung phiên stream">
                <Textarea
                  placeholder="Công ty chúng tôi đang tuyển dụng vị trí..."
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={4}
                />
              </Field>

              <Field label="Thời gian bắt đầu" required error={errors.scheduledAt} hint="Có thể bắt đầu sớm hơn 30 phút">
                <Input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => updateField("scheduledAt", e.target.value)}
                  error={!!errors.scheduledAt}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </Field>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && isInterview && (
            <Field label="Interview Slots" hint="Mỗi slot là một khung giờ phỏng vấn riêng" error={errors.slots}>
              <InterviewSlotsBuilder
                slots={form.slots}
                onChange={(slots) => updateField("slots", slots)}
              />
            </Field>
          )}

          {step === 2 && !isInterview && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 text-sm font-medium">Job Fair không cần cài đặt slots</p>
              <p className="text-slate-400 text-xs mt-1">Ứng viên có thể apply trực tiếp trong khi stream</p>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && <ReviewStep data={{ ...form }} />}

          {/* Submit error */}
          {errors.submit && (
            <p className="text-sm text-red-500 text-center bg-red-50 py-2 rounded-lg">{errors.submit}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 bg-slate-800 text-white text-sm font-semibold py-3 rounded-xl hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
              >
                Tiếp theo
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-slate-800 text-white text-sm font-semibold py-3 rounded-xl hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
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