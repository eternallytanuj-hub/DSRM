import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xlbdypsxinbyqthszmvi.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsYmR5cHN4aW5ieXF0aHN6bXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NjUwNTksImV4cCI6MjEwNDM0MTA1OX0.W0vaJznsbAKAHIvr0d1yFaIP70rjVH8FKEPig1FP0gE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  wallet_address: string;
  display_tag: string | null;
  kyc_tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  reputation_score: number;
  created_at: string;
  updated_at: string;
}

export interface BookingRecord {
  id: string;
  booking_id: string;
  user_address: string;
  operator_address?: string | null;
  satellite: string;
  norad_id?: number | null;
  window_start?: string | null;
  window_end?: string | null;
  window_text?: string | null;
  locked_amount: string;
  status: 'PENDING' | 'ACTIVE' | 'SETTLED' | 'REFUNDED' | 'PARTIALLY_SETTLED';
  tx_hash?: string | null;
  settlement_tx_hash?: string | null;
  etherscan_url?: string | null;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface OperatorListing {
  id: string;
  operator_name: string;
  operator_address: string;
  satellite_name: string;
  norad_id?: number | null;
  category?: string | null;
  band?: string | null;
  bandwidth?: string | null;
  elevation?: string | null;
  speed?: string | null;
  window_start?: string | null;
  window_end?: string | null;
  window_display?: string | null;
  price_eth?: string | null;
  coverage_area?: string | null;
  status: 'AVAILABLE' | 'BOOKED' | 'COMPLETED' | 'CANCELLED';
  created_at?: string;
  updated_at?: string;
}
