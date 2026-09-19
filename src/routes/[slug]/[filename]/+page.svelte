<script>
	import { page } from '$app/stores';
	import QRCode from 'qrcode';
	import { onMount } from 'svelte';

	let { data } = $props();

	let imageUrl = $derived(data.image?.url || '');
	const qrCodeSize = 300;

	let qrPageUrlDataUrl = $state(Promise.resolve(''));
	let loadingState = $state('checking'); // 'checking', 'loaded', 'error'
	let retryCount = $state(0);
	const MAX_RETRIES = 60; // 3 minutes at 3s interval

	$effect(() => {
		if (data.image) {
			loadingState = 'loaded';
		}
	});

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
			},
			width: qrCodeSize,
			height: qrCodeSize
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
					<button class="btn btn-primary" onclick={() => window.location.reload()}>Retry</button>
				</div>
			{:else}
				<div class="image-wrapper">
					<img
						src={imageUrl}
						alt={data.filename}
						class="main-image"
						style:--tag={'img-' + data.filename.replace(/[^a-z0-9]/gi, '-')}
						onerror={() => (loadingState = 'checking')}
					/>
				</div>

				<div class="action-bar">
					<button class="action-btn primary" onclick={downloadImage}>
						<span class="icon">
							<svg
								fill="currentColor"
								width="80"
								height="80"
								viewBox="0 0 25 24"
								xmlns="http://www.w3.org/2000/svg"
								transform="rotate(0 0 0)"
								><path
									d="M12.4239 16.75C12.2079 16.75 12.0132 16.6587 11.8763 16.5126L7.26675 11.9059C6.97376 11.6131 6.97361 11.1382 7.26641 10.8452C7.55921 10.5523 8.03408 10.5521 8.32707 10.8449L11.6739 14.1896L11.6739 4C11.6739 3.58579 12.0096 3.25 12.4239 3.25C12.8381 3.25 13.1739 3.58579 13.1739 4L13.1739 14.1854L16.5168 10.8449C16.8098 10.5521 17.2846 10.5523 17.5774 10.8453C17.8702 11.1383 17.87 11.6131 17.5771 11.9059L13.0021 16.4776C12.8646 16.644 12.6566 16.75 12.4239 16.75Z"
								/><path
									d="M5.17188 16C5.17188 15.5858 4.83609 15.25 4.42188 15.25C4.00766 15.25 3.67188 15.5858 3.67188 16V18.5C3.67188 19.7426 4.67923 20.75 5.92188 20.75H18.9227C20.1654 20.75 21.1727 19.7426 21.1727 18.5V16C21.1727 15.5858 20.837 15.25 20.4227 15.25C20.0085 15.25 19.6727 15.5858 19.6727 16V18.5C19.6727 18.9142 19.337 19.25 18.9227 19.25H5.92188C5.50766 19.25 5.17188 18.9142 5.17188 18.5V16Z"
								/></svg
							>
						</span>
						<span>Save</span>
					</button>
					<button class="action-btn secondary" onclick={shareImage}>
						<span class="icon"
							><svg
								fill="currentColor"
								width="80"
								height="80"
								viewBox="0 0 25 25"
								xmlns="http://www.w3.org/2000/svg"
								transform="rotate(0 0 0)"
								><path
									d="M15.0928 2.37789C14.8783 2.1634 14.5558 2.09923 14.2755 2.21532C13.9952 2.3314 13.8125 2.60488 13.8125 2.90823V6.75455C7.39629 7.14206 2.3125 12.4683 2.3125 18.982C2.3125 19.8676 2.4066 20.7321 2.58563 21.5657C2.65986 21.9113 2.96538 22.1582 3.31891 22.1582C3.67244 22.1582 3.97796 21.9113 4.05219 21.5657C5.04239 16.955 8.99081 13.4426 13.8125 13.1102V16.9082C13.8125 17.2116 13.9952 17.4851 14.2755 17.6011C14.5558 17.7172 14.8783 17.6531 15.0928 17.4386L22.0929 10.4386C22.2335 10.2979 22.3125 10.1071 22.3125 9.90823C22.3125 9.70932 22.2335 9.51855 22.0929 9.3779L15.0928 2.37789Z"
								/></svg
							></span
						>
						<span>Share</span>
					</button>
				</div>

				<div class="qr-section">
					{#await qrPageUrlDataUrl then dataUrl}
						<figure class="qr-figure">
							<img src={dataUrl} alt="QR Code" class="qr-code" style="--size: ${qrCodeSize}px;" />
							<figcaption>Scan to share this photo</figcaption>
						</figure>
					{/await}
				</div>

				<div class="attribution">
					<p>Powered by <a href="/" target="_blank">IA Event Pics</a></p>
				</div>
			{/if}
		</main>
	</div>
</div>

<style>
	.attribution a {
		text-decoration: underline;
	}

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
		border: 2px solid var(--text-primary);
		background: transparent;
		color: var(--text-surface-primary);
		transition: var(--transition-base);
		cursor: pointer;
		.icon svg {
			height: 32px;
			width: 32px;
		}
	}

	.action-btn.primary {
		background: var(--color-primary);
		color: var(--text-primary);
	}

	.action-btn.secondary {
		background: var(--color-secondary);
		color: var(--text-secondary);
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
		width: var(--size);
		aspect-ratio: 1;
		max-width: calc(100vw - 6rem);
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
