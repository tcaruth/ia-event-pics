<script>
	import { page } from '$app/stores';
	import QRCode from 'qrcode';
	export let data;

	const imageUrl = `${data.publicBucketRead}${data.slug}/${data.filename}`;

	let qrPageUrlDataUrl = QRCode.toDataURL($page.url.href, { errorCorrectionLevel: 'L' });

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
		const response = await fetch(imageUrl);
		const blob = await response.blob();
		const file = new File([blob], `${data.filename}`, { type: blob.type });

		if (navigator.canShare && navigator.canShare({ files: [file] })) {
			await navigator.share({
				files: [file]
			});
		} else if (navigator.canShare && navigator.canShare({ url: imageUrl, title: data.filename })) {
			navigator.share({ url: imageUrl, title: data.filename });
		} else {
			navigator.clipboard.writeText(imageUrl);
		}
	}
</script>

<div class="image-viewer">
	<div class="content">
		<a href="/{data.slug}" class="close">×</a>
		<img src={imageUrl} alt={data.filename} />

		<div class="actions">
			<button class="button" type="button" on:click={downloadImage}> Download </button>
			<button class="button" type="button" on:click={shareImage}> Share </button>
		</div>

		{#await qrPageUrlDataUrl then dataUrl}
			<figure class="qr-container">
				<img class="qrcode" src={dataUrl} alt="QR Code for the displayed photo" />
				<figcaption>Scan to share this image</figcaption>
			</figure>
		{/await}
	</div>
</div>

<style>
	.image-viewer {
		position: fixed;
		inset: 0;
		background: black;
		display: block;
		z-index: 1000;
		overflow-y: auto;
		padding: 4rem 1rem;
	}
	.content {
		position: relative;
		max-width: calc(100vw - 2rem);
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 2rem;
		align-items: center;
	}
	img {
		max-width: 100%;
		max-height: 80vh;
		object-fit: contain;
		border-radius: 0.5rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
	}
	.close {
		position: fixed;
		top: 1rem;
		right: 1rem;
		color: white;
		text-decoration: none;
		font-size: 2rem;
		line-height: 1;
		background: rgba(0, 0, 0, 0.5);
		width: 3rem;
		height: 3rem;
		display: grid;
		place-items: center;
		border-radius: 50%;
		z-index: 1001;
	}
	.actions {
		display: flex;
		gap: 1rem;
		width: 100%;
		justify-content: center;
	}
	.button {
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		border: 1px solid rgba(255, 255, 255, 0.3);
		color: white;
		background: rgba(255, 255, 255, 0.1);
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		flex: 1;
		max-width: 150px;
	}
	.button:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: translateY(-2px);
	}
	.qr-container {
		text-align: center;
		color: white;
		margin: 0;
		padding-bottom: 2rem;
	}
	.qrcode {
		margin: 0 auto 0.5rem;
		max-width: 150px;
		border-radius: 0.5rem;
		background: white;
		padding: 0.5rem;
	}
	figcaption {
		font-size: 0.9rem;
		opacity: 0.8;
	}
</style>
