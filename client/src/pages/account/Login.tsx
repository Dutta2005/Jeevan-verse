import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { api } from "../../api/api";
import { login } from "../../store/authSlice";
import { useDispatch } from "react-redux";
import { useToast } from "../../hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  // const [error, setError] = useState("");
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

    try {
      const response = await api.post("/users/login", formData);
      
      if (response.status === 200) {       
        dispatch(login(response.data.data.user));
        toast({
          title: "Login Successful",
          description: "You have successfully logged in.",
          variant: "success",
          duration: 2000
        })
        navigate("/");
      } else{
        toast({
          title: "Login Failed",
          description: response.data.message || "An error occurred during login. Please try again.",
          variant: "destructive",
          duration: 2000
        })
      }

    } catch (err: any) {
      if(err.response.status === 401){
      toast({
        title: "Login Failed",
        description: "Invalid email or password.",
        variant: "destructive",
        duration: 5000
      })
    } else {
      toast({
        title: "Login Failed",
        description: "Something went wrong",
        variant: "destructive",
        duration: 5000
      })
    }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-light-bg dark:bg-dark-bg/90 flex justify-center items-center p-4">
      <div className="absolute top-0 left-0 w-1/2 h-screen bg-primary/85 transform -skew-x-12 -translate-x-20" />

      <Card className="w-full max-w-md bg-white/95 dark:bg-dark-bg/95 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="space-y-4">
          <CardTitle className="text-3xl font-bold text-center text-light-text dark:text-dark-text">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-dark-text/80">
            Please sign in to continue
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            {/* {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )} */}
            
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-light-text dark:text-dark-text font-medium"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="h-11 bg-white dark:bg-dark-bg border-secondary focus:border-accent focus:ring-accent dark:text-dark-text"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-light-text dark:text-dark-text font-medium"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="h-11 bg-white dark:bg-dark-bg border-secondary focus:border-accent focus:ring-accent dark:text-dark-text"
                required
              />
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:text-secondary transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-md dark:text-white bg-primary dark:bg-primary hover:bg-primary/90 dark:hover:bg-primary/90 transition-colors"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-accent hover:text-secondary dark:text-secondary dark:hover:text-accent transition-colors"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;