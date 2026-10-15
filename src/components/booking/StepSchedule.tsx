"use client";

import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, ShieldAlert, Cpu, Clock, Calendar as CalendarIcon } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  scheduleFormSchema,
  ScheduleFormData,
  BuyerType,
} from "@/lib/agreement/schema";
import {
  COUNTRY_LIST,
  isCountryBlocked,
  isCountryHighRisk,
  SCHEDULE_C_CATEGORIES,
} from "@/config/compliance";
import { SatellitePass } from "@/app/(stitch)/marketplace/types";
import { parseEther } from "viem";
import { generateBookingId } from "@/lib/agreement/hashes";

interface StepScheduleProps {
  listing: SatellitePass;
  connectedWallet: `0x${string}`;
  initialValues?: Partial<ScheduleFormData>;
  onValidSubmit: (data: ScheduleFormData) => void;
  onValuesChanged?: () => void;
}

interface DateTimePickerProps {
  label: string;
  fieldNumber: string;
  valueSec: number;
  onChangeSec: (sec: number) => void;
  minDate?: Date;
  maxDate?: Date;
  helperText?: string;
}

function DateTimePickerField({
  label,
  fieldNumber,
  valueSec,
  onChangeSec,
  minDate,
  maxDate,
  helperText,
}: DateTimePickerProps) {
  const d = new Date(valueSec * 1000);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  const day = d.getUTCDate();
  const hours = d.getUTCHours();
  const minutes = d.getUTCMinutes();
  const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  const selectedDate = new Date(Date.UTC(year, month, day, 12, 0, 0));

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;
    const newYear = newDate.getUTCFullYear();
    const newMonth = newDate.getUTCMonth();
    const newDay = newDate.getUTCDate();
    const newSec = Math.floor(Date.UTC(newYear, newMonth, newDay, hours, minutes, 0) / 1000);
    onChangeSec(newSec);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val || !val.includes(":")) return;
    const [hStr, mStr] = val.split(":");
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (!isNaN(h) && !isNaN(m)) {
      const newSec = Math.floor(Date.UTC(year, month, day, h, m, 0) / 1000);
      onChangeSec(newSec);
    }
  };

  return (
    <div className="space-y-2 p-3 rounded-lg border border-white/[0.08] bg-white/[0.02]">
      <div className="flex justify-between items-center text-xs">
        <FormLabel className="text-xs font-mono font-medium text-white flex items-center gap-1.5">
          <span className="text-white font-bold">{fieldNumber}:</span>
          <span>{label}</span>
        </FormLabel>
        <span className="text-[10px] font-mono text-white/60 bg-white/[0.05] px-2 py-0.5 rounded border border-white/[0.08]">
          UTC
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              type="button"
              className="w-full justify-start text-left font-mono text-xs bg-white/[0.04] border-white/[0.08] text-white hover:bg-white/[0.08] h-9"
            >
              <CalendarIcon className="mr-2 h-3.5 w-3.5 text-white/60" />
              <span>{d.toISOString().slice(0, 10)}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => {
                if (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return true;
                if (maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), 23, 59, 59)) return true;
                return false;
              }}
            />
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-white/60 shrink-0" />
          <Input
            type="time"
            value={timeStr}
            onChange={handleTimeChange}
            className="font-mono text-xs bg-white/[0.04] border-white/[0.08] text-white h-9"
            aria-label={`${label} time UTC`}
          />
        </div>
      </div>

      <div className="text-[10px] font-mono text-white/60 flex flex-wrap justify-between gap-1 pt-1 border-t border-white/[0.08]">
        <span>UTC: {d.toUTCString().slice(0, 22)} UTC</span>
        <span>Local: {d.toLocaleTimeString()}</span>
      </div>
      {helperText && (
        <div className="text-[10px] text-white/40">{helperText}</div>
      )}
    </div>
  );
}

export function StepSchedule({
  listing,
  connectedWallet,
  initialValues,
  onValidSubmit,
  onValuesChanged,
}: StepScheduleProps) {
  // Derive listing price in wei and ETH
  const listingPriceEth = useMemo(() => {
    if (listing.price && listing.price.includes("ETH")) {
      const match = listing.price.match(/([0-9.]+)/);
      return match ? match[1] : "0.0001";
    }
    return "0.0001";
  }, [listing.price]);

  const listingPriceWei = useMemo(() => {
    try {
      return parseEther(listingPriceEth).toString();
    } catch {
      return parseEther("0.0001").toString();
    }
  }, [listingPriceEth]);

  // Default window: now + 3600 to now + 7200, or from listing if parsed
  const defaultWindowStart = useMemo(() => {
    return initialValues?.windowStart || Math.floor(Date.now() / 1000) + 3600;
  }, [initialValues?.windowStart]);

  const defaultWindowEnd = useMemo(() => {
    return initialValues?.windowEnd || defaultWindowStart + 1800; // 30 min pass
  }, [initialValues?.windowEnd, defaultWindowStart]);

  const defaultDeadline = useMemo(() => {
    const defaultSec = Math.floor(Date.now() / 1000) + 1800; // now + 30 min
    const maxSec = Math.min(Math.floor(Date.now() / 1000) + 86400, defaultWindowStart);
    return Math.min(defaultSec, maxSec);
  }, [defaultWindowStart]);

  // Random bytes32 booking ID generated as keccak256 of random bytes (A1)
  const defaultBookingId = useMemo(() => {
    if (initialValues?.bookingId) return initialValues.bookingId;
    return generateBookingId();
  }, [initialValues?.bookingId]);

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      bookingId: defaultBookingId,
      wallet: connectedWallet,
      buyerType: initialValues?.buyerType || "Individual",
      isAgent: initialValues?.isAgent || false,
      legalName: initialValues?.legalName || "",
      country: initialValues?.country || "US",
      email: initialValues?.email || "",
      principalName: initialValues?.principalName || "",
      principalAddress: initialValues?.principalAddress || "",
      targetRegion: initialValues?.targetRegion || "Global Ground Stations (LEO Uplink)",
      frequencyBand: initialValues?.frequencyBand || "Ku/Ka-Band",
      minElevation: initialValues?.minElevation || "15 degrees",
      dataVolume: initialValues?.dataVolume || "25 GB nominal",
      latencyTarget: initialValues?.latencyTarget || "< 45 ms RTT",
      intendedUseCategory:
        initialValues?.intendedUseCategory || "Scientific research and education",
      otherDescription: initialValues?.otherDescription || "",
      windowStart: defaultWindowStart,
      windowEnd: defaultWindowEnd,
      signatureDeadline: initialValues?.signatureDeadline || defaultDeadline,
      amountWei: listingPriceWei,
    },
    mode: "onChange",
  });

  const { watch, setValue, handleSubmit, formState } = form;

  const currentCountry = watch("country");
  const isAgent = watch("isAgent");
  const currentBuyerType = watch("buyerType");
  const currentCategory = watch("intendedUseCategory");
  const windowStart = watch("windowStart");
  const windowEnd = watch("windowEnd");
  const signatureDeadline = watch("signatureDeadline");

  // Keep wallet in sync with connected address
  useEffect(() => {
    if (connectedWallet) {
      setValue("wallet", connectedWallet, { shouldValidate: true });
    }
  }, [connectedWallet, setValue]);

  // Notify parent on any form field change to trigger invalidation if necessary
  useEffect(() => {
    const subscription = watch(() => {
      onValuesChanged?.();
    });
    return () => subscription.unsubscribe();
  }, [watch, onValuesChanged]);

  // Sync isAgent with buyerType
  const handleAgentToggle = (checked: boolean) => {
    setValue("isAgent", checked, { shouldValidate: true });
    if (checked) {
      setValue("buyerType", "Autonomous Agent", { shouldValidate: true });
    } else {
      if (currentBuyerType === "Autonomous Agent") {
        setValue("buyerType", "Company", { shouldValidate: true });
      }
      setValue("principalName", "", { shouldValidate: true });
      setValue("principalAddress", "", { shouldValidate: true });
    }
  };

  const handleBuyerTypeChange = (type: BuyerType) => {
    setValue("buyerType", type, { shouldValidate: true });
    if (type === "Autonomous Agent") {
      setValue("isAgent", true, { shouldValidate: true });
    } else {
      setValue("isAgent", false, { shouldValidate: true });
      setValue("principalName", "", { shouldValidate: true });
      setValue("principalAddress", "", { shouldValidate: true });
    }
  };

  const isBlocked = isCountryBlocked(currentCountry);
  const isHighRiskCountry = isCountryHighRisk(currentCountry);
  const isOtherCategory = currentCategory.toLowerCase() === "other";
  const selectedCategoryObj = SCHEDULE_C_CATEGORIES.find(
    (c) => c.label === currentCategory || c.id === currentCategory
  );
  const isCategoryRisk = selectedCategoryObj?.highRisk || false;

  return (
    <div className="space-y-6">
      <div className="border-b border-white/[0.08] pb-4">
        <h2 className="text-sm font-semibold tracking-wider font-mono text-white flex items-center justify-between">
          <span>PART A: BOOKING SCHEDULE & SPECIFICATION</span>
          <span className="text-[11px] text-white/50 font-normal font-sans">
            Step 1 of 4
          </span>
        </h2>
        <p className="text-xs text-white/60 mt-1 font-sans">
          Specify mission legal identity, technical parameters, and Schedule C acceptable use.
        </p>
      </div>

      {/* Country Sanctions Warning Banner */}
      {isBlocked && (
        <Alert variant="destructive" className="border-white/20 bg-white/[0.02]">
          <ShieldAlert className="h-4 w-4 text-white" />
          <AlertTitle className="text-xs font-mono text-white">Sanctions Gate Restriction</AlertTitle>
          <AlertDescription className="text-xs font-sans text-white/70">
            Selected country ({currentCountry}) is subject to comprehensive international sanctions.
            Bookings from restricted jurisdictions cannot proceed to agreement signing.
          </AlertDescription>
        </Alert>
      )}

      {isHighRiskCountry && !isBlocked && (
        <Alert variant="warning" className="border-white/20 bg-white/[0.02]">
          <AlertTriangle className="h-4 w-4 text-white" />
          <AlertTitle className="text-xs font-mono text-white">Enhanced Compliance Review</AlertTitle>
          <AlertDescription className="text-xs font-sans text-white/70">
            The selected jurisdiction is designated high-risk. Additional export-control screening
            and operator clearance may be applied prior to pass execution.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-6">
          {/* Section 1: Read-Only Listing Parameters (A8, A9, A10, A14) */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
              <span className="text-[10px] uppercase tracking-wider text-white/40 font-sans">
                Listing Parameters (Read-Only)
              </span>
              <Badge variant="outline" className="text-[10px] border-white/20 text-white/80 bg-white/[0.03]">
                Server-Authoritative
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] text-white/40 block font-sans">A8: Satellite / Target</span>
                <span className="text-white font-medium">{listing.name}</span>
                {listing.noradId && (
                  <span className="text-white/40 ml-1">#{listing.noradId}</span>
                )}
              </div>
              <div>
                <span className="text-[10px] text-white/40 block font-sans">A8: Operator Wallet</span>
                <span className="text-white/60 text-[11px] truncate block" title={listing.operatorAddress || "0xc25f9F0Ce27A2D248c43563a32cDC4886D069176"}>
                  {listing.operatorAddress ? `${listing.operatorAddress.slice(0, 6)}...${listing.operatorAddress.slice(-4)}` : "DSRM Operator Pool"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-white/40 block font-sans">A9: Service Type</span>
                <span className="text-white">LEO RF Downlink</span>
              </div>
              <div>
                <span className="text-[10px] text-white/40 block font-sans">A14: Escrow Price</span>
                <span className="text-white font-semibold">{listingPriceEth} ETH</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.08] flex flex-wrap items-center justify-between text-[11px]">
              <div>
                <span className="text-white/40">A1: Booking ID: </span>
                <span className="text-white/70">{defaultBookingId.slice(0, 10)}...{defaultBookingId.slice(-8)}</span>
              </div>
              <div>
                <span className="text-white/40">A2: Signer Wallet: </span>
                <span className="text-white">{connectedWallet.slice(0, 6)}...{connectedWallet.slice(-4)}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Buyer Legal Identity (A3, A4, A5, A6, A7) */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
              <span className="text-xs font-mono font-semibold text-white tracking-wide">
                1. BUYER LEGAL IDENTITY & JURISDICTION
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-white/60 font-mono">Autonomous Agent Mode</span>
                <Switch
                  checked={isAgent}
                  onCheckedChange={handleAgentToggle}
                  aria-label="Toggle Autonomous Agent mode"
                />
              </div>
            </div>

            {isAgent && (
              <Alert variant="info" className="py-2.5 border-white/20 bg-white/[0.02]">
                <Cpu className="h-4 w-4 text-white" />
                <AlertTitle className="text-xs font-mono text-white">Autonomous Agent Signer Active</AlertTitle>
                <AlertDescription className="text-xs font-sans text-white/70">
                  Per Article 3.7 and Schedule D: Where an autonomous agent signs on-chain,
                  the human or corporate Principal warrants full liability. Principal name and
                  legal address are strictly mandatory.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="buyerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>A3: Buyer Entity Type</FormLabel>
                    <Select
                      disabled={isAgent}
                      onValueChange={(val: BuyerType) => handleBuyerTypeChange(val)}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white/[0.04] border-white/[0.08] text-white">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Individual">Individual</SelectItem>
                        <SelectItem value="Company">Company / Corporation</SelectItem>
                        <SelectItem value="Institution">Institution / University</SelectItem>
                        <SelectItem value="Autonomous Agent">Autonomous Agent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="legalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>A4: Legal Name / Entity Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Acme Aerospace Ltd or Satoshi Nakamoto" className="bg-white/[0.04] border-white/[0.08] text-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>A5: Jurisdiction (Country)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/[0.04] border-white/[0.08] text-white">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRY_LIST.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.name} ({c.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>A6: Contact Email for Legal Notices</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="legal-notices@domain.com" className="bg-white/[0.04] border-white/[0.08] text-white" {...field} />
                  </FormControl>
                  <FormDescription className="text-white/40">
                    Official email address used for dispute notices and performance certificates.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* A7: Required if Autonomous Agent */}
            {isAgent && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-lg border border-white/10 bg-white/[0.02]">
                <FormField
                  control={form.control}
                  name="principalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        A7: Principal Name (Responsible Human / Corp)
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Full legal name of human operator" className="bg-white/[0.04] border-white/[0.08] text-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="principalAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        A7: Principal Legal Address
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Physical registered address & jurisdiction" className="bg-white/[0.04] border-white/[0.08] text-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          {/* Section 3: Technical Parameters & Timing (A10, A11, A12, A17) */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-4">
            <span className="text-xs font-mono font-semibold text-white tracking-wide block border-b border-white/[0.08] pb-2">
              2. TECHNICAL PASS PARAMETERS & TIMING
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="targetRegion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>A11: Target Ground Station or Region</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Svalbard Ground Station / 78.22° N, 15.40° E" className="bg-white/[0.04] border-white/[0.08] text-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequencyBand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>A12: Frequency Band</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Ku/Ka-Band Downlink (11.7 - 12.2 GHz)" className="bg-white/[0.04] border-white/[0.08] text-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="minElevation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Elevation</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 15°" className="bg-white/[0.04] border-white/[0.08] text-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataVolume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Volume</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 25 GB nominal" className="bg-white/[0.04] border-white/[0.08] text-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="latencyTarget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latency Target</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. < 45 ms RTT" className="bg-white/[0.04] border-white/[0.08] text-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* A10: Pass Window & A17: Signature Deadline */}
            <div className="space-y-4 pt-2">
              <span className="text-xs font-mono font-medium text-white block">
                Pass Window (A10) & Signature Deadline (A17)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DateTimePickerField
                  fieldNumber="A10 Start"
                  label="Pass Window Start"
                  valueSec={windowStart}
                  minDate={new Date()}
                  onChangeSec={(sec) => setValue("windowStart", sec, { shouldValidate: true })}
                  helperText="Unix seconds (uint64) converted automatically in UTC."
                />

                <DateTimePickerField
                  fieldNumber="A10 End"
                  label="Pass Window End"
                  valueSec={windowEnd}
                  minDate={new Date(windowStart * 1000)}
                  onChangeSec={(sec) => setValue("windowEnd", sec, { shouldValidate: true })}
                  helperText={`Duration: ${Math.round((windowEnd - windowStart) / 60)} minutes`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DateTimePickerField
                  fieldNumber="A17"
                  label="Signature Deadline"
                  valueSec={signatureDeadline}
                  minDate={new Date()}
                  maxDate={new Date(Math.min(Date.now() + 86400000, windowStart * 1000))}
                  onChangeSec={(sec) => setValue("signatureDeadline", sec, { shouldValidate: true })}
                  helperText={`Valid for ~${Math.max(0, Math.round((signatureDeadline - Math.floor(Date.now() / 1000)) / 60))} minutes. Max: earlier of now+24h and window start.`}
                />

                <div className="p-3 rounded-lg border border-white/[0.08] bg-white/[0.02] flex flex-col justify-center text-xs space-y-1">
                  <span className="font-mono text-white text-[11px] font-medium">Timing & Availability Rules</span>
                  <p className="text-[10px] text-white/50 leading-relaxed font-sans">
                    Pass windows are scheduled in UTC. The signature deadline enforces smart contract and backend freshness: signatures cannot be submitted after the deadline.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Schedule C Acceptable Use Declaration */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-4">
            <span className="text-xs font-mono font-semibold text-white tracking-wide block border-b border-white/[0.08] pb-2">
              3. SCHEDULE C: ACCEPTABLE USE & EXPORT DECLARATION
            </span>

            <FormField
              control={form.control}
              name="intendedUseCategory"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Select Mission Intended Use Category (A13):</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                    >
                      {SCHEDULE_C_CATEGORIES.map((cat) => (
                        <div
                          key={cat.id}
                          className="flex items-center space-x-2 rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 hover:border-white/20 transition-colors"
                        >
                          <RadioGroupItem value={cat.label} id={cat.id} />
                          <label
                            htmlFor={cat.id}
                            className="text-xs font-mono text-white cursor-pointer flex-1"
                          >
                            {cat.label}
                            {cat.highRisk && (
                              <span className="ml-2 text-[10px] text-white/50 font-sans">
                                (Review)
                              </span>
                            )}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isCategoryRisk && !isOtherCategory && (
              <Alert variant="warning" className="py-2.5 border-white/20 bg-white/[0.02]">
                <AlertTriangle className="h-4 w-4 text-white" />
                <AlertTitle className="text-xs font-mono text-white">Specialized Regulatory Clearance</AlertTitle>
                <AlertDescription className="text-xs font-sans text-white/70">
                  The selected category ({currentCategory}) may be subject to dual-use export control
                  scrutiny under Article 11. The Buyer warrants no military end-use.
                </AlertDescription>
              </Alert>
            )}

            {isOtherCategory && (
              <div className="space-y-3 p-3 rounded-lg border border-white/10 bg-white/[0.02]">
                <Alert variant="warning" className="py-2 border-white/20 bg-white/[0.02]">
                  <AlertTriangle className="h-4 w-4 text-white" />
                  <AlertTitle className="text-xs font-mono text-white">Manual Platform Approval Required</AlertTitle>
                  <AlertDescription className="text-xs font-sans text-white/70">
                    Category "Other" flags <code className="font-mono text-white/80">requiresManualApproval = true</code>.
                    Detailed mission scope description is required for compliance screening.
                  </AlertDescription>
                </Alert>

                <FormField
                  control={form.control}
                  name="otherDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        Detailed Description of Intended Use (Minimum 10 characters)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide detailed description of payload operations, receiving equipment, and mission intent..."
                          className="bg-white/[0.04] border-white/[0.08] text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isBlocked || !formState.isValid}
              className="px-6 py-2.5 bg-white text-black hover:bg-white/90 font-mono text-xs font-semibold"
            >
              Save Schedule & Review Terms
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
