import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router";
import type { RootState } from "@/store/store";
import { api } from "@/api/api";
import { getErrorMessage } from "@/lib/error";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import RequestFilters from "./RequestFilters";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import RequestCard from "./RequestCard";
import RequestPagination from "./RequestPagination";
import BeVolunteer from "./BeVolunteer";
import { useRequestFilters } from "./useRequestFilters";
import type { BloodRequestPage } from "./blood-request-types";
import styles from "./BloodBridge.module.css";

export default function Requests({
  filterSidebarId,
  onCloseFilters,
}: {
  filterSidebarId: string;
  onCloseFilters: () => void;
}) {
  const user = useSelector((state: RootState) => state.auth.user);
  const [search, setSearch] = useSearchParams();
  const { bloodGroup, status, sidebarExpanded } = useRequestFilters();
  const requestedPage = Number(search.get("page") || 1);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const setPage = (next: number) =>
    setSearch(
      (previous) => {
        const params = new URLSearchParams(previous);
        params.set("page", String(next));
        return params;
      },
      { replace: true },
    );
  const [result, setResult] = useState<BloodRequestPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const requestKey = JSON.stringify([bloodGroup, status, page, retry]);
  const [previousRequestKey, setPreviousRequestKey] = useState(requestKey);
  if (previousRequestKey !== requestKey) {
    setPreviousRequestKey(requestKey);
    setLoading(true);
    setError(null);
  }
  useEffect(() => {
    let active = true;

    const params = new URLSearchParams();
    if (bloodGroup !== "all") params.set("bloodGroup", bloodGroup);
    if (status !== "all") params.set("status", status);
    params.set("page", String(page));
    api
      .get(`/blood-requests?${params.toString()}`)
      .then((response) => {
        if (response.status !== 200) throw new Error("Could not load requests");
        if (active) setResult(response.data.data);
      })
      .catch((error: unknown) => {
        if (active) setError(getErrorMessage(error, "Failed to fetch requests"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [bloodGroup, status, page, retry]);
  const changeFilter = (name: "bloodGroup" | "status", value: string) => {
    setSearch(
      (previous) => {
        const params = new URLSearchParams(previous);
        params.delete("filter");
        params.delete("page");
        params.set("bloodGroup", name === "bloodGroup" ? value : bloodGroup);
        params.set("status", name === "status" ? value : status);
        return params;
      },
      { replace: true },
    );
  };
  const clearFilters = () =>
    setSearch(
      (previous) => {
        const params = new URLSearchParams(previous);
        params.delete("filter");
        params.delete("page");
        params.set("bloodGroup", "all");
        params.set("status", "all");
        return params;
      },
      { replace: true },
    );
  const filters = (
    <RequestFilters
      bloodGroup={bloodGroup}
      status={status}
      onChange={changeFilter}
      onClear={clearFilters}
    />
  );
  return (
    <section
      aria-label="Browse blood requests"
      className={styles.browseLayout}
      data-filters-expanded={sidebarExpanded}
    >
      <aside
        id={filterSidebarId}
        hidden={!sidebarExpanded}
        className={styles.filterSidebar}
        aria-label="Request filters"
      >
        <h2 className={styles.filterTitle}>Filters</h2>
        {filters}
      </aside>
      <div className={styles.results}>
        {loading ? (
          <div className={styles.list} aria-label="Loading requests">
            {[1, 2, 3].map((key) => (
              <Skeleton key={key} className="h-48 w-full" />
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => setRetry((value) => value + 1)}
            >
              Try again
            </Button>
          </Alert>
        ) : !result?.bloodRequests.length ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No requests found</EmptyTitle>
              <EmptyDescription>Try another blood group or request status</EmptyDescription>
            </EmptyHeader>
            {(bloodGroup !== "all" || status !== "all") && (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </Empty>
        ) : (
          <>
            <div className={styles.list}>
              {result.bloodRequests.map((request) => {
                const volunteered = request.volunteers?.some(
                  (volunteer) =>
                    (typeof volunteer.user === "string" ? volunteer.user : volunteer.user?._id) ===
                    user?.id,
                );
                return (
                  <RequestCard
                    key={request._id}
                    request={request}
                    actions={
                      volunteered ? (
                        <span className="text-sm text-muted-foreground">You volunteered</span>
                      ) : request.bloodGroup === user?.bloodGroup &&
                        request.status === "pending" &&
                        request.userId !== user?.id ? (
                        <BeVolunteer
                          id={request._id}
                          onJoined={() => setRetry((value) => value + 1)}
                        />
                      ) : undefined
                    }
                  />
                );
              })}
            </div>
            <RequestPagination page={result} onPage={setPage} />
          </>
        )}
      </div>
      <SheetContent side="right" className={styles.filterDrawer}>
        <SheetHeader className="text-left">
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Refine the request list</SheetDescription>
        </SheetHeader>
        {filters}
        <SheetFooter>
          <Button onClick={onCloseFilters}>Show requests</Button>
        </SheetFooter>
      </SheetContent>
    </section>
  );
}
