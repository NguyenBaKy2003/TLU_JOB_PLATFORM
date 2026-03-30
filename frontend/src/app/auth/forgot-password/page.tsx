"use client";

import { useState }           from "react";
import { AuthLayout }         from "@/presentation/components/auth/AuthLayout";
import { ForgotPasswordForm } from "@/presentation/components/auth/forgot-password/ForgotPasswordForm";
import { SentConfirmation }   from "@/presentation/components/auth/forgot-password/SentConfirmation";

export default function ForgotPasswordPage() {
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  return (
    <AuthLayout imageSrc="/candidate.png">
      {sentEmail
        ? <SentConfirmation email={sentEmail} />
        : <ForgotPasswordForm onSent={setSentEmail} />
      }
    </AuthLayout>
  );
}