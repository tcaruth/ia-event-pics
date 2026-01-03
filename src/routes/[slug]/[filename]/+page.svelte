<script>
	import { page } from '$app/stores';
	import QRCode from 'qrcode';
	import { onMount } from 'svelte';
	export let data;

	const imageUrl = data.image?.url || '';

	let qrPageUrlDataUrl = Promise.resolve('');
	let loadingState = 'checking'; // 'checking', 'loaded', 'error'
	let retryCount = 0;
	const MAX_RETRIES = 60; // 3 minutes at 3s interval

	async function checkImage() {
		try {
			const response = await fetch(imageUrl, { method: 'HEAD', cache: 'no-cache' });
			if (response.ok) {
				loadingState = 'loaded';
				return true;
			}
		} catch (e) {
			console.error('Error checking image:', e);
		}
		return false;
	}

	onMount(() => {
		qrPageUrlDataUrl = QRCode.toDataURL($page.url.href, {
			errorCorrectionLevel: 'L',
			margin: 2,
			color: {
				dark: '#000000',
				light: '#ffffff'
			}
		});
		/** @type {ReturnType<typeof setInterval>} */
		let interval;

		const poll = async () => {
			const found = await checkImage();
			if (found) {
				clearInterval(interval);
			} else {
				retryCount++;
				if (retryCount >= MAX_RETRIES) {
					loadingState = 'error';
					clearInterval(interval);
				}
			}
		};

		poll(); // Initial check
		interval = setInterval(poll, 3000);

		return () => clearInterval(interval);
	});

	async function downloadImage() {
		const response = await fetch(imageUrl);
		const blob = await response.blob();
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = data.filename;
		a.click();
		URL.revokeObjectURL(url);
	}

	async function shareImage() {
		try {
			if (navigator.share) {
				await navigator.share({
					title: `Photo from ${data.event?.name}`,
					url: window.location.href
				});
			} else {
				await navigator.clipboard.writeText(window.location.href);
				alert('Link copied to clipboard!');
			}
		} catch (err) {
			console.error('Sharing failed', err);
		}
	}
</script>

<div class="image-viewer">
	<div class="content-container">
		<header class="viewer-header">
			<a href="/{data.slug}" class="back-link">
				<span class="icon">←</span> Back to Gallery
			</a>
		</header>

		<main class="viewer-main">
			{#if loadingState === 'checking'}
				<div class="status-container">
					<div class="spinner"></div>
					<p>Finding your photo...</p>
					<p class="subtext">Just a moment while we process the magic.</p>
				</div>
			{:else if loadingState === 'error'}
				<div class="status-container">
					<p class="error-text">Photo Not Found</p>
					<p class="subtext">We couldn't locate this photo. It might still be uploading.</p>
					<button class="btn btn-primary" on:click={() => window.location.reload()}>Retry</button>
				</div>
			{:else}
				<div class="image-wrapper">
					<img src={imageUrl} alt={data.filename} class="main-image" />
				</div>

				<div class="action-bar">
					<button class="action-btn" on:click={downloadImage}>
						<span class="icon">↓</span> Save
					</button>
					<button class="action-btn primary" on:click={shareImage}>
						<span class="icon">↗</span> Share
					</button>
				</div>

				<div class="qr-section">
					{#await qrPageUrlDataUrl then dataUrl}
						<figure class="qr-figure">
							<img src={dataUrl} alt="QR Code" class="qr-code" />
							<figcaption>Scan to share this photo</figcaption>
						</figure>
					{/await}
				</div>
			{/if}
		</main>
	</div>
</div>

<style>
	.image-viewer {
		position: fixed;
		inset: 0;
		background: var(--surface-primary);
		color: var(--text-surface-primary);
		z-index: 1000;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
	}

	.content-container {
		width: 100%;
		max-width: 800px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		min-height: 100%;
		padding: var(--spacing-md);
	}

	.viewer-header {
		padding: var(--spacing-sm) 0;
		display: flex;
		justify-content: flex-start;
	}

	.back-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
		color: var(--text-surface-primary);
		opacity: 0.8;
		transition: opacity var(--transition-base);
	}

	.back-link:hover {
		opacity: 1;
	}

	.viewer-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-lg);
		padding-bottom: var(--spacing-xl);
	}

	.image-wrapper {
		width: 100%;
		display: flex;
		justify-content: center;
		background: rgba(0, 0, 0, 0.03);
		border-radius: var(--radius-lg);
		padding: var(--spacing-sm);
	}

	.main-image {
		max-width: 100%;
		max-height: 70vh;
		object-fit: contain;
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
	}

	.action-bar {
		display: flex;
		gap: var(--spacing-sm);
		width: 100%;
		max-width: 400px;
	}

	.action-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1rem;
		border-radius: var(--radius-md);
		font-weight: 700;
		font-size: 1.125rem;
		border: 2px solid var(--border-color);
		background: transparent;
		color: var(--text-surface-primary);
		transition: var(--transition-base);
	}

	.action-btn.primary {
		background: var(--color-primary);
		color: var(--text-primary);
		border-color: var(--color-primary);
	}

	.action-btn:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.qr-section {
		text-align: center;
		margin-top: var(--spacing-sm);
	}

	.qr-figure {
		margin: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.qr-code {
		width: 120px;
		height: 120px;
		padding: 0.5rem;
		background: white;
		border-radius: var(--radius-sm);
		box-shadow: var(--shadow-sm);
	}

	figcaption {
		font-size: 0.875rem;
		opacity: 0.7;
	}

	.status-container {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.spinner {
		width: 48px;
		height: 48px;
		border: 4px solid var(--border-color);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.subtext {
		color: var(--text-surface-secondary);
		font-size: 0.9rem;
	}

	.error-text {
		color: #ef4444;
		font-size: 1.5rem;
		font-weight: 700;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 480px) {
		.action-bar {
			padding: 0;
		}
		.main-image {
			max-height: 60vh;
		}
	}
</style>
