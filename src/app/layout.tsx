import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import ToastProvider from "@/components/providers/ToastProvider";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "RaceDay Admin Portal | Operations Dashboard",
  description:
    "RaceDay operations dashboard for Race-staff, Admin, Manager, and Photographer roles.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} min-h-full`} suppressHydrationWarning>
      <body className="min-h-full antialiased bg-background text-foreground" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
