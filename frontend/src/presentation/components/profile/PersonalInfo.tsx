"use client";

import React, { useState } from "react";
import { User, Pencil } from "lucide-react";
import { UserProfile } from "@/types/profile";
import { SectionCard } from "../layout/profile/SectionCard";

interface PersonalInfoProps {
  user: UserProfile;
  onSave?: (data: Partial<UserProfile>) => void;
}

interface InfoFieldProps {
  label: string;
  value?: string | number;
  placeholder?: string;
}

function InfoField({ label, value, placeholder = "—" }: InfoFieldProps) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
      <p className={`text-sm font-medium ${value ? "text-gray-800" : "text-gray-300"}`}>
        {value || placeholder}
      </p>
    </div>
  );
}

export function PersonalInfo({ user, onSave }: PersonalInfoProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName,
    lastName: user?.lastName,
    email: user?.email,
    phone: user?.phone || "",
    maritalStatus: user?.maritalStatus || "",
    city: user?.city || "",
    birthYear: user?.birthYear?.toString() || "",
    gender: user?.gender || "",
  });

  const handleSave = () => {
    onSave?.({
      ...form,
      birthYear: form.birthYear ? parseInt(form.birthYear) : undefined,
    });
    setEditing(false);
  };

  return (
    <SectionCard
      title="Thông tin cá nhân"
      icon={<User size={16} />}
      isEmpty={false}
    >
      <div className="flex items-start justify-between mb-4">
        <div />
        <button
          onClick={() => (editing ? handleSave() : setEditing(true))}
          className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Pencil size={13} />
          {editing ? "Lưu" : "Chỉnh sửa"}
        </button>
      </div>

      {editing ? (
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: "firstName", label: "Tên" },
            { key: "lastName", label: "Họ" },
            { key: "email", label: "Địa chỉ Email" },
            { key: "phone", label: "Số điện thoại" },
            { key: "maritalStatus", label: "Tình trạng hôn nhân" },
            { key: "city", label: "Thành phố" },
            { key: "birthYear", label: "Năm sinh" },
            { key: "gender", label: "Giới tính" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-[11px] text-gray-400 mb-1 block">{label}</label>
              <input
                type="text"
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <InfoField label="Tên" value={user?.firstName} />
          <InfoField label="Họ" value={user?.lastName} />
          <InfoField label="Địa chỉ Email" value={user?.email} />
          <InfoField label="Số điện thoại" value={user?.phone} />
          <InfoField label="Tình trạng hôn nhân" value={user?.maritalStatus} />
          <InfoField label="Thành phố" value={user?.city} />
          <InfoField label="Năm sinh" value={user?.birthYear} />
          <InfoField label="Giới tính" value={user?.gender} />
        </div>
      )}

      {editing && (
        <button
          onClick={() => setEditing(false)}
          className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Hủy
        </button>
      )}
    </SectionCard>
  );
}