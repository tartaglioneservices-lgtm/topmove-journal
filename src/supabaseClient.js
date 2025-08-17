import { createClient } from '@supabase/supabase-js'

// Remplacez ces valeurs par les vôtres depuis Supabase Dashboard
const supabaseUrl = 'https://ayixtwmojsufpzayvrnm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5aXh0d21vanN1ZnB6YXl2cm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MTMzNjcsImV4cCI6MjA3MDk4OTM2N30.wMCNeuH4PLjYwJjA-DcbkeVDiIx_4y_7SJ73fn35l7o'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
