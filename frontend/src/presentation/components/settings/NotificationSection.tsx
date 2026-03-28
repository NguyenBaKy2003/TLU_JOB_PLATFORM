// src/presentation/components/settings/NotificationSection.tsx
"use client";
import { useState }    from "react";
import { Bell }        from "lucide-react";
import { SectionCard } from "./SectionCard";
import { Toggle }      from "./Toggle";

const ITEMS = [
  { key: "newJobs",      label: "Việc làm mới",      desc: "Thông báo cho tôi khi có việc làm mới phù hợp." },
  { key: "applications", label: "Kết quả ứng tuyển", desc: "Thông báo cho tôi khi có kết quả từ nhà tuyển dụng." },
  { key: "messages",     label: "Tin nhắn",           desc: "Thông báo khi có tin nhắn mới từ nhà tuyển dụng." },
] as const;

type NotifKey = typeof ITEMS[number]["key"];

export function NotificationSection() {
  const [notif, setNotif] = useState<Record<NotifKey, boolean>>({
    newJobs: true, applications: true, messages: false,
  });

  return (
    <SectionCard icon={<Bell size={16} />} title="Thông báo">
      <div className="flex flex-col gap-4">
        {ITEMS.map(({ key, label, desc }) => (
          <div key={key} className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
            <Toggle on={notif[key]} onChange={(v) => setNotif(p => ({ ...p, [key]: v }))} />
          </div>
        ))}
      </div>
    </SectionCard>
  );
}