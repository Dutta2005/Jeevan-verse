import { useEffect, useState } from "react";
import { Landmark, Mail, Globe, Building2, Calendar, Edit } from "lucide-react";
import { api } from "../../api/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { format, isValid } from "date-fns";
import { useParams } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

interface OrgProfileData {
  _id: string;
  name: string;
  email: string;
  description: string;
  type: string;
  website: string | null;
  createdAt: string;
  updatedAt: string;
}

function OrgProfile() {
  const orgId = useParams<{ id: string }>().id;
  const loggedInId = useSelector((state: RootState) => state.auth.organization?.id);
  const [orgProfile, setOrgProfile] = useState<OrgProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getOrgProfile = async () => {
    try {
      setIsLoading(true);
      setError(null); // Reset error state
      const response = await api.get(`/organizations/profile`);
      if (response.status === 200) {
        setOrgProfile(response.data.data);
      }
    } catch (err: any) {
      setError("Failed to fetch organization profile. Please try again later.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getOrgProfileById = async () => {
    try {
      setIsLoading(true);
      setError(null); // Reset error state
      const response = await api.get(`/organizations/profile/${orgId}`);
      if (response.status === 200) {
        setOrgProfile(response.data.data);
      }
    } catch (err: any) {
      setError("Failed to fetch organization profile by ID. Please try again later.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orgId === "0") getOrgProfile();
    else getOrgProfileById();
  }, [orgId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isValid(date) ? format(date, "MMMM dd, yyyy") : "Invalid date";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-48 bg-secondary/20 relative">
          <Skeleton className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full" />
        </div>
        <div className="max-w-3xl mx-auto px-4">
          <Skeleton className="h-12 w-48 mb-4" />
          <Skeleton className="h-24 w-full mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-6">
        <Alert variant="destructive">
          <div>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </div>
        </Alert>
      </div>
    );
  }

  if (!orgProfile) return null;

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg pb-10">
      {/* Header Section */}
      <div className="h-48 relative">
        <div className="h-full bg-secondary/20" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-light-bg dark:bg-dark-bg p-6 rounded-full shadow-lg">
          <Landmark className="w-16 h-16 text-primary" />
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-3xl mx-auto px-4 mt-3">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">
            {orgProfile.name}
          </h1>
          <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium capitalize">
            {orgProfile.type}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-light-text dark:text-dark-text">
                <Mail className="w-4 h-4 opacity-70" />
                <span>{orgProfile.email}</span>
              </div>
              {orgProfile.website && (
                <div className="flex items-center gap-2 text-light-text dark:text-dark-text">
                  <Globe className="w-4 h-4 opacity-70" />
                  <a
                    href={orgProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:underline"
                  >
                    {orgProfile.website}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Organization Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-light-text dark:text-dark-text">
                <span className="block opacity-70">Member since</span>
                <span className="font-medium">
                  {formatDate(orgProfile.createdAt)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-xl">About</span>
              {loggedInId === orgProfile._id && (
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-light-text dark:text-dark-text whitespace-pre-wrap">
              {orgProfile.description}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OrgProfile;
