import type { ReactNode } from "react";
import { SmcrDataProvider } from "./context/SmcrDataContext";

export default function SmcrLayout({ children }: { children: ReactNode }) {
  return <SmcrDataProvider>{children}</SmcrDataProvider>;
}
