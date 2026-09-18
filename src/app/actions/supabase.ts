'use server';

import { createClient } from '@supabase/supabase-js';
import { BookingRecord, OperatorListing, Profile } from '@/lib/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xlbdypsxinbyqthszmvi.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsYmR5cHN4aW5ieXF0aHN6bXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NjUwNTksImV4cCI6MjEwNDM0MTA1OX0.W0vaJznsbAKAHIvr0d1yFaIP70rjVH8FKEPig1FP0gE';

function getServerSupabase() {
  return createClient(supabaseUrl, supabaseKey);
}

export async function recordBookingReceipt(booking: {
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
  status?: 'PENDING' | 'ACTIVE' | 'SETTLED' | 'REFUNDED' | 'PARTIALLY_SETTLED';
  tx_hash?: string | null;
  settlement_tx_hash?: string | null;
  etherscan_url?: string | null;
  metadata?: Record<string, any>;
}) {
  try {
    const supabase = getServerSupabase();
    
    if (booking.user_address) {
      const normalizedWallet = booking.user_address.toLowerCase();
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('wallet_address', normalizedWallet)
        .maybeSingle();

      if (!existingProfile) {
        await supabase.from('profiles').upsert({
          wallet_address: normalizedWallet,
          display_tag: `Terminal ${booking.user_address.slice(0, 6)}`,
          kyc_tier: 'Tier 1',
          reputation_score: 100
        }, { onConflict: 'wallet_address', ignoreDuplicates: true });
      }
    }

    const payload = {
      id: booking.id,
      booking_id: booking.booking_id,
      user_address: booking.user_address.toLowerCase(),
      operator_address: booking.operator_address ? booking.operator_address.toLowerCase() : null,
      satellite: booking.satellite,
      norad_id: booking.norad_id || null,
      window_start: booking.window_start || null,
      window_end: booking.window_end || null,
      window_text: booking.window_text || null,
      locked_amount: booking.locked_amount,
      status: booking.status || 'ACTIVE',
      tx_hash: booking.tx_hash || null,
      settlement_tx_hash: booking.settlement_tx_hash || null,
      etherscan_url: booking.etherscan_url || (booking.tx_hash ? `https://sepolia.etherscan.io/tx/${booking.tx_hash}` : null),
      metadata: booking.metadata || {}
    };

    const { data, error } = await supabase
      .from('bookings')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Error inserting booking into Supabase:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Exception in recordBookingReceipt:', err);
    return { success: false, error: err?.message || 'Failed to record booking' };
  }
}

export async function fetchBookings(userAddress?: string): Promise<{ success: boolean; data: BookingRecord[]; error?: string }> {
  try {
    const supabase = getServerSupabase();
    let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });

    if (userAddress) {
      query = query.ilike('user_address', userAddress.toLowerCase());
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching bookings from Supabase:', error);
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: (data as BookingRecord[]) || [] };
  } catch (err: any) {
    console.error('Exception in fetchBookings:', err);
    return { success: false, data: [], error: err?.message || 'Failed to fetch bookings' };
  }
}

export async function fetchOperatorListings(): Promise<{ success: boolean; data: OperatorListing[]; error?: string }> {
  try {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from('operator_listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching operator listings from Supabase:', error);
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: (data as OperatorListing[]) || [] };
  } catch (err: any) {
    console.error('Exception in fetchOperatorListings:', err);
    return { success: false, data: [], error: err?.message || 'Failed to fetch operator listings' };
  }
}

export async function createOperatorListing(listing: {
  operator_name: string;
  operator_address: string;
  satellite_name: string;
  norad_id?: number | null;
  category?: string;
  band?: string;
  bandwidth?: string;
  elevation?: string;
  speed?: string;
  window_display?: string;
  price_eth?: string;
  coverage_area?: string;
}) {
  try {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from('operator_listings')
      .insert({
        ...listing,
        operator_address: listing.operator_address.toLowerCase(),
        status: 'AVAILABLE'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating operator listing in Supabase:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Exception in createOperatorListing:', err);
    return { success: false, error: err?.message || 'Failed to create operator listing' };
  }
}

export async function updateOperatorListingStatus(
  listingId: string, 
  status: 'AVAILABLE' | 'BOOKED' | 'COMPLETED' | 'CANCELLED'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getServerSupabase();
    const { error } = await supabase
      .from('operator_listings')
      .update({ status })
      .eq('id', listingId);

    if (error) {
      console.error('Error updating operator listing status:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Exception in updateOperatorListingStatus:', err);
    return { success: false, error: err?.message || 'Failed to update operator listing' };
  }
}

export async function fetchProfiles(): Promise<{ success: boolean; data: Profile[]; error?: string }> {
  try {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('reputation_score', { ascending: false });

    if (error) {
      console.error('Error fetching profiles from Supabase:', error);
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: (data as Profile[]) || [] };
  } catch (err: any) {
    console.error('Exception in fetchProfiles:', err);
    return { success: false, data: [], error: err?.message || 'Failed to fetch profiles' };
  }
}

export async function syncUserProfile(walletAddress: string, displayTag?: string): Promise<{ success: boolean; data?: Profile; error?: string }> {
  try {
    const supabase = getServerSupabase();
    const normalized = walletAddress.toLowerCase();

    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .ilike('wallet_address', normalized)
      .maybeSingle();

    if (existing) {
      return { success: true, data: existing as Profile };
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        wallet_address: normalized,
        display_tag: displayTag || `Operator ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        kyc_tier: 'Tier 1',
        reputation_score: 100
      }, { onConflict: 'wallet_address' })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Profile };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to sync profile' };
  }
}
