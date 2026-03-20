// ─── Enums ────────────────────────────────────────────────────────────────────

export type JobSearchStatus = "ACTIVELY_LOOKING" | "OPEN_TO_OFFERS" | "NOT_LOOKING";
export type CVType          = "UPLOADED" | "ONLINE";
export type SkillLevel      = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type Degree          = "BACHELOR" | "MASTER" | "PHD" | "OTHER";

// ─── Sub-models ───────────────────────────────────────────────────────────────

export interface Skill {
  name:       string;
  level:      SkillLevel | string;
  yearsOfExp: number;
}

export interface WorkExperience {
  id:          string;
  companyName: string;
  position:    string;
  description: string | null;
  startDate:   string;
  endDate:     string | null;
  current:     boolean;
}

export interface Education {
  id:          string;
  school:      string;
  major:       string | null;
  degree:      Degree | string;
  startDate:   string;
  endDate:     string | null;
  description: string | null;
}

export interface Language {
  id:    string;
  name:  string;
  level: string;
}

export interface SocialLink {
  id:       string;
  platform: string;
  url:      string;
}

export interface DesiredJob {
  id:            string;
  industry:      string;
  minSalary:     number;
  currency:      string;
  contractTypes: string[];
  levels:        string[];
}

// ─── Candidate Profile ────────────────────────────────────────────────────────

export interface CandidateProfile {
  id:              string;
  userId:          string;
  email:           string | null;
  firstName:       string | null;
  lastName:        string | null;
  headline:        string | null;
  summary:         string | null;
  phone:           string | null;
  location:        string | null;
  avatarUrl:       string | null;
  dateOfBirth:     string | null;
  gender:          string | null;
  maritalStatus:   string | null;
  profileUrl:      string | null;
  jobSearchStatus: JobSearchStatus | null;
  expectedSalary:  number;
  currency:        string;
  skills:          Skill[];
  experiences:     WorkExperience[];
  educations:      Education[];
  languages:       Language[];
  socialLinks:     SocialLink[];
  desiredJobs:     DesiredJob[];
  benefits:        string[];
  createdAt:       string;
  updatedAt:       string;
}

// ─── CV ───────────────────────────────────────────────────────────────────────

export interface CandidateCV {
  id:         string;
  title:      string;
  type:       CVType;
  fileUrl:    string | null;
  primary:    boolean;
  hasContent: boolean;
  createdAt:  string;
  updatedAt:  string;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface UpdateCandidateProfileRequest {
  headline?:       string;
  summary?:        string;
  phone?:          string;
  location?:       string;
  dateOfBirth?:    string;
  gender?:         string;
  expectedSalary?: number;
  currency?:       string;
  skills?:         Skill[];
}

export interface UpdateJobSearchStatusRequest {
  status: JobSearchStatus;
}

export interface CreateOnlineCVRequest {
  title:    string;
  content?: string;
}