import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rderhrqtufzdxlspxxnt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZXJocnF0dWZ6ZHhsc3B4eG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1MDM4NjgsImV4cCI6MjA1MTA3OTg2OH0.nXUVXPoya2bXS_WyspfJbneAItzxh905Ap_2UfelMnM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
