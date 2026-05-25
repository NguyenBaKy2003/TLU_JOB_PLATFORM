"use client";
import { motion } from "framer-motion";
import { useInView } from "./useInView";

const STEPS = [
  {
    number: 1,
    title: "Tạo tài khoản",
    desc: "Bắt đầu hành trình của bạn ngay hôm nay chỉ với vài bước đăng ký đơn giản.",
  },
  {
    number: 2,
    title: "Tải lên CV / Hồ sơ",
    desc: "Tải lên CV của bạn một cách dễ dàng để tiếp cận với nhà tuyển dụng.",
  },
  {
    number: 3,
    title: "Tìm việc phù hợp",
    desc: "Khám phá những công việc tốt nhất được gợi ý riêng cho kỹ năng của bạn.",
  },
  {
    number: 4,
    title: "Ứng tuyển công việc",
    desc: "Ứng tuyển nhanh chóng chỉ với một cú click chuột và chờ phản hồi từ HR.",
  },
];

export function HowItWorksSection() {
  const { ref, inView } = useInView();

  return (
    <section ref={ref} className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-700 mb-4">
            Các bước chinh phục công việc mơ ước
          </h2>
          <p className="text-gray-400 text-[16px] sm:text-base">
            Những cơ hội việc làm mới nhất vừa được cập nhật
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-blue-100/70 rounded-2xl px-6 pt-5 pb-7 relative"
            >
              {/* Step number badge */}
              <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center mb-5">
                <span className="text-blue-600 font-extrabold text-base">{step.number}</span>
              </div>

              <h3 className="font-extrabold text-gray-900 text-base mb-2">
                {step.title}
              </h3>
              <p className="text-gray-500 text-[16px] leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}