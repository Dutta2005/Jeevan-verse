import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { api } from '../../../api/api';
import { useToast } from '../../../hooks/use-toast';
import { useDispatch } from 'react-redux';
import { loginOrganization } from '../../../store/authSlice';
import { useState } from 'react';

// Zod validation schema
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" })
});

type LoginData = z.infer<typeof loginSchema>;

export default function OrganizationLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    try {
      const response = await api.post('/organizations/login', data);
      
      if (response.status === 200) {
        dispatch(loginOrganization(response.data.data.organization));
        toast({
          title: 'Login Successful',
          description: 'You have successfully logged in.',
          variant: 'success',
          duration: 2000
        });
        
        navigate('/organisation');
      }
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.response?.data?.message || 'An error occurred during login',
        variant: 'destructive',
        duration: 4000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-light-bg dark:bg-dark-bg/90 flex justify-center items-center p-4">
      <div className="absolute top-0 left-0 w-1/2 h-screen bg-primary/85 transform -skew-x-12 -translate-x-20" />

      <Card className="w-full max-w-md bg-white/95 dark:bg-dark-bg/95 backdrop-blur-sm shadow-2xl border-0 z-10 relative">
        <CardHeader className="space-y-4">
          <CardTitle className="text-3xl font-bold text-center text-light-text dark:text-dark-text">
            Organization Login
          </CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-dark-text/80">
            Sign in to access your organization's dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-light-text dark:text-dark-text font-medium"
              >
                Email
              </Label>
              <Input
                {...register("email")}
                type="email"
                placeholder="Enter your email"
                className="h-11 bg-white dark:bg-dark-bg border-secondary focus:border-accent focus:ring-accent dark:text-dark-text"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-light-text dark:text-dark-text font-medium"
              >
                Password
              </Label>
              <Input
                {...register("password")}
                type="password"
                placeholder="Enter your password"
                className="h-11 bg-white dark:bg-dark-bg border-secondary focus:border-accent focus:ring-accent dark:text-dark-text"
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
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
              to="/register"
              className="text-accent hover:text-secondary dark:text-secondary dark:hover:text-accent transition-colors"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}