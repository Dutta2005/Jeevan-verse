import type { ReactNode } from "react";
import { UmeedContext } from "./umeed-context";
import { useChatController } from "./useChatController";
export function UmeedProvider({ children }: { children: ReactNode }) {
  const value = useChatController();
  return <UmeedContext.Provider value={value}>{children}</UmeedContext.Provider>;
}
