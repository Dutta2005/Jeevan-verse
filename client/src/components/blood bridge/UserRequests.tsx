import React from "react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AlertCircle, ArrowRight, Edit2, EllipsisVertical, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { api } from "../../api/api";
import { RootState } from "../../store/store";
import { Link } from "react-router";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import EditRequest from "./EditRequest";
import { Dialog, DialogHeader, DialogContent, DialogTitle } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";


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
}

interface RequestCardProps {
  request: Request;
  onStatusChange: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const UrgencyBadge = ({ urgency }: { urgency: string }) => {
  const colors = {
    high: "bg-red-600 dark:bg-red-600 text-red-800",
    medium: "bg-orange-400 dark:bg-orange-400 text-orange-800",
    low: "bg-yellow-400 dark:bg-yellow-400 text-yellow-800",
  };

  return (
    <Badge className={colors[urgency as keyof typeof colors]}>
      {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
    </Badge>
  );
};

const RequestCard: React.FC<RequestCardProps> = ({
  request,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  const { bloodGroup, urgency, message, contactDetails, status, address } =
    request;

  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Blood Group: {bloodGroup}</CardTitle>
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className={`${
                status === "pending"
                  ? "text-yellow-600 dark:text-yellow-600"
                  : "text-green-600 dark:text-green-600"
              }`}
            >
              {status}
            </Badge>
            <UrgencyBadge urgency={urgency} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <EllipsisVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="dark:bg-dark-bg/70">
              <Button
            variant="ghost"
            onClick={() => onEdit(request._id)}
            className="flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </Button>
          <Button
            variant="ghost"
            onClick={() => onDelete(request._id)}
            className="flex items-center gap-2 text-primary dark:text-primary"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700 dark:text-dark-text">
              Message
            </h3>
            <p className="text-gray-600 dark:text-dark-text/80">{message}</p>
          </div>

          <div className="space-y-2  text-gray-700 dark:text-dark-text">
            <h3 className="font-semibold">Contact Details</h3>
            <p>{contactDetails.email}</p>
            <p>{contactDetails.phone}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700 dark:text-dark-text">
              Address
            </h3>
            <p className="text-gray-600 dark:text-dark-text/80">
              {address.city}, {address.district}, {address.state}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between items-center">
        <Link
          to={`/bloodbridge/request/${request._id}`}
          className="text-secondary flex items-center hover:underline font-semibold"
        >
          View details <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
          {status === "pending" && (
            <Button
            variant="secondary"
            onClick={() => onStatusChange(request._id)}
            className="flex items-center gap-2 hover:text-green-500 dark:hover:text-green-400"
          >
            <AlertCircle className="w-4 h-4" />
            Mark as completed
          </Button>
          )}
      </CardFooter>
    </Card>
  );
};

const UserRequests = () => {
  const userID = useSelector((state: RootState) => state.auth.user?.id);
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/blood-requests/user/${userID}&page=1`);
      if (response.status === 200) {
        setRequests(response.data.data.bloodRequests);
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch blood requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    console.log(`Edit request with ID: ${id}`);
    // Implement the edit logic here
    setEditingRequestId(id);
  };

  const handleEditSave = async () => {
    await fetchRequests(); // Refresh the requests after saving
    setEditingRequestId(null);
  };

  const handleEditCancel = () => {
    setEditingRequestId(null);
  };


  const markCompleted = async (id: string) => {
    try {
      const response = await api.patch(`/blood-requests/status/${id}`, {
        status: "completed"
      });
      if (response.status === 200) {
        setRequests((prevRequests) =>
          prevRequests.map((request) => {
            if (request._id === id) {
              return { ...request, status: "completed" };
            }
            return request;
          })
        );
      }
    } catch (error: any) {
      setError(`Failed to mark request as completed: ${error.message}`);
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await api.delete(`/blood-requests/delete/${id}`);
      if (response.status === 200) {
        setRequests((prevRequests) =>
          prevRequests.filter((request) => request._id !== id)
        );
      }
    } catch (error: any) {
      setError(`Failed to delete request: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [userID]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold text-center mb-8">
        Your Blood Donation Requests
      </h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="max-w-3xl mx-auto space-y-4">
        {requests.length > 0 ? (
          requests.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              onStatusChange={markCompleted}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <Card>
            <CardContent className="flex justify-center py-8">
              <p className="text-gray-500">No blood donation requests found.</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Edit Request Dialog */}
      <Dialog open={!!editingRequestId} onOpenChange={() => setEditingRequestId(null)}>
        <DialogContent className="max-w-md w-full p-0 h-[90%] md:h-auto dark:bg-dark-bg dark:text-dark-text">
        <ScrollArea className="h-full w-full">
         <div className="p-6">
                   <DialogHeader>
                     <DialogTitle>Request Form</DialogTitle>
                   </DialogHeader>
          {editingRequestId && (
            <EditRequest
              requestId={editingRequestId}
              onSave={handleEditSave}
              onCancel={handleEditCancel}
            />
          )}
          </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default UserRequests;
