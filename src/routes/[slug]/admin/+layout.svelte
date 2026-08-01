<script>
	/** @type {{ children?: import('svelte').Snippet }} */
	let { children } = $props();
</script>

<div class="admin-theme-shell">
	{#if children}
		{@render children()}
	{:else}
		<slot />
	{/if}
</div>

<style>
	.admin-theme-shell {
		/* Explicit, high-contrast Admin Dark Design Tokens */
		--color-primary: #3b82f6;
		--text-primary: #ffffff;
		--color-secondary: #2563eb;
		--text-secondary: #ffffff;
		--surface-primary: #0f172a;
		--surface-secondary: #1e293b;
		--border-color: rgba(255, 255, 255, 0.12);
		--text-surface-primary: #f8fafc;
		--text-surface-secondary: #94a3b8;
		--heading-font: 'Inter', system-ui, -apple-system, sans-serif;
		--body-font: 'Inter', system-ui, -apple-system, sans-serif;

		min-height: 100vh;
		background-color: #0f172a !important;
		color: #f8fafc !important;
		font-family: var(--body-font);
		padding: 1.5rem 1.5rem 4rem 1.5rem;
		box-sizing: border-box;
	}

	:global(body) {
		background-color: #0f172a !important;
		color: #f8fafc !important;
	}
</style>
