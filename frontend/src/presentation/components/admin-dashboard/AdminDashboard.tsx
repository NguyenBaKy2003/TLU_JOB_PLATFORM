"use client";
import { useState }                  from "react";
import { AdminDashboardStatCards }   from "./AdminDashboardStatCards";
import { AdminDashboardChart }       from "./AdminDashboardChart";
import { AdminDashboardRecentJobs }  from "./AdminDashboardRecentJobs";
import { AdminDashboardSchedule }    from "./AdminDashboardSchedule";
import { AdminDashboardSubscription } from "./AdminDashboardSubscription";

export function AdminDashboard() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto ">
          <div className="flex gap-5">

            {/* Left / center */}
            <div className="flex-1 min-w-0 flex flex-col gap-5">
              <AdminDashboardStatCards />
              <AdminDashboardChart />
              <AdminDashboardRecentJobs />
            </div>

            {/* Right panel */}
            <div className="w-64 shrink-0 flex flex-col gap-4">
              <AdminDashboardSchedule />
              <AdminDashboardSubscription />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}