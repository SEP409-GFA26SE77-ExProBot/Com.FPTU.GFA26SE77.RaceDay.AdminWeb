import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import ToastProvider from "@/components/providers/ToastProvider";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "RaceDay | Quản trị và vận hành",
  description:
    "Trang quản trị và vận hành RaceDay dành cho quản trị viên, quản lý, nhân viên giải chạy và nhiếp ảnh gia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${inter.variable} min-h-full`} suppressHydrationWarning>
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
