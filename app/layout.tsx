import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "./globals.css";
import Nav from "@/components/Nav";

export const viewport = { themeColor: "#0A0B0D" };

export const metadata: Metadata = {
  metadataBase: new URL("https://www.kronosaegis.com"),
  title: {
    default: "KRONOS Aegis — read-only on-chain intelligence for Base",
    template: "%s",
  },
  description:
    "KRONOS Aegis is read-only, public on-chain intelligence for Base: scan a token for safety before you commit, map collateral & bridge contagion while you hold, and reconstruct your UK crypto tax (CARF/CGT) when you file. No wallet connection, no advice.",
  keywords: [
    "Base token scanner", "onchain safety", "honeypot check", "collateral contagion",
    "bridge risk", "UK crypto tax", "CARF", "Capital Gains Tax crypto", "DeFi risk",
    "read-only wallet analysis", "KRONOS Aegis", "Base network", "MCP crypto tools",
  ],
  authors: [{ name: "KRONOS" }],
  applicationName: "KRONOS Aegis",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico", shortcut: "/favicon.ico", apple: "/favicon.ico" },
  openGraph: {
    type: "website",
    url: "https://www.kronosaegis.com",
    siteName: "KRONOS Aegis",
    title: "KRONOS Aegis — read-only on-chain intelligence for Base",
    description:
      "Scan a token before you commit, trace its collateral risk while you hold, reconstruct your UK tax when you file — all from public data. No wallet, no advice.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@kronosalpha2026",
    title: "KRONOS Aegis — read-only on-chain intelligence for Base",
    description: "Public on-chain intelligence for Base: safety, contagion, and UK tax. Read-only, no advice.",
    images: ["/og-image.png"],
  },
  manifest: "/site.webmanifest",
};

const JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "KRONOS Aegis",
  url: "https://www.kronosaegis.com",
  description: "Read-only, public on-chain intelligence for Base: token safety, collateral contagion, and UK crypto tax reconstruction.",
  publisher: { "@type": "Organization", name: "KRONOS", url: "https://www.kronosaegis.com" },
};

const APP_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "KRONOS Aegis",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  url: "https://www.kronosaegis.com",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description: "Read-only, public on-chain intelligence for Base: token safety scanning, collateral & bridge contagion mapping, and UK crypto tax (CARF/CGT) reconstruction. No wallet, no advice.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(APP_LD) }} />
      </head>
      <body className="min-h-screen bg-bg text-ink font-sans antialiased">
        <Nav />
        <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-5 py-10 text-xs text-muted border-t border-edge mt-10">
          KRONOS Aegis is an on-chain AI identity experiment on Base. Read-only, public data only.
          Not financial or tax advice. No profit, yield, or return is promised. Data reconstruction, not advice.
        </footer>
      </body>
    </html>
  );
}
