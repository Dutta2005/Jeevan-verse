import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthField } from "@/components/auth/AuthField";
import { authFieldProps } from "@/components/auth/auth-field-props";
import styles from "@/components/auth/AuthLayout.module.css";
import {
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useToast } from "../../hooks/use-toast";
import { api } from "../../api/api";
import { isAxiosError } from "axios";
import { indianStates as states, type IndianState } from "@/lib/india-locations";
import { useIndianCities } from "@/hooks/useIndianCities";

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

  const [selectedState, setSelectedState] = useState<IndianState | undefined>(undefined);
  const {
    cities,
    isLoading: citiesLoading,
    error: citiesError,
    retry,
  } = useIndianCities(selectedState?.isoCode || "");

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;

    const isCheckbox = (e.target as HTMLInputElement).type === "checkbox";
    const inputValue = isCheckbox ? (e.target as HTMLInputElement).checked : value;

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
    if (formData.phone.length !== 10) newErrors.phone = "Phone number must be 10 digits";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.age) newErrors.age = "Age is required";
    if (!formData.address.state) newErrors.state = "State is required";
    if (!formData.address.district) newErrors.district = "District is required";
    if (!formData.address.city) newErrors.city = "City is required";
    if (!formData.info.bloodGroup) newErrors.bloodGroup = "Blood group is required";
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
    setIsSubmitting(true);

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
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 409)
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      audience="individual"
      mode="signup"
      title="Create your account"
      description="A place for your health questions, shared experiences, and blood support."
    >
      <form onSubmit={handleSubmit} className={styles.form} aria-busy={isSubmitting}>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>About you</FieldLegend>
            <div className={styles.twoColumns}>
              <AuthField id="name" label="Full name" error={errors.name}>
                <Input
                  {...authFieldProps("name", errors.name)}
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  placeholder="John Doe"
                />
              </AuthField>
              <AuthField id="phone" label="Phone number" error={errors.phone}>
                <Input
                  {...authFieldProps("phone", errors.phone)}
                  value={formData.phone}
                  onChange={handleChange}
                  type="tel"
                  autoComplete="tel"
                  placeholder="1234567890"
                />
              </AuthField>
            </div>
            <div className={styles.twoColumns}>
              <AuthField id="age" label="Age" error={errors.age}>
                <Input
                  {...authFieldProps("age", errors.age)}
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="25"
                />
              </AuthField>
              <AuthField id="email" label="Email" error={errors.email}>
                <Input
                  {...authFieldProps("email", errors.email)}
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                />
              </AuthField>
            </div>
          </FieldSet>
          <FieldSet className={styles.formSection}>
            <FieldLegend>Location</FieldLegend>
            <div className={styles.threeColumns}>
              <AuthField id="address.state" label="State" error={errors.state}>
                <select
                  {...authFieldProps("address.state", errors.state)}
                  value={formData.address.state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  autoComplete="address-level1"
                  className={styles.nativeSelect}
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state.isoCode} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </AuthField>
              <AuthField id="address.district" label="District" error={errors.district}>
                <Input
                  {...authFieldProps("address.district", errors.district)}
                  value={formData.address.district}
                  onChange={handleChange}
                  autoComplete="address-level2"
                  placeholder="Enter District"
                />
              </AuthField>
              <AuthField id="address.city" label="City" error={errors.city}>
                <select
                  {...authFieldProps("address.city", errors.city)}
                  value={formData.address.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  disabled={!selectedState || citiesLoading || !!citiesError}
                  aria-busy={citiesLoading}
                  className={styles.nativeSelect}
                >
                  <option value="">{citiesLoading ? "Loading cities…" : "Select City"}</option>
                  {cities.map((city, index) => (
                    <option key={`${city}-${index}`} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {citiesError && (
                  <div role="status">
                    <p>{citiesError}</p>
                    <Button type="button" variant="link" onClick={retry}>
                      Retry city suggestions
                    </Button>
                  </div>
                )}
              </AuthField>
            </div>
          </FieldSet>
          <FieldSet className={styles.formSection}>
            <FieldLegend>Health profile</FieldLegend>
            <FieldDescription>
              Profile details do not confirm eligibility to donate blood.
            </FieldDescription>
            <div className={styles.threeColumns}>
              <AuthField id="info.bloodGroup" label="Blood group" error={errors.bloodGroup}>
                <select
                  {...authFieldProps("info.bloodGroup", errors.bloodGroup)}
                  value={formData.info.bloodGroup}
                  onChange={handleChange}
                  className={styles.nativeSelect}
                >
                  <option value="">Blood Group</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Others"].map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </AuthField>
              <AuthField id="info.height" label="Height (cm)" error={errors.height}>
                <Input
                  {...authFieldProps("info.height", errors.height)}
                  type="number"
                  value={formData.info.height}
                  onChange={handleChange}
                  placeholder="170"
                />
              </AuthField>
              <AuthField id="info.weight" label="Weight (kg)" error={errors.weight}>
                <Input
                  {...authFieldProps("info.weight", errors.weight)}
                  type="number"
                  value={formData.info.weight}
                  onChange={handleChange}
                  placeholder="65"
                />
              </AuthField>
            </div>
            <AuthField id="status" label="Background" error={errors.status}>
              <select
                {...authFieldProps("status", errors.status)}
                value={formData.status}
                onChange={handleChange}
                className={styles.nativeSelect}
              >
                <option value="doctor">Doctor</option>
                <option value="medical student">Medical Student</option>
                <option value="others">Others</option>
              </select>
            </AuthField>
          </FieldSet>
          <FieldSet className={styles.formSection}>
            <FieldLegend>Account security</FieldLegend>
            <div className={styles.twoColumns}>
              <AuthField id="password" label="Password" error={errors.password}>
                <Input
                  {...authFieldProps("password", errors.password)}
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                />
              </AuthField>
              <AuthField
                id="confirmPassword"
                label="Confirm password"
                error={errors.confirmPassword}
              >
                <Input
                  {...authFieldProps("confirmPassword", errors.confirmPassword)}
                  type="password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                />
              </AuthField>
            </div>
          </FieldSet>
          <div>
            <div className={styles.consent}>
              <input
                {...authFieldProps("termsAccepted", errors.termsAccepted)}
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={handleChange}
              />
              <label htmlFor="termsAccepted">
                I agree to the <Link to="/">Terms of Service</Link> and{" "}
                <Link to="/">Privacy Policy</Link>
              </label>
            </div>
            {errors.termsAccepted && (
              <FieldError id="termsAccepted-error">{errors.termsAccepted}</FieldError>
            )}
          </div>
        </FieldGroup>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <p className={styles.footer}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
};

export default Signup;
