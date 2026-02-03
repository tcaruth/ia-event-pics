<script>
	import { enhance } from '$app/forms';
	import heroImage from '$lib/assets/photobooth_hero_party.png';
	export let form;

	let loading = false;
</script>

<div class="page-container" data-theme="dark">
	<section class="hero">
		<div class="hero-content">
			<div class="badge">Serving the Cedar Valley</div>
			<h1 class="gradient-text">Capture the Magic at Your Next Event</h1>
			<p class="subhead">
				High-quality photobooth rentals for weddings, corporate events, and parties.
			</p>
			<div class="cta-group">
				<a href="mailto:contact@example.com" class="btn btn-primary">Book Your Date</a>
				<a href="#find" class="btn btn-secondary">Find Photos</a>
			</div>
		</div>
		<div class="hero-image">
			<div class="image-wrapper">
				<img src={heroImage} alt="Happy people using a photobooth" />
			</div>
		</div>
	</section>

	<section id="find" class="lookup-section">
		<div class="card">
			<h2>Find Your Event</h2>
			<p>Enter your unique event code to view and download your memories.</p>

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
						placeholder="e.g. WEDDING2024"
						class:error={form?.invalid}
						value={form?.code ?? ''}
						required
						autocomplete="off"
					/>
					{#if form?.invalid}
						<div class="error-msg">
							<span class="icon">⚠️</span>
							Event not found. Please check your code.
						</div>
					{/if}
				</div>
				<button type="submit" disabled={loading} class="btn btn-submit">
					{#if loading}
						<span class="spinner"></span> Finding...
					{:else}
						Go to Event
					{/if}
				</button>
			</form>
		</div>
	</section>

	<section class="features">
		<div class="feature-item">
			<div class="feature-icon">✨</div>
			<h3>Instant Prints</h3>
			<p>Get high-quality prints in seconds for a lasting physical memory of your night.</p>
		</div>
		<div class="feature-item">
			<div class="feature-icon">📱</div>
			<h3>Digital Sharing</h3>
			<p>Instantly share your photos to social media or via email with our live gallery.</p>
		</div>
		<div class="feature-item">
			<div class="feature-icon">🎨</div>
			<h3>Custom Branding</h3>
			<p>Personalize prints and screens with your event's unique logo and theme.</p>
		</div>
	</section>
</div>

<style>
	.page-container {
		width: 100%;
		min-height: 100vh;
		background: var(--surface-primary);
		color: var(--text-surface-primary);
		overflow-x: hidden;
	}

	.hero {
		display: grid;
		grid-template-columns: 1fr;
		gap: 3rem;
		padding: var(--spacing-xl) var(--spacing-md);
		max-width: 1400px;
		margin: 0 auto;
		align-items: center;
	}

	@media (min-width: 900px) {
		.hero {
			grid-template-columns: 1.2fr 0.8fr;
			padding: var(--spacing-xl) var(--spacing-xl);
			min-height: 80vh;
		}
	}

	.hero-content {
		z-index: 1;
	}

	.badge {
		display: inline-block;
		padding: 0.5rem 1rem;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: var(--radius-round);
		font-size: 0.875rem;
		font-weight: 600;
		color: white;
		margin-bottom: 2rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	h1 {
		font-size: clamp(2.5rem, 5vw, 4.5rem);
		font-weight: 800;
		line-height: 1.1;
		margin-bottom: 2rem;
		letter-spacing: -0.02em;
	}

	.gradient-text {
		background: linear-gradient(135deg, #fff 0%, #a1a1aa 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.subhead {
		font-size: clamp(1.125rem, 2vw, 1.5rem);
		color: var(--text-surface-secondary);
		max-width: 600px;
		line-height: 1.6;
		margin-bottom: 3rem;
	}

	.cta-group {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
	}

	.btn {
		padding: 1rem 2rem;
		font-size: 1.125rem;
		font-weight: 700;
		border-radius: var(--radius-md);
		transition: var(--transition-base);
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.btn-primary {
		background: #ffffff;
		color: #000000;
		border: none;
		box-shadow: 0 10px 20px -5px rgba(255, 255, 255, 0.1);
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 20px 30px -10px rgba(255, 255, 255, 0.2);
		background: #f4f4f5;
	}

	.btn-secondary {
		background: transparent;
		color: #ffffff;
		border: 2px solid rgba(255, 255, 255, 0.2);
	}

	.btn-secondary:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: #ffffff;
	}

	.image-wrapper {
		position: relative;
		border-radius: var(--radius-lg);
		overflow: hidden;
		box-shadow: var(--shadow-lg);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.hero-image img {
		width: 100%;
		height: auto;
		display: block;
		transform: scale(1.02);
		transition: transform 0.5s ease-out;
	}

	.hero-image:hover img {
		transform: scale(1.05);
	}

	/* Lookup Section */
	.lookup-section {
		padding: var(--spacing-xl) var(--spacing-md);
		background: radial-gradient(circle at 50% 0%, #18181b, #000);
		display: grid;
		place-items: center;
	}

	.card {
		background: #09090b;
		border: 1px solid #27272a;
		padding: var(--spacing-lg);
		border-radius: var(--radius-xl);
		width: 100%;
		max-width: 500px;
		text-align: center;
		box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.5);
	}

	.card h2 {
		font-size: 2rem;
		margin-bottom: 1rem;
	}

	.card p {
		color: var(--text-surface-secondary);
		margin-bottom: 2.5rem;
	}

	.input-group {
		margin-bottom: 2rem;
		text-align: left;
	}

	input {
		width: 100%;
		padding: 1.25rem;
		background: #18181b;
		border: 2px solid #27272a;
		border-radius: var(--radius-md);
		color: white;
		font-size: 1.25rem;
		text-align: center;
		transition: var(--transition-base);
		font-weight: 600;
		letter-spacing: 0.05em;
	}

	input:focus {
		outline: none;
		border-color: var(--color-secondary);
		background: #27272a;
	}

	.error-msg {
		margin-top: 1rem;
		padding: 1rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.2);
		border-radius: var(--radius-sm);
		color: #f87171;
		font-size: 0.875rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.btn-submit {
		width: 100%;
		background: var(--color-secondary);
		color: white;
		border: none;
		padding: 1.25rem;
		border-radius: var(--radius-md);
		font-size: 1.25rem;
		box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
	}

	.btn-submit:hover:not(:disabled) {
		background: #818cf8;
		transform: translateY(-2px);
		box-shadow: 0 15px 25px -5px rgba(99, 102, 241, 0.5);
	}

	.btn-submit:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	/* Features */
	.features {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 3rem;
		padding: var(--spacing-xl) var(--spacing-md);
		max-width: 1200px;
		margin: 0 auto;
	}

	.feature-item {
		text-align: center;
		padding: var(--spacing-lg);
		border-radius: var(--radius-lg);
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.05);
		transition: var(--transition-base);
	}

	.feature-item:hover {
		background: rgba(255, 255, 255, 0.04);
		border-color: rgba(255, 255, 255, 0.1);
		transform: translateY(-5px);
	}

	.feature-icon {
		font-size: 2.5rem;
		margin-bottom: 1.5rem;
	}

	.feature-item h3 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
	}

	.feature-item p {
		color: var(--text-surface-secondary);
		line-height: 1.6;
	}

	.spinner {
		width: 20px;
		height: 20px;
		border: 3px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: #fff;
		animation: spin 1s linear infinite;
		margin-right: 0.75rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
