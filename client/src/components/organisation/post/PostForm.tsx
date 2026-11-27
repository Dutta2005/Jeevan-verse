import { getErrorMessage } from "@/lib/error";
import React, { useState, useEffect } from "react";
import { api } from "../../../api/api";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { Alert, AlertDescription } from "../../ui/alert";
import { useNavigate, useParams } from "react-router";
import { Loader2, Send } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "../../ui/field";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../../ui/sheet";
import styles from "../OrganizationWorkspace.module.css";

const TAG_OPTIONS = ["Announcement", "Update", "Event", "Policy", "General"] as const;

type TagOption = (typeof TAG_OPTIONS)[number];

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
    title: "",
    content: "",
    tags: "General",
    thumbnail: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!formData.thumbnail || !thumbnailPreview) return;
    return () => URL.revokeObjectURL(thumbnailPreview);
  }, [formData.thumbnail, thumbnailPreview]);

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
            tags: TAG_OPTIONS.includes(post.tags) ? post.tags : "General",
            thumbnail: null,
          });
          setThumbnailPreview(post.thumbnail);
        } catch (err: unknown) {
          setError(getErrorMessage(err, "Failed to fetch post details"));
        } finally {
          setIsLoading(false);
        }
      };

      fetchPost();
    }
  }, [postId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTagChange = (value: TagOption) => {
    setFormData((prev) => ({
      ...prev,
      tags: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
      setFormData((prev) => ({
        ...prev,
        thumbnail: file,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // Validate form
    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Title and content are required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formPayload = new FormData();
      formPayload.append("title", formData.title.trim());
      formPayload.append("content", formData.content.trim());
      formPayload.append("tags", formData.tags);

      if (formData.thumbnail) {
        formPayload.append("thumbnail", formData.thumbnail);
      }

      if (postId) {
        // Edit existing post
        await api.patch(`/org-posts/edit/${postId}`, {
          title: formData.title.trim(),
          content: formData.content.trim(),
          tags: formData.tags,
        });
        navigate(`/organisation`);
      } else {
        // Create new post
        const res = await api.post("/org-posts/create", formPayload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        navigate(`/organisation/post/${res.data.data._id}`);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Something went wrong"));
    } finally {
      setIsLoading(false);
    }
  };

  const form = (
    <form onSubmit={handleSubmit} className={styles.composer} aria-busy={isLoading}>
      <div className={styles.composerBody}>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <fieldset disabled={isLoading} className="min-w-0">
          <legend className="sr-only">Post details</legend>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Give your update a clear title"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="content">Content</FieldLabel>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="What would you like your community to know?"
                rows={9}
                required
              />
              <FieldDescription>
                Include useful details and any next steps for readers.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="tags">Tag</FieldLabel>
              <Select value={formData.tags} onValueChange={handleTagChange} disabled={isLoading}>
                <SelectTrigger id="tags">
                  <SelectValue placeholder="Select a tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {TAG_OPTIONS.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            {!postId && (
              <Field>
                <FieldLabel htmlFor="thumbnail">Cover image (optional)</FieldLabel>
                <Input
                  type="file"
                  id="thumbnail"
                  name="thumbnail"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {thumbnailPreview && (
                  <img
                    src={thumbnailPreview}
                    alt="Cover image preview"
                    className={styles.coverPreview}
                  />
                )}
              </Field>
            )}
          </FieldGroup>
        </fieldset>
      </div>
      <div className={styles.composerFooter}>
        <p>Your post will be visible to the community.</p>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => navigate("/organisation", { replace: true })}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" />
            ) : (
              <Send data-icon="inline-start" aria-hidden="true" />
            )}
            {isLoading ? "Saving…" : postId ? "Update post" : "Publish post"}
          </Button>
        </div>
      </div>
    </form>
  );

  if (postId)
    return (
      <section className={styles.editPage}>
        <header className={styles.sectionHeading}>
          <h1>Edit post</h1>
          <p>Update the details of your community post.</p>
        </header>
        {form}
      </section>
    );

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open && !isLoading) navigate("/organisation", { replace: true });
      }}
    >
      <SheetContent
        side="right"
        className={styles.drawer}
        onEscapeKeyDown={(event) => {
          if (isLoading) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (isLoading) event.preventDefault();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById("organization-create-post")?.focus();
        }}
      >
        <SheetHeader className={styles.drawerHeader}>
          <SheetTitle>Create post</SheetTitle>
          <SheetDescription>Share an update from your organization.</SheetDescription>
        </SheetHeader>
        {form}
      </SheetContent>
    </Sheet>
  );
};

export default PostForm;
