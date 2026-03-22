export type SectionKey =
  | "personal"
  | "bio"
  | "skills"
  | "experience"
  | "education"
  | "links"
  | "languages"
  | "jobExpectation"
  | "benefits";
 
/** Kiểu onSave dùng chung cho mọi section gọi updateProfile */
export type OnSaveFn<P = Record<string, unknown>> = (
  section: SectionKey,
  payload: P,
) => Promise<void>;
 