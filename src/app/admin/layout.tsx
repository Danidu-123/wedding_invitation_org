import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Thinidu & Chenaji",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-svh bg-[#f6f3ec] text-navy-900">{children}</div>;
}
