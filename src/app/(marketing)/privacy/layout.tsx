import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Systemly",
  description:
    "How Systemly handles personal information across its business management, booking, and related services.",
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
