import type { Metadata } from "next";
import { AuthBranding } from "@/app/(app)/(authentication)/_components/auth-branding";
import { AuthUnavailable } from "@/app/(app)/(authentication)/_components/auth-unavailable";
import { AuthenticationCard } from "@/app/(app)/(authentication)/_components/authentication-card";
import { SignIn } from "@/app/(app)/(authentication)/sign-in/_components/sign-in";
import { constructMetadata } from "@/config/metadata";
import { siteConfig } from "@/config/site-config";
import { hasUsableAuthControls } from "@/lib/auth/auth-ui-availability";

export const metadata: Metadata = constructMetadata({
  title: "Sign In",
  description: `Sign in to your ${siteConfig.name} account to access your dashboard, projects, and settings.`,
  noIndex: true,
});

export default function SignInPage() {
  /**
   * Gated on the controls that would render, not on
   * `NEXT_PUBLIC_FEATURE_AUTH_ENABLED`. That flag is true for Better Auth,
   * which contributes no control to the card, so it let the page render a card
   * with nothing in it.
   */
  if (!hasUsableAuthControls()) {
    return <AuthUnavailable />;
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <AuthBranding />
      <AuthenticationCard>
        <SignIn />
      </AuthenticationCard>
    </div>
  );
}
