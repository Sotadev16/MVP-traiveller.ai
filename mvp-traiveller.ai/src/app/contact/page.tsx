"use client";

import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  FaChevronDown,
  FaEnvelope,
  FaClock,
  FaFlag,
  FaLock,
  FaBriefcase,
  FaShieldAlt,
  FaBug,
  FaNewspaper,
} from "react-icons/fa";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    honeypot: "", // spam protection
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const subjectOptions = [
    { value: "", label: "Selecteer onderwerp" },
    { value: "general", label: "Algemene vraag" },
    { value: "technical", label: "Technisch probleem" },
    { value: "feedback", label: "Feedback/Suggestie" },
    { value: "privacy", label: "Privacy/Gegevens" },
    { value: "partnership", label: "Partnership" },
    { value: "press", label: "Pers/Media" },
    { value: "other", label: "Anders" },
  ];

  const [selectedOption, setSelectedOption] = useState(
    subjectOptions.find((opt) => opt.value === formData.subject) ||
      subjectOptions[0]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectOption = (option: { value: string; label: string }) => {
    setSelectedOption(option);
    setIsDropdownOpen(false);

    // Update form data
    setFormData((prev) => ({
      ...prev,
      subject: option.value,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check
    if (formData.honeypot) {
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission
    try {
      // In real implementation, this would send to API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Contact form submitted:", formData);
      setSubmitted(true);

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        honeypot: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Er ging iets mis. Probeer het opnieuw.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Contact - TrAIveller.ai</title>
        <meta
          name="description"
          content="Neem contact met ons op voor vragen of feedback"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/images/traiveller-logo.png" />
      </Head>

      <Navbar />

      {/* Parallax Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/beach-hero.jpg')",
          }}
        />
        <div className="absolute" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 lg:px-6" style={{ paddingTop: "120px" }}>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-black leading-none tracking-tight mb-4">
            <div className="text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] [text-shadow:_2px_2px_4px_rgba(0,0,0,0.9)]">
              <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter">
                NEEM
              </span>
              <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mt-1 text-yellow-400">
                CONTACT OP
              </span>
            </div>
          </h1>
          <p className="text-white/90 text-lg drop-shadow-lg max-w-2xl mx-auto font-medium">
            We staan klaar om je te helpen bij al je vragen over TrAIveller.ai
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-lg">
              Verschillende Manieren om Contact Op te Nemen
            </h2>
            <p className="mb-6 leading-relaxed text-white/80 drop-shadow-sm">
              Heb je vragen over TrAIveller.ai, wil je feedback geven, of heb je
              technische problemen? We staan klaar om je te helpen!
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <FaEnvelope className="text-yellow-400 text-lg" />
                </div>
                <span className="text-white font-medium">
                  hello@traiveller.ai
                </span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <FaClock className="text-yellow-400 text-lg" />
                </div>
                <span className="text-white font-medium">
                  Reactie binnen 24 uur
                </span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <FaFlag className="text-yellow-400 text-lg" />
                </div>
                <span className="text-white font-medium">Nederlands team</span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <FaLock className="text-yellow-400 text-lg" />
                </div>
                <span className="text-white font-medium">
                  Privacy gegarandeerd
                </span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-4 drop-shadow-lg">
              Specifieke Teams
            </h2>
            <p className="mb-4 leading-relaxed text-white/80 drop-shadow-sm">
              Je kunt ons ook rechtstreeks een e-mail sturen naar het juiste
              team:
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-white/90">
                <FaBriefcase className="text-yellow-400" />
                <span className="text-sm">
                  Algemene vragen: hello@traiveller.ai
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <FaShieldAlt className="text-yellow-400" />
                <span className="text-sm">Privacy: privacy@traiveller.ai</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <FaBug className="text-yellow-400" />
                <span className="text-sm">
                  Technische problemen: support@traiveller.ai
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <FaNewspaper className="text-yellow-400" />
                <span className="text-sm">
                  Pers & Media: press@traiveller.ai
                </span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-4 drop-shadow-lg">
              Meer Informatie
            </h2>
            <p className="mb-4 leading-relaxed text-white/80 drop-shadow-sm">
              Voordat je contact opneemt, bekijk ook onze{" "}
              <Link
                href="/about"
                className="text-yellow-400 hover:underline font-medium"
              >
                Over ons
              </Link>{" "}
              pagina voor meer informatie over hoe ons platform werkt.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-lg">
              Stuur een Bericht
            </h2>

            {submitted && (
              <div className="text-center p-6 mb-6 rounded-xl bg-green-500/20 border border-green-400/30 backdrop-blur-sm">
                <strong className="text-green-400 text-lg">
                  Bedankt voor je bericht!
                </strong>
                <br />
                <span className="text-white/90">
                  We nemen binnen 24 uur contact met je op.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="block font-medium text-white mb-3 drop-shadow-sm"
                >
                  Naam *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Je volledige naam"
                  required
                  className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="block font-medium text-white mb-3 drop-shadow-sm"
                >
                  E-mailadres *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="jouw.email@example.com"
                  className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="subject"
                  className="flex items-center gap-2 font-medium text-white mb-3 drop-shadow-sm"
                >
                  Onderwerp <span className="text-red-400">*</span>
                </label>

                <div className="relative" ref={dropdownRef}>
                  {/* Hidden native select for form submission */}
                  <select
                    id="subject"
                    name="subject"
                    value={selectedOption.value}
                    required
                    onChange={handleChange}
                    className="sr-only"
                    aria-hidden="true"
                  >
                    <option value="">Selecteer onderwerp</option>
                    <option value="general">Algemene vraag</option>
                    <option value="technical">Technisch probleem</option>
                    <option value="feedback">Feedback/Suggestie</option>
                    <option value="privacy">Privacy/Gegevens</option>
                    <option value="partnership">Partnership</option>
                    <option value="press">Pers/Media</option>
                    <option value="other">Anders</option>
                  </select>

                  {/* Custom select button */}
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-left focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 hover:bg-white/20 transition-all duration-300 flex items-center justify-between"
                  >
                    <span
                      className={
                        selectedOption.value ? "text-white" : "text-white"
                      }
                    >
                      {selectedOption.label}
                    </span>
                    <FaChevronDown
                      className={`ml-2 transition-transform text-yellow-400 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown menu */}
                  {isDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-md border border-white/30 rounded-xl shadow-2xl z-[9999] max-h-60 overflow-auto">
                      {subjectOptions.map((option) => (
                        <div
                          key={option.value}
                          className={`px-4 py-3 cursor-pointer transition-all duration-200 first:rounded-t-xl last:rounded-b-xl ${
                            option.value === selectedOption.value
                              ? "bg-yellow-400/20 text-yellow-400 font-medium"
                              : "text-white/90 hover:bg-white/15 hover:text-yellow-400"
                          }`}
                          onClick={() => handleSelectOption(option)}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="message"
                  className="block font-medium text-white mb-3 drop-shadow-sm"
                >
                  Bericht *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Beschrijf je vraag of opmerking zo duidelijk mogelijk..."
                  required
                  rows={5}
                  className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300 resize-y min-h-[120px]"
                />
              </div>

              {/* Honeypot for spam protection */}
              <div className="absolute left-[-9999px] w-px h-px overflow-hidden">
                <label htmlFor="honeypot">Leave empty:</label>
                <input
                  type="text"
                  id="honeypot"
                  name="honeypot"
                  value={formData.honeypot}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {isSubmitting ? "Bezig met versturen..." : "Verstuur Bericht"}
              </button>
            </form>

            <p className="text-sm mt-6 text-center text-white/70">
              Door dit formulier te versturen ga je akkoord met ons{" "}
              <Link
                href="/privacy"
                className="text-yellow-400 hover:underline font-medium"
              >
                privacybeleid
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
