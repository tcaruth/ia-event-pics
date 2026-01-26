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
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet" />
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
