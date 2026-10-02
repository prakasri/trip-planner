"use client";

import { Header, HeaderName, HeaderGlobalBar, HeaderGlobalAction } from "@carbon/react";
import { Logout } from "@carbon/icons-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AppHeader() {
  const { logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <Header aria-label="Evergreen Travels">
      <HeaderName href="/trips" prefix="">
        Evergreen Travels
      </HeaderName>
      <HeaderGlobalBar>
        <HeaderGlobalAction aria-label="Log out" onClick={handleLogout}>
          <Logout size={20} />
        </HeaderGlobalAction>
      </HeaderGlobalBar>
    </Header>
  );
}
