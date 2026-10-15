"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { runVerification, type VerificationState } from "./verify";
import type { EvidenceBundle, VerificationStepId } from "./types";

export interface UseVerificationProps {
  initialBundle: EvidenceBundle | null;
  observationId?: string;
  registryAddress?: string;
  autoRun?: boolean;
}

export function useVerification({
  initialBundle,
  observationId = "11726893",
  registryAddress,
  autoRun = true,
}: UseVerificationProps) {
  const [verification, setVerification] = useState<VerificationState | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [runningStepId, setRunningStepId] = useState<VerificationStepId | null>(null);

  const activeBundleRef = useRef<EvidenceBundle | null>(initialBundle);

  useEffect(() => {
    activeBundleRef.current = initialBundle;
  }, [initialBundle]);

  const runAll = useCallback(
    async (bundleOverride?: EvidenceBundle): Promise<VerificationState> => {
      const bundleToVerify = bundleOverride || activeBundleRef.current || undefined;
      setIsVerifying(true);
      setRunningStepId(null);
      try {
        const res = await runVerification({
          bundle: bundleToVerify,
          observationId,
          registryAddress: registryAddress as `0x${string}`,
          onStepProgress: (step) => {
            setRunningStepId(step.id);
          },
        });
        setVerification(res);
        return res;
      } finally {
        setIsVerifying(false);
        setRunningStepId(null);
      }
    },
    [observationId, registryAddress]
  );

  const runStep = useCallback(
    async (
      stepId: VerificationStepId,
      bundleOverride?: EvidenceBundle
    ): Promise<VerificationState> => {
      const bundleToVerify = bundleOverride || activeBundleRef.current || undefined;
      setIsVerifying(true);
      setRunningStepId(stepId);
      try {
        const res = await runVerification({
          bundle: bundleToVerify,
          observationId,
          registryAddress: registryAddress as `0x${string}`,
          onlyStepId: stepId,
          existingState: verification || undefined,
        });
        setVerification(res);
        return res;
      } finally {
        setIsVerifying(false);
        setRunningStepId(null);
      }
    },
    [observationId, registryAddress, verification]
  );

  // Auto-run on initial mount when bundle is available
  useEffect(() => {
    if (autoRun && initialBundle && !verification) {
      runAll(initialBundle);
    }
  }, [autoRun, initialBundle, verification, runAll]);

  return {
    verification,
    setVerification,
    isVerifying,
    runningStepId,
    runAll,
    runStep,
  };
}
