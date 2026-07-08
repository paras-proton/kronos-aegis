/** @type {import('next').NextConfig} */

// Derived from a live browser render test of the deployed site (2026-07-08).
//
// Measured on /ledger:
//   - 8 inline <script> tags        -> Next.js App Router hydration payload
//   - 2 inline <style> tags
//   - 12 elements with a style attr
//   - every external resource (script, css, img, font, fetch) is same-origin
//
// Therefore: lock every source list to 'self', and accept 'unsafe-inline' for
// script/style as a documented tradeoff for the framework's inline hydration.
//
// DO NOT drop 'unsafe-inline' from script-src without first adding a nonce via
// middleware — it blanks every page while still returning HTTP 200, so no
// server-side check will catch it. See AEGIS-CSP-NONCE.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  // The client only ever calls same-origin /api/* — the server makes the
  // outbound calls to Blockscout/DefiLlama/Frankfurter. This is the directive
  // that stops injected code exfiltrating a pasted wallet address.
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
