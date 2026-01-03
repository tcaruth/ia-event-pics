<script>
	console.log('admin page');
	/** @type {import('./$types').PageData} */
	export let data;
	/** @type {import('./$types').ActionData} */
	export let form;
	import { enhance } from '$app/forms';
	import JSZip from 'jszip';

	let isDownloading = false;
	let downloadProgress = '';

	/** @type {HTMLDialogElement} */
	let deleteDialog;
	/** @type {import('$lib/events.server').EventImage | null} */
	let imageToDelete = null;

	/** @param {import('$lib/events.server').EventImage} image */
	function confirmDelete(image) {
		imageToDelete = image;
		deleteDialog.showModal();
	}

	function closeDeleteDialog() {
		deleteDialog.close();
		imageToDelete = null;
	}

	async function downloadAll() {
		if (isDownloading) return;
		isDownloading = true;
		downloadProgress = 'Fetching image list...';

		try {
			const response = await fetch(`/api/image-list?event=${data.slug}`);
			if (!response.ok) throw new Error('Failed to fetch image list');
			const images = await response.json();

			if (!images || images.length === 0) {
				alert('No images found to download.');
				return;
			}

			const zip = new JSZip();
			const total = images.length;
			const eventSlug = (data.event?.name || 'event')
				.toLowerCase()
				.replace(/[^a-z0-9]/g, '-')
				.replace(/-+/g, '-')
				.replace(/^-|-$/g, '');

			let completed = 0;
			const CONCURRENCY_LIMIT = 5;
			const chunks = [];

			for (let i = 0; i < images.length; i += CONCURRENCY_LIMIT) {
				chunks.push(images.slice(i, i + CONCURRENCY_LIMIT));
			}

			for (const chunk of chunks) {
				await Promise.all(
					chunk.map(async (/** @type {import('$lib/events.server').EventImage} */ image) => {
						const imgRes = await fetch(image.url);
						if (!imgRes.ok) {
							console.error(`Failed to download ${image.name}`);
							completed++;
							return;
						}
						const blob = await imgRes.blob();

						// Improved filename: event-name_timestamp_suffix.jpg
						const timestamp = new Date(image.created)
							.toISOString()
							.replace(/[:.]/g, '-')
							.replace('T', '_')
							.split('Z')[0];

						// Determine suffix based on name or presence of 'raw'
						let suffix = '';
						if (image.name) {
							suffix = image.name.toLowerCase().includes('raw') ? '_raw' : '_overlaid';
						}

						const ext = image.name?.split('.').pop() || 'jpg';
						const friendlyName = `${eventSlug}_${timestamp}${suffix}.${ext}`;

						zip.file(friendlyName, blob);
						completed++;
						downloadProgress = `Downloading image ${completed} of ${total}...`;
					})
				);
			}

			downloadProgress = 'Generating ZIP file...';
			const content = await zip.generateAsync({ type: 'blob' });

			const link = document.createElement('a');
			link.href = URL.createObjectURL(content);
			const dateStr = new Date().toISOString().split('T')[0];
			link.download = `${eventSlug}_${dateStr}.zip`;
			link.click();

			downloadProgress = 'Download complete!';
			setTimeout(() => {
				downloadProgress = '';
			}, 3000);
		} catch (error) {
			console.error('Batch download failed:', error);
			alert(
				'Failed to download images: ' +
					(error instanceof Error ? error.message : 'An unknown error occurred')
			);
		} finally {
			isDownloading = false;
		}
	}
</script>

<div class="admin-container">
	<h1>Admin Dashboard</h1>

	{#if form?.error}
		<div class="alert alert-error">
			{form.error}
		</div>
	{/if}

	{#if form?.success}
		<div class="alert alert-success">Image deleted successfully.</div>
	{/if}

	<div class="admin-actions">
		<button class="download-all-btn" on:click={downloadAll} disabled={isDownloading}>
			{isDownloading ? 'Preparing ZIP...' : 'Download All (ZIP)'}
		</button>
		{#if downloadProgress}
			<p class="progress-message">{downloadProgress}</p>
		{/if}
	</div>

	<div class="image-grid">
		{#each data.images as image}
			<div class="image-card">
				<div class="image-wrapper">
					<img src={image.url} alt={image.name} loading="lazy" />
				</div>
				<div class="card-content">
					<p class="image-name" title={image.name}>{image.name}</p>
					<div class="card-actions">
						<button type="button" class="delete-btn" on:click={() => confirmDelete(image)}>
							Delete
						</button>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<dialog bind:this={deleteDialog} class="confirm-dialog">
		<div class="dialog-content">
			<h2>Confirm Deletion</h2>
			<p>Are you sure you want to delete <strong>{imageToDelete?.name}</strong>?</p>
			<p class="warning-text">This action cannot be undone.</p>

			<div class="dialog-actions">
				<button type="button" class="btn-secondary" on:click={closeDeleteDialog}>Cancel</button>
				<form
					method="POST"
					action="?/delete"
					use:enhance={() => {
						return async ({ result, update }) => {
							closeDeleteDialog();
							if (result.type === 'success') {
								await update();
							}
						};
					}}
				>
					<input type="hidden" name="fullPath" value={imageToDelete?.fullPath} />
					<button type="submit" class="btn-danger">Yes, Delete</button>
				</form>
			</div>
		</div>
	</dialog>
</div>

<style>
	.admin-container {
		padding: 2rem 0;
	}

	h1 {
		font-size: 2rem;
		font-weight: 700;
		margin-bottom: 2rem;
		color: var(--color-primary);
	}

	.admin-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 2rem;
		background: var(--surface-secondary);
		padding: 1rem;
		border-radius: 0.75rem;
		border: 1px solid var(--border-color);
	}

	.download-all-btn {
		padding: 0.75rem 1.5rem;
		background-color: var(--color-primary);
		color: var(--text-primary);
		border: none;
		border-radius: 0.5rem;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.download-all-btn:hover:not(:disabled) {
		opacity: 0.9;
	}

	.download-all-btn:disabled {
		background-color: #9ca3af;
		cursor: not-allowed;
	}

	.progress-message {
		font-size: 0.875rem;
		color: var(--text-surface-secondary);
	}

	.alert {
		padding: 1rem;
		border-radius: 0.5rem;
		margin-bottom: 1.5rem;
		font-size: 0.875rem;
		border: 1px solid transparent;
	}

	.alert-error {
		background-color: rgba(239, 68, 68, 0.2);
		border-color: #ef4444;
		color: #ef4444;
	}

	.alert-success {
		background-color: rgba(34, 197, 94, 0.2);
		border-color: #22c55e;
		color: #22c55e;
	}

	.image-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.5rem;
	}

	.image-card {
		background: var(--surface-secondary);
		border-radius: 0.75rem;
		overflow: hidden;
		box-shadow: var(--shadow-sm);
		border: 1px solid var(--border-color);
		transition: transform 0.2s;
	}

	.image-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-md);
	}

	.image-wrapper {
		width: 100%;
		height: 200px;
	}

	.image-wrapper img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.card-content {
		padding: 1rem;
	}

	.image-name {
		font-size: 0.875rem;
		color: var(--text-surface-secondary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-bottom: 1rem;
	}

	.delete-btn {
		width: 100%;
		padding: 0.5rem;
		background-color: #dc2626;
		color: white;
		border: none;
		border-radius: 0.375rem;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.delete-btn:hover {
		background-color: #b91c1c;
	}

	.confirm-dialog {
		border: none;
		border-radius: 1rem;
		padding: 0;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
		max-width: 400px;
		width: 90%;
		background: var(--surface-primary);
		color: var(--text-surface-primary);
	}

	.confirm-dialog::backdrop {
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
	}

	.dialog-content {
		padding: 2rem;
	}

	.dialog-content h2 {
		margin-top: 0;
		font-size: 1.5rem;
		color: var(--text-surface-primary);
	}

	.warning-text {
		color: #ef4444;
		font-size: 0.875rem;
		font-weight: 500;
		margin-top: 0.5rem;
	}

	.dialog-actions {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 2rem;
	}

	.btn-secondary,
	.btn-danger {
		padding: 0.625rem 1.25rem;
		border-radius: 0.5rem;
		font-weight: 600;
		cursor: pointer;
		font-size: 0.875rem;
		border: 1px solid transparent;
	}

	.btn-secondary {
		background: var(--surface-secondary);
		border-color: var(--border-color);
		color: var(--text-surface-secondary);
	}

	.btn-secondary:hover {
		background: var(--surface-primary);
		color: var(--text-surface-primary);
	}

	.btn-danger {
		background: #dc2626;
		color: white;
	}

	.btn-danger:hover {
		background: #b91c1c;
	}
</style>
