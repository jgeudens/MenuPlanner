import { writable } from 'svelte/store';

export type Toast = { message: string; kind: 'success' | 'error' };

export const toast = writable<Toast | null>(null);

export function showToast(message: string, kind: Toast['kind'] = 'success') {
	toast.set({ message, kind });
}
