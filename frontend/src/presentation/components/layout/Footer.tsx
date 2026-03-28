"use client";

import Link from "next/link";
import {
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  MapPin,
  Phone,
} from "lucide-react";

// lucide-react không có WhatsApp — giữ SVG inline riêng
function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SERVICES = [
  { label: "Tìm việc", href: "/jobs" },
  { label: "Tạo CV", href: "/cv" },
  { label: "Tìm công ty", href: "/companies" },
  { label: "Gói dịch vụ", href: "/pricing" },
];

const LINKS = [
  { label: "Blog", href: "/blog" },
  { label: "Trung tâm trợ giúp", href: "/help" },
  { label: "Liên hệ", href: "/contact" },
  { label: "Chính sách bảo mật", href: "/privacy" },
  { label: "Về chúng tôi", href: "/about" },
];

const SOCIALS = [
  { Icon: Instagram,    href: "#", label: "Instagram",   color: "hover:text-pink-500 hover:bg-pink-50" },
  { Icon: Facebook,     href: "#", label: "Facebook",    color: "hover:text-blue-600 hover:bg-blue-50" },
  { Icon: WhatsAppIcon, href: "#", label: "WhatsApp",    color: "hover:text-green-500 hover:bg-green-50" },
  { Icon: Linkedin,     href: "#", label: "LinkedIn",    color: "hover:text-blue-700 hover:bg-blue-50" },
  { Icon: Twitter,      href: "#", label: "X (Twitter)", color: "hover:text-gray-900 hover:bg-gray-100" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      {/* Main content */}
      <div className="max-w-[1232px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* ── Col 1: Brand ─────────────────────────────────────────────── */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <img src="/Logo.svg" alt="Job" className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Job là nền tảng tuyển dụng và tìm kiếm việc làm thông minh, giúp
              kết nối ứng viên với nhà tuyển dụng hàng đầu. Với bộ công cụ tìm
              kiếm nhanh, tính năng tạo CV chuyên nghiệp và thuật toán kết nối
              thông minh, Job giúp quá trình tuyển dụng trở nên dễ dàng và hiệu
              quả hơn bao giờ hết.
            </p>
            
          </div>

          {/* ── Col 2: Dịch vụ ───────────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Dịch vụ</h3>
            <ul className="space-y-2.5">
              {SERVICES.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3: Liên kết ──────────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Liên kết</h3>
            <ul className="space-y-2.5">
              {LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 4: Liên hệ ───────────────────────────────────────────── */}
          <div >
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Liên hệ với chúng mình
            </h3>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {SOCIALS.map(({ Icon, href, label, color }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 transition-all duration-150 ${color}`}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-gray-500">
                <MapPin size={16} className="text-blue-500  mt-0.5" />
                <span>140, Nguyễn Trãi, Hà Nội</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-500">
                <Phone size={16} className="text-blue-500 " />
                <span>1(647)558-5560</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────────────────── */}
      <div className="border-t border-gray-100">
        <div className="max-w-[308] mx-auto px-4 h-12 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Job Copyright © {new Date().getFullYear()}
          </p>

          {/* Payment badges */}
          <div className="flex items-center gap-1.5">
            <div className="h-6 px-2 rounded bg-[#1a1f71] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold italic tracking-wider">VISA</span>
            </div>
            <div className="h-6 px-2 rounded bg-[#635bff] flex items-center justify-center">
              <span className="text-white text-[10px] font-semibold">stripe</span>
            </div>
            <div className="h-6 px-2 rounded bg-[#003087] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">PayPal</span>
            </div>
            <div className="h-6 px-2 rounded border border-gray-200 bg-white flex items-center justify-center">
              <span className="text-[10px] font-semibold text-[#3c4043]">G Pay</span>
            </div>
            <div className="h-6 w-8 rounded bg-[#e30613] flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">⬡</span>
            </div>
            <div className="h-6 px-2 rounded bg-black flex items-center justify-center gap-0.5">
              <svg viewBox="0 0 24 24" width="10" height="10" fill="white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <span className="text-white text-[10px] font-semibold">Pay</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}