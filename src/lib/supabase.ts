import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with proper anon configuration
export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
})

// Admin client that bypasses RLS (for server-side operations only)
export const createSupabaseAdmin = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  })
}

// Types for our database
export interface IntakeData {
  id?: string
  created_at?: string

  // Traveler info
  traveler_type: 'adults' | 'family' | 'solo' | 'couple' | 'group'
  adults: number
  children: number
  children_ages: number[]

  // Dates (keeping original field names for compatibility)
  vertrek_datum: string // date_depart
  terug_datum: string   // date_return
  flexible: boolean

  // Destination & departure (keeping original field names)
  bestemming: string    // destination
  vertrek_vanaf: string // departure_airport

  // Flight preferences
  direct_only: boolean
  stops_ok: boolean
  cabin_class: 'economy' | 'premium_economy' | 'business' | 'first'
  vlucht_type?: string  // existing field

  // Car rental
  car_needed: boolean
  car_type?: 'economy' | 'compact' | 'intermediate' | 'standard' | 'full_size' | 'premium' | 'luxury' | 'suv'
  gearbox?: 'manual' | 'automatic'
  driver_age?: number
  vervoer?: string      // existing field

  // Accommodation
  accommodation_type?: 'hotel' | 'apartment' | 'hostel' | 'resort' | 'villa' | 'bnb' | 'mixed'

  // Budget
  budget: number        // existing field

  // Contact info
  full_name: string
  email: string
  phone?: string
  name?: string         // existing field

  // Extra
  notes?: string        // existing field
  utm_source?: string
  user_agent?: string
  ip_hash?: string

  // Existing fields to maintain compatibility
  personen?: number     // can map to adults + children
  halal?: boolean
  dieet_voorkeuren?: string
  trip_mode?: string
  destination?: string
  cruise_region?: string
  payload?: Record<string, unknown>

  // Status & admin (for admin use)
  status?: 'new' | 'in_progress' | 'completed' | 'cancelled'
  assignee?: string
  admin_notes?: string
  ai_mode?: boolean
  ai_destination?: string
}

export interface EventLog {
  id?: string
  created_at?: string
  event_type: string
  intake_id?: string
  user_id?: string
  metadata?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
}