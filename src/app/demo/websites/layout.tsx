import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Public website demos | Systemly",
  description:
    "Fictional salon and clinic websites rendered with the production Systemly templates.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DemoWebsitesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
