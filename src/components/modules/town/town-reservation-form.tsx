"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Turnstile } from "@/components/turnstile";
import {
  submitTownReservationForm,
  type TownReservationFormData,
} from "@/server/actions/town-reservation";

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  requestedDate?: string;
  requestedTime?: string;
  eventPurpose?: string;
  expectedAttendance?: string;
}

const COMMUNITY_CENTER_CAPACITY = 120;

export const TownReservationForm = () => {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const turnstileTokenRef = useRef<string | null>(null);
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
    if (!form.get("lastName")) errs.lastName = "Last name is required";
    const email = form.get("email") as string;
    if (!email) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Please enter a valid email";
    const phone = form.get("phone") as string;
    if (!phone || phone.trim().length < 7) errs.phone = "Please enter a valid phone number";
    const requestedDate = form.get("requestedDate") as string;
    if (!requestedDate) errs.requestedDate = "Please choose a date";
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(requestedDate))
      errs.requestedDate = "Please choose a valid date";
    if (!form.get("requestedTime")) errs.requestedTime = "Please describe the requested time";
    const eventPurpose = form.get("eventPurpose") as string;
    if (!eventPurpose || eventPurpose.trim().length < 3)
      errs.eventPurpose = "Please describe the event or purpose";
    const attendanceStr = form.get("expectedAttendance") as string;
    const attendance = attendanceStr ? Number(attendanceStr) : Number.NaN;
    if (!attendanceStr || Number.isNaN(attendance))
      errs.expectedAttendance = "Expected attendance is required";
    else if (!Number.isInteger(attendance) || attendance < 1)
      errs.expectedAttendance = "Expected attendance must be a whole number of 1 or more";
    else if (attendance > COMMUNITY_CENTER_CAPACITY)
      errs.expectedAttendance = `The Community Center's Fire Code capacity is ${COMMUNITY_CENTER_CAPACITY} people`;
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

    const attendance = Number(form.get("expectedAttendance"));

    startTransition(async () => {
      const payload: TownReservationFormData & { _loadedAt?: string } = {
        firstName: form.get("firstName") as string,
        lastName: form.get("lastName") as string,
        email: form.get("email") as string,
        phone: form.get("phone") as string,
        requestedDate: form.get("requestedDate") as string,
        requestedTime: form.get("requestedTime") as string,
        eventPurpose: form.get("eventPurpose") as string,
        expectedAttendance: attendance,
        notes: (form.get("notes") as string) || undefined,
        turnstileToken: turnstileTokenRef.current ?? undefined,
        website: (form.get("website") as string) || undefined,
        _loadedAt: loadedAtRef.current,
      };

      const result = await submitTownReservationForm(payload);

      if (result.success) {
        setSubmitted(true);
      } else {
        setServerError(result.error ?? "Something went wrong.");
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
        aria-labelledby="town-reservation-success-title"
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
          id="town-reservation-success-title"
          className="mb-3 text-2xl font-semibold text-sage-dark"
        >
          Request Received
        </h2>
        <p className="mx-auto max-w-md text-base text-[#2D2A24]">
          Thank you for your Community Center reservation request. Town Hall will follow up within 2
          business days to confirm availability and next steps. Your reservation is not confirmed
          until Town Hall replies.
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
      <p className="text-sm text-[#4A4640]">
        Complete this form and Town Hall will contact you within 2 business days to confirm
        availability, collect the rental application and payment, and finalize your reservation.
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

        <FieldWrapper label="Last Name" id="lastName" error={errors.lastName} required>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            required
            aria-required="true"
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
            className={inputClass(!!errors.lastName)}
          />
        </FieldWrapper>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldWrapper label="Email" id="email" error={errors.email} required>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={inputClass(!!errors.email)}
          />
        </FieldWrapper>

        <FieldWrapper label="Phone" id="phone" error={errors.phone} required>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            aria-required="true"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            className={inputClass(!!errors.phone)}
          />
        </FieldWrapper>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldWrapper
          label="Requested Date"
          id="requestedDate"
          error={errors.requestedDate}
          required
        >
          <input
            id="requestedDate"
            name="requestedDate"
            type="date"
            required
            aria-invalid={!!errors.requestedDate}
            aria-describedby={errors.requestedDate ? "requestedDate-error" : undefined}
            className={inputClass(!!errors.requestedDate)}
          />
        </FieldWrapper>

        <FieldWrapper
          label="Requested Time"
          id="requestedTime"
          error={errors.requestedTime}
          hint="e.g. 2:00 – 6:00 PM"
          required
        >
          <input
            id="requestedTime"
            name="requestedTime"
            type="text"
            required
            aria-required="true"
            aria-invalid={!!errors.requestedTime}
            aria-describedby={errors.requestedTime ? "requestedTime-error" : undefined}
            className={inputClass(!!errors.requestedTime)}
          />
        </FieldWrapper>
      </div>

      <FieldWrapper
        label="Expected Attendance"
        id="expectedAttendance"
        error={errors.expectedAttendance}
        hint={`Fire Code capacity: ${COMMUNITY_CENTER_CAPACITY}`}
        required
      >
        <input
          id="expectedAttendance"
          name="expectedAttendance"
          type="number"
          inputMode="numeric"
          min={1}
          max={COMMUNITY_CENTER_CAPACITY}
          required
          aria-required="true"
          aria-invalid={!!errors.expectedAttendance}
          aria-describedby={errors.expectedAttendance ? "expectedAttendance-error" : undefined}
          className={inputClass(!!errors.expectedAttendance)}
        />
      </FieldWrapper>

      <FieldWrapper label="Event or Purpose" id="eventPurpose" error={errors.eventPurpose} required>
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
        }}
        onExpire={() => {
          turnstileTokenRef.current = null;
        }}
      />

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-sage-dark px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-sage-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Sending…" : "Submit Reservation Request"}
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
