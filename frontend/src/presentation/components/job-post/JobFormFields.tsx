"use client";
import {
  Briefcase, MapPin, DollarSign, Users,
  Wrench, FileText, AlertCircle, Star,
} from "lucide-react";
import { PostSection } from "./shared";
import { RichTextArea } from "./RichTextArea";
import { SkillsInput } from "./SkillsInput";
import type { JobPostForm, JobType, JobLevel, WorkLocType, JobSkill } from "@/domain/models/Job";

// ── Helpers ───────────────────────────────────────────────────────────────────

export const inputCls =
  "w-full px-3 py-2.5 text-[16px] border border-gray-200 rounded-xl bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 " +
  "placeholder:text-gray-300 text-gray-800 transition-all";

// ── Field ─────────────────────────────────────────────────────────────────────

export function Field({
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

// ── SegmentedControl ──────────────────────────────────────────────────────────

export function SegmentedControl<T extends string>({
  options, value, onChange, cols = 3,
}: {
  options: { value: T; label: string }[];
  value: T | "";
  onChange: (v: T) => void;
  cols?: number;
}) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {options.map(o => (
        <button
          key={o.value} type="button" onClick={() => onChange(o.value)}
          className={`py-2.5 px-3 text-[16px] font-medium rounded-xl border transition-all
            ${value === o.value
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"
            }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Featured Toggle ───────────────────────────────────────────────────────────

export function FeaturedToggle({
  checked, onChange, disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
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
        <p className={`text-[16px] font-semibold leading-tight ${checked ? "text-amber-700" : "text-gray-700"}`}>
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

// ── JobFormFields (Main Component) ────────────────────────────────────────────

interface JobFormFieldsProps {
  form: JobPostForm;
  errors: Partial<Record<keyof JobPostForm, string>>;
  onChange: <K extends keyof JobPostForm>(key: K, val: JobPostForm[K]) => void;
  options: {
    jobTypes: { value: JobType; label: string }[];
    levels: { value: JobLevel; label: string }[];
    workLocs: { value: WorkLocType; label: string }[];
  };
  // ✅ Featured toggle props
  featured?: boolean;
  onFeaturedChange?: (v: boolean) => void;
  showFeatured?: boolean;
  isBusy?: boolean;
}

export function JobFormFields({ 
  form, errors, onChange, options,
  featured = false,
  onFeaturedChange,
  showFeatured = false,
  isBusy = false,
}: JobFormFieldsProps) {
  return (
    <div className="flex flex-col gap-5">

      {/* ── 1. Giới thiệu ─────────────────────────────────── */}
      <PostSection icon={<Briefcase size={16} />} title="Giới thiệu công việc">
        <div className="flex flex-col gap-4">
          <Field label="Tiêu đề công việc" required error={errors.title}>
            <input
              value={form.title}
              onChange={e => onChange("title", e.target.value)}
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
              onChange={e => onChange("category", e.target.value)}
              placeholder="VD: Công nghệ thông tin"
              className={inputCls}
            />
          </Field>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-gray-700">Hình thức làm việc</p>
            <SegmentedControl
              options={options.jobTypes} value={form.jobType}
              onChange={v => onChange("jobType", v)} cols={4}
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-gray-700">Cấp bậc</p>
            <SegmentedControl
              options={options.levels} value={form.level}
              onChange={v => onChange("level", v)} cols={3}
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
              options={options.workLocs} value={form.workLocationType}
              onChange={v => onChange("workLocationType", v)} cols={3}
            />
          </div>
          {form.workLocationType !== "REMOTE" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Thành phố">
                <input
                  value={form.workLocationCity}
                  onChange={e => onChange("workLocationCity", e.target.value)}
                  placeholder="Hà Nội"
                  className={inputCls}
                />
              </Field>
              <Field label="Địa chỉ cụ thể">
                <input
                  value={form.workLocationAddress}
                  onChange={e => onChange("workLocationAddress", e.target.value)}
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
              onChange={e => onChange("salaryNegotiable", e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 accent-blue-600"
            />
            <span className="text-[16px] text-gray-700">Mức lương thoả thuận</span>
          </label>

          {!form.salaryNegotiable && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Lương tối thiểu">
                <div className="relative">
                  <input
                    type="number" value={form.salaryMin} min={0}
                    onChange={e => onChange("salaryMin", e.target.value)}
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
                    onChange={e => onChange("salaryMax", e.target.value)}
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
                  onChange={e => onChange("salaryCurrency", e.target.value)}
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
              onChange={e => onChange("experienceYears", e.target.value)}
              placeholder="0"
              className={inputCls}
            />
          </Field>
          <Field label="Số lượng tuyển" required error={errors.vacancies}>
            <input
              type="number" value={form.vacancies} min={1}
              onChange={e => onChange("vacancies", e.target.value)}
              placeholder="1"
              className={inputCls}
            />
          </Field>
          <Field label="Hạn nộp CV" required error={errors.deadline}>
            <input
              type="date" value={form.deadline}
              onChange={e => onChange("deadline", e.target.value)}
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
          onChange={(skills: JobSkill[]) => onChange("skills", skills)}
        />
      </PostSection>

      {/* ── 6. Mô tả ──────────────────────────────────────── */}
      <PostSection icon={<FileText size={16} />} title="Mô tả & Yêu cầu">
        <div className="flex flex-col gap-5">
          <RichTextArea
            label="Mô tả công việc" required
            placeholder="Mô tả chi tiết về vị trí, trách nhiệm hàng ngày..."
            value={form.description}
            onChange={v => onChange("description", v)}
            minLength={100} maxLength={5000} rows={7}
            error={errors.description}
            hint="Tối thiểu 100 ký tự — mô tả rõ ràng giúp thu hút đúng ứng viên"
          />
          <RichTextArea
            label="Yêu cầu ứng viên"
            placeholder="Bằng cấp, kinh nghiệm, kỹ năng cụ thể..."
            value={form.requirements}
            onChange={v => onChange("requirements", v)}
            maxLength={3000} rows={5}
          />
          <RichTextArea
            label="Phúc lợi"
            placeholder="Bảo hiểm, thưởng, du lịch, đào tạo..."
            value={form.benefits}
            onChange={v => onChange("benefits", v)}
            maxLength={2000} rows={4}
            hint="Phúc lợi hấp dẫn giúp tăng tỷ lệ ứng tuyển lên 35%"
          />
        </div>
      </PostSection>

      {/* ── 7. Tuỳ chọn đăng tin ─────────────────────────── */}
      {showFeatured && onFeaturedChange && (
        <PostSection icon={<Star size={16} />} title="Tuỳ chọn đăng tin">
          <FeaturedToggle
            checked={featured}
            onChange={onFeaturedChange}
            disabled={isBusy}
          />
        </PostSection>
      )}

    </div>
  );
}