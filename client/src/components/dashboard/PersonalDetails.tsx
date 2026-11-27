import { useEffect, useState } from "react";
import { api } from "@/api/api";
import { getErrorMessage } from "@/lib/error";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import styles from "./Dashboard.module.css";

interface PersonalDetailsProps {
  name: string;
  email: string;
  phone: string;
  age: number;
  canDonate: boolean;
  status: string;
  info: { bloodGroup: string; height: number; weight: number };
  address: { state: string; district: string; city: string };
}

export default function PersonalDetails() {
  const [details, setDetails] = useState<PersonalDetailsProps | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    let active = true;
    api
      .get("/users/current-user/details")
      .then((res) => {
        if (active) setDetails(res.data.data);
      })
      .catch((error: unknown) => {
        if (active) setError(getErrorMessage(error, "Failed to fetch details"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Your profile</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex flex-col gap-5" aria-label="Loading profile">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!loading && !error && details && (
          <>
            <dl className={styles.details}>
              <div className={styles.profileEmail}>
                <dt>Email</dt>
                <dd>{details.email || "Not added"}</dd>
              </div>
              <div>
                <dt>Blood group</dt>
                <dd>{details.info?.bloodGroup || "Not added"}</dd>
              </div>
            </dl>
            <Collapsible open={expanded} onOpenChange={setExpanded} className={styles.profileMore}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {expanded ? "Less detail" : "Profile details"}
                  <ChevronDown
                    aria-hidden="true"
                    data-icon="inline-end"
                    className={expanded ? "rotate-180" : undefined}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <dl className={styles.details}>
                  <div>
                    <dt>Phone</dt>
                    <dd>{details.phone || "Not added"}</dd>
                  </div>
                  <div>
                    <dt>Height</dt>
                    <dd>{details.info?.height ? `${details.info.height} cm` : "Not added"}</dd>
                  </div>
                  <div>
                    <dt>Weight</dt>
                    <dd>{details.info?.weight ? `${details.info.weight} kg` : "Not added"}</dd>
                  </div>
                  {(details.status === "doctor" || details.status === "medical student") && (
                    <div>
                      <dt>Background</dt>
                      <dd>
                        {details.status === "doctor" ? "Doctor" : "Medical Student"}
                        <span className="block text-xs text-muted-foreground">Self-reported</span>
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt>Address</dt>
                    <dd>
                      {[details.address?.city, details.address?.district, details.address?.state]
                        .filter(Boolean)
                        .join(", ") || "Not added"}
                    </dd>
                  </div>
                </dl>
              </CollapsibleContent>
            </Collapsible>
          </>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Profile details do not establish blood donor eligibility.
        </p>
      </CardFooter>
    </Card>
  );
}
