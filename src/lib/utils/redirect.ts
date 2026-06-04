import { redirect as nextRedirect } from "next/navigation";
import { BASE_URL } from "../../config/base-url";
import { SEARCH_PARAM_KEYS } from "../../config/search-param-keys";

interface RedirectOptions {
  code?: string;
  nextUrl?: string;
}

export function createRedirectUrl(pathname: string, options?: RedirectOptions): string {
  const url = new URL(pathname, BASE_URL);
  if (options?.code) {
    url.searchParams.set(SEARCH_PARAM_KEYS.statusCode, options.code);
  }
  if (options?.nextUrl) {
    url.searchParams.set(SEARCH_PARAM_KEYS.nextUrl, options.nextUrl);
  }
  return url.pathname + url.search;
}

export function redirect(pathname: string, options?: RedirectOptions) {
  const url = createRedirectUrl(pathname, options);
  return nextRedirect(url);
}
