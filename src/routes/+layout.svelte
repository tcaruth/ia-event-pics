<script>
	import '../app.css';
	import { theme } from '$lib/stores.js';
	import { onMount } from 'svelte';

	$: if (typeof document !== 'undefined') {
		document.documentElement.classList.toggle('dark', $theme === 'dark');
	}
</script>

<slot />

<style>
</style>
