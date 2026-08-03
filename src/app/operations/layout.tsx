import "./operations.css";
import "./operations-overrides.css";
import type { ReactNode } from "react";
import { OperationsWorkspaceFrame } from "@/modules/operations/components/OperationsWorkspaceFrame";

export default function OperationsLayout({ children }: { children: ReactNode }) {
  return (
    <OperationsWorkspaceFrame
      runtime={{
        mode: "live",
        basePath: "/operations",
      }}
    >
      {children}
    </OperationsWorkspaceFrame>
  );
}
