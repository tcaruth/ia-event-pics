<script>
    import '../app.css';
    import { preparePageTransition } from '$lib/page-transitions';
	import Navbar from 'lib/Navbar.svelte';

	preparePageTransition();
</script>

<Navbar />
<main>
	<slot />
</main>

<style>
    main {
        background-color: var(--surface-primary);
        max-width: 1440px;
        margin: 0 auto;
        padding-inline: 1rem;
    }
</style>