import { useParams } from "react-router";
import { Badge } from "../components/ui/badge";
import { Card, CardHeader, CardContent, CardFooter } from "../components/ui/card";
import { useEffect, useState } from "react";
import { api } from "../api/api";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { Skeleton } from "../components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { MapPin, Phone, Mail, Users, Clock } from 'lucide-react';
import BeVolunteer from "../components/blood bridge/BeVolunteer";

interface Address {
    state: string;
    district: string;
    city: string;
}

interface ContactDetails {
    email: string;
    phone: string;
}

interface Volunteer {
    user: {
        _id: string;
        name: string;
        email: string;
        phone: string;
    };
    canShareDetails: boolean;
}

interface Request {
    _id: string;
    bloodGroup: string;
    urgency: string;
    message: string;
    contactDetails: ContactDetails;
    status: string;
    userId: string;
    address: Address;
    createdAt: string;
    volunteers: Volunteer[];
}

export default function BloodBridgeRequest() {
    const { id } = useParams();
    const [request, setRequest] = useState<Request | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const userId = useSelector((state: RootState) => state.auth.user?.id);

    useEffect(() => {
        const getRequest = async () => {
            try {
                const response = await api.get(`blood-requests/${id}`);
                setRequest(response.data.data);
            } catch (error: any) {
                setError("Failed to load request details. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        getRequest();
    }, [id]);

    const getUrgencyColor = (urgency: string) => {
        switch (urgency.toLowerCase()) {
            case "high":
                return "bg-red-600 text-white dark:bg-red-600 dark:text-white";
            case "medium":
                return "bg-yellow-500 text-white dark:bg-yellow-500 dark:text-white";
            case "low":
                return "bg-accent text-white dark:bg-accent dark:text-white";
            default:
                return "bg-gray-500 text-white";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "rejected":
                return "bg-accent/20 text-accent border-accent dark:border-accent dark:text-accent dark:bg-accent/20";
            case "completed":
                return "bg-secondary/20 text-secondary border-secondary dark:border-secondary dark:text-secondary dark:bg-secondary/20";
            case "pending":
                return "bg-primary/20 text-primary border-primary dark:border-primary dark:text-primary dark:bg-primary/20";
            default:
                return "bg-gray-200 text-gray-700 border-gray-700";
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-4 max-w-4xl mx-auto">
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {loading ? (
                <Card className="p-6">
                    <Skeleton className="h-8 w-1/3 mb-4" />
                    <Skeleton className="h-6 w-1/2 mb-4" />
                    <Skeleton className="h-24 w-full" />
                </Card>
            ) : request ? (
                <Card className="hover:shadow-xl transition-all duration-300 dark:bg-dark-bg">
                    <CardHeader className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <Badge className="px-4 py-2 text-lg bg-primary text-white dark:bg-primary dark:text-white">
                                {request.bloodGroup}
                            </Badge>
                            <Badge className={`px-4 py-2 border ${getStatusColor(request.status)}`}>
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Badge className={`${getUrgencyColor(request.urgency)} px-3 py-1`}>
                                {request.urgency.toUpperCase()} URGENCY
                            </Badge>
                            <Badge className="bg-secondary/20 text-secondary border-secondary dark:border-secondary dark:text-secondary dark:bg-secondary/20 px-3 py-1">
                                <Users className="w-4 h-4 mr-1 inline" />
                                {request.volunteers.length} volunteer{request.volunteers.length !== 1 ? "s" : ""}
                            </Badge>
                            <Badge className="bg-gray-200 text-gray-700 dark:bg-gray-400 px-3 py-1">
                                <Clock className="w-4 h-4 mr-1 inline" />
                                {formatDate(request.createdAt)}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="bg-light-bg dark:bg-dark-bg/50 p-4 rounded-lg">
                            <h3 className="font-semibold text-lg mb-2 text-primary">Message</h3>
                            <p className="text-light-text dark:text-dark-text leading-relaxed">{request.message}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-light-bg dark:bg-dark-bg/50 p-4 rounded-lg">
                                <h3 className="font-semibold text-lg mb-3 text-primary flex items-center">
                                    <MapPin className="w-5 h-5 mr-2" />
                                    Location
                                </h3>
                                <p className="text-light-text dark:text-dark-text">
                                    {request.address.city}, {request.address.district}, {request.address.state}
                                </p>
                            </div>

                            <div className="bg-light-bg dark:bg-dark-bg/50 p-4 rounded-lg">
                                <h3 className="font-semibold text-lg mb-3 text-primary">Contact Details</h3>
                                <div className="space-y-2">
                                    <p className="flex items-center text-light-text dark:text-dark-text">
                                        <Phone className="w-4 h-4 mr-2" />
                                        {request.contactDetails.phone}
                                    </p>
                                    <p className="flex items-center text-light-text dark:text-dark-text">
                                        <Mail className="w-4 h-4 mr-2" />
                                        {request.contactDetails.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {userId !== request.userId && (
                            <BeVolunteer id={request._id} />
                        )}
                    </CardContent>

                    {userId === request.userId && (
                        <CardFooter className="block p-6 text-center">
                            <h3 className="font-semibold text-xl text-primary mb-4">Volunteers</h3>
                            <div className="bg-light-bg dark:bg-dark-bg/50 rounded-lg overflow-hidden">
                                <div className="grid grid-cols-2 bg-secondary/10 p-4">
                                    <p className="font-semibold text-light-text dark:text-dark-text">Name</p>
                                    <p className="font-semibold text-light-text dark:text-dark-text">Contact</p>
                                </div>
                                {request.volunteers.length === 0 ? (
                                    <p className="text-gray-600 dark:text-dark-text p-4 text-center">No volunteers yet.</p>
                                ) : (
                                    request.volunteers.map((volunteer) => (
                                        <div key={volunteer.user._id} className="grid grid-cols-2 p-4 border-t border-gray-200 dark:border-gray-700">
                                            <p className="text-light-text dark:text-dark-text">{volunteer.user.name}</p>
                                            {volunteer.canShareDetails ? (
                                                <div className="space-y-1">
                                                    <p className="text-light-text dark:text-dark-text flex items-center">
                                                        <Phone className="w-4 h-4 mr-2" />
                                                        {volunteer.user.phone || "-"}
                                                    </p>
                                                    <p className="text-light-text dark:text-dark-text flex items-center">
                                                        <Mail className="w-4 h-4 mr-2" />
                                                        {volunteer.user.email || "-"}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="italic text-gray-500">Contact details hidden</p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardFooter>
                    )}
                </Card>
            ) : (
                <div className="text-center p-8">
                    <p className="text-gray-600 dark:text-dark-text text-lg">No request found.</p>
                </div>
            )}
        </div>
    );
}