// src/presentation/components/companies/mockData.ts
import type { Company } from "./types";

export const COMPANIES: Company[] = [
  {
    id: "1", name: "BMW", logo: "", location: "Hà Nội", rating: 4.5,
    tags: ["Toàn cầu", "Đang tuyển dụng"],
    description: "Sandro is a French fashion brand known for its chic, contemporary collections, offering men.",
    jobCount: 50, reviewCount: 0, salaryCount: "103.98K",
  },
  {
    id: "2", name: "Belle", logo: "", location: "Bắc Ninh", rating: 4.5,
    tags: ["Toàn cầu", "Đang tuyển dụng"],
    description: "Sandro is a French fashion brand known for its chic, contemporary collections, offering men.",
    jobCount: 50, reviewCount: 0, salaryCount: "103.98K",
  },
  {
    id: "3", name: "Domino's Pizza", logo: "", location: "TP. Hồ Chí Minh", rating: 4.5,
    tags: ["Toàn cầu", "Đang tuyển dụng"],
    description: "Sandro is a French fashion brand known for its chic, contemporary collections, offering men.",
    jobCount: 50, reviewCount: 0, salaryCount: "103.98K",
  },
  {
    id: "4", name: "P & G", logo: "", location: "Đà Nẵng", rating: 4.5,
    tags: ["Toàn cầu", "Đang tuyển dụng"],
    description: "Sandro is a French fashion brand known for its chic, contemporary collections, offering men.",
    jobCount: 50, reviewCount: 0, salaryCount: "103.98K",
  },
  {
    id: "5", name: "FPT", logo: "", location: "Hà Nội", rating: 4.8,
    tags: ["Toàn cầu", "Đang tuyển dụng"],
    description: "Là thành viên của Tập đoàn công nghệ lớn nhất Việt Nam, FPT Telecom hiện là một trong những nhà cung cấp dịch vụ viễn thông và Internet có uy tín.",
    jobCount: 120, reviewCount: 0, salaryCount: "88.1K",
  },
  {
    id: "6", name: "Viettel", logo: "", location: "Hà Nội", rating: 4.3,
    tags: ["Toàn cầu", "Đang tuyển dụng"],
    description: "Viettel là tập đoàn viễn thông và công nghệ thông tin hàng đầu Việt Nam.",
    jobCount: 85, reviewCount: 0, salaryCount: "95.2K",
  },
  {
    id: "7", name: "Vingroup", logo: "", location: "Hà Nội", rating: 4.6,
    tags: ["Toàn cầu", "Đang tuyển dụng"],
    description: "Vingroup là tập đoàn kinh tế tư nhân lớn nhất Việt Nam hoạt động đa lĩnh vực.",
    jobCount: 200, reviewCount: 0, salaryCount: "120K",
  },
  {
    id: "8", name: "Samsung", logo: "", location: "Bắc Ninh", rating: 4.4,
    tags: ["Toàn cầu", "Đang tuyển dụng"],
    description: "Samsung Electronics là tập đoàn điện tử đa quốc gia hàng đầu thế giới.",
    jobCount: 150, reviewCount: 0, salaryCount: "110K",
  },
];

export const BENEFIT_OPTIONS = [
  "Giờ làm việc linh hoạt",
  "Lộ trình thăng tiến",
  "Môi trường chuyên nghiệp",
  "Đội ngũ chuyên gia",
];

export const SIZE_OPTIONS = [
  { label: "1 - 50",    value: "1-50"    },
  { label: "51 - 200",  value: "51-200"  },
  { label: "201 - 500", value: "201-500" },
  { label: "501 - 1000",value: "501-1000"},
  { label: "1000+",     value: "1000+"   },
];

export const SORT_TABS = [
  { label: "Phổ biến nhất",  value: "popular"  },
  { label: "Xem nhiều nhất", value: "views"    },
  { label: "Đánh giá cao nhất", value: "rating"},
  { label: "Thành công nhất",value: "success"  },
];