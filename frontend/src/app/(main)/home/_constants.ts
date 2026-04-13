// src/app/(main)/home/_constants.ts
// Tất cả data tĩnh dùng trong HomePage — tách ra để dễ maintain

export const CITIES = [
  "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Bình Dương",
];

export const POPULAR_SEARCHES = [
  "React Developer", "Product Manager", "UI/UX Designer", "Data Analyst", "Sales",
];

export const FEATURED_CATEGORIES = [
  { icon: "💻", label: "Công nghệ",    count: "2.4k+" },
  { icon: "📊", label: "Kinh doanh",   count: "1.8k+" },
  { icon: "🎨", label: "Thiết kế",     count: "890+"  },
  { icon: "📣", label: "Marketing",    count: "1.2k+" },
  { icon: "⚙️", label: "Kỹ thuật",    count: "1.5k+" },
  { icon: "💰", label: "Tài chính",    count: "740+"  },
  { icon: "🏥", label: "Y tế",         count: "620+"  },
  { icon: "📚", label: "Giáo dục",     count: "530+"  },
];

export const STATS = [
  { value: "18,000+", label: "Việc làm đang tuyển",  iconKey: "briefcase" },
  { value: "3,200+",  label: "Công ty hàng đầu",     iconKey: "building"  },
  { value: "420k+",   label: "Ứng viên đăng ký",     iconKey: "users"     },
  { value: "94%",     label: "Tỷ lệ phản hồi",       iconKey: "zap"       },
] as const;

export const TESTIMONIALS = [
  {
    quote:  "Tôi tìm được công việc mơ ước chỉ sau 2 tuần đăng hồ sơ. Quy trình nhanh, minh bạch.",
    name:   "Nguyễn Minh Tuấn",
    role:   "Senior Software Engineer tại VNG",
    avatar: "MT",
    color:  "from-blue-500 to-blue-700",
  },
  {
    quote:  "Joblin giúp chúng tôi tiếp cận hàng nghìn ứng viên chất lượng. ROI tuyệt vời.",
    name:   "Trần Thị Lan",
    role:   "Head of Talent tại FPT Software",
    avatar: "TL",
    color:  "from-violet-500 to-violet-700",
  },
  {
    quote:  "Bộ lọc thông minh và AI matching giúp HR team tiết kiệm 60% thời gian sàng lọc.",
    name:   "Lê Văn Đức",
    role:   "HR Director tại Techcombank",
    avatar: "VĐ",
    color:  "from-amber-500 to-amber-700",
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step:  "01",
    title: "Tạo hồ sơ",
    desc:  "Điền thông tin cá nhân và upload CV chuyên nghiệp trong 5 phút.",
  },
  {
    step:  "02",
    title: "Khám phá việc làm",
    desc:  "Tìm kiếm hàng nghìn vị trí phù hợp với kỹ năng và mức lương mong muốn.",
  },
  {
    step:  "03",
    title: "Ứng tuyển dễ dàng",
    desc:  "Gửi đơn chỉ một click, theo dõi trạng thái theo thời gian thực.",
  },
];

export const FEATURES = [
  {
    iconKey: "zap",
    title:   "AI Matching thông minh",
    desc:    "Thuật toán phân tích hồ sơ và đề xuất công việc phù hợp nhất với bạn theo thời gian thực.",
  },
  {
    iconKey: "shield",
    title:   "Bảo mật thông tin",
    desc:    "Hồ sơ của bạn chỉ được chia sẻ khi bạn cho phép. Kiểm soát hoàn toàn quyền riêng tư.",
  },
  {
    iconKey: "trending",
    title:   "Theo dõi đơn ứng tuyển",
    desc:    "Dashboard trực quan, nhận thông báo realtime về mọi cập nhật từ nhà tuyển dụng.",
  },
  {
    iconKey: "clock",
    title:   "Phản hồi nhanh 72h",
    desc:    "Cam kết nhà tuyển dụng trả lời trong vòng 3 ngày làm việc. Không bị bỏ qua.",
  },
];

export const FOOTER_LINKS = {
  "Ứng viên": [
    ["Tìm việc làm",    "/jobs"               ],
    ["Tạo CV online",   "/cv"                 ],
    ["Công ty nổi bật", "/companies"          ],
  ],
  "Nhà tuyển dụng": [
    ["Đăng tin tuyển",   "/auth/employer/signup"  ],
    ["Gói dịch vụ",      "/pricing"               ],
    ["Quản lý ứng viên", "/employer/dashboard"    ],
  ],
  Joblin: [
    ["Về chúng tôi", "/about"  ],
    ["Blog",         "/blog"   ],
    ["Trợ giúp",     "/help"   ],
    ["Chính sách",   "/privacy"],
  ],
} as const;