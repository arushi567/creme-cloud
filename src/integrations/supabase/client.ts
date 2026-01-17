// src/integrations/supabase/client.ts

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('SUPABASE_PUBLISHABLE_KEY:', SUPABASE_PUBLISHABLE_KEY);

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);