<script>
	import '../app.css';
	import { theme } from '$lib/stores.js';
</script>

<div class:dark={$theme === 'dark'}>
  <slot />
</div>

<style>
</style>
