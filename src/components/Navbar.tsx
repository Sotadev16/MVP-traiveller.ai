"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaPlane } from "react-icons/fa";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const isActivePath = (path: string) => pathname === path;

  return (
    <header
      className={`
        fixed top-4 left-4 right-4 z-50
        ${isMobileMenuOpen ? "bg-transparent" : isScrolled ? "bg-black/20 backdrop-blur-sm" : "bg-transparent"}
        ${isMobileMenuOpen ? "" : "transition-all duration-700 ease-in-out"}
      `}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="group relative z-50"
          aria-label="TrAIveller.ai"
        >
          <Image
            src="/images/traiveller-logo.png"
            alt="TrAIveller.ai logo"
            width={100}
            height={100}
            className="w-auto transition-all duration-500 group-hover:scale-110 drop-shadow-lg"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {[
            { href: "/palm-intake", label: "INTAKE" },
            { href: "/results", label: "RESULTATEN" },
            { href: "/about", label: "OVER ONS" },
            { href: "/contact", label: "CONTACT" },
            { href: "/privacy", label: "PRIVACY" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative group text-sm font-bold tracking-widest transition-all duration-300
                hover:text-yellow-400 hover:-translate-y-0.5
                ${
                  isActivePath(item.href)
                    ? "text-yellow-400"
                    : "text-white drop-shadow-lg"
                }
              `}
            >
              {item.label}
              <span
                className={`
                absolute bottom-0 left-0 h-0.5 bg-yellow-400 transition-all duration-300
                ${isActivePath(item.href) ? "w-full" : "w-0 group-hover:w-full"}
              `}
              ></span>
            </Link>
          ))}

          {/* CTA Button */}
          <Link
            href="/palm-intake"
            className="
              group relative px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 
              hover:from-yellow-300 hover:to-orange-400 text-black font-black 
              rounded-full transition-all duration-500 hover:scale-105 hover:shadow-2xl
              hover:shadow-yellow-400/50 overflow-hidden
            "
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
            <span className="relative flex items-center gap-2">
              START NU
              <FaPlane className="group-hover:rotate-12 transition-transform duration-300" />
            </span>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="lg:hidden relative z-50 p-2 text-white hover:text-yellow-400 transition-colors duration-300"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <div className="relative w-6 h-6 flex flex-col justify-center items-center">
            <span
              className={`
                block absolute h-0.5 w-6 bg-current transition-all duration-300 ease-in-out
                ${isMobileMenuOpen ? "rotate-45" : "-translate-y-2"}
              `}
            ></span>
            <span
              className={`
                block absolute h-0.5 w-6 bg-current transition-all duration-300 ease-in-out
                ${isMobileMenuOpen ? "opacity-0" : ""}
              `}
            ></span>
            <span
              className={`
                block absolute h-0.5 w-6 bg-current transition-all duration-300 ease-in-out
                ${isMobileMenuOpen ? "-rotate-45" : "translate-y-2"}
              `}
            ></span>
          </div>
        </button>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 pt-20">
              <div className="space-y-8 text-center w-full max-w-sm">
                {[
                  { href: "/palm-intake", label: "INTAKE" },
                  { href: "/results", label: "RESULTATEN" },
                  { href: "/about", label: "OVER ONS" },
                  { href: "/contact", label: "CONTACT" },
                  { href: "/privacy", label: "PRIVACY" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      block text-2xl font-black tracking-widest transition-all duration-300
                      hover:text-yellow-400 hover:scale-110 py-2
                      ${
                        isActivePath(item.href) ? "text-yellow-400" : "text-white"
                      }
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="pt-8">
                  <Link
                    href="/palm-intake"
                    className="
                      inline-flex items-center gap-3 px-8 py-4
                      bg-gradient-to-r from-yellow-400 to-orange-500
                      text-black font-black rounded-full text-lg
                      hover:scale-105 transition-all duration-300
                    "
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    START NU
                    <FaPlane className="text-lg" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
