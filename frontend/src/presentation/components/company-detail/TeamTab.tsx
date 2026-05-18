// src/presentation/components/company-detail/TeamTab.tsx
"use client";
import { Linkedin } from "lucide-react";
import type { CompanyProfile, TeamMember } from "@/domain/models/Company";
import Image from "next/image";

interface Props {
  company: CompanyProfile;
}

function TeamMemberAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  if (avatarUrl) {
    return (
      <div className="w-20 h-20 rounded-full overflow-hidden mx-auto bg-gray-100">
        <Image src={avatarUrl} alt={name} width={80} height={80} className="w-full h-full object-cover" />
      </div>
    );
  }

  const colors = [
    "from-blue-400 to-blue-600", "from-purple-400 to-purple-600",
    "from-green-400 to-green-600", "from-orange-400 to-orange-600",
    "from-pink-400 to-pink-600", "from-teal-400 to-teal-600",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  
  return (
    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-xl mx-auto`}>
      {initials}
    </div>
  );
}

export function TeamTab({ company }: Props) {
  const teamMembers = company.teamMembers || [];

  if (teamMembers.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-6">Đội ngũ</h2>
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-[16px] text-gray-400">Chưa có thông tin đội ngũ</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-6">Đội ngũ lãnh đạo</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {teamMembers.map((member) => (
          <div key={member.id} className="flex flex-col items-center text-center gap-3">
            <TeamMemberAvatar name={member.fullName} avatarUrl={member.avatarUrl} />
            <div>
              <p className="text-[16px] font-semibold text-gray-800 leading-tight">{member.fullName}</p>
              <p className="text-xs text-gray-500 mt-0.5">{member.jobTitle}</p>
              {member.bio && (
                <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{member.bio}</p>
              )}
            </div>
            {member.linkedinUrl && (
              <div className="flex items-center gap-2">
                <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                  <Linkedin size={16} />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}