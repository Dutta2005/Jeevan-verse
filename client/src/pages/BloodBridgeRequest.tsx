import { Link, useLocation, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { api } from "@/api/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import BeVolunteer from "@/components/blood bridge/BeVolunteer";
import styles from "@/components/blood bridge/BloodBridge.module.css";

interface Volunteer {
  _id?: string;
  user: { _id: string; name: string; email?: string; phone?: string } | null;
  canShareDetails: boolean;
}
interface RequestDetails {
  _id: string;
  userId: string;
  bloodGroup: string;
  urgency: string;
  status: string;
  message: string;
  createdAt: string;
  address: { city: string; district: string; state: string };
  contactDetails: { phone: string; email?: string };
  volunteers: Volunteer[];
}

export default function BloodBridgeRequest() {
  const { id } = useParams();
  const { state } = useLocation();
  const backTo =
    typeof state?.from === "string" && /^\/bloodbridge(?:\?|$)/.test(state.from)
      ? state.from
      : "/bloodbridge";
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const requestKey = JSON.stringify([id, retry]);
  const [previousRequestKey, setPreviousRequestKey] = useState(requestKey);
  if (previousRequestKey !== requestKey) {
    setPreviousRequestKey(requestKey);
    setLoading(true);
    setError("");
    setRequest(null);
  }
  useEffect(() => {
    let active = true;

    api
      .get(`/blood-requests/${id}`)
      .then((response) => {
        if (active) setRequest(response.data.data);
      })
      .catch(() => {
        if (active) setError("Failed to load request details. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, retry]);
  const owner = request?.userId === userId;
  const volunteered = request?.volunteers?.some((volunteer) => volunteer.user?._id === userId);
  return (
    <div className={styles.page}>
      <Button variant="ghost" asChild className="mb-6">
        <Link to={backTo}>
          <ArrowLeft data-icon="inline-start" aria-hidden="true" />
          Back to requests
        </Link>
      </Button>
      {loading ? (
        <div className="flex flex-col gap-6" aria-label="Loading request details">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
          <Button variant="outline" className="mt-3" onClick={() => setRetry((value) => value + 1)}>
            Try again
          </Button>
        </Alert>
      ) : !request ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No request found.</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <header className={styles.header}>
            <div className={styles.cardHeading}>
              <span className={styles.bloodType} aria-hidden="true">
                {request.bloodGroup}
              </span>
              <div>
                <h1>{request.bloodGroup} blood request</h1>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant={request.urgency === "high" ? "destructive" : "secondary"}>
                    {request.urgency[0]?.toUpperCase() + request.urgency.slice(1)} urgency
                  </Badge>
                  <Badge variant="outline">
                    {request.status === "pending"
                      ? "Open"
                      : request.status[0]?.toUpperCase() + request.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
            {owner ? (
              <Button variant="outline" asChild>
                <Link to="/bloodbridge?view=mine">Manage your requests</Link>
              </Button>
            ) : request.status === "pending" ? (
              volunteered ? (
                <span className="text-sm text-muted-foreground">You volunteered</span>
              ) : (
                <BeVolunteer id={request._id} onJoined={() => setRetry((value) => value + 1)} />
              )
            ) : null}
          </header>
          <div className={styles.detailGrid}>
            <div className={styles.detailMain}>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <h2>Request details</h2>
                  </CardTitle>
                  {request.createdAt && !Number.isNaN(Date.parse(request.createdAt)) && (
                    <CardDescription>
                      <time dateTime={request.createdAt}>
                        Posted{" "}
                        {new Date(request.createdAt).toLocaleDateString("en", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className={styles.requestMessage}>
                    {request.message || "No additional details"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <h2>Location</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={styles.location}>
                    {[request.address?.city, request.address?.district, request.address?.state]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </CardContent>
              </Card>
              {owner && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <h2>Volunteers</h2>
                    </CardTitle>
                    <CardDescription>
                      Contact details appear only when a volunteer chooses to share them
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!request.volunteers?.length ? (
                      <Empty className="px-0 py-4">
                        <EmptyHeader>
                          <EmptyTitle>No volunteers yet.</EmptyTitle>
                        </EmptyHeader>
                      </Empty>
                    ) : (
                      <ul className={styles.volunteers}>
                        {request.volunteers.map((volunteer, index) => (
                          <li key={volunteer._id || volunteer.user?._id || index}>
                            <p className="text-sm font-medium">
                              {volunteer.user?.name || "Member unavailable"}
                            </p>
                            {volunteer.canShareDetails ? (
                              <div className={styles.volunteerContact}>
                                <p>{volunteer.user?.phone || "-"}</p>
                                <p>{volunteer.user?.email || "-"}</p>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                Contact details hidden
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
            <aside aria-label="Request contact and coordination">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <h2>Contact details</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className={styles.contactList}>
                    <div>
                      <dt>Phone</dt>
                      <dd>
                        <a href={`tel:${request.contactDetails.phone.replace(/[^\d+]/g, "")}`}>
                          {request.contactDetails.phone}
                        </a>
                      </dd>
                    </div>
                    {request.contactDetails.email && (
                      <div>
                        <dt>Email</dt>
                        <dd>
                          <a href={`mailto:${request.contactDetails.email}`}>
                            {request.contactDetails.email}
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>
                  <p className="mt-6 text-xs text-muted-foreground">
                    {request.volunteers?.length || 0}{" "}
                    {(request.volunteers?.length || 0) === 1 ? "volunteer" : "volunteers"}
                  </p>
                </CardContent>
              </Card>
            </aside>
          </div>
          <p className={styles.note}>
            Volunteer coordination does not verify donor eligibility or guarantee a donation.
            Confirm requirements and arrangements with the hospital or blood bank.
          </p>
        </>
      )}
    </div>
  );
}
