"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Turnstile } from "@/components/turnstile";
import {
  type CommunityCenterReservationFormData,
  submitCommunityCenterReservation,
} from "@/server/actions/community-center-reservation";

interface FormErrors {
  firstName?: string;
  email?: string;
  phone?: string;
  contact?: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  eventPurpose?: string;
  expectedAttendance?: string;
}

const PHONE_DIGIT_PATTERN = /\d/g;
const isPlausiblePhone = (value: string) => {
  const digits = value.match(PHONE_DIGIT_PATTERN)?.length ?? 0;
  return digits >= 7;
};

// Fire-code capacity (see the reservation rules above the form).
const MAX_ATTENDANCE = 120;

interface CommunityCenterReservationFormProps {
  // Optional Builder-block overrides passed through to the server action.
  // Cleared Builder fields arrive as "" (not undefined); the server treats
  // empty/whitespace values as unset and falls back to env/default.
  recipientEmail?: string;
  bccEmail?: string;
}

export const CommunityCenterReservationForm = ({
  recipientEmail,
  bccEmail,
}: CommunityCenterReservationFormProps = {}) => {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const turnstileTokenRef = useRef<string | null>(null);
  const turnstileResetRef = useRef<(() => void) | null>(null);
  const [turnstileFailed, setTurnstileFailed] = useState(false);
  const loadedAtRef = useRef(Date.now().toString());
  const successRef = useRef<HTMLOutputElement | null>(null);

  useEffect(() => {
    if (submitted && successRef.current) {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      successRef.current.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "nearest",
      });
      successRef.current.focus();
    }
  }, [submitted]);

  const validate = (form: FormData): FormErrors => {
    const errs: FormErrors = {};
    if (!form.get("firstName")) errs.firstName = "First name is required";
    const email = ((form.get("email") as string) ?? "").trim();
    const phone = ((form.get("phone") as string) ?? "").trim();
    if (!email && !phone) {
      errs.contact = "Please provide an email address or a phone number so we can reply.";
    } else {
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errs.email = "Please enter a valid email";
      }
      if (phone && !isPlausiblePhone(phone)) {
        errs.phone = "Please enter a valid phone number";
      }
    }
    if (!form.get("eventDate")) errs.eventDate = "Please choose a date for your event";
    if (!form.get("startTime")) errs.startTime = "Please choose a start time";
    if (!form.get("endTime")) errs.endTime = "Please choose an end time";
    const purpose = ((form.get("eventPurpose") as string) ?? "").trim();
    if (purpose.length < 3) errs.eventPurpose = "Please describe the event or purpose";
    const attendanceRaw = ((form.get("expectedAttendance") as string) ?? "").trim();
    const attendance = Number(attendanceRaw);
    if (
      !attendanceRaw ||
      Number.isNaN(attendance) ||
      !Number.isInteger(attendance) ||
      attendance < 1
    ) {
      errs.expectedAttendance = "Please enter the expected number of guests";
    } else if (attendance > MAX_ATTENDANCE) {
      errs.expectedAttendance = `The Community Center holds up to ${MAX_ATTENDANCE} guests (Fire Code)`;
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const validationErrors = validate(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setServerError(null);

    startTransition(async () => {
      const result = await submitCommunityCenterReservation({
        firstName: form.get("firstName") as string,
        lastName: (form.get("lastName") as string) || undefined,
        email: ((form.get("email") as string) || "").trim() || undefined,
        phone: ((form.get("phone") as string) || "").trim() || undefined,
        eventDate: form.get("eventDate") as string,
        startTime: form.get("startTime") as string,
        endTime: form.get("endTime") as string,
        eventPurpose: form.get("eventPurpose") as string,
        expectedAttendance: Number(
          form.get("expectedAttendance") as string
        ) as CommunityCenterReservationFormData["expectedAttendance"],
        notes: (form.get("notes") as string) || undefined,
        turnstileToken: turnstileTokenRef.current ?? undefined,
        website: (form.get("website") as string) || undefined,
        recipientEmail,
        bccEmail,
        _loadedAt: loadedAtRef.current,
      });

      if (result.success) {
        setSubmitted(true);
      } else {
        setServerError(result.error ?? "Something went wrong.");
        // Turnstile tokens are single-use — get a fresh one for the retry.
        turnstileTokenRef.current = null;
        turnstileResetRef.current?.();
      }
    });
  };

  if (submitted) {
    return (
      <output
        ref={successRef}
        tabIndex={-1}
        className="block rounded-lg border-2 border-sage bg-sage/10 p-8 text-center shadow-sm outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2"
        aria-live="polite"
        aria-labelledby="cc-reservation-success-title"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-sage text-white shadow-md">
          <svg
            aria-hidden="true"
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2
          id="cc-reservation-success-title"
          className="mb-3 text-2xl font-semibold text-sage-dark"
        >
          Request Received
        </h2>
        <p className="mx-auto max-w-sm text-base text-[#2D2A24]">
          Thank you. Town staff will review your reservation request and follow up within 2 business
          days. Your reservation is not confirmed until the application and payment are received.
        </p>
      </output>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-xl border border-[#DDD7CC] bg-warm-white p-6"
    >
      <h2 className="mb-2 text-xl font-semibold text-sage-dark">Request a Reservation</h2>
      <p className="text-sm text-[#635E56]">
        Submitting this form sends a request to Town Hall. It does not guarantee availability —
        staff will confirm and collect payment before your reservation is final.
      </p>

      <div aria-live="polite" aria-atomic="true">
        {serverError && (
          <p
            className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600"
            role="alert"
          >
            {serverError}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldWrapper label="First Name" id="firstName" error={errors.firstName} required>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            aria-required="true"
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
            className={inputClass(!!errors.firstName)}
          />
        </FieldWrapper>

        <FieldWrapper label="Last Name" id="lastName" hint="Optional">
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            className={inputClass(false)}
          />
        </FieldWrapper>
      </div>

      <p className="text-sm text-[#635E56]">
        Please provide an email address <em>or</em> a phone number so we can reply.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldWrapper label="Email" id="email" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={inputClass(!!errors.email || !!errors.contact)}
          />
        </FieldWrapper>

        <FieldWrapper label="Phone" id="phone" error={errors.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            className={inputClass(!!errors.phone || !!errors.contact)}
          />
        </FieldWrapper>
      </div>
      {errors.contact && (
        <p className="-mt-2 text-xs text-red-600" role="alert">
          {errors.contact}
        </p>
      )}

      {/* date/time inputs rely on the native `required` attribute for the
          required state — their input roles don't support aria-required. */}
      <FieldWrapper label="Requested Date" id="eventDate" error={errors.eventDate} required>
        <input
          id="eventDate"
          name="eventDate"
          type="date"
          required
          aria-invalid={!!errors.eventDate}
          aria-describedby={errors.eventDate ? "eventDate-error" : undefined}
          className={inputClass(!!errors.eventDate)}
        />
      </FieldWrapper>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldWrapper
          label="Start Time"
          id="startTime"
          error={errors.startTime}
          hint="Available 10 AM – 10 PM"
          required
        >
          <input
            id="startTime"
            name="startTime"
            type="time"
            required
            aria-invalid={!!errors.startTime}
            aria-describedby={errors.startTime ? "startTime-error" : undefined}
            className={inputClass(!!errors.startTime)}
          />
        </FieldWrapper>

        <FieldWrapper label="End Time" id="endTime" error={errors.endTime} required>
          <input
            id="endTime"
            name="endTime"
            type="time"
            required
            aria-invalid={!!errors.endTime}
            aria-describedby={errors.endTime ? "endTime-error" : undefined}
            className={inputClass(!!errors.endTime)}
          />
        </FieldWrapper>
      </div>

      <FieldWrapper
        label="Event / Purpose"
        id="eventPurpose"
        error={errors.eventPurpose}
        hint="e.g. birthday party, family reunion, meeting"
        required
      >
        <input
          id="eventPurpose"
          name="eventPurpose"
          type="text"
          required
          aria-required="true"
          aria-invalid={!!errors.eventPurpose}
          aria-describedby={errors.eventPurpose ? "eventPurpose-error" : undefined}
          className={inputClass(!!errors.eventPurpose)}
        />
      </FieldWrapper>

      <FieldWrapper
        label="Expected Attendance"
        id="expectedAttendance"
        error={errors.expectedAttendance}
        hint={`Max ${MAX_ATTENDANCE} (Fire Code)`}
        required
      >
        <input
          id="expectedAttendance"
          name="expectedAttendance"
          type="number"
          min={1}
          max={MAX_ATTENDANCE}
          inputMode="numeric"
          required
          aria-required="true"
          aria-invalid={!!errors.expectedAttendance}
          aria-describedby={errors.expectedAttendance ? "expectedAttendance-error" : undefined}
          className={inputClass(!!errors.expectedAttendance)}
        />
      </FieldWrapper>

      <FieldWrapper label="Additional Notes" id="notes" hint="Optional">
        <textarea id="notes" name="notes" rows={4} className={inputClass(false)} />
      </FieldWrapper>

      {/* honeypot — hidden from real users, filled only by bots */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "auto",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" autoComplete="off" tabIndex={-1} />
      </div>

      <Turnstile
        onVerify={(token) => {
          turnstileTokenRef.current = token;
          setTurnstileFailed(false);
        }}
        onError={() => {
          setTurnstileFailed(true);
        }}
        onExpire={() => {
          turnstileTokenRef.current = null;
        }}
        resetRef={turnstileResetRef}
      />
      {turnstileFailed && (
        <p className="text-xs text-red-600" role="alert">
          The security check couldn't load. Please refresh the page and try again — or call Town
          Hall if the problem continues.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-sage-dark px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-sage-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Submitting…" : "Submit Request"}
      </button>
    </form>
  );
};

const inputClass = (hasError: boolean, paddingRight = "pr-4") =>
  `w-full rounded-lg border ${hasError ? "border-red-400" : "border-[#DDD7CC]"} bg-white pl-4 ${paddingRight} py-2.5 text-sm text-[#2D2A24] placeholder:text-[#635E56]/60 focus:outline-none focus:ring-1 focus:ring-sage focus:border-sage`;

const FieldWrapper = ({
  label,
  id,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div>
    <label htmlFor={id} className="mb-1 block text-sm font-medium text-[#2D2A24]">
      {label}
      {required && (
        <span className="ml-0.5 text-red-500" aria-hidden="true">
          *
        </span>
      )}
      {hint && <span className="ml-1 font-normal text-[#635E56]">({hint})</span>}
    </label>
    {children}
    {error && (
      <p id={`${id}-error`} className="mt-1 text-xs text-red-600" role="alert">
        {error}
      </p>
    )}
  </div>
);
