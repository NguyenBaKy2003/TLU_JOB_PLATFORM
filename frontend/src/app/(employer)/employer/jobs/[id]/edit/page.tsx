// src/app/(employer)/employer/jobs/[id]/edit/page.tsx
"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AlertCircle, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/presentation/components/ui/toast";
import { JobService } from "@/application/services/JobService";
import { JobRepository } from "@/infrastructure/repositories/JobRepository";
import {
  EMPTY_JOB_FORM,
  JOB_TYPE_LABELS, JOB_LEVEL_LABELS, WORK_LOC_LABELS,
  type JobPostForm, type JobType, type JobLevel, type WorkLocType,
  type JobPostDetail,
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
  if (!form.salaryNegotiable && form.salaryMin && form.salaryMax
    && Number(form.salaryMin) > Number(form.salaryMax))
    e.salaryMax = "Lương tối đa phải ≥ lương tối thiểu";
  return e;
}

function detailToForm(job: JobPostDetail): JobPostForm {
  return {
    title: job.title ?? "",
    description: job.description ?? "",
    requirements: job.requirements ?? "",
    benefits: job.benefits ?? "",
    jobType: job.jobType ?? "",
    level: job.level ?? "",
    category: job.category ?? "",
    salaryNegotiable: job.salaryNegotiable ?? false,
    salaryMin: job.salaryMin != null ? String(job.salaryMin) : "",
    salaryMax: job.salaryMax != null ? String(job.salaryMax) : "",
    salaryCurrency: job.salaryCurrency ?? "VND",
    workLocationType: job.workLocationType ?? "",
    workLocationCity: job.workLocationCity ?? "",
    workLocationAddress: job.workLocationAddress ?? "",
    experienceYears: job.experienceYears != null ? String(job.experienceYears) : "",
    vacancies: job.vacancies != null ? String(job.vacancies) : "",
    deadline: job.deadline ?? "",
    skills: job.skills ?? [],
  };
}

export default function EditJobPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  const [form, setForm] = useState<JobPostForm>(EMPTY_JOB_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobStatus, setJobStatus] = useState<string>("");

  const [aiForm, setAiForm] = useState({
    title: "", description: "", requirements: "",
    benefits: "", level: "", category: "",
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    jobService.getById(id)
      .then(job => {
        const formData = detailToForm(job);
        setForm(formData);
        setJobStatus((job as any).status ?? "");
        setAiForm({
          title: formData.title,
          description: formData.description,
          requirements: formData.requirements,
          benefits: formData.benefits,
          level: formData.level,
          category: formData.category,
        });
      })
      .catch(e => {
        toast.error("Không tải được tin", extractErrorMessage(e, "Vui lòng thử lại."));
        router.push("/employer/jobs");
      })
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

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
      await jobService.updateFromForm(id, form, publish);
      toast.success(
        publish ? "Đã cập nhật & đăng tin" : "Đã lưu thay đổi",
        publish
          ? "Tin tuyển dụng đã được cập nhật và đang hiển thị với ứng viên."
          : "Thay đổi đã được lưu thành công.",
      );
      router.push("/employer/jobs");
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e, "Vui lòng thử lại."));
    } finally {
      setSaving(null);
    }
  }, [form, id, router, toast]);

  const jobTypeOpts = Object.entries(JOB_TYPE_LABELS).map(([value, label]) => ({ value: value as JobType, label }));
  const levelOpts = Object.entries(JOB_LEVEL_LABELS).map(([value, label]) => ({ value: value as JobLevel, label }));
  const locOpts = Object.entries(WORK_LOC_LABELS).map(([value, label]) => ({ value: value as WorkLocType, label }));

  const isBusy = saving !== null;
  const hasErrors = Object.keys(errors).length > 0;
  const isDraft = jobStatus === "DRAFT" || jobStatus === "";

  if (loading) {
    return (
      <div className="w-full pb-12 flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 size={28} className="animate-spin text-blue-500" />
          <span className="text-sm">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-12">
      {/* Back + Title */}
      <div className="flex items-center gap-3 mb-5">
        <button
          type="button"
          onClick={() => router.push("/employer/jobs")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={15} />
          Quay lại
        </button>
        <span className="text-gray-300">|</span>
        <h1 className="text-sm font-semibold text-gray-700">Chỉnh sửa tin tuyển dụng</h1>
        {jobStatus && (
          <span className={`ml-auto text-[11px] font-semibold px-2.5 py-1 rounded-full
            ${jobStatus === "PUBLISHED"
              ? "bg-green-50 text-green-600 border border-green-200"
              : jobStatus === "CLOSED"
                ? "bg-red-50 text-red-500 border border-red-200"
                : "bg-gray-100 text-gray-500 border border-gray-200"}`}
          >
            {jobStatus === "PUBLISHED" ? "Đang đăng"
              : jobStatus === "CLOSED" ? "Đã đóng"
              : "Nháp"}
          </span>
        )}
      </div>

      <div className="flex gap-6 items-start">
        {/* Main Form */}
        <div className="flex-1 min-w-0">
          {hasErrors && (
            <div className="mb-4 flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              Vui lòng kiểm tra lại thông tin trước khi lưu.
            </div>
          )}

          <JobFormFields
            form={form}
            errors={errors}
            onChange={set}
            options={{ jobTypes: jobTypeOpts, levels: levelOpts, workLocs: locOpts }}
            showFeatured={false}
          />

          <JobFormActions
            isDraft={isDraft}
            isBusy={isBusy}
            saving={saving}
            draftLabel={isDraft ? "Lưu nháp" : "Lưu thay đổi"}
            publishLabel={isDraft ? "Lưu & Đăng tin" : "Cập nhật & Đăng lại"}
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
        onClick={() => toast.info("AI Assistant", "AI Assistant chỉ khả dụng trên màn hình lớn.")}
      >
        <Sparkles size={22} className="text-white" />
      </button>
    </div>
  );
}