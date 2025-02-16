import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader } from "../ui/card"
import { RootState } from "../../store/store";
import { useEffect, useState } from "react";
import { api } from "../../api/api";
import DiscussionPostSkeleton from "../discussion/DiscussionPostSkeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import PostCard from "../discussion/PostCard";
import { Link } from "react-router";
import { Newspaper } from "lucide-react";

interface Post {
    _id: string;
    title: string;
    content: string;
    author?: {
        name?: string;
    };
    createdAt: string;
    tags?: string[];
}

export const LatestsPosts = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const userId = useSelector((state: RootState) => state.auth.user?.id);
    const getPostsOfUser = async() => {
        try {
            const response = await api.get(`/posts/user/${userId}`);
            setPosts(response.data.data);
        } catch (error: any) {
            setError(error.response.data?.message || "Failed to fetch posts");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getPostsOfUser();
    }, [])

    return (
        <Card>
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
                <h1 className="text-2xl font-bold text-accent">Your Posts</h1>
            </CardHeader>
            <CardContent className="my-6">
                {loading && (
                    <DiscussionPostSkeleton />
                )}
                { error && (
                    <Alert>
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-col space-y-4">
                { posts && posts.map((post: Post) => (
                    <Link to={`/discussions/${post._id}`} key={post._id}>
                        <PostCard post={post} />
                    </Link>
                ))}
                {posts.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="bg-secondary/10 p-6 rounded-full mb-6">
                      <Newspaper className="w-12 h-12 text-secondary" />
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2">No Posts Yet</h3>
                    
                    <p className="text-light-text/70 dark:text-dark-text/70 text-center max-w-sm mb-6">
                      It looks a bit empty here. Start sharing your thoughts and experiences with the community.
                    </p>
                    </div>
                )}
                </div>
            </CardContent>
        </Card>
    )
}