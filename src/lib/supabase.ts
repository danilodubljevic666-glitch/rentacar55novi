import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export type ReservationStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type Reservation = {
  id: string;
  car_id: string;
  car_name: string;
  full_name: string;
  email: string;
  phone: string;
  from_date: string;
  to_date: string;
  message: string | null;
  status: ReservationStatus;
  created_at: string;
};

export type AvailabilityRow = {
  car_id: string;
  from_date: string;
  to_date: string;
};
