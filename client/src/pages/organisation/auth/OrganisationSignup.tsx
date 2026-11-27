import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthField } from "@/components/auth/AuthField";
import { authFieldProps } from "@/components/auth/auth-field-props";
import styles from "@/components/auth/AuthLayout.module.css";
import { FieldGroup } from "@/components/ui/field";
import { isAxiosError } from "axios";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";

import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { api } from "../../../api/api";
import { useToast } from "../../../hooks/use-toast";

// Zod validation schema (same as previous)
const organizationSchema = z.object({
  name: z.string().min(2, { message: "Organization name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" })
    .max(500, { message: "Description cannot exceed 500 characters" }),
  type: z.enum(["hospital", "ngo", "research", "other"], {
    error: (issue) =>
      issue.input === undefined ? "Please select an organization type" : undefined,
  }),
  website: z
    .union([z.string().url({ message: "Invalid website URL" }), z.literal("")])
    .optional()
    .transform((value) => value || undefined),
});

type OrganizationSignupData = z.infer<typeof organizationSchema>;

export default function OrganizationSignup() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState("");
  const { toast } = useToast();
  const {
    control,
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof organizationSchema>, unknown, OrganizationSignupData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      description: "",
      type: undefined,
      website: "",
    },
  });

  const onSubmit = async (data: OrganizationSignupData) => {
    setSubmitError("");
    try {
      const response = await api.post("/organizations/register", data);
      if (response.status === 200) {
        toast({
          title: "Registration Successful",
          description: "You have successfully registered as an organization.",
          variant: "success",
          duration: 2000,
        });
        navigate("/signin");
      }
    } catch (error: unknown) {
      setSubmitError("Unable to create your organization account. Please try again.");
      toast({
        title: "Registration Failed",
        description:
          (isAxiosError(error) && error.response?.statusText) ||
          "An error occurred during registration. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  return (
    <AuthLayout
      audience="organization"
      mode="signup"
      title="Create an organization account"
      description="Introduce your organization and start sharing health updates."
    >
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form} aria-busy={isSubmitting}>
        {submitError && (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}
        <FieldGroup>
          <AuthField id="name" label="Organization name" error={errors.name?.message}>
            <Input
              {...register("name")}
              {...authFieldProps("name", errors.name?.message)}
              autoComplete="organization"
              placeholder="Enter organization name"
            />
          </AuthField>
          <AuthField id="type" label="Organization type" error={errors.type?.message}>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    {...authFieldProps("type", errors.type?.message)}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    className="w-full"
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="ngo">NGO</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </AuthField>
          <AuthField id="email" label="Email" error={errors.email?.message}>
            <Input
              {...register("email")}
              {...authFieldProps("email", errors.email?.message)}
              type="email"
              autoComplete="email"
              placeholder="Enter email"
            />
          </AuthField>
          <AuthField
            id="password"
            label="Password"
            error={errors.password?.message}
            description="8+ characters with uppercase, lowercase, and number"
          >
            <Input
              {...register("password")}
              {...authFieldProps(
                "password",
                errors.password?.message,
                "8+ characters with uppercase, lowercase, and number",
              )}
              type="password"
              autoComplete="new-password"
              placeholder="Enter password"
            />
          </AuthField>
          <AuthField
            id="description"
            label="Organization description"
            error={errors.description?.message}
          >
            <Textarea
              {...register("description")}
              {...authFieldProps("description", errors.description?.message)}
              placeholder="Brief description of your organization"
              rows={4}
              className="resize-y"
            />
          </AuthField>
          <AuthField id="website" label="Website (optional)" error={errors.website?.message}>
            <Input
              {...register("website")}
              {...authFieldProps("website", errors.website?.message)}
              type="url"
              autoComplete="url"
              placeholder="https://www.yourorganization.com"
            />
          </AuthField>
        </FieldGroup>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating account..." : "Register organization"}
        </Button>
      </form>
      <p className={styles.footer}>
        Already have an organization account? <Link to="/signin">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
