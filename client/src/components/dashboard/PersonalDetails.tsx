import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "../ui/card";
import { api } from "../../api/api";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
  GraduationCap,
  Stethoscope,
  Shield,
  Mail,
  Phone,
  MapPin,
  Ruler,
  Weight,
  Droplet,
  Info,
} from "lucide-react";

interface PersonalDetailsProps {
  _id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  canDonate: boolean;
  status: string;
  info: {
    bloodGroup: string;
    height: number;
    weight: number;
  };
  address: {
    state: string;
    district: string;
    city: string;
  };
  createdAt: string;
  updatedAt: string;
}

const UserIcon = ({
  status,
  ...props
}: {
  status: string;
  className?: string;
}) => {
  if (status === "doctor")
    return (
      <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full">
        <Stethoscope {...props} />
        <span className="font-medium">Doctor</span>
      </div>
    );
  else if (status === "medical student")
    return (
      <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full">
        <GraduationCap {...props} />
        <span className="font-medium">Medical Student</span>
      </div>
    );
};

const DetailRow = ({
  icon: Icon,
  label,
  value,
  important,
}: {
  icon: any;
  label: string;
  value: string | number;
  important: boolean;
}) => (
  <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-light-bg dark:hover:bg-dark-bg/50 transition-colors">
    <div className="flex-shrink-0">
      <Icon className="w-5 h-5 text-primary/70" />
    </div>
    <div className="">
      <div className="flex">
        <p className="text-sm text-light-text/70 dark:text-dark-text/70">
          {label}
        </p>
        {important && <span className="text-primary">*</span>}
      </div>
      <p className="font-medium">{value}</p>
    </div>
  </div>
);

export default function PersonalDetails() {
  const [details, setDetails] = useState<PersonalDetailsProps | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getDetails = async () => {
    try {
      const res = await api.get("/users/current-user/details");
      setDetails(res.data.data);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDetails();
  }, []);

  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
        <h1 className="text-2xl font-bold text-primary">Personal Details</h1>
      </CardHeader>
      <CardContent className="p-6">
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <div className="grid gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {details && (
          <div className="space-y-6">
            <div className="flex lg:flex-col items-center justify-between gap-2">
              <UserIcon status={details.status} className="w-5 h-5" />
              {details.canDonate && (
                <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Eligible Blood Donor
                  </span>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <DetailRow
                icon={Mail}
                label="Email Address"
                value={details.email}
                important={false}
              />
              <DetailRow
                icon={Phone}
                label="Phone Number"
                value={details.phone}
                important={false}
              />
              <DetailRow
                icon={Droplet}
                label="Blood Group"
                value={details.info.bloodGroup}
                important={true}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <DetailRow
                  icon={Ruler}
                  label="Height"
                  value={`${details.info.height} cm`}
                  important={true}
                />
                <DetailRow
                  icon={Weight}
                  label="Weight"
                  value={`${details.info.weight} kg`}
                  important={true}
                />
              </div>
              <DetailRow
                icon={MapPin}
                label="Address"
                value={`${details.address.city}, ${details.address.district}, ${details.address.state}`}
                important={true}
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-light-bg dark:bg-dark-bg border-t p-4">
        <div className="flex items-center gap-2 text-xs text-light-text/70 dark:text-dark-text/70">
          <Info size={15} />
          <span className="text-primary text-lg">*</span>

          <p>These details are never shared with anyone.</p>
        </div>
      </CardFooter>
    </Card>
  );
}
