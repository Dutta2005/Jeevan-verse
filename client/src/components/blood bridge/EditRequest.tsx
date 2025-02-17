import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { api } from "../../api/api";
import { State, City } from "country-state-city";
import { z } from "zod";

const requestFormSchema = z.object({
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  urgency: z.enum(["low", "medium", "high"]),
  message: z.string().optional(),
  phone: z.string().min(10).max(15).regex(/^[0-9+\-\s()]*$/, "Invalid phone number format"),
  email: z.string().email().optional().or(z.literal("")),
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  city: z.string().min(1, "City is required"),
});

type FormData = z.infer<typeof requestFormSchema>;

interface EditRequestProps {
  requestId: string;
  onSave: () => void;
  onCancel: () => void;
}

function EditRequest({ requestId, onSave, onCancel }: EditRequestProps) {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [selectedStateCode, setSelectedStateCode] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch the existing request data when the component mounts
  useEffect(() => {
    const fetchRequestData = async () => {
      try {
        const response = await api.get(`/blood-requests/${requestId}`);
        if (response.status === 200) {
          const data = response.data.data;
          setFormData({
            bloodGroup: data.bloodGroup,
            urgency: data.urgency,
            message: data.message || "",
            phone: data.contactDetails?.phone || "",
            email: data.contactDetails?.email || "",
            state: data.address?.state || "",
            district: data.address?.district || "",
            city: data.address?.city || "",
          });

          const state = State.getStatesOfCountry("IN").find((s) => s.name === data.address.state);
          if (state) setSelectedStateCode(state.isoCode);
        }
      } catch (error) {
        console.error("Failed to fetch blood request data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequestData();
  }, [requestId]);

  const handleChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
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
    if (!formData || !validateForm()) return;

    try {
      const response = await api.patch(`/blood-requests/update/${requestId}`, {
        bloodGroup: formData.bloodGroup,
        urgency: formData.urgency,
        message: formData.message || undefined,
        contactDetails: {
          phone: formData.phone,
          email: formData.email || undefined,
        },
        address: {
          state: formData.state,
          district: formData.district,
          city: formData.city,
        },
      });

      if (response.status === 200) onSave();
    } catch (error) {
      console.error("Error updating blood request:", error);
      setErrors({ submit: "Failed to update the request. Please try again." });
    }
  };

  if (loading) {
    return <p>Loading request details...</p>;
  }

  if (!formData) {
    return <p>Failed to load request details.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      {errors.submit && <p className="text-red-600 text-sm">{errors.submit}</p>}

      <div className="space-y-4">
        <div>
          <Label>Blood Group *</Label>
          <Select value={formData.bloodGroup} onValueChange={(value) => handleChange("bloodGroup", value)}>
            <SelectTrigger>
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
        </div>

        <div>
          <Label>Urgency *</Label>
          <Select value={formData.urgency} onValueChange={(value) => handleChange("urgency", value)}>
            <SelectTrigger>
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
        </div>

        <div>
          <Label>Phone *</Label>
          <Input type="tel" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} required />
        </div>

        <div>
          <Label>Email</Label>
          <Input type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label>State *</Label>
          <Select
            value={selectedStateCode}
            onValueChange={(stateCode) => {
              const state = State.getStatesOfCountry("IN").find((s) => s.isoCode === stateCode);
              if (state) {
                handleChange("state", state.name);
                setSelectedStateCode(stateCode);
              }
            }}
          >
            <SelectTrigger>
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
        </div>

        <div>
          <Label>District *</Label>
          <Input type="text" value={formData.district} onChange={(e) => handleChange("district", e.target.value)} />
        </div>

        <div>
          <Label>City *</Label>
          <Select value={formData.city} onValueChange={(value) => handleChange("city", value)}>
            <SelectTrigger>
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
        </div>
      </div>
      </div>

      <div className="flex gap-4 pt-4 justify-center">
        <Button type="submit">Save Changes</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default EditRequest;
