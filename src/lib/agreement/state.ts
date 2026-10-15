import { ScheduleFormData } from "./schema";

export interface StoredAcknowledgement {
  ticked: boolean;
  timestamp: string; // ISO 8601
}

export interface BookingDraftState {
  formValues?: Partial<ScheduleFormData>;
  readCompleted?: boolean;
  readTermsHash?: string;
  acknowledgements?: Record<string, StoredAcknowledgement>;
  currentStep?: number;
}

function getStorageKey(listingId: string, walletAddress: string): string {
  return `dsrm_booking_draft_${listingId}_${walletAddress.toLowerCase()}`;
}

/**
 * Persists the booking draft to sessionStorage.
 * SECURITY: Never persists cryptographic signatures or private credentials.
 */
export function saveBookingDraft(
  listingId: string,
  walletAddress: string,
  state: BookingDraftState
): void {
  if (typeof window === "undefined" || !listingId || !walletAddress) return;
  try {
    const key = getStorageKey(listingId, walletAddress);
    // Deep clone and ensure no signature keys exist
    const sanitized: BookingDraftState = {
      formValues: state.formValues ? { ...state.formValues } : undefined,
      readCompleted: Boolean(state.readCompleted),
      readTermsHash: state.readTermsHash,
      acknowledgements: state.acknowledgements ? { ...state.acknowledgements } : {},
      currentStep: state.currentStep || 1,
    };
    sessionStorage.setItem(key, JSON.stringify(sanitized));
  } catch (err) {
    console.warn("Failed to persist booking draft to sessionStorage:", err);
  }
}

/**
 * Loads persisted booking draft from sessionStorage.
 */
export function loadBookingDraft(
  listingId: string,
  walletAddress: string
): BookingDraftState | null {
  if (typeof window === "undefined" || !listingId || !walletAddress) return null;
  try {
    const key = getStorageKey(listingId, walletAddress);
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as BookingDraftState;
  } catch (err) {
    console.warn("Failed to retrieve booking draft from sessionStorage:", err);
    return null;
  }
}

/**
 * Clears booking draft from sessionStorage.
 */
export function clearBookingDraft(listingId: string, walletAddress: string): void {
  if (typeof window === "undefined" || !listingId || !walletAddress) return;
  try {
    const key = getStorageKey(listingId, walletAddress);
    sessionStorage.removeItem(key);
  } catch {
    // Ignore error
  }
}
