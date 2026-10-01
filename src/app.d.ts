import type { Db } from '$lib/server/supabase';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			readOnly: boolean;
			db: Db;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
