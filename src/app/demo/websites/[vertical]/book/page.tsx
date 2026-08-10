import { notFound } from "next/navigation";
import {
  getDemoWebsiteData,
  isDemoWebsiteVertical,
} from "@/modules/demo/websites/demo-website.fixtures";
import { DemoBookingFlow } from "@/modules/demo/websites/DemoBookingFlow";

export default async function DemoWebsiteBookingPage({
  params,
}: {
  params: Promise<{ vertical: string }>;
}) {
  const { vertical } = await params;
  if (!isDemoWebsiteVertical(vertical)) notFound();

  const data = getDemoWebsiteData(vertical);
  return (
    <DemoBookingFlow
      vertical={vertical}
      businessName={data.businessName}
      services={data.services.map((service) => ({
        id: service.id,
        name: service.name,
        category: service.category,
        durationMin: Number(service.durationMin),
        priceEgp: Number(service.priceEgp),
      }))}
      staff={data.staff.map((member) => ({
        id: member.id,
        name: member.name,
        jobTitle: member.jobTitle,
      }))}
    />
  );
}
