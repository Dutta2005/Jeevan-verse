import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { useToast } from "../../hooks/use-toast";
import { api } from "../../api/api";
import { State, City } from "country-state-city";

interface FormData {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: string;
  canDonate: boolean;
  address: {
    state: string;
    district: string;
    city: string;
  };
  status: string;
  info: {
    bloodGroup: string;
    height: string;
    weight: string;
  };
  termsAccepted: boolean;
}

interface Errors {
  name?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  age?: string;
  state?: string;
  district?: string;
  city?: string;
  bloodGroup?: string;
  height?: string;
  weight?: string;
  termsAccepted?: string;
  status?: "doctor" | "medical student" | "others";
}

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedState, setSelectedState] = useState<any>(null);
  // @ts-ignore
  const [selectedCity, setSelectedCity] = useState<any>(null);

  const states = State.getStatesOfCountry("IN");

  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    canDonate: true,
    address: {
      state: "",
      district: "",
      city: "",
    },
    status: "others",
    info: {
      bloodGroup: "",
      height: "",
      weight: "",
    },
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<Errors>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;

    const isCheckbox = (e.target as HTMLInputElement).type === "checkbox";
    const inputValue = isCheckbox
      ? (e.target as HTMLInputElement).checked
      : value;

    setFormData((prev) => {
      if (id.includes(".")) {
        const [parent, child] = id.split(".");

        return {
          ...prev,
          [parent]:
            parent === "address"
              ? { ...prev.address, [child]: inputValue }
              : parent === "info"
              ? { ...prev.info, [child]: inputValue }
              : prev[parent as keyof FormData],
        };
      }

      return {
        ...prev,
        [id]: inputValue,
      };
    });
  };

  const handleStateChange = (stateName: string) => {
    const state = states.find((s) => s.name === stateName);
    setSelectedState(state);

    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        state: stateName,
        city: "",
      },
    }));
  };

  const handleCityChange = (cityName: string) => {
    const city = City.getCitiesOfState("IN", selectedState.isoCode).find(
      (c) => c.name === cityName
    );
    setSelectedCity(city);

    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        city: cityName,
      },
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (formData.phone.length !== 10)
      newErrors.phone = "Phone number must be 10 digits";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.age) newErrors.age = "Age is required";
    if (!formData.address.state) newErrors.state = "State is required";
    if (!formData.address.district) newErrors.district = "District is required";
    if (!formData.address.city) newErrors.city = "City is required";
    if (!formData.info.bloodGroup)
      newErrors.bloodGroup = "Blood group is required";
    if (!formData.info.height) newErrors.height = "Height is required";
    if (!formData.info.weight) newErrors.weight = "Weight is required";
    if (!formData.termsAccepted)
      newErrors.termsAccepted = "You must accept the terms and conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await api.post("/users/register", {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        age: formData.age,
        canDonate: parseInt(formData.age) >= 18,
        address: formData.address,
        status: formData.status,
        info: formData.info,
      });

      if (response.status === 201) {
        toast({
          title: "Registration Successful",
          description: "Your account has been created. Please log in.",
          variant: "success",
          duration: 5000,
        });
        navigate("/login");
      } else {
        toast({
          title: "Registration Failed",
          description: "Something went wrong",
          variant: "destructive",
          duration: 2000,
        });
      }
    } catch (error: any) {
      if (error.response.status === 409)
        toast({
          title: "Registration Failed",
          description: "Email or phone number already exists",
          variant: "destructive",
          duration: 5000,
        });
      else
        toast({
          title: "Registration Failed",
          description: "Something went wrong",
          variant: "destructive",
          duration: 5000,
        });
    }
  };

  return (
    <div className="min-h-screen w-full bg-light-bg dark:bg-dark-bg/90 flex justify-center items-center p-4">
      <div className="fixed top-0 left-0 w-1/2 h-full bg-accent/85 transform -skew-x-12 -translate-x-20" />

      <Card className="relative w-full max-w-lg bg-white/95 dark:bg-dark-bg/95 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="space-y-4">
          <CardTitle className="text-3xl font-bold text-center text-light-text dark:text-dark-text">
            Create Account
          </CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-dark-text/80">
            Join us and become a potential life-saver
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`h-11 ${errors.name ? "border-red-500" : ""}`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="1234567890"
                  className={`h-11 ${errors.phone ? "border-red-500" : ""}`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="25"
                  className={`h-11 ${errors.age ? "border-red-500" : ""}`}
                />
                {errors.age && (
                  <p className="text-red-500 text-sm">{errors.age}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                  className={`h-11 ${errors.email ? "border-red-500" : ""}`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>State</Label>
                <select
                  value={formData.address.state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className={`w-full h-11 p-2 border rounded bg-white dark:bg-dark-bg 
            text-light-text dark:text-dark-text
            border-secondary 
            focus:ring-accent focus:border-accent ${
              errors.state ? "border-red-500" : ""
            }`}
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state.isoCode} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-red-500 text-sm">{errors.state}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address.district">District</Label>
                <Input
                  id="address.district"
                  value={formData.address.district}
                  onChange={handleChange}
                  placeholder="Enter District"
                  className={`h-11 ${errors.district ? "border-red-500" : ""}`}
                />
                {errors.district && (
                  <p className="text-red-500 text-sm">{errors.district}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address.city">City</Label>
                <select
                  value={formData.address.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  disabled={!formData.address.state}
                  className={`w-full h-11 p-2 border rounded bg-white dark:bg-dark-bg 
            text-light-text dark:text-dark-text
            border-secondary 
            focus:ring-accent focus:border-accent ${
              errors.city ? "border-red-500" : ""
            }`}
                >
                  <option value="">Select City</option>
                  {selectedState &&
                    City.getCitiesOfState("IN", selectedState.isoCode).map(
                      (city) => (
                        <option key={city.name} value={city.name}>
                          {city.name}
                        </option>
                      )
                    )}
                </select>
                {errors.city && (
                  <p className="text-red-500 text-sm">{errors.city}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="info.bloodGroup">Blood Group</Label>
                <select
                  id="info.bloodGroup"
                  value={formData.info.bloodGroup}
                  onChange={handleChange}
                  className={`w-full h-11 p-2 border rounded bg-white dark:bg-dark-bg 
                text-light-text dark:text-dark-text
                border-secondary 
                focus:ring-accent focus:border-primary ${
                  errors.bloodGroup ? "border-red-500" : ""
                }`}
                >
                  <option value="">Blood Group</option>
                  {[
                    "A+",
                    "A-",
                    "B+",
                    "B-",
                    "AB+",
                    "AB-",
                    "O+",
                    "O-",
                    "Others",
                  ].map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
                {errors.bloodGroup && (
                  <p className="text-red-500 text-sm">{errors.bloodGroup}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="info.height">Height (cm)</Label>
                <Input
                  id="info.height"
                  type="number"
                  value={formData.info.height}
                  onChange={handleChange}
                  placeholder="170"
                  className={`h-11 ${errors.height ? "border-red-500" : ""}`}
                />
                {errors.height && (
                  <p className="text-red-500 text-sm">{errors.height}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="info.weight">Weight (kg)</Label>
                <Input
                  id="info.weight"
                  type="number"
                  value={formData.info.weight}
                  onChange={handleChange}
                  placeholder="65"
                  className={`h-11 ${errors.weight ? "border-red-500" : ""}`}
                />
                {errors.weight && (
                  <p className="text-red-500 text-sm">{errors.weight}</p>
                )}
              </div>
            </div>

            <select
              id="status"
              value={formData.status}
              onChange={handleChange}
              className={`
              w-full h-11 
              border rounded 
            bg-white dark:bg-dark-bg 
            text-light-text dark:text-dark-text
            border-secondary 
            focus:ring-accent focus:border-accent
              ${errors.status ? "border-red-500" : ""}
            `}
            >
              <option value="doctor">Doctor</option>
              <option value="medical student">Medical Student</option>
              <option value="others">Others</option>
            </select>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className={`h-11 ${errors.password ? "border-red-500" : ""}`}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`h-11 ${
                    errors.confirmPassword ? "border-red-500" : ""
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-2 text-sm">
              <input
                type="checkbox"
                id="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className={`mt-1 rounded border-secondary text-accent focus:ring-accent ${
                  errors.termsAccepted ? "border-red-500" : ""
                }`}
              />
              <label
                htmlFor="termsAccepted"
                className={`text-gray-600 dark:text-gray-400 ${
                  errors.termsAccepted ? "text-red-500" : ""
                }`}
              >
                I agree to the{" "}
                <Link
                  to={"/"}
                  className="text-accent hover:text-secondary dark:text-secondary dark:hover:text-accent transition-colors"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to={"/"}
                  className="text-accent hover:text-secondary dark:text-secondary dark:hover:text-accent transition-colors"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.termsAccepted && (
              <p className="text-red-500 text-sm">{errors.termsAccepted}</p>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-accent dark:bg-accent hover:bg-accent/90 dark:hover:bg-accent/90 transition-colors"
            >
              Create Account
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">
            Already have an account?{" "}
            <Link
              to={"/login"}
              className="text-accent hover:text-secondary dark:text-secondary dark:hover:text-accent transition-colors"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;