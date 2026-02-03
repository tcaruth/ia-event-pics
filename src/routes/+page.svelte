<script>
  import Navbar from '$lib/Navbar.svelte';
  import Hero from '$lib/Hero.svelte';
  import Pricing from '$lib/Pricing.svelte';
  import FindEvent from '$lib/FindEvent.svelte';
  import Features from '$lib/Features.svelte';
  import Gallery from '$lib/Gallery.svelte';
  import Footer from '$lib/Footer.svelte';
</script>

<svelte:head>
  <title>IA Event Pics - Photobooth Rentals</title>
</svelte:head>

<div class="page-wrapper">
  <Navbar />
  <main>
    <Hero />
    <Pricing />
    <FindEvent />
    <Features />
    <Gallery />
  </main>
  <Footer />
</div>
