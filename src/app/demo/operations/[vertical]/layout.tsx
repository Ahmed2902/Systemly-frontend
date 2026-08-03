import "../../../operations/operations.css";
import "../../../operations/operations-overrides.css";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { DemoOperationsEnvironment } from "@/modules/demo/operations/DemoOperationsEnvironment";
import type { OperationsVertical } from "@/modules/operations/runtime/operations-runtime";

export const metadata = {
  title: "Systemly operations demo",
  description: "A fictional interactive Systemly workspace.",
  robots: { index: false, follow: false },
};

function isVertical(value: string): value is OperationsVertical {
  return value === "salon" || value === "clinic";
}

export default async function DemoOperationsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ vertical: string }>;
}) {
  const { vertical } = await params;
  if (!isVertical(vertical)) notFound();
  return (
    <DemoOperationsEnvironment vertical={vertical}>
      {children}
    </DemoOperationsEnvironment>
  );
}
