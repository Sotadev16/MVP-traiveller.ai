"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { IntakeData } from '@/lib/supabase';

export default function AdminDashboard() {
  const [intakes, setIntakes] = useState<IntakeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [destinationFilter, setDestinationFilter] = useState<string>('');

  const fetchIntakes = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('intakes')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (destinationFilter) {
        query = query.ilike('bestemming', `%${destinationFilter}%`);
      }

      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate: Date;

        switch (dateFilter) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          default:
            startDate = new Date(0);
        }

        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching intakes:', error);
      } else {
        setIntakes(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFilter, destinationFilter]);

  useEffect(() => {
    checkAuth();

    // Handle auth state changes (magic link callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
        setLoginMessage('Successfully logged in!');
      } else if (event === 'SIGNED_OUT') {
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
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      // Check if user is admin
      const { data: adminUser } = await supabase
        .from('users_admin')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setIsAuthenticated(!!adminUser);
    } else {
      setIsAuthenticated(false);
    }

    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Only allow existing users
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        setLoginMessage('Login failed: ' + error.message);
      } else {
        setLoginMessage('Magic link sent! Check your email.');
      }
    } catch {
      setLoginMessage('An error occurred during login.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIntakes([]);
  };

  const updateIntakeStatus = async (id: string, status: string, notes?: string) => {
    try {
      const updates: { status: string; admin_notes?: string } = { status };
      if (notes !== undefined) {
        updates.admin_notes = notes;
      }

      const { error } = await supabase
        .from('intakes')
        .update(updates)
        .eq('id', id);

      if (error) {
        alert('Error updating intake: ' + error.message);
      } else {
        fetchIntakes(); // Refresh the list
      }
    } catch {
      alert('Error updating intake');
    }
  };

  // formatDate function moved to IntakeRow component where it's used

  const exportToCSV = () => {
    const headers = [
      'Date', 'Name', 'Email', 'Phone', 'Destination', 'Departure Date',
      'Return Date', 'Budget', 'Adults', 'Children', 'Traveler Type',
      'Departure Airport', 'Flight Class', 'Car Needed', 'Accommodation',
      'Status', 'Admin Notes'
    ];

    const csvData = intakes.map(intake => [
      intake.created_at ? new Date(intake.created_at).toLocaleDateString() : '',
      intake.full_name || '',
      intake.email || '',
      intake.phone || '',
      intake.bestemming || '',
      intake.vertrek_datum || '',
      intake.terug_datum || '',
      intake.budget || '',
      intake.adults || '',
      intake.children || '',
      intake.traveler_type || '',
      intake.vertrek_vanaf || '',
      intake.cabin_class || '',
      intake.car_needed ? 'Yes' : 'No',
      intake.accommodation_type || '',
      intake.status || '',
      intake.admin_notes || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `traiveller-intakes-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@traiveller.ai"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50"
            >
              {isLoggingIn ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
          {loginMessage && (
            <div className={`mt-4 p-3 rounded-md text-sm ${
              loginMessage.includes('sent') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {loginMessage}
            </div>
          )}
          <div className="mt-4 text-xs text-gray-600 text-center">
            Access restricted to authorized administrators only.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Past Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
              <input
                type="text"
                value={destinationFilter}
                onChange={(e) => setDestinationFilter(e.target.value)}
                placeholder="Search destination..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={fetchIntakes}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Refresh
              </button>
              <button
                onClick={exportToCSV}
                disabled={intakes.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-blue-600">{intakes.length}</div>
            <div className="text-gray-600">Total Intakes</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {intakes.filter(i => i.status === 'new').length}
            </div>
            <div className="text-gray-600">New</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-orange-600">
              {intakes.filter(i => i.status === 'in_progress').length}
            </div>
            <div className="text-gray-600">In Progress</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-green-600">
              {intakes.filter(i => i.status === 'completed').length}
            </div>
            <div className="text-gray-600">Completed</div>
          </div>
        </div>

        {/* Intakes Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Intake Submissions</h2>
          </div>

          {loading ? (
            <div className="p-6 text-center">Loading intakes...</div>
          ) : intakes.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No intakes found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
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
  onStatusUpdate
}: {
  intake: IntakeData;
  onStatusUpdate: (id: string, status: string, notes?: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notes, setNotes] = useState(intake.admin_notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const saveNotes = () => {
    onStatusUpdate(intake.id!, intake.status!, notes);
    setIsEditingNotes(false);
  };

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {intake.created_at && formatDate(intake.created_at)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-gray-900">{intake.full_name}</div>
          <div className="text-sm text-gray-500">{intake.email}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {intake.bestemming}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {intake.vertrek_datum && intake.terug_datum && (
            <>
              {formatDate(intake.vertrek_datum)} - {formatDate(intake.terug_datum)}
            </>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          €{intake.budget}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <select
            value={intake.status || 'new'}
            onChange={(e) => onStatusUpdate(intake.id!, e.target.value)}
            className={`text-xs px-2 py-1 rounded-full border-0 ${getStatusColor(intake.status || 'new')}`}
          >
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-900"
          >
            {isExpanded ? 'Hide' : 'View'}
          </button>
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={7} className="px-6 py-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Travel Details</h4>
                <p><strong>Type:</strong> {intake.traveler_type}</p>
                <p><strong>Adults:</strong> {intake.adults}</p>
                <p><strong>Children:</strong> {intake.children}</p>
                <p><strong>Departure Airport:</strong> {intake.vertrek_vanaf}</p>
                <p><strong>Flight Class:</strong> {intake.cabin_class}</p>
                <p><strong>Car Needed:</strong> {intake.car_needed ? 'Yes' : 'No'}</p>
                <p><strong>Accommodation:</strong> {intake.accommodation_type}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Admin Notes</h4>
                {isEditingNotes ? (
                  <div>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={3}
                      placeholder="Add notes..."
                    />
                    <div className="mt-2 space-x-2">
                      <button
                        onClick={saveNotes}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingNotes(false);
                          setNotes(intake.admin_notes || '');
                        }}
                        className="bg-gray-500 text-white px-3 py-1 rounded text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-700 mb-2">{notes || 'No notes yet'}</p>
                    <button
                      onClick={() => setIsEditingNotes(true)}
                      className="text-blue-600 hover:text-blue-900 text-xs"
                    >
                      Edit Notes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}