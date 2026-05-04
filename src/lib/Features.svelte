<script>
	const features = [
		{
			icon: 'print',
			title: 'Instant Prints',
			description:
				'Get high-quality prints in seconds for a lasting physical memory of your night. Our optional printer addon makes it easy.'
		},
		{
			icon: 'share',
			title: 'Digital Sharing',
			description:
				'Instantly share your photos to social media or via email with our live gallery. Perfect for modern celebrations.'
		},
		{
			icon: 'palette',
			title: 'Custom Branding',
			description:
				"Personalize prints and screens with your event's unique logo and theme. We match your vibe perfectly."
		}
	];
</script>

<section class="features-section" id="features">
	<div class="container">
		<div class="grid">
			{#each features as feature}
				<div class="card">
					<div class="icon-container">
						<span class="material-symbols-outlined icon">{feature.icon}</span>
					</div>
					<h3 class="title">{feature.title}</h3>
					<p class="description">{feature.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.features-section {
		padding: 5rem 0;
		background-color: var(--surface-color);
		color: var(--text-color);
	}

	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 1.5rem;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
	}

	@media (min-width: 768px) {
		.grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	.card {
		background-color: var(--card-bg);
		padding: 2rem;
		border-radius: 0.75rem;
		border: 1px solid var(--border-color);
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
		transition: box-shadow 0.3s;
	}

	.card:hover {
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
	}

	.icon-container {
		width: 4rem;
		height: 4rem;
		background-color: var(--primary-light);
		border-radius: 0.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 1.5rem;
		transition: background-color 0.3s;
	}

	.card:hover .icon-container {
		background-color: var(--primary);
	}

	.icon {
		font-size: 2rem;
		color: var(--primary);
		transition: color 0.3s;
	}

	.card:hover .icon {
		color: white;
	}

	.title {
		font-size: 1.25rem;
		font-weight: 800;
		margin-bottom: 1rem;
	}

	.description {
		color: var(--text-muted);
		line-height: 1.6;
	}
</style>
