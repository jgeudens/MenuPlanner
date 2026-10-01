import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
	SUPABASE_URL,
	SUPABASE_PUBLISHABLE_KEY,
	HOUSEHOLD_PASSCODE,
	READONLY_PASSCODE
} from '$env/static/private';

export type Db = SupabaseClient;

function createDb(passcode: string): Db {
	return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
		global: { headers: { 'x-household-passcode': passcode } }
	});
}

const readWriteDb = createDb(HOUSEHOLD_PASSCODE);
const readOnlyDb = createDb(READONLY_PASSCODE);

/** Read-only sessions use a client that sends the read-only passcode, so the
 * database (RLS) rejects any write even if the app layer lets one through. */
export function getDb(readOnly: boolean): Db {
	return readOnly ? readOnlyDb : readWriteDb;
}
