"use client";

// src/app/settings/confirm-email/ConfirmEmailPageClient.tsx

import { useSearchParams }    from "next/navigation";
import { ConfirmEmailForm }   from "@/presentation/components/auth/confirm-email/ConfirmEmailForm";
import { InvalidTokenState }  from "@/presentation/components/auth/reset-password/InvalidTokenState";

type Role = "candidate" | "employer" | "admin";

const VALID_ROLES: Role[] = ["candidate", "employer", "admin"];

function isValidRole(value: string | null): value is Role {
  return VALID_ROLES.includes(value as Role);
}

export function ConfirmEmailPageClient() {
  const searchParams = useSearchParams();
  const token  = searchParams.get("token");
  const userId = searchParams.get("userId");
  const role   = searchParams.get("role");

  // Thiếu bất kỳ param nào hoặc role không hợp lệ → invalid
  if (!token || !userId || !isValidRole(role)) {
    return <InvalidTokenState />;
  }

  return <ConfirmEmailForm token={token} userId={userId} role={role} />;
}