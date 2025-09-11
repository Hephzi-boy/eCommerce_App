// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// For safety, keep these in .env or a config file
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pxdczecqhtsrbpjvgdue.supabase.co'
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4ZGN6ZWNxaHRzcmJwanZnZHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NTcxNzMsImV4cCI6MjA3MzAzMzE3M30.l-1CGb_zsNMbsWEMnDmO4w_c8iwfTONFuOTOhK01-_0'

// Create a single supabase client for your app
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
