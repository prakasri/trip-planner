import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { Theme } from "@carbon/react";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.scss";

// Registers the "IBM Plex Sans" @font-face that Carbon's type styles
// reference by name — see globals.scss for why Carbon's own font loading
// is disabled.
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Evergreen Travels",
  description: "Plan your trip, day by day.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={ibmPlexSans.className}>
      <body>
        <Theme theme="white">
          <AuthProvider>{children}</AuthProvider>
        </Theme>
      </body>
    </html>
  );
}
