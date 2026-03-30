// src/presentation/components/company-detail/companyDetailMock.ts
import type { CompanyDetail } from "./companyDetailTypes";

export const FPT_COMPANY: CompanyDetail = {
  id: "fpt",
  name: "FPT",
  website: "FPT.com",
  location: "Hà Nội",
  companySize: 1000,
  email: "fpt@gmail.com",
  phone: "1800 6600",
  following: false,
  description: `Là thành viên của Tập đoàn công nghệ lớn nhất Việt Nam, Công ty Cổ phần Viễn thông FPT (tên gọi tắt là FPT Telecom) hiện là một trong những nhà cung cấp dịch vụ viễn thông và Internet có uy tín và được khách hàng yêu mến tại Việt Nam và khu vực.

FPT Telecom được thành lập ngày 31/01/1997, xuất phát từ Trung tâm Dịch vụ Trực tuyến với sản phẩm mạng Intranet đầu tiên của Việt Nam "Trí tuệ Việt Nam – TTVN", mở đường cho sự phát triển Internet tại Việt Nam.

Với sứ mệnh mang Internet và kết nối đến mọi gia đình Việt Nam, FPT Telecom đang thực hiện chiến lược "Mang đến trải nghiệm tuyệt vời cho khách hàng", phát huy giá trị văn hóa "Lấy khách hàng làm trọng tâm" và sức mạnh công nghệ FPT, từ đó tiên phong trở thành Nhà cung cấp dịch vụ số có trải nghiệm khách hàng vượt trội, tốt nhất tại Việt Nam.`,
  employees: [
    { id: "1", name: "Cameron Williamson", role: "Product Analyst"              },
    { id: "2", name: "Cody Fisher",        role: "Data Analyst Lead"            },
    { id: "3", name: "Brooklyn Simmons",   role: "Senior Interaction Designer"  },
    { id: "4", name: "Kristin Watson",     role: "Head of Product Design"       },
    { id: "5", name: "Darrell Steward",    role: "Head of Engineering"          },
  ],
  reviews: [
    {
      id: "1", author: "Leslie Alexander", role: "Job Seeker", rating: 4.5, likes: 14, dislikes: 0,
      content: "When I sent in my application to Sandro, I was simply hoping for a chance. What I got was a masterclass in how to run a thoughtful, respectful, and inspiring hiring process. From the way they asked questions to the way they listened—every detail reflected.",
    },
    {
      id: "2", author: "Wade Warren", role: "Job Seeker", rating: 4.5, likes: 56, dislikes: 1,
      content: "Taint stood out to me because of their communication and transparency. I always knew where I stood, what the next steps were, and what they were looking for. More importantly, I felt like they truly wanted a two-way dialogue—not just to assess.",
    },
    {
      id: "3", author: "Ronald Richards", role: "Job Seeker", rating: 4.5, likes: 65, dislikes: 7,
      content: "I've always believed that the best companies are the ones that make you feel seen, even before you join them. That was exactly my experience with Taint. The interview wasn't just about evaluating me—it was about helping me evaluate them, too.",
    },
  ],
  jobs: [
    { id: "1", company: "FPT", title: "QA Engineer",        tags: ["Part Time"],              location: "Hà Nội", salary: "3-5 triệu",   postedAgo: "1 giờ trước"  },
    { id: "2", company: "FPT", title: "Front-end Developer",tags: ["Full Time", "Remote"],     location: "Hà Nội", salary: "15-25 triệu", postedAgo: "3 giờ trước"  },
    { id: "3", company: "FPT", title: "UI/UX Designer",     tags: ["Senior", "Part Time"],    location: "Hà Nội", salary: "10-15 triệu", postedAgo: "1 giờ trước"  },
    { id: "4", company: "FPT", title: "Creative Director",  tags: ["Full Time"],              location: "Hà Nội", salary: "7-9 triệu",   postedAgo: "1 giờ trước"  },
    { id: "5", company: "FPT", title: "Copywriter",         tags: ["Hybrid", "Part Time"],    location: "Hà Nội", salary: "3-5 triệu",   postedAgo: "6 giờ trước"  },
    { id: "6", company: "FPT", title: "Credit Officer",     tags: ["Mid Level"],              location: "Hà Nội", salary: "12-13 triệu", postedAgo: "9 giờ trước"  },
  ],
};