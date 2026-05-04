// src/app/(employer)/employer/jobs/[id]/edit/page.tsx
"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter, useParams }             from "next/navigation";
import {
  Briefcase, MapPin, DollarSign, Users,
  Calendar, Wrench, FileText,
  ChevronRight, AlertCircle, ArrowLeft, Loader2,
} from "lucide-react";
import { PostSection }            from "@/presentation/components/job-post/shared";
import { useToast }               from "@/presentation/components/ui/toast";
import { JobService }             from "@/application/services/JobService";
import { JobRepository }          from "@/infrastructure/repositories/JobRepository";
import {
  EMPTY_JOB_FORM,
  JOB_TYPE_LABELS, JOB_LEVEL_LABELS, WORK_LOC_LABELS,
  type JobPostForm, type JobType, type JobLevel, type WorkLocType, type JobSkill,
  type JobPostDetail,
} from "@/domain/models/Job";
import { extractErrorMessage }    from "@/lib/extractErrorMessage";
import { RichTextArea }           from "@/presentation/components/job-post/RichTextArea";
import { SkillsInput }            from "@/presentation/components/job-post/SkillsInput";

// ── Singleton ─────────────

const jobService = new JobService(new JobRepository());

// ── Helpers 

const inputCls =
  "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 " +
  "placeholder:text-gray-300 text-gray-800 transition-all";

type Errors = Partial<Record<keyof JobPostForm, string>>;

function validate(form: JobPostForm): Errors {
  const e: Errors = {};
  if (!form.title.trim())               e.title       = "Tiêu đề không được để trống";
  if (form.title.length > 300)          e.title       = "Tiêu đề tối đa 300 ký tự";
  if (form.description.length > 0 && form.description.length < 100)
                                        e.description = "Mô tả phải có ít nhất 100 ký tự";
  if (!form.deadline)                   e.deadline    = "Vui lòng chọn hạn nộp CV";
  if (form.deadline && new Date(form.deadline) <= new Date())
                                        e.deadline    = "Hạn nộp CV phải là ngày trong tương lai";
  if (form.vacancies && (isNaN(Number(form.vacancies)) || Number(form.vacancies) < 1))
                                        e.vacancies   = "Số lượng phải ≥ 1";
  if (!form.salaryNegotiable && form.salaryMin && form.salaryMax
      && Number(form.salaryMin) > Number(form.salaryMax))
                                        e.salaryMax   = "Lương tối đa phải ≥ lương tối thiểu";
  return e;
}

/** Map JobPostDetail (từ API) → JobPostForm (local state) */
function detailToForm(job: JobPostDetail): JobPostForm {
  return {
    title:               job.title       ?? "",
    description:         job.description ?? "",
    requirements:        job.requirements ?? "",
    benefits:            job.benefits     ?? "",
    jobType:             job.jobType      ?? "",
    level:               job.level        ?? "",
    category:            job.category     ?? "",
    salaryNegotiable:    job.salaryNegotiable ?? false,
    salaryMin:           job.salaryMin != null ? String(job.salaryMin) : "",
    salaryMax:           job.salaryMax != null ? String(job.salaryMax) : "",
    salaryCurrency:      job.salaryCurrency   ?? "VND",
    workLocationType:    job.workLocationType   ?? "",
    workLocationCity:    job.workLocationCity   ?? "",
    workLocationAddress: job.workLocationAddress ?? "",
    experienceYears:     job.experienceYears != null ? String(job.experienceYears) : "",
    vacancies:           job.vacancies    != null ? String(job.vacancies)    : "",
    deadline:            job.deadline     ?? "",
    skills:              job.skills       ?? [],
  };
}

// ── Sub-components ────────

function Field({ label, required, hint, error, children }: {
  label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-red-500 flex items-center gap-1">
          <AlertCircle size={11}/>{error}
        </p>
      )}
      {hint && !error && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

function SegmentedControl<T extends string>({ options, value, onChange, cols = 3 }: {
  options: { value: T; label: string }[];
  value:   T | "";
  onChange:(v: T) => void;
  cols?:   number;
}) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {options.map(o => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className={`py-2.5 px-3 text-sm font-medium rounded-xl border transition-all
            ${value === o.value
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Page ───

export default function EditJobPage() {
  const router    = useRouter();
  const { id }    = useParams<{ id: string }>();
  const toast     = useToast();

  const [form,    setForm]    = useState<JobPostForm>(EMPTY_JOB_FORM);
  const [errors,  setErrors]  = useState<Errors>({});
  const [saving,  setSaving]  = useState<"draft" | "publish" | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobStatus, setJobStatus] = useState<string>("");

  // ── Load job data ─────

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    jobService.getById(id)
      .then(job => {
        setForm(detailToForm(job));
        setJobStatus((job as any).status ?? "");
      })
      .catch(e => {
        toast.error("Không tải được tin", extractErrorMessage(e, "Vui lòng thử lại."));
        router.push("/employer/jobs");
      })
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Field updater ─────

  const set = <K extends keyof JobPostForm>(key: K, val: JobPostForm[K]) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: undefined }));
  };

  // ── Submit ────────────

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

  // ── Derived ───────────

  const jobTypeOpts = Object.entries(JOB_TYPE_LABELS).map(([value, label]) => ({ value: value as JobType, label }));
  const levelOpts   = Object.entries(JOB_LEVEL_LABELS).map(([value, label]) => ({ value: value as JobLevel, label }));
  const locOpts     = Object.entries(WORK_LOC_LABELS).map(([value, label]) => ({ value: value as WorkLocType, label }));

  const isBusy    = saving !== null;
  const hasErrors = Object.keys(errors).length > 0;
  const isDraft   = jobStatus === "DRAFT" || jobStatus === "";

  // ── Loading state ─────

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto pb-12 flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 size={28} className="animate-spin text-blue-500" />
          <span className="text-sm">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  // ──────

  return (
    <div className="max-w-3xl mx-auto pb-12">

      {/* Back + Title */}
      <div className="flex items-center gap-3 mb-5">
        <button
          type="button"
          onClick={() => router.push("/employer/jobs")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors">
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
              : "bg-gray-100 text-gray-500 border border-gray-200"}`}>
            {jobStatus === "PUBLISHED" ? "Đang đăng"
              : jobStatus === "CLOSED" ? "Đã đóng"
              : "Nháp"}
          </span>
        )}
      </div>

      {/* Error summary */}
      {hasErrors && (
        <div className="mb-4 flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-100
          rounded-2xl text-xs text-red-600">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          Vui lòng kiểm tra lại thông tin trước khi lưu.
        </div>
      )}

      <div className="flex flex-col gap-5">

        {/* ── 1. Giới thiệu ───── */}
        <PostSection icon={<Briefcase size={16} />} title="Giới thiệu công việc">
          <div className="flex flex-col gap-4">
            <Field label="Tiêu đề công việc" required error={errors.title}>
              <input value={form.title} onChange={e => set("title", e.target.value)}
                placeholder="VD: Senior Backend Developer (Java/Spring Boot)"
                maxLength={300} className={inputCls} />
              <span className="text-[11px] text-gray-400 text-right -mt-1">{form.title.length}/300</span>
            </Field>

            <Field label="Danh mục công việc">
              <input value={form.category} onChange={e => set("category", e.target.value)}
                placeholder="VD: Công nghệ thông tin" className={inputCls} />
            </Field>

            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-gray-700">Hình thức làm việc</p>
              <SegmentedControl options={jobTypeOpts} value={form.jobType}
                onChange={v => set("jobType", v)} cols={4} />
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-gray-700">Cấp bậc</p>
              <SegmentedControl options={levelOpts} value={form.level}
                onChange={v => set("level", v)} cols={3} />
            </div>
          </div>
        </PostSection>

        {/* ── 2. Địa điểm ─────── */}
        <PostSection icon={<MapPin size={16} />} title="Địa điểm làm việc">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-gray-700">Hình thức</p>
              <SegmentedControl options={locOpts} value={form.workLocationType}
                onChange={v => set("workLocationType", v)} cols={3} />
            </div>
            {form.workLocationType !== "REMOTE" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Thành phố">
                  <input value={form.workLocationCity}
                    onChange={e => set("workLocationCity", e.target.value)}
                    placeholder="Hà Nội" className={inputCls} />
                </Field>
                <Field label="Địa chỉ cụ thể">
                  <input value={form.workLocationAddress}
                    onChange={e => set("workLocationAddress", e.target.value)}
                    placeholder="140 Nguyễn Trãi, Thanh Xuân" className={inputCls} />
                </Field>
              </div>
            )}
          </div>
        </PostSection>

        {/* ── 3. Mức lương ────── */}
        <PostSection icon={<DollarSign size={16} />} title="Mức lương">
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.salaryNegotiable}
                onChange={e => set("salaryNegotiable", e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-300 accent-blue-600" />
              <span className="text-sm text-gray-700">Mức lương thoả thuận</span>
            </label>

            {!form.salaryNegotiable && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Lương tối thiểu">
                  <div className="relative">
                    <input type="number" value={form.salaryMin} min={0}
                      onChange={e => set("salaryMin", e.target.value)}
                      placeholder="20,000,000" className={inputCls + " pr-12"} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      {form.salaryCurrency}
                    </span>
                  </div>
                </Field>
                <Field label="Lương tối đa" error={errors.salaryMax}>
                  <div className="relative">
                    <input type="number" value={form.salaryMax} min={0}
                      onChange={e => set("salaryMax", e.target.value)}
                      placeholder="35,000,000" className={inputCls + " pr-12"} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      {form.salaryCurrency}
                    </span>
                  </div>
                </Field>
                <Field label="Đơn vị tiền tệ">
                  <select value={form.salaryCurrency}
                    onChange={e => set("salaryCurrency", e.target.value)}
                    className={inputCls + " bg-white cursor-pointer"}>
                    {["VND","USD","EUR","JPY","SGD"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
            )}
          </div>
        </PostSection>

        {/* ── 4. Điều kiện ────── */}
        <PostSection icon={<Users size={16} />} title="Điều kiện tuyển dụng">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Kinh nghiệm (năm)" hint="0 = chưa có kinh nghiệm">
              <input type="number" value={form.experienceYears} min={0} max={30}
                onChange={e => set("experienceYears", e.target.value)}
                placeholder="0" className={inputCls} />
            </Field>
            <Field label="Số lượng tuyển" required error={errors.vacancies}>
              <input type="number" value={form.vacancies} min={1}
                onChange={e => set("vacancies", e.target.value)}
                placeholder="1" className={inputCls} />
            </Field>
            <Field label="Hạn nộp CV" required error={errors.deadline}>
              <input type="date" value={form.deadline}
                onChange={e => set("deadline", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className={inputCls + " cursor-pointer"} />
            </Field>
          </div>
        </PostSection>

        {/* ── 5. Kỹ năng ──────── */}
        <PostSection icon={<Wrench size={16} />} title="Kỹ năng yêu cầu">
          <SkillsInput
            skills={form.skills}
            onChange={(skills: JobSkill[]) => set("skills", skills)}
          />
        </PostSection>

        {/* ── 6. Mô tả ────────── */}
        <PostSection icon={<FileText size={16} />} title="Mô tả & Yêu cầu">
          <div className="flex flex-col gap-5">
            <RichTextArea
              label="Mô tả công việc" required
              placeholder="Mô tả chi tiết về vị trí, trách nhiệm hàng ngày..."
              value={form.description} onChange={v => set("description", v)}
              minLength={100} maxLength={5000} rows={7}
              error={errors.description}
              hint="Tối thiểu 100 ký tự — mô tả rõ ràng giúp thu hút đúng ứng viên"
            />
            <RichTextArea
              label="Yêu cầu ứng viên"
              placeholder="Bằng cấp, kinh nghiệm, kỹ năng cụ thể..."
              value={form.requirements} onChange={v => set("requirements", v)}
              maxLength={3000} rows={5}
            />
            <RichTextArea
              label="Phúc lợi"
              placeholder="Bảo hiểm, thưởng, du lịch, đào tạo..."
              value={form.benefits} onChange={v => set("benefits", v)}
              maxLength={2000} rows={4}
              hint="Phúc lợi hấp dẫn giúp tăng tỷ lệ ứng tuyển lên 35%"
            />
          </div>
        </PostSection>

        {/* ── Actions ─────────── */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {/* Lưu nháp — chỉ hiển thị khi đang là draft */}
          {isDraft && (
            <button type="button" disabled={isBusy}
              onClick={() => handleSubmit(false)}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm
                font-semibold text-blue-600 bg-white border border-blue-200 rounded-2xl
                hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50 transition-all">
              {saving === "draft"
                ? <span className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                : null}
              {saving === "draft" ? "Đang lưu..." : "Lưu nháp"}
            </button>
          )}

          {/* Lưu thay đổi — hiển thị khi đã published */}
          {!isDraft && (
            <button type="button" disabled={isBusy}
              onClick={() => handleSubmit(false)}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm
                font-semibold text-blue-600 bg-white border border-blue-200 rounded-2xl
                hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50 transition-all">
              {saving === "draft"
                ? <span className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                : null}
              {saving === "draft" ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          )}

          <button type="button" disabled={isBusy}
            onClick={() => handleSubmit(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm
              font-semibold text-white bg-blue-600 rounded-2xl hover:bg-blue-700
              disabled:opacity-50 transition-all shadow-sm">
            {saving === "publish"
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <ChevronRight size={16} />}
            {saving === "publish"
              ? "Đang lưu..."
              : isDraft ? "Lưu & Đăng tin" : "Cập nhật & Đăng lại"}
          </button>
        </div>

      </div>
    </div>
  );
}