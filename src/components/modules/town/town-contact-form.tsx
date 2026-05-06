"use client";

import { useState, useTransition } from "react";
import { submitTownContactForm, type TownContactFormData } from "@/server/actions/town-contact";

const INQUIRY_OPTIONS = [
  { value: "general", label: "General Inquiry" },
  { value: "utilities", label: "Water/Sewer Utilities" },
  { value: "permits", label: "Permits & Zoning" },
  { value: "taxes", label: "Taxes & Billing" },
  { value: "parks", label: "Parks & Recreation" },
  { value: "roads", label: "Roads & Infrastructure" },
  { value: "complaint", label: "Complaint" },
  { value: "other", label: "Other" },
];

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  inquiryType?: string;
  message?: string;
}

export const TownContactForm = () => {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (form: FormData): FormErrors => {
    const errs: FormErrors = {};
    if (!form.get("firstName")) errs.firstName = "First name is required";
    if (!form.get("lastName")) errs.lastName = "Last name is required";
    const email = form.get("email") as string;
    if (!email) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Please enter a valid email";
    if (!form.get("inquiryType")) errs.inquiryType = "Please select an inquiry type";
    const message = form.get("message") as string;
    if (!message || message.length < 10) errs.message = "Message must be at least 10 characters";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
      const result = await submitTownContactForm({
        firstName: form.get("firstName") as string,
        lastName: form.get("lastName") as string,
        email: form.get("email") as string,
        phone: (form.get("phone") as string) || undefined,
        inquiryType: form.get("inquiryType") as TownContactFormData["inquiryType"],
        message: form.get("message") as string,
      });

      if (result.success) {
        setSubmitted(true);
      } else {
        setServerError(result.error ?? "Something went wrong.");
      }
    });
  };

  if (submitted) {
    return (
      <output className="bg-white border border-stone rounded p-6 block" aria-live="polite">
        <h2 className="text-xl font-semibold text-sage-dark mb-2">Message Sent</h2>
        <p className="text-[#2D2A24]">
          Thank you for contacting the Town of Harmony. We will respond within 2 business days.
        </p>
      </output>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white border border-stone rounded p-6 space-y-4"
    >
      <h2 className="text-xl font-semibold text-sage-dark mb-2">Send a Message</h2>

      {serverError && (
        <p
          className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3"
          role="alert"
        >
          {serverError}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldWrapper label="First Name" id="firstName" error={errors.firstName} required>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
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
            className={inputClass(!!errors.lastName)}
          />
        </FieldWrapper>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldWrapper label="Email" id="email" error={errors.email} required>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputClass(!!errors.email)}
          />
        </FieldWrapper>

        <FieldWrapper label="Phone" id="phone" hint="Optional">
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={inputClass(false)}
          />
        </FieldWrapper>
      </div>

      <FieldWrapper label="Inquiry Type" id="inquiryType" error={errors.inquiryType} required>
        <select
          id="inquiryType"
          name="inquiryType"
          required
          defaultValue=""
          className={inputClass(!!errors.inquiryType)}
        >
          <option value="" disabled>
            Select a topic…
          </option>
          {INQUIRY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </FieldWrapper>

      <FieldWrapper label="Message" id="message" error={errors.message} required>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className={inputClass(!!errors.message)}
        />
      </FieldWrapper>

      <button
        type="submit"
        disabled={isPending}
        className="w-full sm:w-auto px-6 py-2.5 bg-sage-dark text-white font-medium rounded hover:bg-sage-dark/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
};

const inputClass = (hasError: boolean) =>
  `w-full rounded border ${hasError ? "border-red-400" : "border-stone"} bg-white px-3 py-2 text-sm text-[#2D2A24] placeholder:text-[#635E56]/60 focus:outline-none focus:ring-2 focus:ring-sage-dark/30 focus:border-sage-dark`;

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
    <label htmlFor={id} className="block text-sm font-medium text-[#2D2A24] mb-1">
      {label}
      {required && (
        <span className="text-red-500 ml-0.5" aria-hidden="true">
          *
        </span>
      )}
      {hint && <span className="text-[#635E56] font-normal ml-1">({hint})</span>}
    </label>
    {children}
    {error && (
      <p className="text-xs text-red-600 mt-1" role="alert">
        {error}
      </p>
    )}
  </div>
);
