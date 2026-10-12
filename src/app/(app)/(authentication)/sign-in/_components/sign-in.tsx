import { AuthForm } from "@/app/(app)/(authentication)/_components/auth-form";
import { CredentialsForm } from "@/app/(app)/(authentication)/_components/credentials-form";
import { GuestForm } from "@/app/(app)/(authentication)/_components/guest-form";
import { Divider } from "@/components/primitives/divider";
import { getAuthUiFlags, isGuestOnlyAuthMode } from "@/lib/auth/auth-ui-availability";

export const SignIn = () => {
  const flags = getAuthUiFlags();

  /**
   * Guest-only mode: guest is the sole way in, so it gets the whole screen.
   * Otherwise guest sits under the other methods — a demo needs a door that
   * works even when OAuth is configured, so this is not a fallback.
   */
  if (isGuestOnlyAuthMode(flags)) {
    return (
      <AuthForm
        mode="sign-in"
        withFooter={false}
        title="Welcome"
        description="Enter your name to get started"
      >
        <GuestForm />
      </AuthForm>
    );
  }

  return (
    <AuthForm mode="sign-in" withFooter={false}>
      {flags.credentials && (
        <>
          <Divider text="Or continue with email" />
          <CredentialsForm />
        </>
      )}

      {flags.guest && (
        <>
          <Divider text="Or try it as a guest" />
          <GuestForm />
        </>
      )}
    </AuthForm>
  );
};
