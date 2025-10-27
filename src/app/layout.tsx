import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "TrAIveller.ai - Jouw slimme AI-reisplanner",
  description:
    "TrAIveller.ai vergelijkt razendsnel vluchten, cruises en stays. Vul je intake in en krijg 3 slimme opties: beste prijs, beste kwaliteit, handigst.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className="h-full">
      <body className="h-full font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
