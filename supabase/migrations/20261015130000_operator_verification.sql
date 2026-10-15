-- Migration: 20261015130000_operator_verification.sql
-- Description: DSRM Operator Verification Tier System, KYB, Satellite Claims, Catalog Checks, and Demo Isolation

-- 1. Create operators table
CREATE TABLE IF NOT EXISTS public.operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT NOT NULL,
    legal_name TEXT,
    declared_country TEXT NOT NULL,
    domain TEXT,
    domain_verified BOOLEAN NOT NULL DEFAULT false,
    domain_verified_at TIMESTAMPTZ,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_wallet_demo UNIQUE (wallet_address, is_demo)
);

CREATE INDEX IF NOT EXISTS idx_operators_wallet ON public.operators (wallet_address);
CREATE INDEX IF NOT EXISTS idx_operators_demo ON public.operators (is_demo);

-- 2. Create operator_kyb table (Private KYB verifications)
CREATE TABLE IF NOT EXISTS public.operator_kyb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_wallet TEXT NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('manual_review', 'mock_kyb', 'sumsub', 'jumio', 'trulioo')),
    decision TEXT NOT NULL CHECK (decision IN ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVIEW')),
    reference_hash TEXT NOT NULL,
    reviewer TEXT,
    review_notes TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_operator_kyb_wallet ON public.operator_kyb (operator_wallet);
CREATE INDEX IF NOT EXISTS idx_operator_kyb_demo ON public.operator_kyb (is_demo);

-- 3. Create operator_documents table (Private document storage references)
CREATE TABLE IF NOT EXISTS public.operator_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_wallet TEXT NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('INCORPORATION', 'TAX_REGISTRATION', 'SPECTRUM_LICENSE', 'OPERATOR_PERMIT', 'OTHER')),
    storage_path TEXT NOT NULL,
    file_hash TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_operator_documents_wallet ON public.operator_documents (operator_wallet);

-- 4. Create satellite_claims table (Control proof challenge & confirmation)
CREATE TABLE IF NOT EXISTS public.satellite_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_wallet TEXT NOT NULL,
    norad_id BIGINT NOT NULL, -- Stored as integer, supports >99999
    status TEXT NOT NULL CHECK (status IN ('OPEN', 'CONFIRMED', 'CONTESTED', 'EXPIRED', 'REVOKED')),
    challenge_id TEXT NOT NULL UNIQUE,
    nonce TEXT NOT NULL,
    opened_at_ms BIGINT NOT NULL,
    deadline_ms BIGINT NOT NULL,
    bundle_hash TEXT,
    merkle_root TEXT,
    observation_id BIGINT,
    tx_hash TEXT,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_satellite_claims_norad ON public.satellite_claims (norad_id);
CREATE INDEX IF NOT EXISTS idx_satellite_claims_operator ON public.satellite_claims (operator_wallet);
CREATE INDEX IF NOT EXISTS idx_satellite_claims_status ON public.satellite_claims (status);
CREATE INDEX IF NOT EXISTS idx_satellite_claims_demo ON public.satellite_claims (is_demo);

-- 5. Create catalog_checks table (SATCAT queries & cache)
CREATE TABLE IF NOT EXISTS public.catalog_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    norad_id BIGINT NOT NULL UNIQUE,
    satellite_name TEXT NOT NULL,
    object_type TEXT,
    ops_status_code TEXT,
    owner_code TEXT,
    launch_date DATE,
    decay_date DATE,
    operator_country TEXT,
    country_match_flag BOOLEAN NOT NULL DEFAULT true,
    source TEXT NOT NULL DEFAULT 'celestrak_satcat',
    raw_satcat JSONB,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_catalog_checks_norad ON public.catalog_checks (norad_id);

-- 6. Create regulatory_evidence table
CREATE TABLE IF NOT EXISTS public.regulatory_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_wallet TEXT NOT NULL,
    issuer TEXT NOT NULL,
    jurisdiction TEXT NOT NULL,
    reference_number TEXT NOT NULL,
    document_hash TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('SUBMITTED', 'VERIFIED', 'REJECTED')),
    reviewer TEXT,
    notes TEXT,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_regulatory_evidence_wallet ON public.regulatory_evidence (operator_wallet);

-- 7. Create listing_window_caps table
CREATE TABLE IF NOT EXISTS public.listing_window_caps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_wallet TEXT NOT NULL,
    current_tier INT NOT NULL DEFAULT 0,
    active_windows_count INT NOT NULL DEFAULT 0,
    max_active_windows INT NOT NULL DEFAULT 3,
    max_booking_value_wei NUMERIC NOT NULL DEFAULT 50000000000000000, -- 0.05 ETH
    payout_hold_hours INT NOT NULL DEFAULT 72,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_caps_operator UNIQUE (operator_wallet, is_demo)
);

-- =============================================================
-- Row Level Security (RLS) Policies
-- =============================================================

ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_kyb ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_window_caps ENABLE ROW LEVEL SECURITY;

-- Public viewable: operators public info (no sensitive PII)
CREATE POLICY "Public can read non-demo operators"
    ON public.operators FOR SELECT
    TO anon, authenticated
    USING (is_demo = false);

CREATE POLICY "Public can read non-demo catalog checks"
    ON public.catalog_checks FOR SELECT
    TO anon, authenticated
    USING (is_demo = false);

CREATE POLICY "Public can read non-demo satellite claims"
    ON public.satellite_claims FOR SELECT
    TO anon, authenticated
    USING (is_demo = false);

-- Operators can read their own private KYB
CREATE POLICY "Operators read own KYB"
    ON public.operator_kyb FOR SELECT
    TO authenticated
    USING (
        lower(operator_wallet) = lower(auth.jwt() ->> 'wallet_address')
        OR lower(operator_wallet) = lower(auth.jwt() ->> 'sub')
    );

-- Operators can read their own documents
CREATE POLICY "Operators read own documents"
    ON public.operator_documents FOR SELECT
    TO authenticated
    USING (
        lower(operator_wallet) = lower(auth.jwt() ->> 'wallet_address')
        OR lower(operator_wallet) = lower(auth.jwt() ->> 'sub')
    );

-- Operators can read their own regulatory evidence
CREATE POLICY "Operators read own regulatory evidence"
    ON public.regulatory_evidence FOR SELECT
    TO authenticated
    USING (
        lower(operator_wallet) = lower(auth.jwt() ->> 'wallet_address')
        OR lower(operator_wallet) = lower(auth.jwt() ->> 'sub')
    );

-- Service role full access to everything
CREATE POLICY "Service role manages operators"
    ON public.operators FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "Service role manages kyb"
    ON public.operator_kyb FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "Service role manages documents"
    ON public.operator_documents FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "Service role manages claims"
    ON public.satellite_claims FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "Service role manages catalog"
    ON public.catalog_checks FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "Service role manages regulatory"
    ON public.regulatory_evidence FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "Service role manages caps"
    ON public.listing_window_caps FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

-- =============================================================
-- Demo Namespace Views
-- Real queries query real tables with WHERE is_demo = false;
-- Demo UI queries demo_* views
-- =============================================================

CREATE OR REPLACE VIEW public.demo_operators AS
    SELECT * FROM public.operators WHERE is_demo = true;

CREATE OR REPLACE VIEW public.demo_satellite_claims AS
    SELECT * FROM public.satellite_claims WHERE is_demo = true;

CREATE OR REPLACE VIEW public.demo_operator_kyb AS
    SELECT * FROM public.operator_kyb WHERE is_demo = true;

CREATE OR REPLACE VIEW public.demo_catalog_checks AS
    SELECT * FROM public.catalog_checks WHERE is_demo = true;

CREATE OR REPLACE VIEW public.demo_regulatory_evidence AS
    SELECT * FROM public.regulatory_evidence WHERE is_demo = true;
