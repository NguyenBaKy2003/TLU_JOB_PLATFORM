"use client";
import { useState, useCallback }  from "react";
import { useRouter }              from "next/navigation";
import {
  Briefcase, MapPin, DollarSign, Users,
  Wrench, FileText,
  ChevronRight, AlertCircle, Star,
} from "lucide-react";
import { PostSection }            from "@/presentation/components/job-post/shared";
import { useToast }               from "@/presentation/components/ui/toast";
import { JobService }             from "@/application/services/JobService";
import { JobRepository }          from "@/infrastructure/repositories/JobRepository";
import {
  EMPTY_JOB_FORM,
  JOB_TYPE_LABELS, JOB_LEVEL_LABELS, WORK_LOC_LABELS,
  type JobPostForm, type JobType, type JobLevel, type WorkLocType, type JobSkill,
} from "@/domain/models/Job";
import { extractErrorMessage }    from "@/lib/extractErrorMessage";
import { RichTextArea }           from "@/presentation/components/job-post/RichTextArea";
import { SkillsInput }            from "@/presentation/components/job-post/SkillsInput";

// ── Singleton ─────────────────────────────────────────────────────────────────

const jobService = new JobService(new JobRepository());

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 " +
  "placeholder:text-gray-300 text-gray-800 transition-all";

type Errors = Partial<Record<keyof JobPostForm, string>>;

function validate(form: JobPostForm): Errors {
  const e: Errors = {};
  if (!form.title.trim())
    e.title = "Tiêu đề không được để trống";
  if (form.title.length > 300)
    e.title = "Tiêu đề tối đa 300 ký tự";
  if (form.description.length > 0 && form.description.length < 100)
    e.description = "Mô tả phải có ít nhất 100 ký tự";
  if (!form.deadline)
    e.deadline = "Vui lòng chọn hạn nộp CV";
  if (form.deadline && new Date(form.deadline) <= new Date())
    e.deadline = "Hạn nộp CV phải là ngày trong tương lai";
  if (form.vacancies && (isNaN(Number(form.vacancies)) || Number(form.vacancies) < 1))
    e.vacancies = "Số lượng phải ≥ 1";
  if (
    !form.salaryNegotiable &&
    form.salaryMin &&
    form.salaryMax &&
    Number(form.salaryMin) > Number(form.salaryMax)
  )
    e.salaryMax = "Lương tối đa phải ≥ lương tối thiểu";
  return e;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Field({
  label, required, hint, error, children,
}: {
  label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-red-500 flex items-center gap-1">
          <AlertCircle size={11} />{error}
        </p>
      )}
      {hint && !error && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

function SegmentedControl<T extends string>({
  options, value, onChange, cols = 3,
}: {
  options: { value: T; label: string }[];
  value:   T | "";
  onChange:(v: T) => void;
  cols?:   number;
}) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {options.map(o => (
        <button
          key={o.value} type="button" onClick={() => onChange(o.value)}
          className={`py-2.5 px-3 text-sm font-medium rounded-xl border transition-all
            ${value === o.value
              ? "bg-blue-500 text-white border-blue-500 shadow-sm"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-800"
            }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Featured Toggle ───────────────────────────────────────────────────────────

function FeaturedToggle({
  checked, onChange, disabled,
}: {
  checked: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-left
        transition-all duration-200 disabled:opacity-50
        ${checked
          ? "border-amber-400 bg-amber-50"
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
        }
      `}
    >
      {/* Icon */}
      <div className={`
        shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors
        ${checked ? "bg-amber-400" : "bg-gray-100"}
      `}>
        <Star
          size={16}
          className={checked ? "text-white fill-white" : "text-gray-400"}
        />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-tight ${checked ? "text-amber-700" : "text-gray-700"}`}>
          Đăng tin nổi bật
        </p>
        <p className={`text-xs mt-0.5 ${checked ? "text-amber-600" : "text-gray-400"}`}>
          {checked
            ? "Bài đăng sẽ được ưu tiên hiển thị — tốn 1 lượt featured trong gói"
            : "Hiển thị ưu tiên, thu hút nhiều ứng viên hơn · Tốn 1 lượt featured"}
        </p>
      </div>

      {/* Pill toggle */}
      <div className={`
        shrink-0 w-11 h-6 rounded-full transition-colors duration-200 relative
        ${checked ? "bg-amber-400" : "bg-gray-200"}
      `}>
        <span className={`
          absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm
          transition-transform duration-200
          ${checked ? "translate-x-5" : "translate-x-0.5"}
        `} />
      </div>
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CreateJobPage() {
  const router = useRouter();
  const toast  = useToast();

  const [form,     setForm]     = useState<JobPostForm>(EMPTY_JOB_FORM);
  const [errors,   setErrors]   = useState<Errors>({});
  const [saving,   setSaving]   = useState<"draft" | "publish" | null>(null);
  const [featured, setFeatured] = useState(false);

  // ── Field updater ─────────────────────────────────────────────────────────

  const set = <K extends keyof JobPostForm>(key: K, val: JobPostForm[K]) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: undefined }));
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async (publish: boolean) => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Thiếu thông tin", "Vui lòng kiểm tra lại các trường bắt buộc.");
      return;
    }

    setSaving(publish ? "publish" : "draft");
    try {
      // featured chỉ có ý nghĩa khi publish, khi lưu nháp luôn false
      await jobService.createFromForm(form, publish, publish ? featured : false);
      toast.success(
        publish
          ? featured ? "Đã đăng tin nổi bật" : "Đã đăng tin tuyển dụng"
          : "Đã lưu nháp",
        publish
          ? featured
            ? "Tin nổi bật đang được ưu tiên hiển thị với ứng viên."
            : "Tin tuyển dụng đang hiển thị với ứng viên."
          : "Bạn có thể đăng tin sau.",
      );
      router.push("/employer/jobs");
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e, "Vui lòng thử lại."));
    } finally {
      setSaving(null);
    }
  }, [form, featured, router, toast]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const jobTypeOpts = Object.entries(JOB_TYPE_LABELS).map(([value, label]) => ({ value: value as JobType, label }));
  const levelOpts   = Object.entries(JOB_LEVEL_LABELS).map(([value, label]) => ({ value: value as JobLevel, label }));
  const locOpts     = Object.entries(WORK_LOC_LABELS).map(([value, label]) => ({ value: value as WorkLocType, label }));

  const isBusy    = saving !== null;
  const hasErrors = Object.keys(errors).length > 0;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto pb-12">

      {/* Error summary */}
      {hasErrors && (
        <div className="mb-4 flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-100
          rounded-2xl text-xs text-red-600">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          Vui lòng kiểm tra lại thông tin trước khi đăng tin.
        </div>
      )}

      <div className="flex flex-col gap-5">

        {/* ── 1. Giới thiệu ─────────────────────────────────── */}
        <PostSection icon={<Briefcase size={16} />} title="Giới thiệu công việc">
          <div className="flex flex-col gap-4">
            <Field label="Tiêu đề công việc" required error={errors.title}>
              <input
                value={form.title}
                onChange={e => set("title", e.target.value)}
                placeholder="VD: Senior Backend Developer (Java/Spring Boot)"
                maxLength={300}
                className={inputCls}
              />
              <span className="text-[11px] text-gray-400 text-right -mt-1">
                {form.title.length}/300
              </span>
            </Field>

            <Field label="Danh mục công việc">
              <input
                value={form.category}
                onChange={e => set("category", e.target.value)}
                placeholder="VD: Công nghệ thông tin"
                className={inputCls}
              />
            </Field>

            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-gray-700">Hình thức làm việc</p>
              <SegmentedControl
                options={jobTypeOpts} value={form.jobType}
                onChange={v => set("jobType", v)} cols={4}
              />
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-gray-700">Cấp bậc</p>
              <SegmentedControl
                options={levelOpts} value={form.level}
                onChange={v => set("level", v)} cols={3}
              />
            </div>
          </div>
        </PostSection>

        {/* ── 2. Địa điểm ───────────────────────────────────── */}
        <PostSection icon={<MapPin size={16} />} title="Địa điểm làm việc">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-gray-700">Hình thức</p>
              <SegmentedControl
                options={locOpts} value={form.workLocationType}
                onChange={v => set("workLocationType", v)} cols={3}
              />
            </div>
            {form.workLocationType !== "REMOTE" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Thành phố">
                  <input
                    value={form.workLocationCity}
                    onChange={e => set("workLocationCity", e.target.value)}
                    placeholder="Hà Nội"
                    className={inputCls}
                  />
                </Field>
                <Field label="Địa chỉ cụ thể">
                  <input
                    value={form.workLocationAddress}
                    onChange={e => set("workLocationAddress", e.target.value)}
                    placeholder="140 Nguyễn Trãi, Thanh Xuân"
                    className={inputCls}
                  />
                </Field>
              </div>
            )}
          </div>
        </PostSection>

        {/* ── 3. Mức lương ──────────────────────────────────── */}
        <PostSection icon={<DollarSign size={16} />} title="Mức lương">
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.salaryNegotiable}
                onChange={e => set("salaryNegotiable", e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-300 accent-blue-600"
              />
              <span className="text-sm text-gray-700">Mức lương thoả thuận</span>
            </label>

            {!form.salaryNegotiable && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Lương tối thiểu">
                  <div className="relative">
                    <input
                      type="number" value={form.salaryMin} min={0}
                      onChange={e => set("salaryMin", e.target.value)}
                      placeholder="20,000,000"
                      className={inputCls + " pr-12"}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      {form.salaryCurrency}
                    </span>
                  </div>
                </Field>
                <Field label="Lương tối đa" error={errors.salaryMax}>
                  <div className="relative">
                    <input
                      type="number" value={form.salaryMax} min={0}
                      onChange={e => set("salaryMax", e.target.value)}
                      placeholder="35,000,000"
                      className={inputCls + " pr-12"}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      {form.salaryCurrency}
                    </span>
                  </div>
                </Field>
                <Field label="Đơn vị tiền tệ">
                  <select
                    value={form.salaryCurrency}
                    onChange={e => set("salaryCurrency", e.target.value)}
                    className={inputCls + " bg-white cursor-pointer"}
                  >
                    {["VND", "USD", "EUR", "JPY", "SGD"].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>
            )}
          </div>
        </PostSection>

        {/* ── 4. Điều kiện ──────────────────────────────────── */}
        <PostSection icon={<Users size={16} />} title="Điều kiện tuyển dụng">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Kinh nghiệm (năm)" hint="0 = chưa có kinh nghiệm">
              <input
                type="number" value={form.experienceYears} min={0} max={30}
                onChange={e => set("experienceYears", e.target.value)}
                placeholder="0"
                className={inputCls}
              />
            </Field>
            <Field label="Số lượng tuyển" required error={errors.vacancies}>
              <input
                type="number" value={form.vacancies} min={1}
                onChange={e => set("vacancies", e.target.value)}
                placeholder="1"
                className={inputCls}
              />
            </Field>
            <Field label="Hạn nộp CV" required error={errors.deadline}>
              <input
                type="date" value={form.deadline}
                onChange={e => set("deadline", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className={inputCls + " cursor-pointer"}
              />
            </Field>
          </div>
        </PostSection>

        {/* ── 5. Kỹ năng ────────────────────────────────────── */}
        <PostSection icon={<Wrench size={16} />} title="Kỹ năng yêu cầu">
          <SkillsInput
            skills={form.skills}
            onChange={(skills: JobSkill[]) => set("skills", skills)}
          />
        </PostSection>

        {/* ── 6. Mô tả ──────────────────────────────────────── */}
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

        {/* ── 7. Tuỳ chọn đăng tin ─────────────────────────── */}
        <PostSection icon={<Star size={16} />} title="Tuỳ chọn đăng tin">
          <FeaturedToggle
            checked={featured}
            onChange={setFeatured}
            disabled={isBusy}
          />
        </PostSection>

        {/* ── Actions ───────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button" disabled={isBusy}
            onClick={() => handleSubmit(false)}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm
              font-semibold text-gray-700 bg-white border border-gray-200 rounded-2xl
              hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 transition-all"
          >
            {saving === "draft" && (
              <span className="w-4 h-4 border-2 border-gray-400/40 border-t-gray-600 rounded-full animate-spin" />
            )}
            {saving === "draft" ? "Đang lưu..." : "Lưu nháp"}
          </button>

          <button
            type="button" disabled={isBusy}
            onClick={() => handleSubmit(true)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 text-sm
              font-semibold text-white rounded-2xl disabled:opacity-50 transition-all shadow-sm
              ${featured
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-blue-500 hover:bg-blue-600"
              }
            `}
          >
            {saving === "publish" ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : featured ? (
              <Star size={15} className="fill-white" />
            ) : (
              <ChevronRight size={16} />
            )}
            {saving === "publish"
              ? "Đang đăng..."
              : featured
                ? "Đăng tin nổi bật"
                : "Đăng tin ngay"
            }
          </button>
        </div>

      </div>
    </div>
  );
}