import { 
  Briefcase, Building2, Users, Zap, 
  Brain, Shield, Video, MessageCircle, TrendingUp, Clock,
  Code, Palette, BarChart3, GraduationCap, Stethoscope, Home,
  Search, UserPlus, Sparkles, ArrowRight, Star, CheckCircle
} from "lucide-react";

export const CITIES = [
  "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", 
  "Cần Thơ", "Bình Dương", "Đồng Nai", "Quảng Ninh"
];

export const POPULAR_SEARCHES = [
  "Frontend Developer", "Backend Engineer", "UI/UX Designer", 
  "Data Analyst", "Product Manager", "DevOps", "Full Stack"
];

export const STATS = [
  { icon: Briefcase, value: "18,000+", label: "Việc làm mới", gradient: "from-blue-600 to-cyan-600" },
  { icon: Building2, value: "6,200+", label: "Công ty hàng đầu", gradient: "from-purple-600 to-pink-600" },
  { icon: Users, value: "420,000+", label: "Người dùng", gradient: "from-emerald-600 to-teal-600" },
  { icon: Zap, value: "95%", label: "Hài lòng", gradient: "from-orange-600 to-amber-600" },
];

export const FEATURED_CATEGORIES = [
  { label: "Công nghệ thông tin", icon: Code, count: "3,500", color: "blue" },
  { label: "Marketing", icon: BarChart3, count: "1,200", color: "purple" },
  { label: "Thiết kế", icon: Palette, count: "900", color: "pink" },
  { label: "Kinh doanh", icon: Briefcase, count: "2,800", color: "emerald" },
  { label: "Giáo dục", icon: GraduationCap, count: "800", color: "amber" },
  { label: "Y tế", icon: Stethoscope, count: "600", color: "rose" },
  { label: "Bất động sản", icon: Home, count: "1,100", color: "indigo" },
  { label: "Tài chính", icon: TrendingUp, count: "1,500", color: "cyan" },
];

export const FEATURES = [
  { icon: Brain, title: "AI Matching thông minh", desc: "Gợi ý việc làm phù hợp với kỹ năng và mong muốn của bạn", color: "blue" },
  { icon: Shield, title: "Bảo mật tuyệt đối", desc: "Dữ liệu cá nhân được bảo vệ với công nghệ mã hóa hàng đầu", color: "purple" },
  { icon: Video, title: "Livestream tuyển dụng", desc: "Phỏng vấn trực tiếp với nhà tuyển dụng qua nền tảng hiện đại", color: "pink" },
  { icon: MessageCircle, title: "Chat & Q&A", desc: "Tương tác thời gian thực, giải đáp mọi thắc mắc", color: "emerald" },
  { icon: TrendingUp, title: "Phân tích xu hướng", desc: "Cập nhật xu hướng tuyển dụng mới nhất", color: "orange" },
  { icon: Clock, title: "Tiết kiệm thời gian", desc: "Tìm việc nhanh chóng chỉ trong 3 bước đơn giản", color: "indigo" },
];

export const TESTIMONIALS = [
  { 
    name: "Nguyễn Văn An", 
    role: "Frontend Developer", 
    quote: "Joblin giúp tôi tìm được công việc mơ ước chỉ sau 2 tuần. Quy trình phỏng vấn qua livestream rất chuyên nghiệp và tiện lợi.",
    avatar: "A", 
    color: "from-blue-600 to-cyan-600" 
  },
  { 
    name: "Trần Thị Bích", 
    role: "HR Manager", 
    quote: "Nền tảng tuyệt vời giúp chúng tôi tiếp cận hàng ngàn ứng viên chất lượng. Tính năng livestream thực sự đột phá.",
    avatar: "B", 
    color: "from-purple-600 to-pink-600" 
  },
  { 
    name: "Lê Văn Cường", 
    role: "Software Engineer", 
    quote: "Giao diện đẹp, trải nghiệm mượt mà. Tôi đã tham gia nhiều buổi phỏng vấn thành công qua Joblin.",
    avatar: "C", 
    color: "from-emerald-600 to-teal-600" 
  },
];

export const HOW_IT_WORKS = [
  { step: "01", title: "Tạo hồ sơ", desc: "Đăng ký và xây dựng CV chuyên nghiệp trong 5 phút", icon: UserPlus },
  { step: "02", title: "Khám phá việc làm", desc: "Tìm kiếm công việc phù hợp với kỹ năng của bạn", icon: Search },
  { step: "03", title: "Phỏng vấn online", desc: "Tham gia livestream và phỏng vấn trực tiếp", icon: Video },
];