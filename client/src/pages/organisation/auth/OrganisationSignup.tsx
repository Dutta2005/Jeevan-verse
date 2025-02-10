import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { Card, CardHeader, CardTitle, CardFooter } from "../../../components/ui/card";
import { api } from "../../../api/api";
import { useToast } from "../../../hooks/use-toast";

// Zod validation schema (same as previous)
const organizationSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Organization name must be at least 2 characters" }),
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
    required_error: "Please select an organization type",
  }),
  website: z
    .union([z.string().url({ message: "Invalid website URL" }), z.literal("")])
    .optional()
    .transform((value) => value || undefined),
});

type OrganizationSignupData = z.infer<typeof organizationSchema>;

export default function OrganizationSignup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<OrganizationSignupData>({
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
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description:
          error.response?.statusText ||
          "An error occurred during registration. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  return (
    <div className="w-full bg-light-bg dark:bg-dark-bg/90 flex justify-center items-center p-4 overflow-x-hidden">
      <div className="absolute top-0 left-0 w-1/2 h-screen bg-primary/85 transform -skew-x-12 -translate-x-20 hidden md:block" />

      <Card className="w-full max-w-4xl bg-white/95 dark:bg-dark-bg/95 backdrop-blur-sm shadow-2xl border-0 z-10 relative 
        flex flex-col md:flex-row">

        <div className="hidden md:flex w-1/2 p-8 bg-primary/10 dark:bg-primary/5 flex-col justify-center space-y-6">
          <h2 className="text-3xl font-bold text-light-text dark:text-dark-text">
            Join Our Journey
          </h2>
          <p className="text-gray-600 dark:text-dark-text/80">
            start making an impact today.
          </p>
          <div className="space-y-2 text-sm">
            <p className="flex items-center space-x-2">
              <span className="text-primary">✓</span>
              <span>Secure and confidential registration</span>
            </p>
            <p className="flex items-center space-x-2">
              <span className="text-primary">✓</span>
              <span>Spread the word about your campaign</span>
            </p>
            <p className="flex items-center space-x-2">
              <span className="text-primary">✓</span>
              <span>Get support from our dedicated team</span>
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-6 md:p-8">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-2xl font-bold text-primary text-center">
              Organization Signup
            </CardTitle>
          </CardHeader>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Organization Name
                </label>
                <Input
                  {...register("name")}
                  placeholder="Enter organization name"
                  className="dark:bg-dark-bg dark:text-dark-text"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Organization Type
                </label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full dark:bg-dark-bg dark:text-dark-text">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hospital">Hospital</SelectItem>
                        <SelectItem value="ngo">NGO</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && (
                  <p className="text-red-500 text-xs">{errors.type.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Email</label>
              <Input
                type="email"
                {...register("email")}
                placeholder="Enter email"
                className="dark:bg-dark-bg dark:text-dark-text"
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Password</label>
              <Input
                type="password"
                {...register("password")}
                placeholder="Enter password"
                className="dark:bg-dark-bg dark:text-dark-text"
              />
              <p className="text-xs text-gray-500">
                8+ characters with uppercase, lowercase, and number
              </p>
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Organization Description
              </label>
              <textarea
                {...register("description")}
                className="w-full px-3 py-2 border rounded-md resize-none dark:bg-dark-bg dark:text-dark-text"
                placeholder="Brief description of your organization"
                rows={4}
              />
              {errors.description && (
                <p className="text-red-500 text-xs">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Website (Optional)
              </label>
              <Input
                type="url"
                {...register("website")}
                placeholder="https://www.yourorganization.com"
                className="dark:bg-dark-bg dark:text-dark-text"
              />
              {errors.website && (
                <p className="text-red-500 text-xs">{errors.website.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 text-white dark:text-white"
            >
              Register Organization
            </Button>
          </form>

          <CardFooter className="text-center mt-4 p-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="text-primary hover:text-secondary transition-colors"
              >
                Log in
              </Link>
            </p>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
}