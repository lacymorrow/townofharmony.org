import type { NextConfig } from "next";

/**
 * Previously applied Payload CMS configuration to Next.js config.
 * Now a pass-through since Payload has been removed.
 */
export function withPayloadConfig(nextConfig: NextConfig): NextConfig {
  return nextConfig;
}
