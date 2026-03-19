"use client";

import React, { useState } from "react";
import { User } from "lucide-react";
import { UserProfile } from "@/types/profile";
import { SectionCard } from "../layout/profile/SectionCard";

interface PersonalInfoProps {
  user: UserProfile;
  onSave?: (data: Partial<UserProfile>) => void;
}

interface FloatingInputProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (val: string) => void;
  type?: string;
}

function FloatingInput({ label, value, placeholder, onChange, type = "text" }: FloatingInputProps) {
  return (
    <div className="relative border border-gray-200 rounded-lg px-3 pt-3 pb-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
      <label className="absolute top-1.5 left-3 text-[10px] text-gray-400 leading-none">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-300 mt-0.5"
      />
    </div>
  );
}

interface RadioGroupProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
}

function RadioGroup({ label, options, value, onChange }: RadioGroupProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>
      <div className="space-y-2">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
            <span
              onClick={() => onChange(opt.value)}
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                value === opt.value
                  ? "border-blue-600"
                  : "border-gray-300 group-hover:border-blue-400"
              }`}
            >
              {value === opt.value && (
                <span className="w-2 h-2 rounded-full bg-blue-600 block" />
              )}
            </span>
            <span className="text-sm text-gray-700" onClick={() => onChange(opt.value)}>
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

const MARITAL_OPTIONS = [
  { value: "married", label: "Đã kết hôn" },
  { value: "single",  label: "Độc thân" },
];

const GENDER_OPTIONS = [
  { value: "female", label: "Nữ" },
  { value: "male",   label: "Nam" },
];

export function PersonalInfo({ user, onSave }: PersonalInfoProps) {
  const [form, setForm] = useState({
    firstName:     user?.firstName     ?? "",
    lastName:      user?.lastName      ?? "",
    email:         user?.email         ?? "",
    phone:         user?.phone         ?? "",
    birthYear:     user?.birthYear?.toString() ?? "",
    city:          user?.city          ?? "",
    maritalStatus: user?.maritalStatus ?? "",
    gender:        user?.gender        ?? "",
  });

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = () => {
    onSave?.({ ...form, birthYear: form.birthYear ? parseInt(form.birthYear) : undefined });
  };

  return (
    <SectionCard title="Thông tin cá nhân" icon={<User size={16} />} isEmpty={false}>
      <div className="space-y-4">
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-3">
          <FloatingInput label="Tên"           value={form.firstName} onChange={set("firstName")} />
          <FloatingInput label="Họ"            value={form.lastName}  onChange={set("lastName")} />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 gap-3">
          <FloatingInput label="Địa chỉ Email" value={form.email}  onChange={set("email")} type="email" />
          <FloatingInput label="Số điện thoại" value={form.phone}  onChange={set("phone")} placeholder="Tehran, Saadat Abad" />
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-2 gap-3">
          <FloatingInput label="Năm sinh"  value={form.birthYear} onChange={set("birthYear")} type="number" />
          <FloatingInput label="Thành phố" value={form.city}      onChange={set("city")}      placeholder="Hà Nội" />
        </div>

        {/* Row 4 — Radio groups */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <RadioGroup
            label="Tình trạng hôn nhân"
            options={MARITAL_OPTIONS}
            value={form.maritalStatus}
            onChange={set("maritalStatus")}
          />
          <RadioGroup
            label="Giới tính"
            options={GENDER_OPTIONS}
            value={form.gender}
            onChange={set("gender")}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-1">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Lưu
          </button>
        </div>
      </div>
    </SectionCard>
  );
}