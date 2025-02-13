import React, { useState, useEffect } from 'react';
import { api } from '../../../api/api';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Upload } from 'lucide-react';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '../../ui/select';

const TAG_OPTIONS = [
    'Announcement',
    'Update',
    'Event',
    'Policy',
    'General'
] as const;

type TagOption = typeof TAG_OPTIONS[number];

interface PostFormData {
    title: string;
    content: string;
    tags: TagOption;
    thumbnail?: File | null;
}

const PostForm: React.FC = () => {
    const navigate = useNavigate();
    const postId = useParams<{ id?: string }>().id;

    const [formData, setFormData] = useState<PostFormData>({
        title: '',
        content: '',
        tags: 'General',
        thumbnail: null
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

    useEffect(() => {
        if (postId) {
            const fetchPost = async () => {
                try {
                    setIsLoading(true);
                    const response = await api.get(`/org-posts/${postId}`);
                    const post = response.data.data;
                    setFormData({
                        title: post.title,
                        content: post.content,
                        tags: TAG_OPTIONS.includes(post.tags) 
                            ? post.tags 
                            : 'General',
                        thumbnail: null
                    });
                    setThumbnailPreview(post.thumbnail);
                } catch (err: any) {
                    setError(err.response?.data?.message || 'Failed to fetch post details');
                } finally {
                    setIsLoading(false);
                }
            };

            fetchPost();
        }
    }, [postId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTagChange = (value: TagOption) => {
        setFormData(prev => ({
            ...prev,
            tags: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                thumbnail: file
            }));
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form
        if (!formData.title || !formData.content) {
            setError('Title and content are required');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const formPayload = new FormData();
            formPayload.append('title', formData.title);
            formPayload.append('content', formData.content);
            formPayload.append('tags', formData.tags);
            
            if (formData.thumbnail) {
                formPayload.append('thumbnail', formData.thumbnail);
            }

            if (postId) {
                // Edit existing post
                await api.patch(`/org-posts/edit/${postId}`, {
                    title: formData.title,
                    content: formData.content,
                    tags: formData.tags
                });
                navigate(`/organisation`);
            } else {
                // Create new post
                const res = await api.post('/org-posts/create', formPayload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                navigate(`/organisation/post/${res.data.data._id}`);
            }

        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-primary">
                        {postId ? 'Edit Post' : 'Create New Post'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium mb-2">
                                Title
                            </label>
                            <Input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Enter post title"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="content" className="block text-sm font-medium mb-2">
                                Content
                            </label>
                            <Textarea
                                id="content"
                                name="content"
                                value={formData.content}
                                onChange={handleInputChange}
                                placeholder="Write your post content"
                                rows={6}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="tags" className="block text-sm font-medium mb-2">
                                Tag
                            </label>
                            <Select 
                                value={formData.tags}
                                onValueChange={handleTagChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a tag" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TAG_OPTIONS.map((tag) => (
                                        <SelectItem key={tag} value={tag}>
                                            {tag}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label htmlFor="thumbnail" className="block text-sm font-medium mb-2">
                                Thumbnail (Optional)
                            </label>
                            <div className="flex items-center space-x-4">
                                <Input
                                    type="file"
                                    id="thumbnail"
                                    name="thumbnail"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <label 
                                    htmlFor="thumbnail" 
                                    className="flex items-center cursor-pointer bg-secondary text-white px-4 py-2 rounded hover:bg-secondary/90"
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Thumbnail
                                </label>
                                
                                {thumbnailPreview && (
                                    <img 
                                        src={thumbnailPreview} 
                                        alt="Thumbnail Preview" 
                                        className="h-20 w-20 object-cover rounded"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => navigate('/past-activities')}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isLoading}
                                className="bg-primary hover:bg-primary/90"
                            >
                                {isLoading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                                ) : (
                                    postId ? 'Update Post' : 'Create Post'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default PostForm;