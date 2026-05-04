// src/presentation/components/settings/NotificationSection.tsx
"use client";
import { useState, useCallback } from "react";
import { Bell, Loader2 }         from "lucide-react";
import { SectionCard }           from "./SectionCard";
import { Toggle }                from "./Toggle";
import { useToast }              from "@/presentation/components/ui/toast";
import { SettingService }        from "@/application/services/SettingService";
import { SettingRepository }     from "@/infrastructure/repositories/SettingRepository";

const ITEMS = [
  { key: "newJobs",      label: "Việc làm mới",      desc: "Thông báo khi có việc làm mới phù hợp." },
  { key: "applications", label: "Kết quả ứng tuyển", desc: "Thông báo khi có kết quả từ nhà tuyển dụng." },
  { key: "messages",     label: "Tin nhắn",           desc: "Thông báo khi có tin nhắn mới từ nhà tuyển dụng." },
] as const;

type NotifKey = typeof ITEMS[number]["key"];

const service = new SettingService(new SettingRepository());

export function NotificationSection() {
  const toast = useToast();
  const [notif, setNotif]     = useState<Record<NotifKey, boolean>>({
    newJobs: true, applications: true, messages: false,
  });
  const [loading, setLoading] = useState<NotifKey | null>(null);

  const handleToggle = useCallback(async (key: NotifKey, value: boolean) => {
    const prev = notif;
    // Optimistic update
    setNotif((p) => ({ ...p, [key]: value }));
    setLoading(key);
    try {
      await service.updateNotificationPreferences({ ...prev, [key]: value });
    } catch (err: unknown) {
      // Rollback on failure
      setNotif(prev);
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra.";
      toast.error("Lỗi", msg);
    } finally {
      setLoading(null);
    }
  }, [notif, toast]);

  return (
    <SectionCard icon={<Bell size={16} />} title="Thông báo">
      <div className="flex flex-col gap-4">
        {ITEMS.map(({ key, label, desc }) => (
          <div key={key} className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
            <div className="relative shrink-0 flex items-center">
              {loading === key && (
                <Loader2 size={12} className="animate-spin text-blue-400 absolute -left-5" />
              )}
              <Toggle
                on={notif[key]}
                onChange={(v) => handleToggle(key, v)}
              />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}