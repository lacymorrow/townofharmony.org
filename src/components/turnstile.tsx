"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { env } from "@/env";

interface TurnstileProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  /** Receives a callback that resets the widget — tokens are single-use, so
   *  callers must reset after a rejected submission to get a fresh token. */
  resetRef?: React.MutableRefObject<(() => void) | null>;
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
        }
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    if (window.turnstile) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${TURNSTILE_SCRIPT_SRC}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Turnstile script")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("Failed to load Turnstile script")), {
      once: true,
    });
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export const Turnstile = ({ onVerify, onError, onExpire, resetRef, className }: TurnstileProps) => {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // Keep callback refs up-to-date without triggering widget re-mount on every render.
  const onVerifyRef = useRef(onVerify);
  const onErrorRef = useRef(onError);
  const onExpireRef = useRef(onExpire);
  onVerifyRef.current = onVerify;
  onErrorRef.current = onError;
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!siteKey) return;
    if (!containerRef.current) return;

    let isCancelled = false;

    void loadTurnstileScript()
      .then(() => {
        if (isCancelled) return;
        if (!window.turnstile) return;
        if (!containerRef.current) return;

        if (widgetIdRef.current) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: resolvedTheme === "dark" ? "dark" : "light",
          callback: (token) => onVerifyRef.current(token),
          "error-callback": () => onErrorRef.current?.(),
          "expired-callback": () => onExpireRef.current?.(),
        });

        if (resetRef) {
          resetRef.current = () => {
            if (widgetIdRef.current && window.turnstile?.reset) {
              window.turnstile.reset(widgetIdRef.current);
            }
          };
        }
      })
      .catch(() => {
        if (isCancelled) return;
        onErrorRef.current?.();
      });

    return () => {
      isCancelled = true;
      if (resetRef) {
        resetRef.current = null;
      }
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  // Only re-mount the widget when the site key or theme changes — not on callback changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme, siteKey]);

  if (!siteKey) {
    return null;
  }

  return <div ref={containerRef} className={className} />;
};
