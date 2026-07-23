import StaffProfileScreen from "@/modules/staff/components/StaffProfileScreen";

export default async function StaffProfilePage({
  params,
}: {
  params: Promise<{ staffId: string }>;
}) {
  const { staffId } = await params;
  return <StaffProfileScreen staffId={staffId} />;
}
