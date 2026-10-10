// Guards a user-controlled post-login redirect target (the `from` query
// param on /login). Only a same-origin relative path is allowed. Rather
// than blacklist specific tricks (a literal "//" prefix check alone misses
// "/\evil.com" -- browsers normalize backslashes to forward slashes for
// special schemes, so it still resolves to protocol-relative "//evil.com"),
// this parses the candidate against a fixed fake origin and lets the URL
// parser itself decide whether it stayed on that origin. That closes the
// whole class of WHATWG-normalization bypasses, not just the one found.
export function safeRedirectPath(path: string | null): string | null {
  if (!path) return null;
  if (!path.startsWith("/")) return null;
  const base = "http://safe-redirect-base.invalid";
  try {
    const url = new URL(path, base);
    if (url.origin !== base) return null;
    return url.pathname + url.search + url.hash;
  } catch {
    return null;
  }
}
