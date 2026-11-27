import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthField } from "@/components/auth/AuthField";
import styles from "@/components/auth/AuthLayout.module.css";
import { FieldGroup } from "@/components/ui/field";
import { isAxiosError } from "axios";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { api } from "../../api/api";
import { login } from "../../store/authSlice";
import { useDispatch } from "react-redux";
import { useToast } from "../../hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/users/login", formData);

      if (response.status === 200) {
        dispatch(login(response.data.data.user));
        toast({
          title: "Login Successful",
          description: "You have successfully logged in.",
          variant: "success",
          duration: 2000,
        });
        navigate("/");
      } else {
        setError(response.data.message || "Unable to sign in. Please try again.");
        toast({
          title: "Login Failed",
          description: response.data.message || "An error occurred during login. Please try again.",
          variant: "destructive",
          duration: 2000,
        });
      }
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 401) {
        setError("Invalid email or password.");
        toast({
          title: "Login Failed",
          description: "Invalid email or password.",
          variant: "destructive",
          duration: 5000,
        });
      } else {
        setError("Unable to sign in. Please try again.");
        toast({
          title: "Login Failed",
          description: "Something went wrong",
          variant: "destructive",
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      audience="individual"
      mode="login"
      title="Sign in"
      description="Your conversations, requests, and community. Pick up where you left off."
    >
      <form onSubmit={handleSubmit} className={styles.form} aria-busy={isLoading}>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <FieldGroup>
          <AuthField id="email" label="Email">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </AuthField>
          <AuthField id="password" label="Password">
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </AuthField>
        </FieldGroup>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <p className={styles.footer}>
        New to Jeevan Verse? <Link to="/signup">Create an account</Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
