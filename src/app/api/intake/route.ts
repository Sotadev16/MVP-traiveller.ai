import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';
import type { IntakeData } from '@/lib/supabase';
import { sendTripOptionsEmail } from '@/lib/email';
import crypto from 'crypto';

function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfIP = request.headers.get('cf-connecting-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfIP) {
    return cfIP;
  }

  return 'unknown';
}

function mapTravelerType(travelerType: string): 'adults' | 'family' | 'solo' | 'couple' | 'group' {
  switch (travelerType) {
    case 'jongeren':
    case 'honeymoon':
    case 'couples':
      return 'couple';
    case 'familievakantie':
      return 'family';
    default:
      return 'adults';
  }
}

function mapCabinClass(cabinClass: string): 'economy' | 'premium_economy' | 'business' | 'first' {
  switch (cabinClass) {
    case 'premium':
      return 'premium_economy';
    case 'economy':
    case 'business':
    case 'first':
      return cabinClass as 'economy' | 'business' | 'first';
    default:
      return 'economy';
  }
}

function mapCarType(carType: string): 'economy' | 'compact' | 'intermediate' | 'standard' | 'full_size' | 'premium' | 'luxury' | 'suv' | undefined {
  switch (carType) {
    case 'hatchback':
      return 'compact';
    case 'sedan':
      return 'standard';
    case 'mpv':
      return 'full_size';
    case '4x4':
      return 'suv';
    case 'economy':
    case 'compact':
    case 'intermediate':
    case 'standard':
    case 'full_size':
    case 'premium':
    case 'luxury':
    case 'suv':
      return carType as 'economy' | 'compact' | 'intermediate' | 'standard' | 'full_size' | 'premium' | 'luxury' | 'suv';
    default:
      return undefined;
  }
}

function mapAccommodationType(accommodationType: string): 'hotel' | 'apartment' | 'hostel' | 'resort' | 'villa' | 'bnb' | 'mixed' | undefined {
  switch (accommodationType) {
    case 'house':
      return 'villa';
    case 'all-inclusive':
      return 'resort';
    case 'included':
      return 'mixed'; // For surprise trips with accommodation
    case 'not-included':
      return undefined; // For surprise trips without accommodation
    case 'hotel':
    case 'apartment':
    case 'hostel':
    case 'resort':
    case 'villa':
    case 'bnb':
    case 'mixed':
      return accommodationType as 'hotel' | 'apartment' | 'hostel' | 'resort' | 'villa' | 'bnb' | 'mixed';
    default:
      return undefined;
  }
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = createSupabaseAdmin();

  try {
    const formData = await request.json();
    console.log('Received form data:', JSON.stringify(formData, null, 2));

    // Honeypot validation
    if (formData.website && formData.website.trim() !== '') {
      return NextResponse.json({ error: 'Spam detected' }, { status: 400 });
    }

    // Timing validation (prevent too fast submissions)
    if (Date.now() - formData.timestamp < 3000) {
      return NextResponse.json({ error: 'Too fast' }, { status: 400 });
    }

    // Server-side validation
    const errors = [];
    const tripType = formData.travelType || formData.tripType;

    if (!formData.email) errors.push('Email is required');
    if (!formData.departureDate) errors.push('Departure date is required');

    // Return date validation - not required for surprise trips as they handle dates differently
    if (tripType !== 'surprise' && !formData.returnDate) {
      errors.push('Return date is required');
    }

    if (!formData.budget && !formData.customBudget) errors.push('Budget is required');

    // Flexibility validation - not required for surprise trips
    if (tripType !== 'surprise' && !formData.flexibility) {
      errors.push('Flexibility is required');
    }

    if (!tripType) errors.push('Travel type is required');

    // Date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const depDate = new Date(formData.departureDate);

    if (depDate < today) errors.push('Departure date cannot be in the past');

    // Return date validation only for non-surprise trips
    if (tripType !== 'surprise' && formData.returnDate) {
      const retDate = new Date(formData.returnDate);
      if (retDate < today) errors.push('Return date cannot be in the past');
      if (retDate <= depDate) errors.push('Return date must be after departure date');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Invalid email format');
    }

    // Budget validation
    const budget = formData.budget || formData.customBudget;
    if (budget && parseInt(budget) < 100) {
      errors.push('Minimum budget is €100');
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Get client info
    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    // Prepare intake data for Supabase
    // Note: tripType already declared above for validation
    const intakeData: Partial<IntakeData> = {
      // Contact info
      full_name: formData.fullName || formData.email.split('@')[0] || 'Anonymous',
      email: formData.email,
      phone: formData.phone || null,

      // Traveler info
      traveler_type: mapTravelerType(formData.travelerType || ''),
      adults: parseInt(formData.adults) || 1,
      children: parseInt(formData.children) || 0,
      children_ages: formData.childrenAges || [],

      // Dates
      vertrek_datum: formData.departureDate,
      terug_datum: formData.returnDate || formData.departureDate, // For surprise trips, use departure date as fallback
      flexible: tripType === 'surprise' ? true : formData.flexibility !== 'exact',

      // Destination & departure - handle special AI destinations
      bestemming: getDestinationForStorage(formData.destination || '', formData.destinationType || ''),
      vertrek_vanaf: formData.departureAirport || formData.departureFrom || (tripType === 'surprise' ? 'flexible' : ''),

      // Flight preferences
      direct_only: formData.flightType === 'direct',
      stops_ok: formData.flightType !== 'direct',
      cabin_class: mapCabinClass(formData.flightClass || formData.cabinClass || ''),

      // Car rental
      car_needed: formData.carRental === true || formData.carRental === 'yes',
      car_type: mapCarType(formData.carType || ''),
      gearbox: formData.carGearbox || formData.gearbox || null,
      driver_age: formData.driverAge ? parseInt(formData.driverAge) : undefined,

      // Accommodation - handle surprise trip accommodation choices
      accommodation_type: mapAccommodationType(formData.accommodation || formData.accommodationType || ''),

      // Budget
      budget: parseInt(budget),

      // Extra - include trip-specific notes
      notes: buildNotesForTripType(formData, tripType),
      utm_source: formData.utm_source || null,
      user_agent: userAgent,
      ip_hash: hashIP(clientIP),

      // Status
      status: 'new'
    };

    // Insert into Supabase
    console.log('Attempting to insert data:', JSON.stringify(intakeData, null, 2));
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
    console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing');

    // Using admin client which bypasses RLS
    console.log('Using supabaseAdmin client (service role)');

    const { data: intake, error: insertError } = await supabaseAdmin
      .from('intakes')
      .insert(intakeData)
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      console.error('Insert data was:', JSON.stringify(intakeData, null, 2));
      return NextResponse.json(
        { error: 'Failed to save intake data', details: insertError.message },
        { status: 500 }
      );
    }

    // Log the event
    await supabaseAdmin.from('event_logs').insert({
      event_type: 'intake_submitted',
      intake_id: intake.id,
      metadata: {
        user_agent: userAgent,
        ip_hash: hashIP(clientIP),
        form_data: {
          travel_type: intakeData.traveler_type,
          budget: intakeData.budget,
          destination: intakeData.bestemming
        }
      },
      ip_address: clientIP,
      user_agent: userAgent
    });

    // Send email with trip options
    const customerName = formData.fullName || formData.email.split('@')[0] || 'Reiziger';

    // Customize email based on trip type
    const emailOptions = {
      customerName,
      email: formData.email,
      tripOptions: [], // Will use default options from email service
      language: 'nl' as const // Default to Dutch
    };

    const emailResult = await sendTripOptionsEmail(emailOptions);

    if (!emailResult.success) {
      console.error('Failed to send email:', emailResult.error);
      // Log email failure but don't fail the entire request
      await supabaseAdmin.from('event_logs').insert({
        event_type: 'email_failed',
        intake_id: intake.id,
        metadata: {
          error: emailResult.error,
          email: formData.email
        }
      });
    } else {
      // Log successful email
      await supabaseAdmin.from('event_logs').insert({
        event_type: 'email_sent',
        intake_id: intake.id,
        metadata: {
          email: formData.email,
          customer_name: customerName
        }
      });
    }

    // Success response
    return NextResponse.json({
      success: true,
      id: intake.id,
      message: 'Intake successfully submitted. We will send you 3 trip options within 24-48 hours.',
      emailSent: emailResult.success
    });

  } catch (error) {
    console.error('API Error:', error);

    // Log error event
    await supabaseAdmin.from('event_logs').insert({
      event_type: 'intake_error',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get destination for storage
function getDestinationForStorage(destination: string, destinationType: string): string {
  switch (destinationType) {
    case 'ai-anywhere':
      return 'AI: Anywhere in the world';
    case 'ai-decide':
      return 'AI: Let AI decide';
    case 'custom':
      return `Custom: ${destination}`;
    case 'popular':
    default:
      return destination || '';
  }
}

// Helper function to build notes based on trip type
function buildNotesForTripType(formData: Record<string, unknown>, tripType: string): string {
  const notes = [];

  if (tripType === 'surprise') {
    notes.push('🎁 SURPRISE TRIP REQUEST');

    if (formData.destinationType === 'ai-anywhere') {
      notes.push('• Destination: Anywhere in the world - let user decide');
    } else if (formData.destinationType === 'ai-decide') {
      notes.push('• Destination: AI decide based on preferences');
    }

    if (formData.accommodation === 'included') {
      notes.push(`• Accommodation: Yes, ${formData.accommodationLevel || 'unspecified'} level`);
    } else if (formData.accommodation === 'not-included') {
      notes.push('• Accommodation: No, just the experience');
    }

    if (formData.tripStyle) {
      notes.push(`• Trip style: ${formData.tripStyle}`);
    }
  }

  if (formData.notes) {
    notes.push(formData.notes);
  }

  return notes.join('\n');
}

export async function GET() { 
  return NextResponse.json({ message: 'Use POST method to submit intake data' });
}