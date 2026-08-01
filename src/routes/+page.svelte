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
	<title>IA Event Pics | Modern Photobooth Rentals in Waterloo & Cedar Valley</title>
	<meta
		name="description"
		content="Premium, affordable photobooth rentals in Waterloo, Cedar Falls, and the Cedar Valley area. Unlimited digital photos, instant print add-ons, and live online guest galleries."
	/>
	<meta name="keywords" content="photobooth rental, Waterloo Iowa photobooth, Cedar Falls photobooth, wedding photobooth, corporate photobooth" />
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://iaevent.pics/" />
	<meta property="og:title" content="IA Event Pics | Photobooth Rentals" />
	<meta property="og:description" content="Capture the joy at your next event with high-quality photobooth rentals in the Cedar Valley." />
	<meta property="og:image" content="/images/hero_photobooth.jpg" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:title" content="IA Event Pics | Photobooth Rentals" />
	<meta property="twitter:description" content="High-quality photobooth rentals for weddings, corporate galas, and celebrations." />
	<meta property="twitter:image" content="/images/hero_photobooth.jpg" />
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
