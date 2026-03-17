export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  maritalStatus?: string;
  birthYear?: number;
  city?: string;
  gender?: string;
  avatar?: string;
  jobTitle?: string;
  university?: string;
  completionPercent: number;
  profileUrl: string;
  bio?: string;
  skills?: Skill[];
  experiences?: WorkExperience[];
  educations?: Education[];
  links?: SocialLink[];
  languages?: Language[];
  desiredJobs?: DesiredJob[];
  benefits?: string[];
  jobExpectation?: JobExpectation;
}

export interface Skill {
  id: string;
  name: string;
  level?: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field?: string;
  startYear: number;
  endYear?: number;
  isCurrent?: boolean;
  description?: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon?: string;
}

export interface Language {
  id: string;
  name: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "native";
}

export interface DesiredJob {
  id: string;
  title: string;
  type?: "full-time" | "part-time" | "remote" | "freelance";
  salary?: string;
}

export interface JobExpectation {
  industry?: string;
  minSalary?: string;
  contractTypes: string[];
  levels: string[];
}