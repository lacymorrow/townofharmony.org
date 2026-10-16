import { useMemo } from "react";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site-config";
import {
  getAuthUiFlags,
  hasUsableAuthControls,
  isGuestOnlyAuthMode,
} from "@/lib/auth/auth-ui-availability";

export function useAuthForm(mode: "sign-in" | "sign-up", title?: string, description?: string) {
  const isSignIn = mode === "sign-in";

  const cardTitle = useMemo(() => {
    return typeof title === "string"
      ? title
      : isSignIn
        ? `Welcome to ${siteConfig.title}`
        : "Create an account";
  }, [title, isSignIn]);

  const cardDescription = useMemo(() => {
    return typeof description === "string"
      ? description
      : isSignIn
        ? "Login to get started"
        : "Sign up to get started";
  }, [description, isSignIn]);

  const alternateLink = useMemo(() => {
    return isSignIn
      ? { text: "Don't have an account?", href: routes.auth.signUp, label: "Sign up" }
      : { text: "Already have an account?", href: routes.auth.signIn, label: "Sign in" };
  }, [isSignIn]);

  /**
   * Keyed to the controls that would render, not to
   * `NEXT_PUBLIC_FEATURE_AUTH_ENABLED`. The pages gate on the same predicate,
   * but the `@modal` intercepting routes render the cards directly with no page
   * gate, so the card has to be able to refuse on its own.
   */
  const flags = getAuthUiFlags();
  const showAuthUnavailable = !hasUsableAuthControls(flags);
  const shouldShowAlternateLink = !isGuestOnlyAuthMode(flags) && !showAuthUnavailable;

  return {
    cardTitle,
    cardDescription,
    alternateLink,
    shouldShowAlternateLink,
    showAuthUnavailable,
  };
}
