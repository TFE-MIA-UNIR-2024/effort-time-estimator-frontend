// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qmfjcgemljsnhsjgjmwq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtZmpjZ2VtbGpzbmhzamdqbXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMDUxMjQsImV4cCI6MjA2Mjc4MTEyNH0._9cKuu1uM7k-Srl8sRju6Y1Sik4R1CuBDv20Bjt2g9E";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
