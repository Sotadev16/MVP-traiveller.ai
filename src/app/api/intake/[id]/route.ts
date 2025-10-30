// GET /api/intake/[id] - Fetch intake data by ID

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || id === 'demo') {
    return NextResponse.json(
      { error: 'Invalid intake ID' },
      { status: 400 }
    );
  }

  try {
    const supabaseAdmin = createSupabaseAdmin();

    const { data: intake, error } = await supabaseAdmin
      .from('intakes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching intake:', error);
      return NextResponse.json(
        { error: 'Intake not found', details: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: intake }, { status: 200 });
  } catch (error) {
    console.error('Error in intake fetch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
