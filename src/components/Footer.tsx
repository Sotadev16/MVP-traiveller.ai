"use client";

import Link from "next/link";
import { FaGlobeAmericas, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import type { ContentType } from "@/content/home";

interface FooterProps {
  content: ContentType;
}

export default function Footer({ content }: FooterProps) {
  return (
    <footer className="relative z-20 bg-slate-900">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
                <FaGlobeAmericas className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Tr<span className="text-yellow-400">AI</span>veller
                </h3>
                <p className="text-yellow-400/80 text-xs font-medium uppercase tracking-wider">
                  AI-Powered Adventures
                </p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              {content.footer.gdpr}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-white font-bold text-lg">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/palm-intake" className="text-slate-400 hover:text-yellow-400 transition-colors text-sm">
                  AI Reisplanner
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-400 hover:text-yellow-400 transition-colors text-sm">
                  Over ons
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-yellow-400 transition-colors text-sm">
                  {content.footer.privacyLink}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-yellow-400 transition-colors text-sm">
                  {content.footer.termsLink}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="text-white font-bold text-lg">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FaEnvelope className="h-4 w-4 text-yellow-400" />
                <a href="mailto:info@traiveller.ai" className="text-slate-400 hover:text-yellow-400 transition-colors text-sm">
                  info@traiveller.ai
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <FaMapMarkerAlt className="h-4 w-4 text-yellow-400" />
                <p className="text-slate-400 text-sm">Amsterdam, Nederland</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <a href="#" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors" aria-label="Facebook">
                <FaFacebook className="h-4 w-4 text-slate-400 hover:text-yellow-400" />
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors" aria-label="Instagram">
                <FaInstagram className="h-4 w-4 text-slate-400 hover:text-yellow-400" />
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors" aria-label="Twitter">
                <FaTwitter className="h-4 w-4 text-slate-400 hover:text-yellow-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-slate-500 text-sm text-center sm:text-left">
              {content.footer.tagline}
            </p>
            <div className="flex items-center space-x-2 text-slate-500 text-sm">
              <span>Gebouwd met</span>
              <span className="text-yellow-400">⚡</span>
              <span>in Nederland</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
