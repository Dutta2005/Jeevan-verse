import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router";
import { Ellipsis } from "lucide-react";
import type { RootState } from "@/store/store";
import { api } from "@/api/api";
import { getErrorMessage } from "@/lib/error";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import RequestCard from "./RequestCard";
import RequestPagination from "./RequestPagination";
import EditRequest from "./EditRequest";
import type { BloodRequestPage } from "./blood-request-types";
import styles from "./BloodBridge.module.css";

export default function UserRequests() {
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const [result, setResult] = useState<BloodRequestPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useSearchParams();
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
  const [retry, setRetry] = useState(0);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [editPending, setEditPending] = useState(false);
  const actionLock = useRef(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const actionTriggers = useRef(new Map<string, HTMLButtonElement>());
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const restoreFocus = (event: Event) => {
    event.preventDefault();
    const fallback = document.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    (returnFocus.current?.isConnected ? returnFocus.current : fallback)?.focus();
  };
  const requestKey = JSON.stringify([userId, page, retry]);
  const [previousRequestKey, setPreviousRequestKey] = useState(requestKey);
  if (previousRequestKey !== requestKey) {
    setPreviousRequestKey(requestKey);
    setLoading(true);
    setError(null);
  }
  useEffect(() => {
    if (!userId) return;
    let active = true;

    api
      .get(`/blood-requests/user/${userId}?page=${page}`)
      .then((response) => {
        if (response.status !== 200) throw new Error("Could not load requests");
        if (active) setResult(response.data.data);
      })
      .catch((error: unknown) => {
        if (active) setError(getErrorMessage(error, "Failed to fetch blood requests"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId, page, retry]);
  const complete = async (id: string) => {
    if (actionLock.current) return;
    actionLock.current = true;
    setPending(true);
    setError(null);
    try {
      const response = await api.patch(`/blood-requests/status/${id}`, { status: "completed" });
      if (response.status !== 200) throw new Error("Could not update request");
      setResult((previous) =>
        previous
          ? {
              ...previous,
              bloodRequests: previous.bloodRequests.map((request) =>
                request._id === id ? { ...request, status: "completed" } : request,
              ),
            }
          : previous,
      );
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Failed to mark request as completed"));
    } finally {
      actionLock.current = false;
      setPending(false);
    }
  };
  const remove = async (id: string) => {
    if (actionLock.current) return;
    actionLock.current = true;
    setPending(true);
    setError(null);
    try {
      const response = await api.delete(`/blood-requests/delete/${id}`);
      if (response.status !== 200) throw new Error("Could not delete request");
      if (result?.bloodRequests.length === 1 && page > 1) setPage(page - 1);
      else setRetry((value) => value + 1);
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Failed to delete request"));
    } finally {
      actionLock.current = false;
      setPending(false);
      setDeleting(null);
    }
  };
  return (
    <section aria-label="My blood requests">
      {error && (
        <Alert variant="destructive" className="mb-5">
          <AlertDescription>{error}</AlertDescription>
          <Button variant="outline" className="mt-3" onClick={() => setRetry((value) => value + 1)}>
            Try again
          </Button>
        </Alert>
      )}
      {loading ? (
        <div className={styles.list} aria-label="Loading your requests">
          {[1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-48 w-full" />
          ))}
        </div>
      ) : !result?.bloodRequests.length ? (
        !error && (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No requests yet</EmptyTitle>
              <EmptyDescription>Use Create request to share a blood need</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )
      ) : (
        <>
          <div className={styles.list}>
            {result.bloodRequests.map((request) => (
              <RequestCard
                key={request._id}
                request={request}
                menu={
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Actions for ${request.bloodGroup} request`}
                        ref={(element) => {
                          if (element) actionTriggers.current.set(request._id, element);
                          else actionTriggers.current.delete(request._id);
                        }}
                        disabled={pending}
                      >
                        <Ellipsis aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          onSelect={() => {
                            returnFocus.current = actionTriggers.current.get(request._id) || null;
                            setEditing(request._id);
                          }}
                        >
                          Edit request
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            returnFocus.current = actionTriggers.current.get(request._id) || null;
                            setDeleting(request._id);
                          }}
                        >
                          Delete request
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                }
                actions={
                  request.status === "pending" ? (
                    <Button
                      variant="secondary"
                      disabled={pending}
                      onClick={() => void complete(request._id)}
                    >
                      Mark as completed
                    </Button>
                  ) : undefined
                }
              />
            ))}
          </div>
          <RequestPagination page={result} onPage={setPage} />
        </>
      )}
      <Sheet
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open && !editPending) setEditing(null);
        }}
      >
        <SheetContent
          side="right"
          className={styles.drawer}
          onCloseAutoFocus={restoreFocus}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            titleRef.current?.focus();
          }}
        >
          <SheetHeader className={styles.drawerHeader}>
            <SheetTitle ref={titleRef} tabIndex={-1} className="outline-none">
              Edit blood request
            </SheetTitle>
            <SheetDescription>Keep the request and contact details up to date</SheetDescription>
          </SheetHeader>
          {editing && (
            <EditRequest
              requestId={editing}
              onSave={() => {
                setEditing(null);
                setRetry((value) => value + 1);
              }}
              onCancel={() => setEditing(null)}
              onPendingChange={setEditPending}
            />
          )}
        </SheetContent>
      </Sheet>
      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open && !actionLock.current) setDeleting(null);
        }}
      >
        <AlertDialogContent onCloseAutoFocus={restoreFocus}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this request?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the request. To stop seeking volunteers and keep the record, mark it as
              completed instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Keep request</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(event) => {
                event.preventDefault();
                if (deleting) void remove(deleting);
              }}
            >
              {pending ? "Deleting…" : "Delete request"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
