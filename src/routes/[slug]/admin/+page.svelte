<script>
	console.log('admin page');
	/** @type {import('./$types').PageData} */
	export let data;
	/** @type {import('./$types').ActionData} */
	export let form;
	import { enhance } from '$app/forms';
	import JSZip from 'jszip';
	import CaptureAnalytics from '$lib/CaptureAnalytics.svelte';
	import { groupPhotosByComposite } from '$lib/analytics';

	let isDownloading = false;
	let downloadProgress = '';

	/** @type {HTMLDialogElement} */
	let deleteDialog;
	/** @type {HTMLDialogElement} */
	let deleteAllDialog;
	/** @type {HTMLDialogElement} */
	let printDialog;
	/** @type {HTMLDialogElement} */
	let rawPhotosDialog;

	/** @type {import('$lib/events.server').EventImage | null} */
	let imageToDelete = null;
	/** @type {import('$lib/events.server').EventImage | null} */
	let imageToPrint = null;
	/** @type {any | null} */
	let selectedGroupForRaws = null;

	$: photoGroups = groupPhotosByComposite(data.images || []);

	/** @param {import('$lib/events.server').EventImage} image */
	function confirmDelete(image) {
		imageToDelete = image;
		deleteDialog.showModal();
	}

	function closeDeleteDialog() {
		deleteDialog.close();
		imageToDelete = null;
	}

	/** @param {import('$lib/events.server').EventImage} image */
	function confirmPrint(image) {
		imageToPrint = image;
		printDialog.showModal();
	}

	function closePrintDialog() {
		printDialog.close();
		imageToPrint = null;
	}

	function confirmDeleteAll() {
		deleteAllDialog.showModal();
	}

	function closeDeleteAllDialog() {
		deleteAllDialog.close();
	}

	/** @param {any} group */
	function openRawPhotos(group) {
		selectedGroupForRaws = group;
		rawPhotosDialog.showModal();
	}

	function closeRawPhotos() {
		rawPhotosDialog.close();
		selectedGroupForRaws = null;
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

	<CaptureAnalytics images={data.images} />

	{#if form?.error}
		<div class="alert alert-error">
			{form.error}
		</div>
	{/if}

	{#if form?.success}
		<div class="alert alert-success">{form.message || 'Image deleted successfully.'}</div>
	{/if}

	<div class="admin-actions">
		<button class="download-all-btn" on:click={downloadAll} disabled={isDownloading}>
			{isDownloading ? 'Preparing ZIP...' : 'Download All (ZIP)'}
		</button>
		<button
			class="delete-all-photos-btn"
			on:click={confirmDeleteAll}
			disabled={isDownloading || !data.images?.length}
		>
			Delete All Photos
		</button>
		{#if downloadProgress}
			<p class="progress-message">{downloadProgress}</p>
		{/if}
	</div>

	<div class="image-grid">
		{#each photoGroups.groups as group}
			{@const image = group.composite}
			<div class="image-card">
				<div class="image-wrapper">
					<img src={image.url} alt={image.name} loading="lazy" />
				</div>
				<div class="card-content">
					<p class="image-name" title={image.name}>{image.name}</p>
					<div class="card-actions">
						<button type="button" class="print-btn" on:click={() => confirmPrint(image)}>
							Print
						</button>
						<button type="button" class="delete-btn" on:click={() => confirmDelete(image)}>
							Delete
						</button>
					</div>

					{#if group.rawPhotos.length > 0}
						<button
							type="button"
							class="raw-shots-btn"
							on:click={() => openRawPhotos(group)}
						>
							📷 Raw Shots ({group.rawPhotos.length})
						</button>
					{/if}
				</div>
			</div>
		{/each}

		{#each photoGroups.standaloneRaws as rawImage}
			<div class="image-card standalone-raw">
				<div class="image-wrapper">
					<img src={rawImage.url} alt={rawImage.name} loading="lazy" />
				</div>
				<div class="card-content">
					<p class="image-name" title={rawImage.name}>{rawImage.name}</p>
					<span class="standalone-badge">Standalone Raw</span>
					<div class="card-actions">
						<button type="button" class="print-btn" on:click={() => confirmPrint(rawImage)}>
							Print
						</button>
						<button type="button" class="delete-btn" on:click={() => confirmDelete(rawImage)}>
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
					<!-- svelte-ignore a11y_autofocus -->
					<button type="submit" class="btn-danger" autofocus>Yes, Delete</button>
				</form>
			</div>
		</div>
	</dialog>

	<dialog bind:this={deleteAllDialog} class="confirm-dialog">
		<div class="dialog-content">
			<h2>Confirm Delete All</h2>
			<p>
				Are you sure you want to delete <strong>ALL {data.images?.length} photos</strong> for this event?
			</p>
			<p class="warning-text">This action is permanent and cannot be undone.</p>

			<div class="dialog-actions">
				<button type="button" class="btn-secondary" on:click={closeDeleteAllDialog}>Cancel</button>
				<form
					method="POST"
					action="?/deleteAll"
					use:enhance={() => {
						return async ({ result, update }) => {
							closeDeleteAllDialog();
							if (result.type === 'success') {
								await update();
							}
						};
					}}
				>
					<!-- svelte-ignore a11y_autofocus -->
					<button type="submit" class="btn-danger" autofocus>Yes, Delete All</button>
				</form>
			</div>
		</div>
	</dialog>

	<dialog bind:this={printDialog} class="confirm-dialog">
		<div class="dialog-content">
			<h2>Confirm Print Job</h2>
			<p>Are you sure you want to send <strong>{imageToPrint?.name}</strong> to the photobooth printer?</p>

			<div class="dialog-actions">
				<button type="button" class="btn-secondary" on:click={closePrintDialog}>Cancel</button>
				<form
					method="POST"
					action="?/print"
					use:enhance={() => {
						return async ({ result, update }) => {
							closePrintDialog();
							if (result.type === 'success') {
								await update();
							}
						};
					}}
				>
					<input type="hidden" name="fullPath" value={imageToPrint?.fullPath} />
					<input type="hidden" name="assetUrl" value={imageToPrint?.url} />
					<input type="hidden" name="imageName" value={imageToPrint?.name} />
					<!-- svelte-ignore a11y_autofocus -->
					<button type="submit" class="btn-primary" autofocus>Yes, Print</button>
				</form>
			</div>
		</div>
	</dialog>

	<dialog bind:this={rawPhotosDialog} class="confirm-dialog raw-modal">
		<div class="dialog-content raw-dialog-content">
			<div class="modal-header">
				<h2>Raw Captures ({selectedGroupForRaws?.rawPhotos?.length || 0})</h2>
				<button type="button" class="close-btn" on:click={closeRawPhotos}>✕</button>
			</div>
			<p class="modal-sub">Nested under {selectedGroupForRaws?.composite?.name}</p>

			<div class="raw-photos-grid">
				{#each selectedGroupForRaws?.rawPhotos || [] as rawImg}
					<div class="raw-photo-card">
						<div class="raw-img-wrapper">
							<img src={rawImg.url} alt={rawImg.name} loading="lazy" />
						</div>
						<div class="raw-card-body">
							<p class="raw-name" title={rawImg.name}>{rawImg.name}</p>
							<div class="card-actions">
								<button type="button" class="print-btn" on:click={() => confirmPrint(rawImg)}>
									Print
								</button>
								<button type="button" class="delete-btn" on:click={() => confirmDelete(rawImg)}>
									Delete
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<div class="dialog-actions">
				<button type="button" class="btn-secondary" on:click={closeRawPhotos}>Close</button>
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
		color: var(--text-surface-primary, #f8fafc);
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

	.delete-all-photos-btn {
		padding: 0.75rem 1.5rem;
		background-color: transparent;
		color: #ef4444;
		border: 1px solid #ef4444;
		border-radius: 0.5rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.delete-all-photos-btn:hover:not(:disabled) {
		background-color: #ef4444;
		color: white;
	}

	.delete-all-photos-btn:disabled {
		opacity: 0.5;
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

	.card-actions {
		display: flex;
		gap: 0.5rem;
	}

	.print-btn,
	.delete-btn {
		flex: 1;
		padding: 0.5rem;
		border: none;
		border-radius: 0.375rem;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.print-btn {
		background-color: var(--color-primary, #0153a4);
		color: white;
	}

	.print-btn:hover {
		filter: brightness(1.15);
	}

	.delete-btn {
		background-color: #dc2626;
		color: white;
	}

	.delete-btn:hover {
		background-color: #b91c1c;
	}

	.raw-shots-btn {
		width: 100%;
		margin-top: 0.75rem;
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.06);
		border: 1px dashed var(--border-color, rgba(255, 255, 255, 0.2));
		border-radius: 0.375rem;
		color: var(--text-surface-primary, #f8fafc);
		font-size: 0.8125rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.raw-shots-btn:hover {
		background: rgba(59, 130, 246, 0.2);
		border-color: var(--color-primary, #3b82f6);
	}

	.standalone-badge {
		display: inline-block;
		font-size: 0.6875rem;
		background: rgba(245, 158, 11, 0.2);
		color: #f59e0b;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		margin-bottom: 0.5rem;
		font-weight: 700;
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
		place-self: center;
	}

	.raw-modal {
		max-width: 720px;
		width: 95%;
	}

	.confirm-dialog::backdrop {
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
	}

	.dialog-content {
		padding: 2rem;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.375rem;
		color: var(--text-surface-primary, #f8fafc);
	}

	.close-btn {
		background: transparent;
		border: none;
		color: var(--text-surface-secondary, #94a3b8);
		font-size: 1.25rem;
		cursor: pointer;
	}

	.close-btn:hover {
		color: #ffffff;
	}

	.modal-sub {
		font-size: 0.8125rem;
		color: var(--text-surface-secondary, #94a3b8);
		margin: 0.25rem 0 1.25rem 0;
	}

	.raw-photos-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 1rem;
		max-height: 420px;
		overflow-y: auto;
		padding-right: 0.25rem;
	}

	.raw-photo-card {
		background: var(--surface-secondary, #1e293b);
		border-radius: 0.5rem;
		overflow: hidden;
		border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
	}

	.raw-img-wrapper {
		width: 100%;
		height: 130px;
	}

	.raw-img-wrapper img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.raw-card-body {
		padding: 0.625rem;
	}

	.raw-name {
		font-size: 0.75rem;
		color: var(--text-surface-secondary, #94a3b8);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-bottom: 0.5rem;
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
		margin-top: 1.5rem;
	}

	.btn-secondary,
	.btn-primary,
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

	.btn-primary {
		background: var(--color-primary, #0153a4);
		color: white;
	}

	.btn-primary:hover {
		filter: brightness(1.15);
	}

	.btn-danger {
		background: #dc2626;
		color: white;
	}

	.btn-danger:hover {
		background: #b91c1c;
	}
</style>
