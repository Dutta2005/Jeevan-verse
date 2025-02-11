import { Skeleton } from "../ui/skeleton";
import { Card, CardContent, CardHeader } from "../ui/card";

const DiscussionPostSkeleton = () => {
    return (
        <div className="container mx-auto px-4 py-4 max-w-2xl">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-6 w-20" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DiscussionPostSkeleton;