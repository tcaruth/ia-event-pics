<script>
	export let data;

	/** @param {string} dateStr */
	function formatTime(dateStr) {
		if (!dateStr) return 'Just now';
		const date = new Date(dateStr);
		// If event spans multiple days, we might want date, but user requested time.
		// For now, let's stick to time as requested.
		return new Intl.DateTimeFormat(undefined, {
			timeStyle: 'short'
		}).format(date);
	}
</script>

<div class="gallery-page">
	<header class="event-header" style:--tag="heading">
		<div class="header-content">
			<h1 style:--tag="title" style="font-family: var(--heading-font)">{data.event?.name}</h1>
			<p class="description">{data.event?.description || ''}</p>
			{#if data.event?.date}
				<p class="date">{data.event?.date}</p>
			{/if}
		</div>
	</header>

	<main class="gallery-wrapper">
		<div class="gallery">
			{#each data.event?.images || [] as image}
				<a href="/{data.slug}/{image.name}" class="gallery-item">
					<figure>
						<div class="img-container">
							<img
								src={image.url}
								alt={image.alt || ''}
								loading="lazy"
								style:--tag={'img-' + image.name.replace(/[^a-z0-9]/gi, '-')}
							/>
						</div>
						<figcaption>
							{formatTime(image.created)}
						</figcaption>
					</figure>
				</a>
			{/each}
		</div>

		{#if data.event?.primary_image}
			<div class="primary-image-section">
				<img src={data.event?.primary_image} alt={data.event?.name} />
			</div>
		{/if}
	</main>
</div>

<style>
	.gallery-page {
		min-height: 100vh;
	}

	.event-header {
		background: var(--color-primary);
		color: var(--text-primary);
		padding: var(--spacing-lg) var(--spacing-md);
		text-align: center;
		border-bottom-left-radius: var(--radius-lg);
		border-bottom-right-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
	}

	.header-content h1 {
		margin: 0;
		font-size: 2.5rem;
		font-weight: 800;
	}

	.description {
		margin-top: 0.5rem;
		opacity: 0.9;
		font-size: 1.125rem;
	}

	.date {
		margin-top: 0.25rem;
		opacity: 0.7;
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.gallery-wrapper {
		padding: var(--spacing-lg) var(--spacing-md);
		max-width: 1400px;
		margin: 0 auto;
	}

	.gallery {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--spacing-md);
	}

	.gallery-item {
		transition: transform var(--transition-base);
	}

	.gallery-item:hover {
		transform: translateY(-4px);
	}

	figure {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.img-container {
		aspect-ratio: 1;
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--surface-secondary);
		box-shadow: var(--shadow-sm);
		border: 1px solid var(--border-color);
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.5s ease;
	}

	.gallery-item:hover img {
		transform: scale(1.05);
	}

	figcaption {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-surface-secondary);
		text-align: center;
	}

	.primary-image-section {
		margin-top: var(--spacing-xl);
		text-align: center;
		img {
			border-radius: var(--radius-lg);
			max-width: 100%;
			box-shadow: var(--shadow-lg);
		}
	}

	@media (max-width: 600px) {
		.gallery {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--spacing-sm);
		}
		.header-content h1 {
			font-size: 1.75rem;
		}
	}
</style>
