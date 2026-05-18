"use client";

import { User }                  from "lucide-react";
import { useState, useEffect }   from "react";
import SectionWrapper            from "./SectionWrapper";
import { CandidateProfile,
         UpdateProfilePayload }  from "@/domain/models/Candidate";
import { SectionKey }            from "./types/SectionKey";

const GENDER_LABEL: Record<string, string> = {
  MALE:   "Nam",
  FEMALE: "Nữ",
  OTHER:  "Khác",
};

const MARITAL_LABEL: Record<string, string> = {
  SINGLE:   "Độc thân",
  MARRIED:  "Đã kết hôn",
  DIVORCED: "Đã ly hôn",
  WIDOWED:  "Góa",
};

// ─── Sub-components ───────

function InputField({ label, value, onChange, placeholder, type = "text", disabled }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-gray-400 uppercase tracking-wide">{label}</label>
      <input
        type={type} value={value} placeholder={placeholder} disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-[16px] border border-gray-200 rounded-lg bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          placeholder:text-gray-300 text-gray-800 disabled:bg-gray-50 disabled:text-gray-400"
      />
    </div>
  );
}

function RadioGroup({ label, options, value, onChange }: {
  label: string; options: { label: string; value: string }[];
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] text-gray-400 uppercase tracking-wide">{label}</label>
      <div className="flex flex-col gap-1.5">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer group"
            onClick={() => onChange(opt.value)}>
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
              shrink-0 transition-colors ${value === opt.value
                ? "border-blue-600 bg-blue-600"
                : "border-gray-300 group-hover:border-gray-400"}`}>
              {value === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <span className="text-[16px] text-gray-700">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function ReadField({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0 overflow-hidden">
      <span className="text-[11px] text-gray-400 uppercase tracking-wide">{label}</span>
      {isLink
        ? <button className="text-[16px] font-medium text-blue-500 hover:underline text-left truncate w-full">{value || "Thêm"}</button>
        : <span className="text-[16px] font-medium text-gray-800 truncate block" title={value}>{value || "—"}</span>
      }
    </div>
  );
}

// ─── Draft ─

interface Draft {
  firstName: string; lastName: string; email: string;
  phone: string; location: string; dateOfBirth: string;
  gender: string; maritalStatus: string;
}

function profileToDraft(p: CandidateProfile): Draft {
  return {
    firstName:     p.firstName     ?? "",
    lastName:      p.lastName      ?? "",
    email:         p.email         ?? "",
    phone:         p.phone         ?? "",
    location:      p.location      ?? "",
    dateOfBirth:   p.dateOfBirth   ?? "",
    gender:        p.gender        ?? "",
    maritalStatus: p.maritalStatus ?? "",
  };
}

// ─── Props ─

interface Props {
  profile: CandidateProfile;
  saving:  boolean;
  error?:  string;
  onSave:  (section: SectionKey, payload: UpdateProfilePayload) => Promise<void>;
}

// ─── Component ────────────

export default function PersonalInfoSection({ profile, saving, error, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState<Draft>(() => profileToDraft(profile));

  /**
   * Sync draft khi profile được cập nhật từ API (page.tsx gọi setProfile).
   * Chỉ sync khi KHÔNG đang edit — tránh xóa mất dữ liệu user đang nhập.
   */
  useEffect(() => {
    if (!editing) {
      setDraft(profileToDraft(profile));
    }
  }, [profile, editing]);

  const set = (key: keyof Draft) => (val: string) =>
    setDraft((p) => ({ ...p, [key]: val }));

  const handleSave = async () => {
    await onSave("personal", {
      firstName:     draft.firstName     || undefined,
      lastName:      draft.lastName      || undefined,
      phone:         draft.phone         || undefined,
      location:      draft.location      || undefined,
      dateOfBirth:   draft.dateOfBirth   || undefined,
      gender:        draft.gender        || undefined,
      maritalStatus: draft.maritalStatus || undefined,
    });
    // Không gọi setEditing(false) ở đây —
    // useEffect sẽ tự sync draft khi profile prop thay đổi,
    // rồi mới tắt editing để read view hiển thị data mới.
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(profileToDraft(profile));
    setEditing(false);
  };

  return (
    <SectionWrapper title="Thông tin cá nhân" icon={<User size={16} />}
      onEdit={() => setEditing(true)} editing={editing}>
      {error && (
        <p className="mb-3 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      {editing ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <InputField label="Tên"           value={draft.firstName}     onChange={set("firstName")} />
            <InputField label="Họ"            value={draft.lastName}      onChange={set("lastName")} />
            <InputField label="Địa chỉ Email" value={draft.email}         onChange={set("email")} disabled />
            <InputField label="Số điện thoại" value={draft.phone}         onChange={set("phone")} />
            <InputField label="Ngày sinh"     value={draft.dateOfBirth}   onChange={set("dateOfBirth")} placeholder="YYYY-MM-DD" />
            <InputField label="Thành phố"     value={draft.location}      onChange={set("location")} />
            <RadioGroup label="Tình trạng hôn nhân" value={draft.maritalStatus} onChange={set("maritalStatus")}
              options={[{ label: "Đã kết hôn", value: "MARRIED" }, { label: "Độc thân", value: "SINGLE" }]} />
            <RadioGroup label="Giới tính" value={draft.gender} onChange={set("gender")}
              options={[{ label: "Nữ", value: "FEMALE" }, { label: "Nam", value: "MALE" }]} />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={handleCancel} disabled={saving}
              className="px-4 py-2 text-[16px] font-medium text-gray-600 bg-gray-100 rounded-lg
                hover:bg-gray-200 disabled:opacity-50 transition-colors">
              Hủy
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 text-[16px] font-medium text-white bg-blue-600 rounded-lg
                hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2">
              {saving && (
                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              Lưu
            </button>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <ReadField label="Tên"                 value={profile.firstName     ?? ""} />
          <ReadField label="Họ"                  value={profile.lastName      ?? ""} />
          <ReadField label="Địa chỉ Email"       value={profile.email         ?? ""} />
          <ReadField label="Số điện thoại"       value={profile.phone         ?? ""} />
          <ReadField label="Tình trạng hôn nhân" value={MARITAL_LABEL[profile.maritalStatus ?? ""] ?? profile.maritalStatus ?? ""} />
          <ReadField label="Thành phố"           value={profile.location      ?? ""} />
          <ReadField label="Ngày sinh"           value={profile.dateOfBirth   ?? ""} />
          <ReadField label="Giới tính" value={GENDER_LABEL[profile.gender ?? ""] ?? profile.gender ?? ""} isLink={!profile.gender} />
        </div>
      )}
    </SectionWrapper>
  );
}