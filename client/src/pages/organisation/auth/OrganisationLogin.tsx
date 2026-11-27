import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthField } from "@/components/auth/AuthField";
import { authFieldProps } from "@/components/auth/auth-field-props";
import styles from "@/components/auth/AuthLayout.module.css";
import { FieldGroup } from "@/components/ui/field";
import { getErrorMessage } from "@/lib/error";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { api } from "../../../api/api";
import { useToast } from "../../../hooks/use-toast";
import { useDispatch } from "react-redux";
import { loginOrganization } from "../../../store/authSlice";
import { useState } from "react";

// Zod validation schema
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginData = z.infer<typeof loginSchema>;

export default function OrganizationLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    setSubmitError("");
    try {
      const response = await api.post("/organizations/login", data);

      if (response.status === 200) {
        dispatch(loginOrganization(response.data.data.organization));
        toast({
          title: "Login Successful",
          description: "You have successfully logged in.",
          variant: "success",
          duration: 2000,
        });

        navigate("/organisation");
      }
    } catch (error: unknown) {
      setSubmitError(getErrorMessage(error, "An error occurred during login"));
      toast({
        title: "Login Failed",
        description: getErrorMessage(error, "An error occurred during login"),
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      audience="organization"
      mode="login"
      title="Organization sign in"
      description="Return to your organization’s profile and published updates."
    >
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form} aria-busy={isLoading}>
        {submitError && (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}
        <FieldGroup>
          <AuthField id="email" label="Email" error={errors.email?.message}>
            <Input
              {...register("email")}
              {...authFieldProps("email", errors.email?.message)}
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
            />
          </AuthField>
          <AuthField id="password" label="Password" error={errors.password?.message}>
            <Input
              {...register("password")}
              {...authFieldProps("password", errors.password?.message)}
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
            />
          </AuthField>
        </FieldGroup>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <p className={styles.footer}>
        New organization? <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
