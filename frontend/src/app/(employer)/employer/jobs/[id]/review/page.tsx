// src/app/(employer)/jobs/[id]/review/page.tsx
"use client";
import { useState }              from "react";
import {
  Briefcase, MonitorSmartphone, MapPin,
  DollarSign, Heart, UserCheck, ClipboardList,
  Wrench, FileText,
} from "lucide-react";
import { DashboardLayout }       from "@/presentation/components/layout/profile/DashboardLayout";
import { PostSection, TagChip }  from "@/presentation/components/job-post/shared";
import { useToast }              from "@/presentation/components/ui/toast";

// Mock — thay bằng service.getJobPost(id)
const MOCK_JOB = {
  title:        "UI Designer",
  workType:     "Full-time",
  level:        "Chuyên viên",
  location:     "Hà Nội",
  category:     "UX Designer",
  workTypes:    ["Full-time", "Làm việc từ xa"],
  locationFull: "Hà Nội / Việt Nam",
  salary:       "10 triệu VNĐ",
  showSalary:   true,
  benefits:     ["Cơ hội thăng tiến", "Bảo hiểm"],
  minAge:       "21 tuổi",
  gender:       ["Nữ"],
  experience:   "Dưới 1 năm",
  expNote:      "Ưu tiên có kinh nghiệm bán hàng, trung tâm thương mại hoặc cửa hàng",
  additionalReqs: ["Có thể tuyển dụng người khuyết tật"],
  majors:       ["UI/UX", "Công nghệ thông tin, Cử nhân"],
  skills:       ["Tiếng Anh / Nâng cao", "Phần mềm đồ họa / Sơ cấp", "Kỹ năng phối hợp", "Quản lý thời gian"],
  workSchedule: "Thứ Hai - Thứ Sáu 8:30 đến 17:30 PM",
  travelReq:    "Một ngày mỗi tháng",
  description:  "Chúng tôi tận tâm vì sự đổi mới và xuất sắc. Sứ mệnh của chúng tôi là cung cấp các sản phẩm và dịch vụ chất lượng cao nhằm nâng cao đời sống hàng ngày. Với đội ngũ chuyên gia đầy nhiệt huyết, chúng tôi không ngừng phá vỡ các giới hạn của sự sáng tạo và công nghệ. Sự hài lòng của khách hàng là cốt lõi trong mọi hoạt động của chúng tôi. Chúng tôi tin tưởng vào sự bền vững, hiệu quả và mang lại giá trị vượt trội. Hãy tham gia cùng chúng tôi để cùng nhau kiến tạo tương lai.",
};

function ReadField({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

function TagRow({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(item => (
        <span key={item}
          className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full border border-gray-200">
          {item}
        </span>
      ))}
    </div>
  );
}

export default function JobReviewPage() {
  const toast = useToast();
  const job   = MOCK_JOB;

  const handleSave = async () => {
    // TODO: call service.publishJob(id)
    toast.success("Đã đăng tin", "Tin tuyển dụng đã được đăng thành công.");
  };

  // Each section navigates to edit form on click
  const goEdit = (section: string) => () => {
    // TODO: router.push(`/jobs/post?section=${section}`)
  };

  return (
    <DashboardLayout activeHref="/jobs/post" topbarTitle="Đăng Tin Tuyển Dụng">
      <div className="max-w-2xl mx-auto flex flex-col gap-5 pb-10">

        {/* ── 1. Giới thiệu ────────────────────────────────────── */}
        <PostSection icon={<Briefcase size={16} />} title="Giới thiệu công việc" onEdit={goEdit("intro")}>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <ReadField label="Chức danh công việc" value={job.title} />
            <ReadField label="Địa điểm"            value={job.location} />
            <ReadField label="Hình thức làm việc"  value={job.workType} />
            <ReadField label="Danh mục công việc"  value={job.category} />
            <ReadField label="Cấp bậc nhân sự"     value={job.level} />
          </div>
        </PostSection>

        {/* ── 2. Hình thức ────────────────────────────────────── */}
        <PostSection icon={<MonitorSmartphone size={16} />} title="Hình thức làm việc" onEdit={goEdit("workType")}>
          <TagRow items={job.workTypes} />
        </PostSection>

        {/* ── 3. Địa điểm ──────────────────────────────────────  */}
        <PostSection icon={<MapPin size={16} />} title="Địa điểm làm việc" onEdit={goEdit("location")}>
          <TagRow items={[job.locationFull]} />
        </PostSection>

        {/* ── 4. Lương ─────────────────────────────────────────  */}
        <PostSection icon={<DollarSign size={16} />} title="Mức lương & Phúc lợi" onEdit={goEdit("salary")}>
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-gray-800">{job.salary}</p>
            {job.showSalary && (
              <p className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-xl">
                Hiển thị mức lương trên tin tuyển dụng
              </p>
            )}
          </div>
        </PostSection>

        {/* ── 5. Phúc lợi ─────────────────────────────────────── */}
        <PostSection icon={<Heart size={16} />} title="Phúc lợi mong muốn" onEdit={goEdit("benefits")}>
          <TagRow items={job.benefits} />
        </PostSection>

        {/* ── 6. Điều kiện ─────────────────────────────────────── */}
        <PostSection icon={<UserCheck size={16} />} title="Điều kiện ứng tuyển" onEdit={goEdit("conditions")}>
          <div className="flex flex-col gap-3">
            <TagRow items={[job.minAge]} />
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Gender</p>
              <TagRow items={job.gender} />
            </div>
          </div>
        </PostSection>

        {/* ── 7. Kinh nghiệm ───────────────────────────────────── */}
        <PostSection icon={<ClipboardList size={16} />} title="Kinh nghiệm làm việc" onEdit={goEdit("experience")}>
          <div className="flex flex-col gap-3">
            <TagRow items={[job.experience]} />
            {job.expNote && <p className="text-xs text-gray-500">{job.expNote}</p>}
          </div>
        </PostSection>

        {/* ── 8. Yêu cầu bổ sung ───────────────────────────────── */}
        <PostSection icon={<ClipboardList size={16} />} title="Yêu cầu bổ sung" onEdit={goEdit("additional")}>
          <div className="flex flex-col gap-3">
            <TagRow items={job.additionalReqs} />
            <TagRow items={job.majors} />
          </div>
        </PostSection>

        {/* ── 9. Kỹ năng ───────────────────────────────────────── */}
        <PostSection icon={<Wrench size={16} />} title="Kỹ năng" onEdit={goEdit("skills")}>
          <div className="flex flex-col gap-2">
            {job.skills.map((s, i) => (
              <span key={i} className="text-xs text-gray-700 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 w-fit">
                {s}
              </span>
            ))}
          </div>
        </PostSection>

        {/* ── 10. Mô tả ────────────────────────────────────────── */}
        <PostSection icon={<FileText size={16} />} title="Mô tả công việc" onEdit={goEdit("description")}>
          <div className="flex flex-col gap-3">
            <TagRow items={[job.workSchedule]} />
            <TagRow items={[job.travelReq]} />
            <p className="text-sm text-gray-700 leading-relaxed">{job.description}</p>
          </div>
        </PostSection>

        {/* ── Save ─────────────────────────────────────────────── */}
        <button
          onClick={handleSave}
          className="w-full py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-2xl
            hover:bg-gray-800 transition-colors shadow-sm"
        >
          Lưu
        </button>
      </div>
    </DashboardLayout>
  );
}