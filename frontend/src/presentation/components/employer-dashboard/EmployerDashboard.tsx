// src/presentation/components/employer-dashboard/EmployerDashboard.tsx
"use client";
import { DashboardStatCards }      from "./DashboardStatCards";
import { DashboardChart }          from "./DashboardChart";
import { DashboardRecentJobs }     from "./DashboardRecentJobs";
import { DashboardSchedule }       from "./DashboardSchedule";
import { DashboardSubscription }   from "./DashboardSubscription";

export function EmployerDashboard() {

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">


      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        <div className="flex-1 overflow-y-auto">
          <div className="flex gap-5">

            {/* Left / center */}
            <div className="flex-1 min-w-0 flex flex-col gap-5">
              <DashboardStatCards />
              <DashboardChart />
              <DashboardRecentJobs />
            </div>

            {/* Right panel */}
            <div className="w-64 shrink-0 flex flex-col gap-4">
              <DashboardSchedule />
              <DashboardSubscription />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}