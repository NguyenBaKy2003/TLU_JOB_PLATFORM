// src/presentation/components/company-detail/JobsTab.tsx
"use client";
import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import { CompanyAvatar } from "@/presentation/components/companies/CompanyAvatar";
import type { CompanyProfile } from "@/domain/models/Company";

// Define Job interface locally or import from a separate file
interface Job {
  id: string;
  title: string;
  location: string;
  salary: string;
  postedAgo: string;
  tags: string[];
}

interface Props {
  company: CompanyProfile;
  jobs?: Job[];
}

const TAG_STYLES: Record<string, string> = {
  "Full Time": "bg-blue-50 text-blue-600 border-blue-200",
  "Part Time": "bg-purple-50 text-purple-600 border-purple-200",
  "Remote": "bg-green-50 text-green-600 border-green-200",
  "Hybrid": "bg-teal-50 text-teal-600 border-teal-200",
  "Senior": "bg-orange-50 text-orange-600 border-orange-200",
  "Mid Level": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Internship": "bg-pink-50 text-pink-600 border-pink-200",
};

function JobCard({ job, companyName }: { job: Job; companyName: string }) {
  return (
    <Link href={`/jobs/${job.id}`} className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all group">
      <CompanyAvatar name={companyName} size={44} />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-gray-400 mb-0.5">{companyName}</p>
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{job.title}</h3>
        <div className="flex flex-wrap items-center gap-1.5 my-2">
          {job.tags.map(tag => (
            <span key={tag} className={`px-2 py-0.5 text-[11px] font-medium rounded-full border ${TAG_STYLES[tag] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><MapPin size={11} /> {job.location}</span>
          <span className="flex items-center gap-1"><Clock size={11} /> {job.postedAgo}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-blue-600">{job.salary}</p>
      </div>
    </Link>
  );
}

export function JobsTab({ company, jobs = [] }: Props) {
  if (jobs.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Việc làm đang tuyển</h2>
        </div>
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-sm text-gray-400">Chưa có tin tuyển dụng nào</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Việc làm đang tuyển</h2>
        <Link href={`/jobs?company=${company.id}`} className="text-sm text-blue-600 hover:underline font-medium flex items-center gap-1">
          Xem tất cả →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map(job => <JobCard key={job.id} job={job} companyName={company.name} />)}
      </div>
    </div>
  );
}