// ─── Enums ───────────

export type JobSearchStatus =
  | "ACTIVELY_LOOKING"
  | "OPEN_TO_OFFERS"
  | "NOT_LOOKING";
export type CVType = "UPLOADED" | "ONLINE";
export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type Degree = "BACHELOR" | "MASTER" | "PHD" | "OTHER";
export type LanguageLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "NATIVE";
export type ContractType = "FULL_TIME" | "PART_TIME" | "REMOTE" | "INTERNSHIP";
export type JobLevel = "FRESHER" | "JUNIOR" | "SENIOR" | "MANAGER" | "DIRECTOR";
export type SocialPlatform =
  | "LINKEDIN"
  | "GITHUB"
  | "DRIBBLE"
  | "INSTAGRAM"
  | "PORTFOLIO"
  | "BEHANCE";

// ─── Sub-models ───────

export interface Skill {
  name: string;
  level: SkillLevel | string;
  yearsOfExp: number;
}

export interface WorkExperience {
  id: string;
  companyName: string;
  position: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
}

export interface ApplicableCV {
  id:             string;
  title:          string;
  type:           "UPLOADED" | "ONLINE";
  fileUrl?:       string;  // UPLOADED only
  slug?:          string;  // ONLINE only
  exportedPdfUrl?: string; // ONLINE only — thêm dòng này
  primary:        boolean;
  createdAt?:     string;
}

export interface Education {
  id: string;
  school: string;
  major: string | null;
  degree: Degree | string;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
}

export interface Language {
  id: string;
  name: string;
  level: LanguageLevel | string;
}

export interface SocialLink {
  id: string;
  platform: SocialPlatform | string;
  url: string;
}

export interface DesiredJob {
  id: string;
  industry: string | null;
  minSalary: number;
  currency: string | null;
  contractTypes: ContractType[] | string[];
  levels: JobLevel[] | string[];
}

export interface Benefit {
  id: string;
  name: string;
}

// ─── Boost ───────────

export interface BoostResult {
  boostedUntil: string; // ISO datetime
  boostsRemaining: number; // -1 = unlimited (PREMIUM)
}

export interface BoostStatus {
  currentlyBoosted: boolean;
  boostedUntil: string | null;
}

// ─── Candidate Profile 

export interface CandidateProfile {
  id: string;
  userId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  headline: string | null;
  summary: string | null;
  phone: string | null;
  location: string | null;
  postalCode: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  maritalStatus: string | null;
  profileUrl: string | null;
  jobSearchStatus: JobSearchStatus | null;
  expectedSalary: number;
  currency: string | null;
  boosted: boolean;           // thêm mới
  boostedUntil: string | null; // thêm mới — ISO datetime
  skills: Skill[];
  experiences: WorkExperience[];
  educations: Education[];
  languages: Language[];
  socialLinks: SocialLink[];
  desiredJobs: DesiredJob[];
  benefits: Benefit[];
  createdAt: string;
  updatedAt: string;
}

// ─── CV ──────────────

export interface CandidateCV {
  id: string;
  title: string;
  type: CVType;
  fileUrl: string | null;
  primary: boolean;
  hasContent: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Request Payloads 

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  headline?: string;
  summary?: string;
  phone?: string;
  location?: string;
  postalCode?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  expectedSalary?: number;
  currency?: string;
  skills?: SkillPayload[];
  languages?: LanguagePayload[];
  socialLinks?: SocialLinkPayload[];
  desiredJob?: DesiredJobPayload;
  benefits?: string[];
}

export interface SkillPayload {
  name: string;
  level: string;
  yearsOfExp: number;
}

export interface LanguagePayload {
  name: string;
  level: LanguageLevel | string;
}

export interface SocialLinkPayload {
  platform: SocialPlatform | string;
  url: string;
}

export interface DesiredJobPayload {
  industry?: string;
  minSalary?: number;
  currency?: string;
  contractTypes?: ContractType[] | string[];
  levels?: JobLevel[] | string[];
}

export interface ExperiencePayload {
  companyName: string;
  position: string;
  description?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

export interface EducationPayload {
  school: string;
  major?: string;
  degree?: Degree | string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface UploadCVPayload {
  file: File;
  title?: string;
}

export interface CreateOnlineCVPayload {
  title: string;
  content?: string;
}