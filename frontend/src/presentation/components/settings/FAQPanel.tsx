// src/presentation/components/settings/FAQPanel.tsx
import { FAQAccordion } from "./FAQAccordion";

const FAQS = [
  {
    question: "Tại sao thông tin của tôi không hiển thị ở đây?",
    answer:   "Chúng tôi đang ẩn một số thông tin tài khoản để bảo vệ danh tính của bạn. Điều này giúp đảm bảo tài khoản của bạn được an toàn khỏi các truy cập trái phép.",
  },
  {
    question: "Những thông tin nào có thể chỉnh sửa?",
    answer:   "Thông tin Joblin sử dụng để xác minh danh tính của bạn không thể thay đổi. Thông tin liên hệ và một số thông tin cá nhân có thể được chỉnh sửa, nhưng chúng tôi có thể yêu cầu bạn xác minh danh tính vào lần ứng tuyển tiếp theo.",
  },
];

export function FAQPanel() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 flex flex-col gap-3">
        {FAQS.map(f => <FAQAccordion key={f.question} {...f} />)}
      </div>
    </div>
  );
}