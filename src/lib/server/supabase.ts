import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, HOUSEHOLD_PASSCODE } from '$env/static/private';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
	global: { headers: { 'x-household-passcode': HOUSEHOLD_PASSCODE } }
});
