"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loading } from "@carbon/react";
import { useAuth } from "@/context/AuthContext";
import AppHeader from "./AppHeader";

// Auth is resolved client-side (see specs/frontend-spec.md > State Management
// Details) so there's a brief loading state before redirecting, rather than
// being blocked at the server.
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return <Loading withOverlay description="Loading" />;
  }

  return (
    <>
      <AppHeader />
      <main style={{ paddingTop: "3rem" }}>{children}</main>
    </>
  );
}
