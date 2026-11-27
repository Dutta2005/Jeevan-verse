import { createContext, useContext } from "react";
import type { useChatController } from "./useChatController";
export const UmeedContext = createContext<ReturnType<typeof useChatController> | null>(null);
export function useUmeed() {
  const value = useContext(UmeedContext);
  if (!value) throw new Error("Umeed must be rendered inside its workspace");
  return value;
}
