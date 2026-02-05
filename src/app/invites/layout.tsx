import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accept Invitation - Nasara Connect",
  robots: { index: false },
};

export default function InvitesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      {children}
    </div>
  );
}
