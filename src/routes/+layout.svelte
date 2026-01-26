<script>
	import '../app.css';
	import { theme } from '$lib/stores.js';
</script>

<div class:dark={$theme === 'dark'}>
  <slot />
</div>

<style>
	main {
		background-color: var(--surface-primary);
		min-height: 100vh;
	}
</style>
