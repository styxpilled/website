import { writable } from 'svelte/store';
import type Repository from '$lib/Projects/repo';

const repoType: Repository[] = []

export const repos = writable(repoType);
