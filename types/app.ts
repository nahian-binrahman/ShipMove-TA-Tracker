export type AppRole = 'admin' | 'data_entry' | 'viewer';

export interface Profile {
  id: string;
  full_name: string | null;
  rank: string | null;
  organization: string | null;
  role: AppRole;
  created_by?: string;
  created_at?: string;
  updated_at: string;
}

export type MovementStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface Soldier {
  id: string;
  service_number: string;
  full_name: string;
  rank: string;
  unit: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Movement {
  id: string;
  soldier_id: string;
  start_time: string;
  end_time: string;
  from_location: string;
  to_location: string;
  movement_type: string;
  transport_mode: string;
  ta_amount: number;
  movement_fingerprint: string;
  status: MovementStatus;
  attachment_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}
