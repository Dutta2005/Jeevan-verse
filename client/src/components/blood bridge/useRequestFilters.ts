import { useSearchParams } from "react-router";
import { bloodGroups } from "./blood-request-form";

export function useRequestFilters() {
  const [search, setSearch] = useSearchParams();
  const legacy = search.get("filter")?.split(":");
  const rawGroup =
    search.get("bloodGroup") ?? (legacy?.[0] === "blood" ? legacy[1] || "all" : "all");
  const rawStatus =
    search.get("status") ??
    (legacy?.[0] === "status" ? legacy[1] || "all" : legacy ? "all" : "pending");
  const bloodGroup = bloodGroups.some((group) => group === rawGroup) ? rawGroup : "all";
  const status = ["pending", "completed", "rejected"].includes(rawStatus) ? rawStatus : "all";
  const sidebarExpanded = search.get("filters") !== "hidden";
  const toggleSidebar = () =>
    setSearch(
      (previous) => {
        const params = new URLSearchParams(previous);
        if (sidebarExpanded) params.set("filters", "hidden");
        else params.delete("filters");
        return params;
      },
      { replace: true },
    );

  return {
    bloodGroup,
    status,
    sidebarExpanded,
    toggleSidebar,
    activeCount: Number(bloodGroup !== "all") + Number(status !== "all"),
  };
}
