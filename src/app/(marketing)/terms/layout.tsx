import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Systemly",
  description:
    "The terms that govern use of Systemly's business management, booking, and related services.",
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
