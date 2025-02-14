import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ArrowRight, ChevronLeft, ChevronRight, HandHelping, Loader2 } from "lucide-react";
import { RootState } from "../../store/store";
import { api } from "../../api/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import BeVolunteer from "./BeVolunteer";
import { Link } from "react-router";

interface Requests {
  bloodRequests: Request[];
  hasNext: boolean;
  hasPrev: boolean;
  currentPage: number;
  totalPages: number;
}

interface Address {
  state: string;
  district: string;
  city: string;
}

interface ContactDetails {
  email: string;
  phone: string;
}

interface Request {
  _id: string;
  bloodGroup: string;
  urgency: string;
  message: string;
  contactDetails: ContactDetails;
  status: string;
  address: Address;
  volunteers: [
    {
      user: string;
    }
  ];
}

const validBloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const statusOptions = ["all", "pending", "accepted", "rejected"];
const sortOptions = ["newest", "oldest"];

function Requests() {
  const userBG = useSelector((state: RootState) => state.auth.user?.bloodGroup);
  const [requests, setRequests] = useState<Requests | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    bloodGroup: userBG || "all",
    status: "all",
    sort: "newest",
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = "/blood-requests";

      if (filters.bloodGroup !== "all") {
        url = `/blood-requests/blood-group?bloodGroup=${filters.bloodGroup}`;
      }
      if (filters.status !== "all") {
        url = `/blood-requests/status?status=${filters.status}`;
      }

      url += `${url.includes("?") ? "&" : "?"}page=${currentPage}`;
      const response = await api.get(url);

      if (response.status === 200) {
        const data = response.data.data;
        if (filters.sort === "oldest") {
          data.bloodRequests = data.bloodRequests.reverse();
        }
        setRequests(data);
      }
    } catch (error: any) {
      setError(error?.message || "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentPage, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setCurrentPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  return (
    <div className="container mx-auto px-1 md:px-4 py-8 ">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex flex-wrap gap-4">
          <Select
            value={filters.bloodGroup}
            onValueChange={(value) => handleFilterChange("bloodGroup", value)}
          >
            <SelectTrigger className="w-[150px] bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text border border-primary">
              <SelectValue placeholder="Blood Group" />
            </SelectTrigger>
            <SelectContent className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
              <SelectItem value="all">All Groups</SelectItem>
              {validBloodGroups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger className="w-[150px] bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text border border-secondary">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.sort}
            onValueChange={(value) => handleFilterChange("sort", value)}
          >
            <SelectTrigger className="w-[150px] bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text border border-accent">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
              {sortOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card className="bg-red-50 dark:bg-red-800 border-red-200 dark:border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-300">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 mb-6 ">
            {requests?.bloodRequests.map((request) => (
              <Card
                key={request._id}
                className="hover:shadow-lg transition-shadow dark:bg-dark-bg"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-semibold flex gap-3 items-center">
                    <Badge
                      variant="outline"
                      className="text-lg border-primary text-primary dark:border-dark-text dark:text-dark-text"
                    >
                      {request.bloodGroup}
                    </Badge>
                    <Badge className={getUrgencyColor(request.urgency)}>
                      {request.urgency.toUpperCase()}
                    </Badge>
                  </CardTitle>
                  <div className="flex gap-4">
                  <p className="flex items-center text-green-400">
                    <HandHelping className="w-6 h-6 mr-2" />
                    <span>{request.volunteers?.length}</span>
                  </p>
                  <Badge
                    variant="outline"
                    className="border-secondary text-secondary dark:border-dark-text dark:text-dark-text"
                  >
                    {request.status.charAt(0).toUpperCase() +
                      request.status.slice(1)}
                  </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-1">Message</h3>
                      <p className="text-gray-600 dark:text-dark-text">
                        {request.message}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Location</h3>
                      <p className="text-gray-600 dark:text-dark-text">
                        {request.address.city}, {request.address.district},{" "}
                        {request.address.state}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Contact</h3>
                      <p className="text-gray-600 dark:text-dark-text">
                        {request.contactDetails.phone}
                      </p>
                      <p className="text-gray-600 dark:text-dark-text">
                        {request.contactDetails.email}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link to={`/bloodbridge/request/${request._id}`}
                  className="text-secondary flex items-center hover:underline font-semibold"
                  >
                    View details <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>

                  {request.bloodGroup === userBG &&
                    request.status === "pending" && (
                      <BeVolunteer id={request._id} />
                    )}
                </CardFooter>
              </Card>
            ))}
          </div>

          {requests && requests.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={!requests.hasPrev}
                className="border-secondary text-secondary dark:border-light-text dark:text-light-text"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {requests.currentPage} of {requests.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={!requests.hasNext}
                className="border-secondary text-secondary dark:border-light-text dark:text-light-text"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Requests;
