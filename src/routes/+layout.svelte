<script>
	import '../app.css';
	import { preparePageTransition } from '$lib/page-transitions';
	import Navbar from 'lib/Navbar.svelte';
	import { page } from '$app/stores';

	preparePageTransition();

	$: if (typeof document !== 'undefined') {
		// Reset theme on root layout to default (dark) if not in a slug route
		// Slug routes will override this in their own layouts
		if (!$page.params.slug) {
			document.body.setAttribute('data-theme', 'dark');
		}
	}
</script>

<svelte:head>
	<title>IA Event Pics</title>
</svelte:head>

<main>
	<slot />
</main>

<style>
	main {
		background-color: var(--surface-primary);
		min-height: 100vh;
	}
</style>
