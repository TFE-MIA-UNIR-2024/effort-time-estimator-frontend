// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rderhrqtufzdxlspxxnt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZXJocnF0dWZ6ZHhsc3B4eG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1MDM4NjgsImV4cCI6MjA1MTA3OTg2OH0.nXUVXPoya2bXS_WyspfJbneAItzxh905Ap_2UfelMnM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);