import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Plus } from "lucide-react";
import { api } from "@/api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { format, isValid } from "date-fns";
import { Link, useParams } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import styles from "@/components/organisation/OrganizationWorkspace.module.css";

interface OrgProfileData {
  _id: string;
  name: string;
  email: string;
  description: string;
  type: string;
  website: string | null;
  createdAt: string;
}

function websiteUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function OrgProfile() {
  const orgId = useParams<{ id: string }>().id;
  const loggedInId = useSelector((state: RootState) => state.auth.organization?.id);
  const role = useSelector((state: RootState) => state.auth.role);
  const [orgProfile, setOrgProfile] = useState<OrgProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const home = role === "organization" ? "/organisation" : "/";

  useEffect(() => {
    const controller = new AbortController();
    const getOrgProfile = async () => {
      setIsLoading(true);
      setError(null);
      setOrgProfile(null);
      try {
        const endpoint =
          orgId === "0" ? "/organizations/profile" : `/organizations/profile/${orgId}`;
        const response = await api.get(endpoint, { signal: controller.signal });
        if (!controller.signal.aborted) setOrgProfile(response.data.data);
      } catch {
        if (!controller.signal.aborted)
          setError("We couldn’t load this organization’s profile. Please try again.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    void getOrgProfile();
    return () => controller.abort();
  }, [orgId, attempt]);

  const isOwner = role === "organization" && loggedInId === orgProfile?._id;
  const website = websiteUrl(orgProfile?.website ?? null);
  const created = orgProfile ? new Date(orgProfile.createdAt) : null;

  return (
    <div className={styles.profile}>
      <Link to={home} className={styles.backLink}>
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to home
      </Link>
      {isLoading ? (
        <div
          className="flex flex-col gap-8"
          role="status"
          aria-label="Loading organization profile"
        >
          <span className="sr-only">Loading organization profile</span>
          <div className="flex items-center gap-5">
            <Skeleton className="size-20" />
            <Skeleton className="h-12 w-2/3" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-start gap-4">
          <Alert variant="destructive">
            <AlertTitle>Profile unavailable</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button variant="outline" onClick={() => setAttempt((value) => value + 1)}>
            Try again
          </Button>
        </div>
      ) : !orgProfile ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Organization not found</EmptyTitle>
            <EmptyDescription>
              This profile may have been removed or the link may be incorrect.
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link to={home}>
              <ArrowLeft data-icon="inline-start" aria-hidden="true" />
              Back to home
            </Link>
          </Button>
        </Empty>
      ) : (
        <>
          <header className={styles.profileHeader}>
            <div className={styles.identity}>
              <div className={styles.monogram} aria-hidden="true">
                {orgProfile.name.trim().slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1>{orgProfile.name}</h1>
                <Badge variant="secondary" className="capitalize">
                  {orgProfile.type}
                </Badge>
              </div>
            </div>
            {isOwner ? (
              <Button asChild>
                <Link to="/organisation/create">
                  <Plus data-icon="inline-start" aria-hidden="true" />
                  Create post
                </Link>
              </Button>
            ) : (
              website && (
                <Button variant="outline" asChild>
                  <a href={website} target="_blank" rel="noopener noreferrer">
                    Visit website
                    <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
                  </a>
                </Button>
              )
            )}
          </header>
          <div className={styles.profileGrid}>
            <section className={styles.about} aria-labelledby="organization-about">
              <h2 id="organization-about">About the organization</h2>
              <p>{orgProfile.description || "This organization hasn’t added a description yet."}</p>
            </section>
            <aside>
              <Card>
                <CardHeader>
                  <CardTitle>Organization details</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className={styles.profileDetails}>
                    <div>
                      <dt>Email</dt>
                      <dd>{orgProfile.email}</dd>
                    </div>
                    <div>
                      <dt>Website</dt>
                      <dd>
                        {website ? (
                          <a href={website} target="_blank" rel="noopener noreferrer">
                            {orgProfile.website}
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>Member since</dt>
                      <dd>
                        {created && isValid(created)
                          ? format(created, "MMMM dd, yyyy")
                          : "Not available"}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              <p className={styles.profileNote}>
                Profile information is provided by the organization.
              </p>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

export default OrgProfile;
