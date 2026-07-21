import { CustomersWorkspace } from "@/modules/customers/components/CustomersWorkspace";

export default async function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;
  return <CustomersWorkspace initialCustomerId={customerId} />;
}
