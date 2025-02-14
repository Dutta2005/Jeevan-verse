import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { api } from "../../api/api";
import { State, City } from "country-state-city";
import { Plus } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { z } from "zod";
import { useNavigate } from "react-router";

const requestFormSchema = z.object({
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
    required_error: "Blood group is required",
  }),
  urgency: z.enum(["low", "medium", "high"], {
    required_error: "Urgency level is required",
  }),
  message: z.string().optional(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .regex(/^[0-9+\-\s()]*$/, "Invalid phone number format"),
  email: z
    .string()
    .email("Invalid email format")
    .optional()
    .or(z.literal("")),
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  city: z.string().min(1, "City is required"),
});

type FormData = z.infer<typeof requestFormSchema>;

function RequestForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    bloodGroup: "" as any,
    urgency: "" as any,
    message: "",
    phone: "",
    email: "",
    state: "",
    district: "",
    city: "",
  });

  const [selectedStateCode, setSelectedStateCode] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: keyof FormData, value: string) => {
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    try {
      requestFormSchema.parse(formData);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const response = await api.post("/blood-requests/create", {
        bloodGroup: formData.bloodGroup,
        urgency: formData.urgency,
        message: formData.message,
        contactDetails: {
          phone: formData.phone,
          email: formData.email,
        },
        status: "pending",
        address: {
          state: formData.state,
          district: formData.district,
          city: formData.city,
        },
      });

      if (response.status === 201) {
        setErrors({});
        setFormData({
          bloodGroup: "" as any,
          urgency: "" as any,
          message: "",
          phone: "",
          email: "",
          state: "",
          district: "",
          city: "",
        });
        setSelectedStateCode("");
        navigate(`/bloodbridge/request/${response.data.data?.bloodRequest._id}`);
      }
    } catch (error) {
      console.error("Error creating blood request:", error);
      setErrors({ submit: "Failed to submit the form. Please try again." });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="dark:bg-dark-bg dark:text-dark-text dark:hover:bg-gray-800">
          <Plus className="mr-2" /> Create a Request
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full p-0 h-[90%] md:h-auto dark:bg-dark-bg dark:text-dark-text">
        <ScrollArea className="h-full w-full">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle>Request Form</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {errors.submit && <p className="text-red-600 text-sm">{errors.submit}</p>}

              <div className="space-y-4">
                {/* Blood Group */}
                <div>
                  <Label htmlFor="bloodGroup">Blood Group *</Label>
                  <Select
                    onValueChange={(value) => handleChange("bloodGroup", value)}
                    value={formData.bloodGroup}
                  >
                    <SelectTrigger className={errors.bloodGroup ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.bloodGroup && (
                    <p className="text-red-500 text-sm mt-1">{errors.bloodGroup}</p>
                  )}
                </div>

                {/* Urgency */}
                <div>
                  <Label htmlFor="urgency">Urgency *</Label>
                  <Select
                    onValueChange={(value) => handleChange("urgency", value)}
                    value={formData.urgency}
                  >
                    <SelectTrigger className={errors.urgency ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      {["low", "medium", "high"].map((level) => (
                        <SelectItem key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.urgency && (
                    <p className="text-red-500 text-sm mt-1">{errors.urgency}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Input
                    type="text"
                    id="message"
                    placeholder="Optional message"
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    className={errors.message ? "border-red-500" : ""}
                  />
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                  )}
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className={errors.phone ? "border-red-500" : ""}
                      required
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Address Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Select
                      onValueChange={(stateCode) => {
                        const state = State.getStatesOfCountry("IN").find(
                          (s) => s.isoCode === stateCode
                        );
                        if (state) {
                          handleChange("state", state.name);
                          setSelectedStateCode(stateCode);
                        }
                      }}
                      value={selectedStateCode}
                    >
                      <SelectTrigger className={errors.state ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {State.getStatesOfCountry("IN").map((state) => (
                          <SelectItem key={state.isoCode} value={state.isoCode}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="district">District *</Label>
                    <Input
                      type="text"
                      id="district"
                      value={formData.district}
                      onChange={(e) => handleChange("district", e.target.value)}
                      className={errors.district ? "border-red-500" : ""}
                      required
                    />
                    {errors.district && (
                      <p className="text-red-500 text-sm mt-1">{errors.district}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Select
                      onValueChange={(value) => handleChange("city", value)}
                      value={formData.city}
                      disabled={!selectedStateCode}
                    >
                      <SelectTrigger className={errors.city ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {City.getCitiesOfState("IN", selectedStateCode)?.map((city) => (
                          <SelectItem key={city.name} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full dark:hover:bg-gray-700">Submit</Button>
              </div>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default RequestForm;