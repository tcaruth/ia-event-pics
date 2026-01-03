<script>
	import { enhance } from '$app/forms';
	import heroImage from '$lib/assets/photobooth_hero_party.png';
	/** @type {import('./$types').ActionData} */
	export let form;

	let loading = false;
</script>

<div class="page-container">
	<div class="hero">
		<div class="hero-content">
			<h1>Capture the Magic at Your Next Event</h1>
			<p class="subhead">
				High-quality photobooth rentals for weddings, corporate events, and parties.
			</p>
			<div class="cta-group">
				<a href="mailto:contact@example.com" class="btn-primary">Book Now</a>
			</div>
		</div>
		<div class="hero-image">
			<img src={heroImage} alt="Happy people using a photobooth" />
		</div>
	</div>

	<div class="lookup-section">
		<div class="card">
			<h2>Find Your Event</h2>
			<p>Enter your event code to view and download your photos.</p>

			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update();
					};
				}}
			>
				<div class="input-group">
					<input
						type="text"
						name="code"
						placeholder="Event Code"
						class:error={form?.invalid}
						value={form?.code ?? ''}
						required
						autocomplete="off"
					/>
					{#if form?.invalid}
						<span class="error-msg">Event not found</span>
					{/if}
				</div>
				<button type="submit" disabled={loading} class="btn-secondary">
					{loading ? 'Finding Event...' : 'Go to Event'}
				</button>
			</form>
		</div>
	</div>

	<div class="features">
		<div class="feature-item">
			<h3>Instant Prints</h3>
			<p>Get high-quality prints in seconds for a lasting memory.</p>
		</div>
		<div class="feature-item">
			<h3>Digital Sharing</h3>
			<p>Instantly share your photos to social media or via email.</p>
		</div>
		<div class="feature-item">
			<h3>Custom Branding</h3>
			<p>Personalize prints and screens with your event's logo and theme.</p>
		</div>
	</div>
</div>

<style>
	/* Premium Page Styles - High Contrast & Accessibility Focused */
	:global(body) {
		margin: 0;
		padding: 0;
		background: #000000; /* Fallback */
		font-family:
			'Inter',
			system-ui,
			-apple-system,
			sans-serif;
		-webkit-font-smoothing: antialiased;
	}

	.page-container {
		width: 100%;
		min-height: 100vh;
		box-sizing: border-box;
		background: #000000; /* Ensure content background is black */
		color: #ffffff;
		display: flex;
		flex-direction: column;
	}

	/* Hero Section */
	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 5rem 2rem;
		background: radial-gradient(circle at 70% 20%, #1a1a1a, #000000 70%);
		text-align: center;
		gap: 3rem;
		border-bottom: 1px solid #333;
	}

	@media (min-width: 900px) {
		.hero {
			flex-direction: row;
			text-align: left;
			justify-content: space-between;
			padding: 8rem 6rem;
			max-width: 1400px;
			margin: 0 auto;
			gap: 4rem;
		}
		.hero-content {
			flex: 1;
			padding-right: 2rem;
		}
		.hero-image {
			flex: 1;
			display: flex;
			justify-content: center;
		}
	}

	h1 {
		font-size: 3.5rem;
		font-weight: 800;
		margin: 0 0 1.5rem 0;
		line-height: 1.1;
		letter-spacing: -0.02em;
		color: #ffffff; /* pure white for contrast */
	}

	.subhead {
		color: #e0e0e0; /* High contrast light grey */
		font-size: 1.5rem;
		margin-bottom: 2.5rem;
		max-width: 600px;
		line-height: 1.5;
		font-weight: 400;
	}

	.cta-group {
		margin-bottom: 2rem;
	}

	.btn-primary {
		display: inline-block;
		background: #ffffff;
		color: #000000;
		padding: 1.25rem 2.5rem;
		font-size: 1.25rem;
		font-weight: 700;
		border-radius: 8px; /* More modern, less pill-shaped */
		text-decoration: none;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
		border: 2px solid #ffffff;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 20px rgba(255, 255, 255, 0.25);
		background: #f0f0f0;
	}

	.btn-primary:focus-visible {
		outline: 3px solid #007bff;
		outline-offset: 4px;
	}

	.hero-image img {
		width: 100%;
		max-width: 600px;
		border-radius: 12px;
		box-shadow: 0 40px 80px rgba(0, 0, 0, 0.8); /* Deep shadow */
		border: 1px solid #333;
	}

	/* Lookup Section */
	.lookup-section {
		background: #0a0a0a;
		padding: 6rem 2rem;
		display: flex;
		justify-content: center;
		border-bottom: 1px solid #222;
		width: 100%;
		box-sizing: border-box;
	}

	.card {
		background: #111111; /* Solid background, no glassmorphism */
		border: 1px solid #333;
		padding: 3rem;
		border-radius: 16px;
		text-align: center;
		max-width: 450px;
		width: 100%;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
	}

	h2 {
		font-size: 2.25rem;
		margin: 0 0 1rem 0;
		font-weight: 700;
		color: white;
	}

	.card p {
		color: #cccccc; /* Accessible grey */
		margin-bottom: 2.5rem;
		font-size: 1.1rem;
	}

	.input-group {
		margin-bottom: 1.5rem;
	}

	input {
		width: 100%;
		padding: 1.25rem;
		border-radius: 8px;
		border: 2px solid #444; /* clear border */
		background: #000000;
		color: white;
		font-size: 1.125rem;
		box-sizing: border-box;
		text-align: center;
		transition: border-color 0.2s;
		font-family: inherit;
	}

	input:focus {
		outline: none;
		border-color: #ffffff;
		background: #000000;
	}

	input:focus-visible {
		outline: 3px solid #007bff;
		outline-offset: 2px;
	}

	input::placeholder {
		color: #666;
	}

	.btn-secondary {
		width: 100%;
		padding: 1.25rem;
		border-radius: 8px;
		border: 2px solid #ffffff;
		background: transparent;
		color: #ffffff;
		font-size: 1.125rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		font-family: inherit;
	}

	.btn-secondary:hover:not(:disabled) {
		background: #ffffff;
		color: #000000;
	}

	.btn-secondary:focus-visible {
		outline: 3px solid #007bff;
		outline-offset: 4px;
	}

	.error-msg {
		background: #3d0000;
		color: #ffcccc; /* High contrast error text */
		padding: 0.75rem;
		border-radius: 6px;
		margin-top: 1rem;
		display: block;
		font-weight: 500;
		border: 1px solid #ff4444;
	}

	/* Features Section */
	.features {
		display: grid;
		grid-template-columns: 1fr;
		gap: 4rem;
		padding: 8rem 2rem;
		max-width: 1200px;
		margin: 0 auto;
		text-align: center;
		background: #000000; /* Explicit black background */
		width: 100%;
		box-sizing: border-box;
	}

	@media (min-width: 768px) {
		.features {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.feature-item h3 {
		font-size: 1.75rem;
		margin-bottom: 1rem;
		color: #ffffff;
		font-weight: 700;
	}

	.feature-item p {
		color: #bbbbbb; /* Readable lighter grey */
		line-height: 1.6;
		font-size: 1.125rem;
	}
</style>
