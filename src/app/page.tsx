"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ChoiceBlock from "@/components/ChoiceBlock";
import WhyUs from "@/components/WhyUs";
import AffiliateTransparency from "@/components/AffiliateTransparency";
import Footer from "@/components/Footer";
import { content } from "@/content/home";

export default function Home() {
  const router = useRouter();
  const [language] = useState<"nl" | "en">("nl"); // Default to Dutch
  const pageContent = content[language];

  useEffect(() => {
    // Check for auth tokens in URL hash and redirect to admin
    if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
      router.push("/admin" + window.location.hash);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-dark-bg text-dark-fg overflow-x-hidden">
      <Navbar />

      {/* Parallax Background - Fixed */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/homeScreenWallpaper.png"
          alt="Beautiful Beach Paradise"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Enhanced overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
      </div>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section with CTAs and QuickSearch */}
        <Hero content={pageContent} />

        {/* Choice Block - Two Ways to Travel */}
        <ChoiceBlock content={pageContent} />

        {/* Why TrAIveller - Benefits Section */}
        <WhyUs content={pageContent} />

        {/* Affiliate Transparency */}
        <AffiliateTransparency content={pageContent} />
      </main>

      {/* Footer */}
      <Footer content={pageContent} />
    </div>
  );
}
