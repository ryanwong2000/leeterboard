import { createClient } from '@supabase/supabase-js';

const supabaseUrl: string = 'https://kwxxvxqltuayccytwakk.supabase.co';
const supabaseAnonKey: string =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eHh2eHFsdHVheWNjeXR3YWtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzM5MjQ4OTEsImV4cCI6MTk4OTUwMDg5MX0.fw578FLoLyKxFpug2qkj4VZveXaUoMOdzev12NZu_8k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
