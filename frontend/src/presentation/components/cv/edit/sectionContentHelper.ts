// src/presentation/components/cv/edit/sectionContentHelper.ts
import type { SectionType } from "@/domain/models/Cv";

// ── Types ─────────────────────────────────────────────────────────────────

type AnyObj = Record<string, unknown>;

export interface ExperienceEntry {
  company:     string;
  position:    string;
  startDate:   string;
  endDate:     string;
  current:     boolean;
  description: string;
}

export interface EducationEntry {
  school:    string;
  degree:    string;
  major:     string;
  startDate: string;
  endDate:   string;
}

export interface LanguageEntry {
  name:  string;
  level: string;
}

export interface SocialLinkEntry {
  platform: string;
  url:      string;
}

// ── Deserialize: JSON từ backend → typed data ─────────────────────────────

export function deserializeContent(type: SectionType, raw: string): string {
  if (!raw?.trim()) return "";
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { return raw; }

  switch (type) {
    case "SUMMARY":
      return (parsed as AnyObj)?.text as string ?? "";
    case "SKILL":
      return Array.isArray(parsed) ? (parsed as string[]).join("\n") : "";
    case "EXPERIENCE":
      if (!Array.isArray(parsed)) return "";
      return (parsed as AnyObj[]).map((e) => {
        const lines: string[] = [];
        if (e.company)     lines.push(`Công ty: ${e.company}`);
        if (e.position)    lines.push(`Vị trí: ${e.position}`);
        if (e.startDate)   lines.push(`Từ: ${e.startDate}`);
        if (e.endDate)     lines.push(`Đến: ${e.endDate}`);
        if (e.current)     lines.push(`Hiện tại: Có`);
        if (e.description) lines.push(`Mô tả: ${e.description}`);
        return lines.join("\n");
      }).join("\n\n---\n\n");
    case "EDUCATION":
      if (!Array.isArray(parsed)) return "";
      return (parsed as AnyObj[]).map((e) => {
        const lines: string[] = [];
        if (e.school)    lines.push(`Trường: ${e.school}`);
        if (e.degree)    lines.push(`Bằng cấp: ${e.degree}`);
        if (e.major)     lines.push(`Chuyên ngành: ${e.major}`);
        if (e.startDate) lines.push(`Từ: ${e.startDate}`);
        if (e.endDate)   lines.push(`Đến: ${e.endDate}`);
        return lines.join("\n");
      }).join("\n\n---\n\n");
    case "LANGUAGE":
      if (!Array.isArray(parsed)) return "";
      return (parsed as AnyObj[]).map((l) =>
        [l.name, l.level].filter(Boolean).join(" — ")
      ).join("\n");
    case "SOCIAL_LINK":
      if (!Array.isArray(parsed)) return "";
      return (parsed as AnyObj[]).map((s) =>
        [s.platform, s.url].filter(Boolean).join(": ")
      ).join("\n");
    default:
      return typeof parsed === "string" ? parsed : raw;
  }
}

// Typed deserializers cho structured editors

export function deserializeExperiences(raw: string): ExperienceEntry[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [emptyExperience()];
    return parsed.map((e: AnyObj) => ({
      company:     String(e.company     ?? ""),
      position:    String(e.position    ?? ""),
      startDate:   String(e.startDate   ?? ""),
      endDate:     String(e.endDate     ?? ""),
      current:     Boolean(e.current),
      description: String(e.description ?? ""),
    }));
  } catch { return [emptyExperience()]; }
}

export function deserializeEducations(raw: string): EducationEntry[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [emptyEducation()];
    return parsed.map((e: AnyObj) => ({
      school:    String(e.school    ?? ""),
      degree:    String(e.degree    ?? ""),
      major:     String(e.major     ?? ""),
      startDate: String(e.startDate ?? ""),
      endDate:   String(e.endDate   ?? ""),
    }));
  } catch { return [emptyEducation()]; }
}

export function deserializeLanguages(raw: string): LanguageEntry[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [emptyLanguage()];
    return parsed.map((l: AnyObj) => ({
      name:  String(l.name  ?? ""),
      level: String(l.level ?? ""),
    }));
  } catch { return [emptyLanguage()]; }
}

export function deserializeSocialLinks(raw: string): SocialLinkEntry[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [emptySocialLink()];
    return parsed.map((s: AnyObj) => ({
      platform: String(s.platform ?? ""),
      url:      String(s.url      ?? ""),
    }));
  } catch { return [emptySocialLink()]; }
}

// ── Empty factories ───────────────────────────────────────────────────────

export const emptyExperience  = (): ExperienceEntry  =>
  ({ company: "", position: "", startDate: "", endDate: "", current: false, description: "" });
export const emptyEducation   = (): EducationEntry   =>
  ({ school: "", degree: "", major: "", startDate: "", endDate: "" });
export const emptyLanguage    = (): LanguageEntry    => ({ name: "", level: "" });
export const emptySocialLink  = (): SocialLinkEntry  => ({ platform: "", url: "" });

// ── Serialize: typed data → JSON string gửi backend ──────────────────────

export function serializeContent(type: SectionType, text: string): string {
  const t = text.trim();

  switch (type) {
    case "SUMMARY":
      return JSON.stringify({ text: t });

    case "SKILL": {
      const names = t.split("\n").map((s) => s.trim()).filter(Boolean);
      return JSON.stringify(names);
    }

    // EXPERIENCE / EDUCATION / LANGUAGE / SOCIAL_LINK:
    // serializeContent không còn được gọi trực tiếp cho những type này.
    // Dùng serializeExperiences / serializeEducations / v.v. từ structured editor.
    // Giữ lại fallback parse text để backward compatible nếu cần.
    case "EXPERIENCE": {
      const blocks = t.split(/\n{0,2}---\n{0,2}/);
      const list = blocks.map((block) => {
        const obj: AnyObj = {};
        block.split("\n").forEach((line) => {
          const idx = line.indexOf(": ");
          if (idx === -1) return;
          const key = line.slice(0, idx).trim();
          const val = line.slice(idx + 2).trim();
          if (!val) return;
          const fieldMap: Record<string, string> = {
            "Công ty": "company", "Vị trí": "position",
            "Từ": "startDate", "Đến": "endDate", "Mô tả": "description",
          };
          if (key === "Hiện tại" && val === "Có") obj["current"] = true;
          else if (fieldMap[key]) obj[fieldMap[key]] = val;
        });
        return obj;
      }).filter((o) => Object.keys(o).length > 0);
      return JSON.stringify(list);
    }

    case "EDUCATION": {
      const blocks = t.split(/\n{0,2}---\n{0,2}/);
      const list = blocks.map((block) => {
        const obj: AnyObj = {};
        block.split("\n").forEach((line) => {
          const idx = line.indexOf(": ");
          if (idx === -1) return;
          const key = line.slice(0, idx).trim();
          const val = line.slice(idx + 2).trim();
          if (!val) return;
          const fieldMap: Record<string, string> = {
            "Trường": "school", "Bằng cấp": "degree",
            "Chuyên ngành": "major", "Từ": "startDate", "Đến": "endDate",
          };
          if (fieldMap[key]) obj[fieldMap[key]] = val;
        });
        return obj;
      }).filter((o) => Object.keys(o).length > 0);
      return JSON.stringify(list);
    }

    case "LANGUAGE": {
      const list = t.split("\n").map((line) => {
        const [name, level] = line.split(" — ").map((s) => s.trim());
        return name ? { name, ...(level ? { level } : {}) } : null;
      }).filter(Boolean);
      return JSON.stringify(list);
    }

    case "SOCIAL_LINK": {
      const list = t.split("\n").map((line) => {
        const idx = line.indexOf(": ");
        if (idx === -1) return null;
        const platform = line.slice(0, idx).trim();
        const url = line.slice(idx + 2).trim();
        return platform && url ? { platform, url } : null;
      }).filter(Boolean);
      return JSON.stringify(list);
    }

    default:
      return JSON.stringify(t);
  }
}

// ── Typed serializers cho structured editors ──────────────────────────────

export function serializeExperiences(list: ExperienceEntry[]): string {
  const clean = list
    .filter((e) => e.company || e.position)
    .map((e) => {
      const obj: AnyObj = {};
      if (e.company)     obj.company     = e.company.trim();
      if (e.position)    obj.position    = e.position.trim();
      if (e.startDate)   obj.startDate   = e.startDate.trim();
      if (e.current)     obj.current     = true;
      else if (e.endDate) obj.endDate    = e.endDate.trim();
      if (e.description) obj.description = e.description.trim();
      return obj;
    });
  return JSON.stringify(clean);
}

export function serializeEducations(list: EducationEntry[]): string {
  const clean = list
    .filter((e) => e.school)
    .map((e) => {
      const obj: AnyObj = {};
      if (e.school)    obj.school    = e.school.trim();
      if (e.degree)    obj.degree    = e.degree.trim();
      if (e.major)     obj.major     = e.major.trim();
      if (e.startDate) obj.startDate = e.startDate.trim();
      if (e.endDate)   obj.endDate   = e.endDate.trim();
      return obj;
    });
  return JSON.stringify(clean);
}

export function serializeLanguages(list: LanguageEntry[]): string {
  const clean = list
    .filter((l) => l.name)
    .map((l) => {
      const obj: AnyObj = { name: l.name.trim() };
      if (l.level) obj.level = l.level.trim();
      return obj;
    });
  return JSON.stringify(clean);
}

export function serializeSocialLinks(list: SocialLinkEntry[]): string {
  const clean = list
    .filter((s) => s.platform && s.url)
    .map((s) => ({ platform: s.platform.trim(), url: s.url.trim() }));
  return JSON.stringify(clean);
}

// ── Placeholder hints ─────────────────────────────────────────────────────

export const SECTION_PLACEHOLDERS: Partial<Record<SectionType, string>> = {
  SUMMARY:
    "Viết vài dòng giới thiệu bản thân, định hướng nghề nghiệp và điểm mạnh…",
  SKILL:
    "Mỗi kỹ năng một dòng:\nReact\nTypeScript\nNode.js\nDocker",
  PROJECT:
    "Tên dự án: Portfolio Website\nCông nghệ: Next.js, TypeScript, Tailwind\nLink: https://github.com/…\nMô tả: Mô tả ngắn về dự án…",
  CERTIFICATE:
    "AWS Certified Developer — 2024\nGoogle Cloud Professional — 2023",
  AWARD:
    "Giải Nhất Hackathon TLU 2024\nTop 10 ICPC 2023",
};