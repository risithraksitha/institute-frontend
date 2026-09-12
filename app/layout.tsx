import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css"; /* CSS EKA CONNECT WENA LINE EKA */
import ClientWrapper from "@/components/ClientWrapper";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Institute OS | NovaTech",
  description: "Advanced Institute Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${jakarta.className} bg-slate-950 text-slate-100 flex h-screen overflow-hidden antialiased`}>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}