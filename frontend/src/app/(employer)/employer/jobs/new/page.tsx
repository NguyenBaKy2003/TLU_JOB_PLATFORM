// src/app/(employer)/employer/jobs/create/page.tsx
"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Sparkles } from "lucide-react";
import { useToast } from "@/presentation/components/ui/toast";
import { JobService } from "@/application/services/JobService";
import { JobRepository } from "@/infrastructure/repositories/JobRepository";
import {
  EMPTY_JOB_FORM,
  JOB_TYPE_LABELS, JOB_LEVEL_LABELS, WORK_LOC_LABELS,
  type JobPostForm, type JobType, type JobLevel, type WorkLocType,
} from "@/domain/models/Job";
import type { JdOptimizationResult } from "@/domain/models/Ai";
import { extractErrorMessage } from "@/lib/extractErrorMessage";
import { JobFormFields } from "@/presentation/components/job-post/JobFormFields";
import { JobFormActions } from "@/presentation/components/job-post/JobFormActions";
import AiJobAssistant from "@/presentation/components/job-post/AiJobAssistant";

const jobService = new JobService(new JobRepository());

type Errors = Partial<Record<keyof JobPostForm, string>>;

function validate(form: JobPostForm): Errors {
  const e: Errors = {};
  if (!form.title.trim()) e.title = "Tiêu đề không được để trống";
  if (form.title.length > 300) e.title = "Tiêu đề tối đa 300 ký tự";
  if (form.description.length > 0 && form.description.length < 100)
    e.description = "Mô tả phải có ít nhất 100 ký tự";
  if (!form.deadline) e.deadline = "Vui lòng chọn hạn nộp CV";
  if (form.deadline && new Date(form.deadline) <= new Date())
    e.deadline = "Hạn nộp CV phải là ngày trong tương lai";
  if (form.vacancies && (isNaN(Number(form.vacancies)) || Number(form.vacancies) < 1))
    e.vacancies = "Số lượng phải ≥ 1";
  if (!form.salaryNegotiable && form.salaryMin && form.salaryMax &&
    Number(form.salaryMin) > Number(form.salaryMax))
    e.salaryMax = "Lương tối đa phải ≥ lương tối thiểu";
  return e;
}

export default function CreateJobPage() {
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState<JobPostForm>(EMPTY_JOB_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [featured, setFeatured] = useState(false);

  const [aiForm, setAiForm] = useState({
    title: "", description: "", requirements: "",
    benefits: "", level: "", category: "",
  });

  useEffect(() => {
    setAiForm({
      title: form.title,
      description: form.description,
      requirements: form.requirements,
      benefits: form.benefits,
      level: form.level,
      category: form.category,
    });
  }, [form.title, form.description, form.requirements, form.benefits, form.level, form.category]);

  const set = <K extends keyof JobPostForm>(key: K, val: JobPostForm[K]) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: undefined }));
  };

  const handleApplyOptimized = (optimized: JdOptimizationResult) => {
    setForm(prev => ({
      ...prev,
      title: optimized.improvedTitle,
      description: optimized.improvedDescription,
      requirements: optimized.improvedRequirements,
      benefits: optimized.improvedBenefits || prev.benefits,
    }));
  };

  const handleSubmit = useCallback(async (publish: boolean) => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Thiếu thông tin", "Vui lòng kiểm tra lại các trường bắt buộc.");
      return;
    }
    setSaving(publish ? "publish" : "draft");
    try {
      await jobService.createFromForm(form, publish, publish ? featured : false);
      toast.success(
        publish ? (featured ? "Đã đăng tin nổi bật" : "Đã đăng tin tuyển dụng") : "Đã lưu nháp",
        publish
          ? (featured ? "Tin nổi bật đang được ưu tiên hiển thị." : "Tin đang hiển thị với ứng viên.")
          : "Bạn có thể đăng tin sau.",
      );
      router.push("/employer/jobs");
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e, "Vui lòng thử lại."));
    } finally {
      setSaving(null);
    }
  }, [form, featured, router, toast]);

  const jobTypeOpts = Object.entries(JOB_TYPE_LABELS).map(([value, label]) => ({ value: value as JobType, label }));
  const levelOpts = Object.entries(JOB_LEVEL_LABELS).map(([value, label]) => ({ value: value as JobLevel, label }));
  const locOpts = Object.entries(WORK_LOC_LABELS).map(([value, label]) => ({ value: value as WorkLocType, label }));

  const isBusy = saving !== null;
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="w-full pb-12">
      <div className="flex gap-6 items-start">

        {/* Main Form */}
        <div className="flex-1 min-w-0">
          {hasErrors && (
            <div className="mb-4 flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              Vui lòng kiểm tra lại thông tin trước khi đăng tin.
            </div>
          )}

          <JobFormFields
            form={form}
            errors={errors}
            onChange={set}
            options={{ jobTypes: jobTypeOpts, levels: levelOpts, workLocs: locOpts }}
            featured={featured}
            onFeaturedChange={setFeatured}
            showFeatured={true}
            isBusy={isBusy}
          />

          <JobFormActions
            isDraft={true}
            isBusy={isBusy}
            saving={saving}
            featured={featured}
            showFeatured={true}
            onSubmit={handleSubmit}
          />
        </div>

        {/* AI Sidebar */}
        <div className="w-96 shrink-0 hidden lg:block self-start sticky ">
          <AiJobAssistant
            form={aiForm}
            onApplyOptimized={handleApplyOptimized}
          />
        </div>

      </div>

      {/* Mobile AI Button */}
      <button
        className="lg:hidden fixed bottom-4 right-4 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg flex items-center justify-center z-50 hover:scale-105 transition-transform"
        onClick={() => toast.info("AI Assistant", "Tính năng AI Assistant chỉ khả dụng trên màn hình lớn.")}
      >
        <Sparkles size={22} className="text-white" />
      </button>
    </div>
  );
}