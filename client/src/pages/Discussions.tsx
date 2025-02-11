import React, { useState, useEffect } from "react";
import { MessageSquareMore } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../api/api";
import CreatePost from "../components/discussion/CreatePost";
import { Button } from "../components/ui/button";
import DiscussionPostSkeleton from "../components/discussion/DiscussionPostSkeleton";
import PostCard from "../components/discussion/PostCard";

interface Author {
  name?: string;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  author?: Author;
  createdAt: string;
  tags?: string[];
}

const DiscussionsPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
    postsPerPage: 15,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/posts?page=${page}`);
      const { posts, pagination } = response.data.data;

      setPosts(posts);
      setPagination(pagination);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Failed to fetch posts", err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (isLoading)
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl flex gap-2 items-center font-semibold">
            <span>Chit Chat</span>
            <MessageSquareMore size={30} className="text-primary" />
          </h1>
        </div>
        <div className="space-y-4">
          <DiscussionPostSkeleton />
          <DiscussionPostSkeleton />
          <DiscussionPostSkeleton />
        </div>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl flex gap-2 items-center font-semibold">
          <span>Chit Chat</span>
          <MessageSquareMore size={30} className="text-primary" />
        </h1>
        <CreatePost />
      </div>

      <div className="flex flex-col space-y-4 items-center">
        {posts.map((post) => (
          <Link
            key={post._id}
            to={`/discussions/${post._id}`}
            className="w-full max-w-2xl"
          >
            <PostCard post={post} />
          </Link>
        ))}
      </div>

      <div className="flex justify-center items-center mt-8 space-x-4">
        <Button
          onClick={() => fetchPosts(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          variant="outline"
        >
          Previous
        </Button>

        <span className="text-gray-600 dark:text-gray-300">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>

        <Button
          onClick={() => fetchPosts(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
          variant="outline"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default DiscussionsPage;
