
import { Suspense }            from "react";
import { EmployerLoginClient } from "./EmployerLoginClient";

export default function EmployerLoginPage() {
  return (
    <Suspense fallback={null}>
      <EmployerLoginClient />
    </Suspense>
  );
}