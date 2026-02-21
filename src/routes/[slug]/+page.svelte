<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	let autoRefreshEnabled = $state(false);
	/** @type {ReturnType<typeof setInterval> | null} */
	let refreshInterval = null;

	const REFRESH_INTERVAL_MS = 5000; // Refresh every 5 seconds

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

	function scrollToLastImage() {
		const lastImage = document.querySelector('[data-last-image="true"]');
		if (lastImage) {
			lastImage.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}

	async function refreshGallery() {
		await invalidateAll();
		// Wait for Svelte to update DOM with new data before scrolling
		await tick();
		scrollToLastImage();
	}

	function startAutoRefresh() {
		if (!autoRefreshEnabled) {
			autoRefreshEnabled = true;
			localStorage.setItem('autoRefreshEnabled', 'true');
		}
		refreshGallery();
		refreshInterval = setInterval(refreshGallery, REFRESH_INTERVAL_MS);
	}

	function stopAutoRefresh() {
		autoRefreshEnabled = false;
		localStorage.setItem('autoRefreshEnabled', 'false');
		if (refreshInterval) {
			clearInterval(refreshInterval);
			refreshInterval = null;
		}
	}

	function toggleAutoRefresh() {
		if (autoRefreshEnabled) {
			stopAutoRefresh();
		} else {
			startAutoRefresh();
		}
	}

	onMount(() => {
		// Restore state from localStorage
		const savedState = localStorage.getItem('autoRefreshEnabled');
		if (savedState === 'true') {
			startAutoRefresh();
		}
	});

	onDestroy(() => {
		if (refreshInterval) {
			clearInterval(refreshInterval);
		}
	});
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
			{#each data.event?.images || [] as image, index}
				{@const isLastImage = index === (data.event?.images || []).length - 1}
				<a href="/{data.slug}/{image.name}" class="gallery-item" data-last-image={isLastImage}>
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

		<div class="attribution">
			<p>Powered by <a href="/" target="_blank">IA Event Pics</a></p>
		</div>

		{#if data.event?.primary_image}
			<div class="primary-image-section">
				<img src={data.event?.primary_image} alt={data.event?.name} />
			</div>
		{/if}

		<div class="auto-refresh-control">
			<label class="switch-container">
				<span class="switch-label">Auto-load new images</span>
				<button
					class="switch"
					role="switch"
					aria-label="Toggle auto-load new images"
					aria-checked={autoRefreshEnabled}
					onclick={toggleAutoRefresh}
				>
					<span class="switch-track">
						<span class="switch-thumb" class:active={autoRefreshEnabled}></span>
					</span>
				</button>
			</label>
			{#if autoRefreshEnabled}
				<p class="refresh-status">Refreshing every {REFRESH_INTERVAL_MS / 1000} seconds...</p>
			{/if}
		</div>
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

	.auto-refresh-control {
		margin-top: var(--spacing-lg);
		padding: var(--spacing-md);
		background: var(--surface-secondary);
		border-radius: var(--radius-md);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.switch-container {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		cursor: pointer;
	}

	.switch-label {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-surface-secondary);
	}

	.switch {
		position: relative;
		display: inline-block;
		width: 52px;
		height: 28px;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
	}

	.switch-track {
		position: absolute;
		inset: 0;
		background-color: #ccc;
		border-radius: 28px;
		transition: background-color 0.3s;
	}

	.switch-thumb {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 24px;
		height: 24px;
		background-color: white;
		border-radius: 50%;
		transition: transform 0.3s;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.switch-thumb.active {
		transform: translateX(24px);
	}

	.switch[aria-checked='true'] .switch-track {
		background-color: var(--color-primary);
	}

	.refresh-status {
		font-size: 0.875rem;
		color: var(--text-surface-secondary);
		margin: 0;
		opacity: 0.8;
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
