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
	.event-layout {
		min-height: 100vh;
		background: var(--surface-primary);
		color: var(--text-surface-primary);
		transition:
			background-color 0.3s ease,
			color 0.3s ease;
	}
</style>
