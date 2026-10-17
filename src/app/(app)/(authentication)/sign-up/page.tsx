import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthBranding } from "@/app/(app)/(authentication)/_components/auth-branding";
import { AuthUnavailable } from "@/app/(app)/(authentication)/_components/auth-unavailable";
import { AuthenticationCard } from "@/app/(app)/(authentication)/_components/authentication-card";
import { SignUp } from "@/app/(app)/(authentication)/sign-up/_components/sign-up";
import { constructMetadata } from "@/config/metadata";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site-config";
import { hasUsableAuthControls, isGuestOnlyAuthMode } from "@/lib/auth/auth-ui-availability";

export const metadata: Metadata = constructMetadata({
  title: "Create Account",
  description: `Create your ${siteConfig.name} account to start building and deploying your applications.`,
  noIndex: true,
});

export default function SignUpPage() {
  /*
   * Guest sign-in creates the account from a name typed on the sign-in page,
   * so there is nothing for this page to collect.
   */
  if (isGuestOnlyAuthMode()) {
    redirect(routes.auth.signIn);
  }

  if (!hasUsableAuthControls()) {
    return <AuthUnavailable />;
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <AuthBranding />
      <AuthenticationCard>
        <SignUp />
      </AuthenticationCard>
    </div>
  );
}
