"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { IntakeData } from "@/lib/supabase";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface CustomSelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

const CustomSelect = ({
  label,
  value,
  options,
  onChange,
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || options[0].label;

  return (
    <div
      className={`${
        label
          ? "w-full bg-white border border-slate-300 hover:border-slate-400"
          : "w-full bg-transparent border-0"
      } transition-all duration-200 relative rounded-md`}
      style={{ zIndex: isOpen ? 9999 : 100, position: "relative" }}
      ref={dropdownRef}
    >
      <div
        className={`flex items-center ${
          label ? "px-4 py-3 gap-3" : "px-2 py-1"
        }`}
      >
        {label && (
          <label className="text-sm font-medium text-slate-700 whitespace-nowrap flex-shrink-0">
            {label}
          </label>
        )}
        <div className="relative flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center justify-between w-full text-left border-0 outline-0 cursor-pointer transition-colors duration-200 bg-transparent ${
              label
                ? "text-sm text-slate-900 hover:text-blue-600"
                : "text-xs text-inherit"
            }`}
          >
            <span className="truncate">{selectedLabel}</span>
            <svg
              className={`ml-2 w-3 h-3 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isOpen && (
            <div
              className="absolute top-full left-0 right-0 mt-2 rounded-md overflow-hidden max-h-48 overflow-y-auto bg-white border border-slate-300 shadow-lg z-[9999] min-w-full"
              style={{ position: "absolute", zIndex: 9999, minWidth: "100%" }}
            >
              {options.map((option) => (
                <div
                  key={option.value}
                  className={`px-3 py-2 cursor-pointer transition-all duration-200 text-sm whitespace-nowrap ${
                    option.value === value
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  }`}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [intakes, setIntakes] = useState<IntakeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [destinationFilter, setDestinationFilter] = useState<string>("");

  // Debounced destination filter
  const debouncedDestinationFilter = useDebounce(destinationFilter, 500);

  const fetchIntakes = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        console.error("No access token available");
        setIntakes([]);
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (dateFilter !== "all") params.append("date", dateFilter);
      if (debouncedDestinationFilter)
        params.append("destination", debouncedDestinationFilter);

      const response = await fetch(`/api/admin/intakes?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIntakes(data.intakes || []);
      } else {
        console.error("Failed to fetch intakes:", response.status);
        setIntakes([]);
      }
    } catch (error) {
      console.error("Error:", error);
      setIntakes([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFilter, debouncedDestinationFilter]);

  useEffect(() => {
    // Handle hash fragments from magic link redirects
    const handleHashFragment = async () => {
      if (window.location.hash) {
        try {
          // Let Supabase handle the hash fragment
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            setIsAuthenticated(true);
            setLoginMessage("Successfully logged in!");
            // Clean up the URL
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
            return;
          }
        } catch (error) {
          console.error("Hash fragment auth error:", error);
        }
      }
      checkAuth();
    };

    handleHashFragment();

    // Handle auth state changes (magic link callback)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        setIsAuthenticated(true);
        setLoginMessage("Successfully logged in!");
      } else if (event === "SIGNED_OUT") {
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchIntakes();
    }
  }, [isAuthenticated, fetchIntakes]);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      // For now, check if email contains "admin" or is in allowed list
      // In production, you'd want proper role-based access control
      const allowedEmails = ["briankock@hotmail.nl", "adziyodevops@gmail.com", "mrharmain9@gmail.com"];

      const isAdmin =
        allowedEmails.includes(session.user.email || "") ||
        !!(session.user.email && session.user.email.includes("admin"));

      setIsAuthenticated(isAdmin);
    } else {
      setIsAuthenticated(false);
    }

    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginMessage("");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Only allow existing users
          emailRedirectTo: `${
            process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
          }/auth/callback`,
        },
      });

      if (error) {
        setLoginMessage("Login failed: " + error.message);
      } else {
        setLoginMessage("Magic link sent! Check your email.");
      }
    } catch {
      setLoginMessage("An error occurred during login.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIntakes([]);
  };

  const updateIntakeStatus = async (
    id: string,
    status: string,
    notes?: string
  ) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert("Authentication required");
        return;
      }

      const response = await fetch("/api/admin/intakes", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status, notes }),
      });

      if (response.ok) {
        fetchIntakes(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert("Error updating intake: " + (errorData.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error updating intake:", error);
      alert("Error updating intake");
    }
  };

  // formatDate function moved to IntakeRow component where it's used

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Name",
      "Email",
      "Phone",
      "Destination",
      "Departure Date",
      "Return Date",
      "Budget",
      "Adults",
      "Children",
      "Traveler Type",
      "Departure Airport",
      "Flight Class",
      "Car Needed",
      "Accommodation",
      "AI Mode",
      "AI Destination",
      "Status",
      "Admin Notes",
    ];

    const csvData = intakes.map((intake) => [
      intake.created_at ? new Date(intake.created_at).toLocaleDateString() : "",
      intake.full_name || "",
      intake.email || "",
      intake.phone || "",
      intake.bestemming || "",
      intake.vertrek_datum || "",
      intake.terug_datum || "",
      intake.budget || "",
      intake.adults || "",
      intake.children || "",
      intake.traveler_type || "",
      intake.vertrek_vanaf || "",
      intake.cabin_class || "",
      intake.car_needed ? "Yes" : "No",
      intake.accommodation_type || "",
      intake.ai_mode ? "Yes" : "No",
      intake.ai_destination || "",
      intake.status || "",
      intake.admin_notes || "",
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `traiveller-intakes-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-lg font-medium text-slate-700">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
          {/* Header Section */}
          <div className="bg-slate-800 px-8 py-8 text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
            <p className="text-slate-300">Traiveller.ai Management Portal</p>
          </div>

          {/* Login Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 pl-11 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white transition-all duration-200 text-slate-900 placeholder-slate-500"
                    placeholder="admin@traiveller.ai"
                    required
                  />
                  <svg
                    className="absolute left-3 top-3.5 w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-medium py-3 px-6 rounded-md transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isLoggingIn ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending Magic Link...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    <span>Send Magic Link</span>
                  </>
                )}
              </button>
            </form>

            {/* Message Display */}
            {loginMessage && (
              <div
                className={`mt-6 p-4 rounded-md text-sm font-medium ${
                  loginMessage.includes("sent")
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                <div className="flex items-center space-x-2">
                  {loginMessage.includes("sent") ? (
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  <span>{loginMessage}</span>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="mt-8 p-4 bg-slate-50 rounded-md border border-slate-200">
              <div className="flex items-center space-x-2 text-slate-600">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span className="text-xs">
                  Secure access for authorized administrators only
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-slate-800 shadow-lg">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Admin Dashboard
                </h1>
                <p className="text-slate-300 text-sm">
                  Traiveller.ai Management Portal
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-slate-300">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
              >
                <svg
                  className="w-4 h-4 inline mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md border border-slate-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-800">
                Filters & Search
              </h2>
            </div>

            <div className="flex gap-3">
              <button
                onClick={fetchIntakes}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center whitespace-nowrap"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>

              <button
                onClick={exportToCSV}
                disabled={intakes.length === 0}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center whitespace-nowrap"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export CSV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="col-span-1">
              <CustomSelect
                label="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "all", label: "All Statuses" },
                  { value: "new", label: "New" },
                  { value: "in_progress", label: "In Progress" },
                  { value: "completed", label: "Completed" },
                  { value: "cancelled", label: "Cancelled" },
                ]}
              />
            </div>

            <div className="col-span-1">
              <CustomSelect
                label="Date Range"
                value={dateFilter}
                onChange={setDateFilter}
                options={[
                  { value: "all", label: "All Time" },
                  { value: "today", label: "Today" },
                  { value: "week", label: "Past Week" },
                  { value: "month", label: "This Month" },
                ]}
              />
            </div>

            <div className="col-span-1">
              <div className="w-full bg-white border border-slate-300 hover:border-slate-400 transition-all duration-200 rounded-md">
                <div className="flex items-center px-4 py-3 gap-3">
                  <label className="text-sm font-medium text-slate-700 whitespace-nowrap flex-shrink-0">
                    Destination
                  </label>
                  <div className="relative flex-1 min-w-0">
                    <input
                      type="text"
                      value={destinationFilter}
                      onChange={(e) => setDestinationFilter(e.target.value)}
                      placeholder="Search destination..."
                      className="w-full border-0 outline-0 bg-transparent text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {intakes.length}
                </div>
                <div className="text-slate-600 font-medium mt-1">
                  Total Intakes
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  All submissions
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {intakes.filter((i) => i.status === "new").length}
                </div>
                <div className="text-slate-600 font-medium mt-1">
                  New Requests
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Awaiting review
                </div>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {intakes.filter((i) => i.status === "in_progress").length}
                </div>
                <div className="text-slate-600 font-medium mt-1">
                  In Progress
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Being processed
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {intakes.filter((i) => i.status === "completed").length}
                </div>
                <div className="text-slate-600 font-medium mt-1">Completed</div>
                <div className="text-xs text-slate-500 mt-1">
                  Successfully processed
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Travel Intake Submissions
                </h2>
              </div>
              <div className="text-sm text-slate-600 bg-white px-3 py-1 rounded-md border border-slate-200">
                {intakes.length} total submissions
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-slate-600 font-medium">
                  Loading intakes...
                </span>
              </div>
            </div>
          ) : intakes.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">
                No intakes found
              </h3>
              <p className="text-slate-600">
                Try adjusting your filters or check back later.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider w-24">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider w-56">
                      Contact
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider w-32">
                      Destination
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider w-40">
                      Dates
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider w-20">
                      Budget
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider w-24">
                      AI Mode
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider w-32">
                      AI Destination
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider w-28">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider w-36">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {intakes.map((intake) => (
                    <IntakeRow
                      key={intake.id}
                      intake={intake}
                      onStatusUpdate={updateIntakeStatus}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IntakeRow({
  intake,
  onStatusUpdate,
}: {
  intake: IntakeData;
  onStatusUpdate: (id: string, status: string, notes?: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notes, setNotes] = useState(intake.admin_notes || "");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isSendingQuote, setIsSendingQuote] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startFormatted = start.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });

    const endFormatted = end.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return `${startFormatted} – ${endFormatted}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-green-100 text-green-800 border border-green-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  const saveNotes = () => {
    onStatusUpdate(intake.id!, intake.status!, notes);
    setIsEditingNotes(false);
  };

  const sendQuote = async () => {
    if (!intake.email) {
      alert("No email address available for this client.");
      return;
    }

    setIsSendingQuote(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert("Authentication required");
        return;
      }

      const response = await fetch("/api/send-quote", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intake_id: intake.id,
          client_email: intake.email,
          client_name: intake.full_name,
          destination: intake.bestemming,
          travel_dates:
            intake.vertrek_datum && intake.terug_datum
              ? formatDateRange(intake.vertrek_datum, intake.terug_datum)
              : "TBD",
        }),
      });

      if (response.ok) {
        alert("Quote sent successfully!");
      } else {
        const errorData = await response.json();
        alert("Error sending quote: " + (errorData.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error sending quote:", error);
      alert("Error sending quote");
    } finally {
      setIsSendingQuote(false);
    }
  };

  return (
    <>
      <tr className="hover:bg-slate-50 transition-colors duration-200">
        <td className="px-3 py-3 whitespace-nowrap text-sm text-slate-900 w-24">
          {intake.created_at && formatDate(intake.created_at)}
        </td>
        <td className="px-4 py-3 w-56">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-medium">
                {intake.full_name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-slate-900 truncate">
                {intake.full_name}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {intake.email}
              </div>
            </div>
          </div>
        </td>
        <td className="px-3 py-3 w-32">
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-slate-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-sm text-slate-900 truncate">
              {intake.bestemming}
            </span>
          </div>
        </td>
        <td className="px-3 py-3 w-40">
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-slate-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm text-slate-900 truncate">
              {intake.vertrek_datum &&
                intake.terug_datum &&
                formatDateRange(intake.vertrek_datum, intake.terug_datum)}
            </span>
          </div>
        </td>
        <td className="px-3 py-3 whitespace-nowrap w-20">
          <div className="flex items-center space-x-1">
            <svg
              className="w-3 h-3 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            <span className="text-sm font-semibold text-slate-900">
              €
              {intake.budget
                ? parseInt(String(intake.budget).replace(/[^\d]/g, ""), 10) || 0
                : 0}
            </span>
          </div>
        </td>
        <td className="px-3 py-3 whitespace-nowrap w-24">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
              intake.ai_mode
                ? "bg-blue-100 text-blue-800"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            <svg
              className="w-3 h-3 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
              />
            </svg>
            {intake.ai_mode ? "AI" : "Manual"}
          </span>
        </td>
        <td className="px-3 py-3 w-32 text-sm text-slate-900">
          <span className="inline-flex items-center truncate">
            {intake.ai_destination ? (
              <>
                <svg
                  className="w-3 h-3 text-blue-600 mr-1 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  />
                </svg>
                <span className="truncate">{intake.ai_destination}</span>
              </>
            ) : (
              <span className="text-slate-400">—</span>
            )}
          </span>
        </td>
        <td className="px-3 py-3 whitespace-nowrap w-28">
          <div
            className={`rounded-md text-xs font-medium ${getStatusColor(
              intake.status || "new"
            )}`}
          >
            <CustomSelect
              label=""
              value={intake.status || "new"}
              onChange={(value) => onStatusUpdate(intake.id!, value)}
              options={[
                { value: "new", label: "New" },
                { value: "in_progress", label: "In Progress" },
                { value: "completed", label: "Completed" },
                { value: "cancelled", label: "Cancelled" },
              ]}
            />
          </div>
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium w-36">
          <div className="flex space-x-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-all duration-200"
            >
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isExpanded
                      ? "M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      : "M12 6v6m0 0v6m0-6h6m-6 0H6"
                  }
                />
              </svg>
              {isExpanded ? "Hide" : "View"}
            </button>
            <button
              onClick={sendQuote}
              disabled={isSendingQuote || !intake.email}
              className="inline-flex items-center px-2 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-xs font-medium rounded-md transition-all duration-200"
            >
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              {isSendingQuote ? "Quote" : "Quote"}
            </button>
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr className="bg-slate-50">
          <td colSpan={9} className="px-6 py-4">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800">
                      Travel Details
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-600 w-20">
                          Type:
                        </span>
                        <span className="text-slate-800 capitalize">
                          {intake.traveler_type}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-600 w-20">
                          Adults:
                        </span>
                        <span className="text-slate-800">{intake.adults}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-600 w-20">
                          Children:
                        </span>
                        <span className="text-slate-800">
                          {intake.children}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-600 w-20">
                          Airport:
                        </span>
                        <span className="text-slate-800">
                          {intake.vertrek_vanaf}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-600 w-20">
                          Class:
                        </span>
                        <span className="text-slate-800 capitalize">
                          {intake.cabin_class}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-600 w-20">
                          Car:
                        </span>
                        <span className="text-slate-800">
                          {intake.car_needed ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-600 w-20">
                          Hotel:
                        </span>
                        <span className="text-slate-800 capitalize">
                          {intake.accommodation_type}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-600 w-20">
                          AI Mode:
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            intake.ai_mode
                              ? "bg-purple-100 text-purple-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {intake.ai_mode ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-6 h-6 bg-green-600 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800">
                      Admin Notes
                    </h4>
                  </div>

                  {isEditingNotes ? (
                    <div className="space-y-3">
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white transition-all duration-200 resize-none text-slate-900"
                        rows={4}
                        placeholder="Add administrative notes..."
                      />
                      <div className="flex space-x-3">
                        <button
                          onClick={saveNotes}
                          className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-all duration-200"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Save Notes
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingNotes(false);
                            setNotes(intake.admin_notes || "");
                          }}
                          className="inline-flex items-center px-3 py-2 bg-slate-500 hover:bg-slate-600 text-white text-sm font-medium rounded-md transition-all duration-200"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-slate-50 rounded-lg p-4 min-h-[100px] border border-slate-200">
                        <p className="text-slate-700 whitespace-pre-wrap">
                          {notes ||
                            "No administrative notes have been added yet."}
                        </p>
                      </div>
                      <button
                        onClick={() => setIsEditingNotes(true)}
                        className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-all duration-200"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit Notes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
