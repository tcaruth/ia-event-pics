<script>
	import { onMount } from 'svelte';

	export let data;
	$: theme = data.event?.theme || 'dark';

	$: if (typeof document !== 'undefined') {
		document.body.setAttribute('data-theme', theme);
	}
</script>

<div
	class="event-layout"
	data-theme={theme}
	style="
		--color-primary: {data.event?.colors?.primary || 'var(--color-primary)'};
		--text-primary: {data.event?.colors?.primaryText || 'var(--text-primary)'};
		--color-secondary: {data.event?.colors?.secondary || 'var(--color-secondary)'};
		--text-secondary: {data.event?.colors?.secondaryText || 'var(--text-secondary)'};
		--surface-primary: {data.event?.colors?.surface || 'var(--surface-primary)'};
		--text-surface-primary: {data.event?.colors?.surfaceText || 'var(--text-surface-primary)'};
		--heading-font: {data.event?.fonts?.heading || 'var(--font-heading)'};
		--body-font: {data.event?.fonts?.body || 'var(--font-main)'};
		font-family: var(--body-font);
	"
>
	<slot />
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Arvo:ital,wght@0,400;0,700;1,400;1,700&family=Bungee&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Lora:ital,wght@0,400..700;1,400..700&family=Outfit:wght@100..900&family=Pacifico&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap');

	:global(:root) {
		--font-main: 'Inter', system-ui, -apple-system, sans-serif;
		--font-heading: 'Outfit', var(--font-main);

		--radius-sm: 8px;
		--radius-md: 12px;
		--radius-lg: 20px;
		--radius-xl: 32px;
		--radius-round: 9999px;

		--spacing-xs: 0.5rem;
		--spacing-sm: 1rem;
		--spacing-md: 1.5rem;
		--spacing-lg: 2.5rem;
		--spacing-xl: 4rem;

		--transition-base: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
		--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
		--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.15);
	}

	:global(body) {
		margin: 0;
		padding: 0;
		font-family: var(--font-main);
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		background: var(--surface-primary);
		color: var(--text-surface-primary);
	}

	.event-layout {
		min-height: 100vh;
		background: var(--surface-primary);
		color: var(--text-surface-primary);
		transition:
			background-color 0.3s ease,
			color 0.3s ease;
	}
</style>
