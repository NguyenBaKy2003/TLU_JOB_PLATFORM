// src/domain/models/JobPost.ts

export interface JobPostForm {
  title: string; category: string; industry: string; level: string;
  workTypes: string[];
  country: string; city: string;
  minSalary: string; showSalary: boolean; benefits: string[];
  minAge: string; maxAge: string; genders: string[];
  experience: string; expNote: string; acceptIntern: boolean;
  bgCheck: boolean; acceptDisabled: boolean; majors: string[]; education: string;
  langName: string; langLevel: string;
  softName: string; softLevel: string; softSkills: string[];
  workSchedule: string; travelReq: string; description: string;
}

export const EMPTY_FORM: JobPostForm = {
  title: "", category: "", industry: "", level: "",
  workTypes: [], country: "Việt Nam", city: "Hà Nội",
  minSalary: "", showSalary: false, benefits: [],
  minAge: "", maxAge: "", genders: [], experience: "", expNote: "", acceptIntern: false,
  bgCheck: false, acceptDisabled: false, majors: [], education: "",
  langName: "", langLevel: "", softName: "", softLevel: "", softSkills: [],
  workSchedule: "", travelReq: "", description: "",
};

export const WORK_TYPES      = ["Full time", "Part time", "Làm việc từ xa", "Thực tập sinh"];
export const BENEFIT_OPTIONS = ["Cơ hội thăng tiến", "Xe đưa đón", "Giờ làm việc linh hoạt", "Bảo hiểm"];
export const GENDER_OPTIONS  = ["Nữ", "Nam", "Khác"];
export const EXP_OPTIONS     = ["Chưa có kinh nghiệm", "Dưới 1 năm", "1-3 năm", "Trên 3 năm"];
export const SOFT_SKILLS     = ["Kỹ năng giải quyết xung đột", "Kỹ năng phối hợp", "Quản lý thời gian", "Kỹ năng liên nhân", "Khả năng thích nghi"];
export const LANG_LEVELS     = ["Sơ cấp", "Trung cấp", "Nâng cao", "Thành thạo"];
export const LEVEL_OPTIONS   = ["Thực tập sinh", "Fresher", "Chuyên viên", "Senior", "Quản lý", "Giám đốc"];