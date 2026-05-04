// src/app/(employer)/jobs/post/page.tsx
"use client";
import { useState, useCallback }         from "react";
import {
  Briefcase, MonitorSmartphone, MapPin,
  DollarSign, Heart, UserCheck, ClipboardList,
  Wrench, FileText,
} from "lucide-react";
import { DashboardLayout }               from "@/presentation/components/layout/profile/DashboardLayout";
import { useToast }                      from "@/presentation/components/ui/toast";
import {
  FormInput, FormSelect, Checkbox, Radio, TagChip, PostSection, inputCls,
} from "@/presentation/components/job-post/shared";
import {
  JobPostForm, EMPTY_FORM, WORK_TYPES, BENEFIT_OPTIONS,
  GENDER_OPTIONS, EXP_OPTIONS, SOFT_SKILLS, LANG_LEVELS, LEVEL_OPTIONS,
} from "@/presentation/components/job-post/jobPostTypes";

export default function PostingJobPage() {
  const toast = useToast();
  const [form, setForm] = useState<JobPostForm>(EMPTY_FORM);

  const set = <K extends keyof JobPostForm>(key: K, val: JobPostForm[K]) =>
    setForm(p => ({ ...p, [key]: val }));

  // Toggle array item
  const toggle = (key: keyof JobPostForm, val: string) => {
    const arr = form[key] as string[];
    set(key, (arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]) as JobPostForm[typeof key]);
  };

  // Add / remove tag chips
  const addTag = (key: keyof JobPostForm, val: string, clearKey?: keyof JobPostForm) => {
    if (!val.trim()) return;
    const arr = form[key] as string[];
    if (!arr.includes(val)) set(key, [...arr, val] as JobPostForm[typeof key]);
    if (clearKey) set(clearKey, "" as JobPostForm[typeof clearKey]);
  };

  const handleSave = useCallback(async () => {
    if (!form.title) { toast.error("Thiếu thông tin", "Vui lòng nhập chức danh công việc."); return; }
    // TODO: call service.createJobPost(form)
    toast.success("Đã lưu", "Tin tuyển dụng đã được lưu thành công.");
  }, [form, toast]);

  // ──────

  return (
    <DashboardLayout activeHref="/jobs/post" topbarTitle="Đăng Tin Tuyển Dụng">
      <div className="max-w-2xl mx-auto flex flex-col gap-5 pb-10">

        {/* ── 1. Giới thiệu công việc  */}
        <PostSection icon={<Briefcase size={16} />} title="Giới thiệu công việc">
          <div className="flex flex-col gap-4">
            <FormInput label="Chức danh công việc" required placeholder="Thiết kế giao diện người dùng (UI Designer)"
              value={form.title} onChange={e => set("title", e.target.value)} />
            <FormInput label="Danh mục công việc" required placeholder="Vui lòng nhập danh mục công việc của bạn"
              value={form.category} onChange={e => set("category", e.target.value)} />
            <FormInput label="Lĩnh vực hoạt động" required placeholder="Vui lòng nhập lĩnh vực hoạt động của công ty bạn"
              value={form.industry} onChange={e => set("industry", e.target.value)} />
            <FormSelect label="Cấp bậc nhân sự" required value={form.level} onChange={e => set("level", e.target.value)}>
              <option value="">Vui lòng nhập cấp bậc nhân sự</option>
              {LEVEL_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </FormSelect>
          </div>
        </PostSection>

        {/* ── 2. Hình thức làm việc ── */}
        <PostSection icon={<MonitorSmartphone size={16} />} title="Hình thức làm việc">
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
              {WORK_TYPES.map(t => (
                <Checkbox key={t} label={t} checked={form.workTypes.includes(t)}
                  onChange={() => toggle("workTypes", t)} />
              ))}
            </div>
            {form.workTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {form.workTypes.map(t => (
                  <TagChip key={t} label={t} onRemove={() => toggle("workTypes", t)} />
                ))}
              </div>
            )}
          </div>
        </PostSection>

        {/* ── 3. Địa điểm làm việc ── */}
        <PostSection icon={<MapPin size={16} />} title="Địa điểm làm việc">
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Quốc gia" required value={form.country} onChange={e => set("country", e.target.value)} />
            <FormInput label="Thành phố" required value={form.city} onChange={e => set("city", e.target.value)} />
          </div>
          {(form.country || form.city) && (
            <div className="flex flex-wrap gap-2 mt-3">
              <TagChip label={[form.country, form.city].filter(Boolean).join(" / ")}
                onRemove={() => { set("country", ""); set("city", ""); }} />
            </div>
          )}
        </PostSection>

        {/* ── 4. Mức lương & Phúc lợi ───────────── */}
        <PostSection icon={<DollarSign size={16} />} title="Mức lương & Phúc lợi">
          <div className="flex flex-col gap-4">
            <div>
              <FormInput label="Mức lương tối thiểu" required placeholder="Nhập"
                value={form.minSalary} onChange={e => set("minSalary", e.target.value)} />
              <p className="text-[11px] text-gray-400 mt-1">Đơn vị tính: VNĐ / Tháng</p>
              <button className="text-xs text-blue-500 hover:underline mt-0.5">
                Mức lương hợp lý cho lĩnh vực này là bao nhiêu?
              </button>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <div onClick={() => set("showSalary", !form.showSalary)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                  ${form.showSalary ? "border-blue-600 bg-blue-600" : "border-gray-300"}`}>
                {form.showSalary && (
                  <svg viewBox="0 0 12 12" className="w-3 h-3">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-700">Hiển thị mức lương trên tin tuyển dụng</span>
            </label>
            {form.showSalary && (
              <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-xl -mt-1">
                Các tin tuyển dụng công khai mức lương minh bạch thường nhận được số lượng hồ sơ cao hơn trung bình 45%.
              </p>
            )}
            {form.minSalary && (
              <div className="flex flex-wrap gap-2">
                <TagChip label={`${form.minSalary} VNĐ`} onRemove={() => set("minSalary", "")} />
              </div>
            )}
          </div>
        </PostSection>

        {/* ── 5. Phúc lợi mong muốn  */}
        <PostSection icon={<Heart size={16} />} title="Phúc lợi mong muốn">
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
              {BENEFIT_OPTIONS.map(b => (
                <Checkbox key={b} label={b} checked={form.benefits.includes(b)}
                  onChange={() => toggle("benefits", b)} />
              ))}
            </div>
            {form.benefits.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {form.benefits.map(b => <TagChip key={b} label={b} onRemove={() => toggle("benefits", b)} />)}
              </div>
            )}
          </div>
        </PostSection>

        {/* ── 6. Điều kiện ứng tuyển ────────────── */}
        <PostSection icon={<UserCheck size={16} />} title="Điều kiện ứng tuyển">
          <div className="flex flex-col gap-5">
            {/* Age */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Độ tuổi tối thiểu" required placeholder="21 tuổi"
                value={form.minAge} onChange={e => set("minAge", e.target.value)} />
              <FormInput label="Độ tuổi tối đa" placeholder="Input"
                value={form.maxAge} onChange={e => set("maxAge", e.target.value)} />
            </div>
            {form.minAge && (
              <div className="flex flex-wrap gap-2">
                <TagChip label={`${form.minAge} tuổi`} onRemove={() => set("minAge", "")} />
              </div>
            )}

            {/* Gender */}
            <div>
              <p className="text-xs font-medium text-gray-700 mb-2.5">Giới tính</p>
              <div className="flex gap-6">
                {GENDER_OPTIONS.map(g => (
                  <Checkbox key={g} label={g} checked={form.genders.includes(g)}
                    onChange={() => toggle("genders", g)} />
                ))}
              </div>
              {form.genders.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.genders.map(g => <TagChip key={g} label={g} onRemove={() => toggle("genders", g)} />)}
                </div>
              )}
            </div>
          </div>
        </PostSection>

        {/* ── 7. Kinh nghiệm làm việc ───────────── */}
        <PostSection icon={<ClipboardList size={16} />} title="Kinh nghiệm làm việc">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
              {EXP_OPTIONS.map(e => (
                <Radio key={e} label={e} checked={form.experience === e} onChange={() => set("experience", e)} />
              ))}
            </div>
            {form.experience && (
              <div className="flex flex-wrap gap-2">
                <TagChip label={form.experience} onRemove={() => set("experience", "")} />
              </div>
            )}
            <textarea
              value={form.expNote}
              onChange={e => set("expNote", e.target.value)}
              placeholder="Ưu tiên có kinh nghiệm bán hàng, trung tâm thương mại hoặc cửa hàng"
              rows={2}
              className={inputCls + " resize-none"}
            />
            <Checkbox label="Chấp nhận thực tập sinh và người mới bắt đầu"
              checked={form.acceptIntern} onChange={v => set("acceptIntern", v)} />
            {form.expNote && (
              <div className="flex flex-wrap gap-2">
                <TagChip label={form.expNote.slice(0, 40) + (form.expNote.length > 40 ? "..." : "")}
                  onRemove={() => set("expNote", "")} />
              </div>
            )}
          </div>
        </PostSection>

        {/* ── 8. Yêu cầu bổ sung ─── */}
        <PostSection icon={<ClipboardList size={16} />} title="Yêu cầu bổ sung">
          <div className="flex flex-col gap-4">
            <Checkbox label="Yêu cầu kiểm tra lý lịch"
              checked={form.bgCheck} onChange={v => set("bgCheck", v)} />
            <Checkbox label="Có thể tuyển dụng người khuyết tật"
              checked={form.acceptDisabled} onChange={v => set("acceptDisabled", v)} />
            {form.acceptDisabled && (
              <div className="flex flex-wrap gap-2">
                <TagChip label="Có thể tuyển dụng người khuyết tật" onRemove={() => set("acceptDisabled", false)} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Ngành học" required placeholder="UI/UX"
                value={form.majors[0] ?? ""}
                onChange={e => set("majors", e.target.value ? [e.target.value] : [])} />
              <FormInput label="Trình độ học vấn" required placeholder="Công nghệ thông tin, Cử nhân"
                value={form.education} onChange={e => set("education", e.target.value)} />
            </div>
            {(form.majors.length > 0 || form.education) && (
              <div className="flex flex-wrap gap-2">
                {form.majors.map(m => <TagChip key={m} label={m} onRemove={() => set("majors", [])} />)}
                {form.education && <TagChip label={form.education} onRemove={() => set("education", "")} />}
              </div>
            )}
          </div>
        </PostSection>

        {/* ── 9. Kỹ năng ─────────── */}
        <PostSection icon={<Wrench size={16} />} title="Kỹ năng">
          <div className="flex flex-col gap-5">
            {/* Ngôn ngữ */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-3">Ngôn ngữ</p>
              <div className="grid grid-cols-2 gap-3">
                <FormInput label="Ngôn ngữ" required placeholder="Tiếng Anh"
                  value={form.langName} onChange={e => set("langName", e.target.value)} />
                <FormSelect label="Mức độ thông thạo" required value={form.langLevel}
                  onChange={e => set("langLevel", e.target.value)}>
                  <option value="">Nâng cao</option>
                  {LANG_LEVELS.map(l => <option key={l}>{l}</option>)}
                </FormSelect>
              </div>
              <button className="mt-2 text-xs text-blue-500 hover:underline"
                onClick={() => addTag("softSkills", `${form.langName} / ${form.langLevel}`, "langName")}>
                + Thêm ngôn ngữ
              </button>
            </div>

            {/* Phần mềm */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-3">Phần mềm</p>
              <div className="grid grid-cols-2 gap-3">
                <FormInput label="Lĩnh vực" required placeholder="Phần mềm đồ họa"
                  value={form.softName} onChange={e => set("softName", e.target.value)} />
                <FormSelect label="Trình độ thành thạo" required value={form.softLevel}
                  onChange={e => set("softLevel", e.target.value)}>
                  <option value="">Sơ cấp</option>
                  {LANG_LEVELS.map(l => <option key={l}>{l}</option>)}
                </FormSelect>
              </div>
              <button className="mt-2 text-xs text-blue-500 hover:underline"
                onClick={() => addTag("softSkills", `${form.softName} / ${form.softLevel}`, "softName")}>
                + Thêm phần mềm
              </button>
            </div>

            {/* Giao tiếp */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-3">Giao tiếp</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
                {SOFT_SKILLS.map(s => (
                  <Checkbox key={s} label={s} checked={form.softSkills.includes(s)}
                    onChange={() => toggle("softSkills", s)} />
                ))}
              </div>
            </div>

            {/* All skill tags */}
            {form.softSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-50">
                {form.softSkills.map(s => <TagChip key={s} label={s} onRemove={() => toggle("softSkills", s)} />)}
              </div>
            )}
          </div>
        </PostSection>

        {/* ── 10. Mô tả công việc ── */}
        <PostSection icon={<FileText size={16} />} title="Mô tả công việc">
          <div className="flex flex-col gap-4">
            <FormInput label="Ngày & Giờ làm việc" required placeholder="Thứ Hai - Thứ Sáu 8:30 đến 17:30 PM"
              value={form.workSchedule} onChange={e => set("workSchedule", e.target.value)} />
            {form.workSchedule && (
              <div className="flex flex-wrap gap-2">
                <TagChip label={form.workSchedule} onRemove={() => set("workSchedule", "")} />
              </div>
            )}
            <FormInput label="Yêu cầu đi công tác" required placeholder="Một ngày mỗi tháng"
              value={form.travelReq} onChange={e => set("travelReq", e.target.value)} />
            {form.travelReq && (
              <div className="flex flex-wrap gap-2">
                <TagChip label={form.travelReq} onRemove={() => set("travelReq", "")} />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                Mô tả công việc & Kỹ năng yêu cầu<span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <textarea
                  value={form.description}
                  onChange={e => set("description", e.target.value.slice(0, 512))}
                  rows={6}
                  placeholder="Mô tả công việc chi tiết..."
                  className={inputCls + " resize-none pr-16"}
                />
                <span className="absolute bottom-3 right-3 text-[11px] text-gray-400">
                  {form.description.length}/512
                </span>
              </div>
            </div>
          </div>
        </PostSection>

        {/* ── Save button ─────────── */}
        <button
          onClick={handleSave}
          className="w-full py-3.5 bg-blue-500 text-white text-sm font-semibold rounded-2xl
            hover:bg-blue-800 transition-colors shadow-sm"
        >
          Lưu
        </button>
      </div>
    </DashboardLayout>
  );
}