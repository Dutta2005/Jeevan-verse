import { z } from "zod";

export const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
export const requestSchema = z.object({
  bloodGroup: z.enum(bloodGroups, { error: "Blood group is required" }),
  urgency: z.enum(["low", "medium", "high"], { error: "Urgency level is required" }),
  message: z.string().trim().optional(),
  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .regex(/^[0-9+\-\s()]*$/, "Invalid phone number format"),
  email: z.union([z.literal(""), z.string().trim().email("Invalid email format")]).optional(),
  state: z.string().trim().min(1, "State is required"),
  district: z.string().trim().min(1, "District is required"),
  city: z.string().trim().min(1, "City is required"),
});
export interface RequestDraft {
  bloodGroup: string;
  urgency: string;
  message: string;
  phone: string;
  email: string;
  state: string;
  district: string;
  city: string;
}
export const emptyRequest: RequestDraft = {
  bloodGroup: "",
  urgency: "",
  message: "",
  phone: "",
  email: "",
  state: "",
  district: "",
  city: "",
};
export function requestPayload(data: z.infer<typeof requestSchema>) {
  return {
    bloodGroup: data.bloodGroup,
    urgency: data.urgency,
    message: data.message,
    contactDetails: { phone: data.phone, email: data.email },
    address: { state: data.state, district: data.district, city: data.city },
  };
}
