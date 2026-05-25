"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useInView } from "./useInView";

// ── Motto Section (Image 1 — trên) ───────────────────────────────────────────
function MottoSection() {
  const { ref, inView } = useInView();

  return (
    <section
      ref={ref}
      className="relative overflow-hidden"
      style={{ minHeight: 280 }}
    >
      {/* Background: real team photo */}
      <div className="absolute inset-0">
        <img
          src="/banners/team-1.png"
          alt="Team background"
          className="w-full h-full object-cover object-center"
          draggable={false}
        />
        {/* Blue gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700/80 via-blue-600/60 to-blue-500/40" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-8 drop-shadow"
        >
          Chúng tôi không chỉ là nơi làm việc.<br />
          Chúng tôi là một gia đình.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Link
            href="/about"
            className="inline-block px-8 py-3.5 bg-sky-400 hover:bg-sky-500 text-white font-semibold rounded-lg transition-colors text-[16px] shadow-lg"
          >
            Tham gia cùng chúng tôi
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ── Team Section (Image 2 — dưới, nền xanh đậm) ──────────────────────────────
const DEPARTMENTS = [
  {
    title: "Kỹ thuật & Công nghệ",
    desc: "Tham gia xây dựng và tối ưu hóa hệ thống hạ tầng quy mô lớn. Bạn sẽ được phát triển các sản phẩm đột phá, ứng dụng công nghệ tiên tiến để mang lại trải nghiệm tốt nhất cho hàng triệu người dùng.",
  },
  {
    title: "Nhân sự",
    desc: "Tập trung vào sứ mệnh thu hút, phát triển và giữ chân các tài năng xuất chúng. Đội ngũ sẽ cùng nhau xây dựng văn hóa gắn kết, duy trì môi trường làm việc lý tưởng và hạnh phúc.",
  },
  {
    title: "Kinh doanh, Dịch vụ & Hỗ trợ",
    desc: "Cầu nối chiến lược giúp mang lại giải pháp tối ưu và giá trị bền vững cho khách hàng. Bạn sẽ tham gia mở rộng thị trường, tư vấn chuyên sâu và thúc đẩy doanh thu mạnh mẽ cho doanh nghiệp.",
  },
  {
    title: "Marketing",
    desc: "Sáng tạo và thực thi các chiến dịch truyền thông bứt phá trên mọi nền tảng. Bạn sẽ chịu trách nhiệm định vị thương hiệu, phân tích thị trường và kết nối sản phẩm đến đúng khách hàng mục tiêu.",
  },
];

function PeopleIllustration() {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden relative min-h-[320px]">
      <img
        src="/banners/team-2.png"
        alt="Team members"
        className="w-full h-full object-cover object-top"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-blue-950/50 to-transparent" />
    </div>
  );
}

function TeamSection() {
  const { ref, inView } = useInView();

  return (
    <section ref={ref} className="py-16 sm:py-20 bg-[#004EB7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="flex items-center justify-between mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Tìm kiếm đội ngũ của bạn
          </h2>
          <Link
            href="/companies"
            className="hidden sm:inline-flex items-center gap-2 text-white font-semibold text-[16px] hover:text-blue-300 transition-colors"
          >
            Xem tất cả đội ngũ <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Content: illustration + departments grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left: illustration */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 min-h-[320px] lg:min-h-0"
          >
            <PeopleIllustration />
          </motion.div>

          {/* Right: 2x2 departments */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
            {DEPARTMENTS.map((dept, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
              >
                <h3 className="font-extrabold text-white text-base sm:text-lg mb-3">
                  {dept.title}
                </h3>
                <p className="text-white/50 text-[16px] leading-relaxed">
                  {dept.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile "Xem tất cả" */}
        <div className="sm:hidden text-center mt-10">
          <Link
            href="/companies"
            className="inline-flex items-center gap-2 text-white font-semibold text-[16px]"
          >
            Xem tất cả đội ngũ <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}

// ── Export combined ───────────────────────────────────────────────────────────
export function MottoAndTeamSection() {
  return (
    <>
      <MottoSection />
      <TeamSection />
    </>
  );
}