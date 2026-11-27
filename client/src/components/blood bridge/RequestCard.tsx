import type { ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BloodRequestRecord } from "./blood-request-types";
import styles from "./BloodBridge.module.css";

export default function RequestCard({
  request,
  actions,
  menu,
}: {
  request: BloodRequestRecord;
  actions?: ReactNode;
  menu?: ReactNode;
}) {
  const location = useLocation();
  const urgency = request.urgency[0]?.toUpperCase() + request.urgency.slice(1);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className={styles.cardHeading}>
            <span className={styles.bloodType} aria-hidden="true">
              {request.bloodGroup}
            </span>
            <div className="flex min-w-0 flex-col gap-2">
              <CardTitle>
                <h2>{request.bloodGroup} blood request</h2>
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant={request.urgency === "high" ? "destructive" : "secondary"}>
                  {urgency} urgency
                </Badge>
                <Badge variant="outline">
                  {request.status === "pending"
                    ? "Open"
                    : request.status[0]?.toUpperCase() + request.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
          {menu}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <p className={styles.location}>
            {[request.address?.city, request.address?.district, request.address?.state]
              .filter(Boolean)
              .join(", ")}
          </p>
          <p className={styles.requestExcerpt}>{request.message || "No additional details"}</p>
          {request.volunteers && (
            <p className="text-xs text-muted-foreground">
              {request.volunteers.length}{" "}
              {request.volunteers.length === 1 ? "volunteer" : "volunteers"}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-between gap-3">
        <Button variant="outline" asChild>
          <Link
            to={`/bloodbridge/request/${request._id}`}
            state={{ from: location.pathname + location.search }}
          >
            View details
          </Link>
        </Button>
        {actions}
      </CardFooter>
    </Card>
  );
}
