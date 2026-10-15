-- Migration: 20261015120000_booking_agreements.sql
-- Description: DSRM Pre-Payment Booking Agreement Tables & RLS Policies

-- 1. Create booking_agreements table
CREATE TABLE IF NOT EXISTS public.booking_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id TEXT NOT NULL UNIQUE,
    buyer TEXT NOT NULL,
    operator TEXT NOT NULL,
    window_start BIGINT NOT NULL,
    window_end BIGINT NOT NULL,
    amount_wei NUMERIC NOT NULL,
    terms_version TEXT NOT NULL,
    terms_hash TEXT NOT NULL,
    use_declaration_hash TEXT NOT NULL,
    nonce NUMERIC NOT NULL,
    deadline BIGINT NOT NULL,
    signature TEXT NOT NULL,
    acks JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'VERIFIED', 'DEPOSITED', 'EXPIRED', 'CANCELLED', 'ACTIVE')),
    tx_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_buyer_nonce UNIQUE (buyer, nonce)
);

-- Index for lookup and query performance
CREATE INDEX IF NOT EXISTS idx_booking_agreements_buyer ON public.booking_agreements (buyer);
CREATE INDEX IF NOT EXISTS idx_booking_agreements_status ON public.booking_agreements (status);
CREATE INDEX IF NOT EXISTS idx_booking_agreements_tx_hash ON public.booking_agreements (tx_hash);

-- 2. Create agreement_pii table (isolated PII storage)
CREATE TABLE IF NOT EXISTS public.agreement_pii (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_id UUID NOT NULL REFERENCES public.booking_agreements(id) ON DELETE CASCADE,
    legal_name TEXT,
    email TEXT,
    country TEXT,
    principal_name TEXT,
    principal_address TEXT,
    form_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) on agreement_pii
ALTER TABLE public.agreement_pii ENABLE ROW LEVEL SECURITY;

-- Deny public read access by default
DROP POLICY IF EXISTS "No public read access to PII" ON public.agreement_pii;
CREATE POLICY "No public read access to PII"
    ON public.agreement_pii
    FOR SELECT
    TO anon
    USING (false);

-- Allow authenticated users to view only their own agreement PII
DROP POLICY IF EXISTS "Owner can view their own agreement PII" ON public.agreement_pii;
CREATE POLICY "Owner can view their own agreement PII"
    ON public.agreement_pii
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.booking_agreements ba
            WHERE ba.id = agreement_pii.agreement_id
              AND (
                lower(ba.buyer) = lower(auth.jwt() ->> 'wallet_address')
                OR lower(ba.buyer) = lower(auth.jwt() ->> 'sub')
              )
        )
    );

-- Allow service role full administrative access for backend verification
DROP POLICY IF EXISTS "Service role manages agreement PII" ON public.agreement_pii;
CREATE POLICY "Service role manages agreement PII"
    ON public.agreement_pii
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 3. Add agreement_id foreign key reference to existing bookings table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'agreement_id'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN agreement_id UUID REFERENCES public.booking_agreements(id);
    END IF;
END $$;
