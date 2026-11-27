export interface BloodRequestRecord {
  _id: string;
  userId?: string;
  bloodGroup: string;
  urgency: string;
  message: string;
  status: string;
  address: { state: string; district: string; city: string };
  contactDetails: { phone: string; email?: string };
  volunteers?: { user: string | { _id: string }; canShareDetails?: boolean }[];
}
export interface BloodRequestPage {
  bloodRequests: BloodRequestRecord[];
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  totalRequests?: number;
}
