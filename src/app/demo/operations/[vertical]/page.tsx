import { redirect } from "next/navigation";

export default async function DemoVerticalRoot({
  params,
}: {
  params: Promise<{ vertical: string }>;
}) {
  const { vertical } = await params;
  redirect(`/demo/operations/${vertical}/calendar`);
}
