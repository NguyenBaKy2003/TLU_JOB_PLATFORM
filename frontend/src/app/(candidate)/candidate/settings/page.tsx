// src/app/settings/page.tsx
"use client";
import { DashboardLayout }       from "@/presentation/components/layout/profile/DashboardLayout";
import { useAuth }               from "@/application/contexts/AuthContext";
import { NameSection }           from "@/presentation/components/settings/NameSection";
import { AccountSection }        from "@/presentation/components/settings/AccountSection";
import { NotificationSection }   from "@/presentation/components/settings/NotificationSection";
import { DeleteAccountSection }  from "@/presentation/components/settings/DeleteAccountSection";
import { DevicesPanel }          from "@/presentation/components/settings/DevicesPanel";
import { FAQPanel }              from "@/presentation/components/settings/FAQPanel";

export default function AccountSettingsPage() {
  const { user } = useAuth();

  return (

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">

        {/* Left */}
        <div className="w-full lg:flex-1 lg:min-w-0 flex flex-col gap-4">
          <NameSection
            firstName={user?.fullName ?? ""}
            lastName={user?.lastName  ?? ""}
          />
          <AccountSection email={user?.email ?? ""} />
          <NotificationSection />
          <DeleteAccountSection />
        </div>

        {/* Right — sticky on desktop */}
        <div className="w-full lg:w-72 lg:shrink-0 lg:sticky lg:top-4 flex flex-col gap-4">
          <DevicesPanel />
          <FAQPanel />
        </div>

      </div>
  );
}