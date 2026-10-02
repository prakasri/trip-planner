import type { Metadata } from "next";
import { Theme } from "@carbon/react";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Evergreen Travels",
  description: "Plan your trip, day by day.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        {/* Registers the "IBM Plex Sans" font that Carbon's type styles
            reference by name — see globals.scss for why Carbon's own bundled
            font loading is disabled. next/font/google's Turbopack dev-mode
            resolution is broken on this Next.js version (16.3.8), so this
            loads the same family via a plain stylesheet link instead. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- this rule only knows the Pages Router's _document.js; this IS the App Router root layout, so it already applies to every page */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&display=swap"
        />
      </head>
      <body>
        <Theme theme="white">
          <AuthProvider>{children}</AuthProvider>
        </Theme>
      </body>
    </html>
  );
}
