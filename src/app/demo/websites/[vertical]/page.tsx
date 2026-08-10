import { notFound } from "next/navigation";
import {
  DEMO_WEBSITE_VERTICALS,
  getDemoWebsiteData,
  isDemoWebsiteVertical,
} from "@/modules/demo/websites/demo-website.fixtures";
import { renderTemplate } from "@/modules/templates/template-registry";

export function generateStaticParams() {
  return DEMO_WEBSITE_VERTICALS.map((vertical) => ({ vertical }));
}

export default async function DemoPublicWebsitePage({
  params,
}: {
  params: Promise<{ vertical: string }>;
}) {
  const { vertical } = await params;
  if (!isDemoWebsiteVertical(vertical)) notFound();

  return renderTemplate(getDemoWebsiteData(vertical));
}
