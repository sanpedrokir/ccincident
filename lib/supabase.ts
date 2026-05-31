import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Strip BOM and whitespace — PowerShell pipe can silently prepend
function clean(val: string | undefined): string {
  return (val || '').replace(/^﻿/, '').trim();
}

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const key = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    if (!url || !key) throw new Error('Supabase env vars not set');
    _client = createClient(url, key);
  }
  return _client;
}

export function createServerSupabaseClient(): SupabaseClient {
  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
