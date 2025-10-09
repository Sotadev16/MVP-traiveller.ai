import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

// Admin email allowlist
const ADMIN_EMAILS = [
  'admin@traiveller.ai',
  'adziyodevops@gmail.com',
  'harry@traiveller.ai',
  'mrharmain9@gmail.com',
  'briankock@hotmail.nl'
];

async function checkAdminAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return { isAdmin: false, user: null };
    }

    // Extract token from header
    const token = authHeader.replace('Bearer ', '');

    // Verify the session with the token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { isAdmin: false, user: null };
    }

    const isAdmin = ADMIN_EMAILS.includes(user.email || '') ||
                   (user.email && user.email.includes('admin'));

    return { isAdmin, user };
  } catch (error) {
    console.error('Auth check error:', error);
    return { isAdmin: false, user: null };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { isAdmin } = await checkAdminAuth(request);

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createSupabaseAdmin();
    const url = new URL(request.url);

    // Get filter parameters
    const statusFilter = url.searchParams.get('status') || 'all';
    const dateFilter = url.searchParams.get('date') || 'all';
    const destinationFilter = url.searchParams.get('destination') || '';

    let query = supabaseAdmin
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
      return NextResponse.json({ error: 'Failed to fetch intakes' }, { status: 500 });
    }

    return NextResponse.json({ intakes: data || [] });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { isAdmin } = await checkAdminAuth(request);

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status, notes } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseAdmin();

    const updates: { status: string; admin_notes?: string } = { status };
    if (notes !== undefined) {
      updates.admin_notes = notes;
    }

    const { error } = await supabaseAdmin
      .from('intakes')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating intake:', error);
      return NextResponse.json({ error: 'Failed to update intake' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}