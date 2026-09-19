import { writable } from 'svelte/store';

export const theme = writable('light');
export const activeTransitionPhoto = writable(/** @type {string | null} */ (null));
