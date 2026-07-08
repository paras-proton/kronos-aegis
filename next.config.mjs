/** @type {import('next').NextConfig} */

// ENFORCED. Only directives that CANNOT break rendering.
//
// IMPORTANT: no `default-src` here. default-src is the fallback for script-src
// and style-src, which are deliberately omitted (Next.js App Router emits inline
// hydration scripts, `self.__next_f.push`). Adding default-src would block them
// and blank the page — it compiles and deploys clean, then fails in the browser.
// Directives below have no fallback behaviour and are inert on this site: it
// renders no <object>/<embed>, sets no <base>, and posts no HTML forms (all data
// flows through fetch() to same-origin /api/* routes).
const enforcedCsp = [
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

// REPORT-ONLY. Never blocks; browsers only log violations.
// This is where the strict policy lives until a render test proves it safe,
// or until a nonce is threaded through middleware.
const reportOnlyCsp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: enforcedCsp },
  { key: "Content-Security-Policy-Report-Only", value: reportOnlyCsp },
];

const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
