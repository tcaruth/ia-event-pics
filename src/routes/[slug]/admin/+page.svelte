<script>
	console.log('admin page');
	/** @type {{ data: import('./$types').PageData, form: import('./$types').ActionData }} */
	let { data, form } = $props();

	import { enhance } from '$app/forms';
	import JSZip from 'jszip';
	import CaptureAnalytics from '$lib/CaptureAnalytics.svelte';
	import { groupPhotosByComposite } from '$lib/analytics';

	let isDownloading = $state(false);
	let downloadProgress = $state('');

	/** @type {HTMLDialogElement | undefined} */
	let deleteDialog = $state(undefined);
	/** @type {HTMLDialogElement | undefined} */
	let printDialog = $state(undefined);
	/** @type {HTMLDialogElement | undefined} */
	let rawPhotosDialog = $state(undefined);
	/** @type {HTMLDialogElement | undefined} */
	let deleteBatchDialog = $state(undefined);
	/** @type {HTMLDialogElement | undefined} */
	let downloadDialog = $state(undefined);
	/** @type {HTMLDialogElement | undefined} */
	let printBatchDialog = $state(undefined);

	/** @type {import('$lib/events.server').EventImage | null} */
	let imageToDelete = $state(null);
	/** @type {import('$lib/events.server').EventImage | null} */
	let imageToPrint = $state(null);
	/** @type {any | null} */
	let selectedGroupForRaws = $state(null);

	let photoGroups = $derived(groupPhotosByComposite(data.images || [], data.event?.captures));

	/** @type {string[]} */
	let selectedKeys = $state([]);

	// Deletion options
	let deleteAssociatedRaws = $state(true);
	let deleteStandaloneRaws = $state(false);

	// Download options
	let downloadIncludeAssociatedRaws = $state(false);
	let downloadIncludeStandaloneRaws = $state(false);

	let allSelectableKeys = $derived(
		[
			...photoGroups.groups.map((g) => g.composite.key),
			...photoGroups.standaloneRaws.map((r) => r.key)
		].filter(Boolean)
	);

	let isAllSelected = $derived(
		allSelectableKeys.length > 0 && allSelectableKeys.every((k) => selectedKeys.includes(k))
	);

	let selectedCompositeGroups = $derived(
		photoGroups.groups.filter((g) => selectedKeys.includes(g.composite.key))
	);

	let selectedStandaloneRawPhotos = $derived(
		photoGroups.standaloneRaws.filter((r) => selectedKeys.includes(r.key))
	);

	let associatedRawKeys = $derived(
		selectedCompositeGroups.flatMap((g) => (g.rawPhotos || []).map((r) => r.key).filter(Boolean))
	);

	let allStandaloneRawKeys = $derived(
		photoGroups.standaloneRaws.map((r) => r.key).filter(Boolean)
	);

	let computedKeysToDelete = $derived(() => {
		const set = new Set(selectedKeys);
		if (deleteAssociatedRaws) {
			for (const key of associatedRawKeys) {
				set.add(key);
			}
		}
		if (deleteStandaloneRaws) {
			for (const key of allStandaloneRawKeys) {
				set.add(key);
			}
		}
		return Array.from(set);
	});

	let downloadScopeIsSelection = $derived(selectedKeys.length > 0);

	let availableAssociatedRawsForDownload = $derived(() => {
		if (downloadScopeIsSelection) {
			return selectedCompositeGroups.flatMap((g) => g.rawPhotos || []);
		}
		return photoGroups.groups.flatMap((g) => g.rawPhotos || []);
	});

	let imagesToDownloadList = $derived(() => {
		const result = new Map();

		if (downloadScopeIsSelection) {
			// Include selected images
			for (const img of data.images || []) {
				if (selectedKeys.includes(img.key) && img?.url) {
					result.set(img.key || img.url, img);
				}
			}
			// Include associated raws if requested
			if (downloadIncludeAssociatedRaws) {
				for (const raw of availableAssociatedRawsForDownload()) {
					if (raw?.url) result.set(raw.key || raw.url, raw);
				}
			}
			// Include standalone raws if requested
			if (downloadIncludeStandaloneRaws) {
				for (const raw of photoGroups.standaloneRaws) {
					if (raw?.url) result.set(raw.key || raw.url, raw);
				}
			}
		} else {
			// All composites
			for (const group of photoGroups.groups) {
				const comp = group.composite;
				if (comp?.url) result.set(comp.key || comp.url, comp);
			}
			// Include associated raws if requested
			if (downloadIncludeAssociatedRaws) {
				for (const raw of availableAssociatedRawsForDownload()) {
					if (raw?.url) result.set(raw.key || raw.url, raw);
				}
			}
			// Include standalone raws if requested
			if (downloadIncludeStandaloneRaws) {
				for (const raw of photoGroups.standaloneRaws) {
					if (raw?.url) result.set(raw.key || raw.url, raw);
				}
			}
		}

		return Array.from(result.values());
	});

	/** @param {string} key */
	function isSelected(key) {
		return selectedKeys.includes(key);
	}

	/** @param {string} key */
	function toggleSelect(key) {
		if (selectedKeys.includes(key)) {
			selectedKeys = selectedKeys.filter((k) => k !== key);
		} else {
			selectedKeys = [...selectedKeys, key];
		}
	}

	function toggleSelectAll() {
		if (isAllSelected) {
			selectedKeys = [];
		} else {
			selectedKeys = [...allSelectableKeys];
		}
	}

	function confirmDeleteBatch() {
		if (selectedKeys.length === 0) return;
		deleteAssociatedRaws = true;
		deleteStandaloneRaws = selectedStandaloneRawPhotos.length > 0;
		deleteBatchDialog?.showModal();
	}

	function closeDeleteBatchDialog() {
		deleteBatchDialog?.close();
	}

	function openDownloadDialog() {
		downloadIncludeAssociatedRaws = false;
		downloadIncludeStandaloneRaws = downloadScopeIsSelection && selectedStandaloneRawPhotos.length > 0;
		downloadDialog?.showModal();
	}

	function closeDownloadDialog() {
		downloadDialog?.close();
	}

	/** @param {import('$lib/events.server').EventImage} image */
	function confirmDelete(image) {
		imageToDelete = image;
		deleteDialog?.showModal();
	}

	function closeDeleteDialog() {
		deleteDialog?.close();
		imageToDelete = null;
	}

	/** @param {import('$lib/events.server').EventImage} image */
	function confirmPrint(image) {
		imageToPrint = image;
		printDialog?.showModal();
	}

	function closePrintDialog() {
		printDialog?.close();
		imageToPrint = null;
	}

	let selectedPrintImages = $derived(
		(data.images || []).filter((img) => selectedKeys.includes(img.key || img.fullPath))
	);

	function openPrintBatchDialog() {
		if (selectedPrintImages.length === 0) return;
		printBatchDialog?.showModal();
	}

	function closePrintBatchDialog() {
		printBatchDialog?.close();
	}

	function selectedPrintPayload() {
		return selectedPrintImages.map((img) => ({
			fullPath: img.key || img.fullPath,
			assetUrl: img.url,
			imageName: img.name || ''
		}));
	}

	/** @param {any} group */
	function openRawPhotos(group) {
		selectedGroupForRaws = group;
		rawPhotosDialog?.showModal();
	}

	function closeRawPhotos() {
		rawPhotosDialog?.close();
		selectedGroupForRaws = null;
	}

	async function executeDownload() {
		const imagesToDownload = imagesToDownloadList();
		if (imagesToDownload.length === 0) {
			alert('No images to download.');
			return;
		}

		closeDownloadDialog();
		if (isDownloading) return;
		isDownloading = true;
		downloadProgress = `Preparing ${imagesToDownload.length} photos...`;

		try {
			const zip = new JSZip();
			const total = imagesToDownload.length;
			const eventSlug = (data.event?.name || 'event')
				.toLowerCase()
				.replace(/[^a-z0-9]/g, '-')
				.replace(/-+/g, '-')
				.replace(/^-|-$/g, '');

			let completed = 0;
			const CONCURRENCY_LIMIT = 5;
			const chunks = [];

			for (let i = 0; i < imagesToDownload.length; i += CONCURRENCY_LIMIT) {
				chunks.push(imagesToDownload.slice(i, i + CONCURRENCY_LIMIT));
			}

			const usedFilenames = new Set();

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

						const timestamp = image.created
							? new Date(image.created)
									.toISOString()
									.replace(/[:.]/g, '-')
									.replace('T', '_')
									.split('Z')[0]
							: 'photo';

						let suffix = '';
						if (image.name) {
							suffix = image.name.toLowerCase().includes('raw') ? '_raw' : '_overlaid';
						}

						const ext = image.name?.split('.').pop() || 'jpg';
						const baseFilename = image.name || `${eventSlug}_${timestamp}${suffix}.${ext}`;

						let uniqueFilename = baseFilename;
						let counter = 1;
						while (usedFilenames.has(uniqueFilename)) {
							const nameWithoutExt = baseFilename.replace(/\.[^/.]+$/, '');
							uniqueFilename = `${nameWithoutExt}_${counter}.${ext}`;
							counter++;
						}
						usedFilenames.add(uniqueFilename);

						zip.file(uniqueFilename, blob);
						completed++;
						downloadProgress = `Downloading image ${completed} of ${total}...`;
					})
				);
			}

			downloadProgress = 'Compressing ZIP archive...';
			const content = await zip.generateAsync({ type: 'blob' });

			const link = document.createElement('a');
			link.href = URL.createObjectURL(content);
			const dateStr = new Date().toISOString().split('T')[0];
			const zipName = downloadScopeIsSelection
				? `${eventSlug}_selected_${total}_${dateStr}.zip`
				: `${eventSlug}_all_${dateStr}.zip`;
			link.download = zipName;
			link.click();

			downloadProgress = `Downloaded ${total} photo${total === 1 ? '' : 's'}!`;
			setTimeout(() => {
				downloadProgress = '';
			}, 3500);
		} catch (error) {
			console.error('Batch download failed:', error);
			alert(
				'Failed to download images: ' +
					(error instanceof Error ? error.message : 'An unknown error occurred')
			);
			downloadProgress = '';
		} finally {
			isDownloading = false;
		}
	}
</script>

<div class="admin-container">
	<div class="admin-header">
		<h1>Admin Dashboard</h1>
	</div>

	<CaptureAnalytics images={data.images} />

	{#if form?.error}
		<div class="alert alert-error">
			{form.error}
		</div>
	{/if}

	{#if form?.success}
		<div class="alert alert-success">{form.message || 'Image deleted successfully.'}</div>
	{/if}

	<div class="unified-toolbar">
		<div class="toolbar-left">
			<label class="select-all-label">
				<input
					type="checkbox"
					checked={isAllSelected}
					onchange={toggleSelectAll}
					disabled={allSelectableKeys.length === 0}
				/>
				<span>Select All ({allSelectableKeys.length})</span>
			</label>
			{#if selectedKeys.length > 0}
				<span class="selected-pill">{selectedKeys.length} selected</span>
				<button
					type="button"
					class="clear-selection-btn"
					onclick={() => (selectedKeys = [])}
				>
					Deselect All
				</button>
			{/if}
		</div>

		<div class="toolbar-right">
			<button
				type="button"
				class="download-btn"
				onclick={openDownloadDialog}
				disabled={isDownloading || !data.images?.length}
			>
				{#if isDownloading}
					Preparing ZIP...
				{:else if selectedKeys.length > 0}
					⬇️ Download Selected ({selectedKeys.length})
				{:else}
					⬇️ Download (ZIP)
				{/if}
			</button>

			<button
				type="button"
				class="batch-print-btn"
				onclick={openPrintBatchDialog}
				disabled={selectedKeys.length === 0 || !data.event?.isPhotoboothActive}
				title={!data.event?.isPhotoboothActive
					? 'Photobooth must be active and assigned to this event to print'
					: selectedKeys.length === 0
						? 'Select photos to print'
						: `Send ${selectedKeys.length} selected photo${selectedKeys.length === 1 ? '' : 's'} to photobooth printer`}
			>
				{#if selectedKeys.length > 0}
					🖨️ Print Selected ({selectedKeys.length})
				{:else}
					🖨️ Print Selected
				{/if}
			</button>

			<button
				type="button"
				class="batch-delete-btn"
				onclick={confirmDeleteBatch}
				disabled={selectedKeys.length === 0}
			>
				🗑️ Delete Selected ({selectedKeys.length})
			</button>
		</div>
	</div>

	{#if downloadProgress}
		<div class="progress-banner">
			<span class="progress-spinner"></span>
			<span>{downloadProgress}</span>
		</div>
	{/if}

	<div class="image-grid">
		{#each photoGroups.groups as group}
			{@const image = group.composite}
			<div class="image-card" class:is-selected={isSelected(image.key)}>
				<label class="card-select-label" title="Select photo">
					<input
						type="checkbox"
						checked={isSelected(image.key)}
						onchange={() => toggleSelect(image.key)}
					/>
					<span class="custom-checkbox"></span>
				</label>
				<a
					href={image.url}
					target="_blank"
					rel="noopener noreferrer"
					class="image-wrapper"
					title="Open direct Sanity image"
				>
					<img src={image.url} alt={image.name} loading="lazy" />
				</a>
				<div class="card-content">
					<p class="image-name" title={image.name}>{image.name}</p>
					<div class="card-actions">
						{#if data.event?.isPhotoboothActive}
							<button type="button" class="print-btn" onclick={() => confirmPrint(image)}>
								Print
							</button>
						{/if}
						<button type="button" class="delete-btn" onclick={() => confirmDelete(image)}>
							Delete
						</button>
					</div>

					{#if group.rawPhotos.length > 0}
						<button
							type="button"
							class="raw-shots-btn"
							onclick={() => openRawPhotos(group)}
						>
							📷 Raw Shots ({group.rawPhotos.length})
						</button>
					{/if}
				</div>
			</div>
		{/each}

		{#each photoGroups.standaloneRaws as rawImage}
			<div class="image-card standalone-raw" class:is-selected={isSelected(rawImage.key)}>
				<label class="card-select-label" title="Select photo">
					<input
						type="checkbox"
						checked={isSelected(rawImage.key)}
						onchange={() => toggleSelect(rawImage.key)}
					/>
					<span class="custom-checkbox"></span>
				</label>
				<a
					href={rawImage.url}
					target="_blank"
					rel="noopener noreferrer"
					class="image-wrapper"
					title="Open direct Sanity image"
				>
					<img src={rawImage.url} alt={rawImage.name} loading="lazy" />
				</a>
				<div class="card-content">
					<p class="image-name" title={rawImage.name}>{rawImage.name}</p>
					<span class="standalone-badge">Standalone Raw</span>
					<div class="card-actions">
						{#if data.event?.isPhotoboothActive}
							<button type="button" class="print-btn" onclick={() => confirmPrint(rawImage)}>
								Print
							</button>
						{/if}
						<button type="button" class="delete-btn" onclick={() => confirmDelete(rawImage)}>
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
				<button type="button" class="btn-secondary" onclick={closeDeleteDialog}>Cancel</button>
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

	<dialog bind:this={printDialog} class="confirm-dialog">
		<div class="dialog-content">
			<h2>Confirm Print Job</h2>
			<p>Are you sure you want to send <strong>{imageToPrint?.name}</strong> to the photobooth printer?</p>

			<div class="dialog-actions">
				<button type="button" class="btn-secondary" onclick={closePrintDialog}>Cancel</button>
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

	<dialog bind:this={printBatchDialog} class="confirm-dialog">
		<div class="dialog-content">
			<h2>Confirm Batch Print Job</h2>
			<p>
				Are you sure you want to send <strong>{selectedPrintImages.length}</strong> photo{selectedPrintImages.length === 1 ? '' : 's'} to the photobooth printer?
			</p>

			<div class="dialog-actions">
				<button type="button" class="btn-secondary" onclick={closePrintBatchDialog}>Cancel</button>
				<form
					method="POST"
					action="?/printBatch"
					use:enhance={() => {
						return async ({ result, update }) => {
							closePrintBatchDialog();
							if (result.type === 'success') {
								await update();
							}
						};
					}}
				>
					<input type="hidden" name="images" value={JSON.stringify(selectedPrintPayload())} />
					<!-- svelte-ignore a11y_autofocus -->
					<button type="submit" class="btn-primary" autofocus>
						Yes, Print {selectedPrintImages.length} Photo{selectedPrintImages.length === 1 ? '' : 's'}
					</button>
				</form>
			</div>
		</div>
	</dialog>

	<dialog bind:this={rawPhotosDialog} class="confirm-dialog raw-modal">
		<div class="dialog-content raw-dialog-content">
			<div class="modal-header">
				<h2>Raw Captures ({selectedGroupForRaws?.rawPhotos?.length || 0})</h2>
				<button type="button" class="close-btn" onclick={closeRawPhotos}>✕</button>
			</div>
			<p class="modal-sub">Nested under {selectedGroupForRaws?.composite?.name}</p>

			<div class="raw-photos-grid">
				{#each selectedGroupForRaws?.rawPhotos || [] as rawImg}
					<div class="raw-photo-card" class:is-selected={isSelected(rawImg.key)}>
						<label class="card-select-label raw-select-label" title="Select photo">
							<input
								type="checkbox"
								checked={isSelected(rawImg.key)}
								onchange={() => toggleSelect(rawImg.key)}
							/>
							<span class="custom-checkbox"></span>
						</label>
						<a
							href={rawImg.url}
							target="_blank"
							rel="noopener noreferrer"
							class="raw-img-wrapper"
							title="Open direct Sanity image"
						>
							<img src={rawImg.url} alt={rawImg.name} loading="lazy" />
						</a>
						<div class="raw-card-body">
							<p class="raw-name" title={rawImg.name}>{rawImg.name}</p>
							<div class="card-actions">
								{#if data.event?.isPhotoboothActive}
									<button type="button" class="print-btn" onclick={() => confirmPrint(rawImg)}>
										Print
									</button>
								{/if}
								<button type="button" class="delete-btn" onclick={() => confirmDelete(rawImg)}>
									Delete
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<div class="dialog-actions">
				{#if selectedKeys.length > 0 && data.event?.isPhotoboothActive}
					<button
						type="button"
						class="btn-print"
						onclick={() => {
							closeRawPhotos();
							openPrintBatchDialog();
						}}
					>
						Print Selected ({selectedKeys.length})
					</button>
				{/if}
				{#if selectedKeys.length > 0}
					<button
						type="button"
						class="btn-danger"
						onclick={() => {
							closeRawPhotos();
							confirmDeleteBatch();
						}}
					>
						Delete Selected ({selectedKeys.length})
					</button>
				{/if}
				<button type="button" class="btn-secondary" onclick={closeRawPhotos}>Close</button>
			</div>
		</div>
	</dialog>

	<dialog bind:this={downloadDialog} class="confirm-dialog download-modal">
		<div class="dialog-content">
			<div class="modal-header">
				<h2>Download Photos (ZIP)</h2>
				<button type="button" class="close-btn" onclick={closeDownloadDialog}>✕</button>
			</div>

			<p class="modal-sub">
				{#if downloadScopeIsSelection}
					Packaging <strong>{selectedKeys.length} selected photo{selectedKeys.length === 1 ? '' : 's'}</strong>:
				{:else}
					Packaging <strong>all {photoGroups.groups.length} composite photo{photoGroups.groups.length === 1 ? '' : 's'}</strong> in this event:
				{/if}
			</p>

			<div class="delete-options">
				{#if availableAssociatedRawsForDownload().length > 0}
					<label class="option-row">
						<input type="checkbox" bind:checked={downloadIncludeAssociatedRaws} />
						<span class="option-label">
							Include associated raw camera captures
							<span class="option-sub">
								({availableAssociatedRawsForDownload().length} capture{availableAssociatedRawsForDownload().length === 1 ? '' : 's'})
							</span>
						</span>
					</label>
				{/if}

				{#if allStandaloneRawKeys.length > 0}
					<label class="option-row">
						<input type="checkbox" bind:checked={downloadIncludeStandaloneRaws} />
						<span class="option-label">
							Include standalone raw photos
							<span class="option-sub">
								({allStandaloneRawKeys.length} standalone photo{allStandaloneRawKeys.length === 1 ? '' : 's'} in event)
							</span>
						</span>
					</label>
				{/if}
			</div>

			<div class="total-download-summary">
				Total files in ZIP: <strong>{imagesToDownloadList().length}</strong>
			</div>

			<div class="dialog-actions">
				<button type="button" class="btn-secondary" onclick={closeDownloadDialog}>Cancel</button>
				<button
					type="button"
					class="btn-primary"
					onclick={executeDownload}
					disabled={isDownloading || imagesToDownloadList().length === 0}
				>
					{isDownloading ? 'Preparing ZIP...' : `Download ${imagesToDownloadList().length} Photo${imagesToDownloadList().length === 1 ? '' : 's'}`}
				</button>
			</div>
		</div>
	</dialog>

	<dialog bind:this={deleteBatchDialog} class="confirm-dialog batch-modal">
		<div class="dialog-content">
			<h2>Confirm Batch Deletion</h2>
			<p>
				You have selected <strong>{selectedKeys.length} item{selectedKeys.length === 1 ? '' : 's'}</strong> for deletion:
			</p>

			<ul class="selection-breakdown">
				{#if selectedCompositeGroups.length > 0}
					<li>
						<strong>{selectedCompositeGroups.length}</strong> composite photo{selectedCompositeGroups.length === 1 ? '' : 's'}
					</li>
				{/if}
				{#if selectedStandaloneRawPhotos.length > 0}
					<li>
						<strong>{selectedStandaloneRawPhotos.length}</strong> standalone raw photo{selectedStandaloneRawPhotos.length === 1 ? '' : 's'}
					</li>
				{/if}
			</ul>

			<div class="delete-options">
				{#if associatedRawKeys.length > 0}
					<label class="option-row">
						<input type="checkbox" bind:checked={deleteAssociatedRaws} />
						<span class="option-label">
							Delete raw capture photos associated with selected composites
							<span class="option-sub">({associatedRawKeys.length} capture{associatedRawKeys.length === 1 ? '' : 's'} across {selectedCompositeGroups.length} composite{selectedCompositeGroups.length === 1 ? '' : 's'})</span>
						</span>
					</label>
				{/if}

				{#if allStandaloneRawKeys.length > 0}
					<label class="option-row">
						<input type="checkbox" bind:checked={deleteStandaloneRaws} />
						<span class="option-label">
							Delete standalone raw photos
							<span class="option-sub">({allStandaloneRawKeys.length} standalone photo{allStandaloneRawKeys.length === 1 ? '' : 's'} in event)</span>
						</span>
					</label>
				{/if}
			</div>

			<div class="total-delete-summary">
				Total photos to delete: <strong>{computedKeysToDelete().length}</strong>
			</div>

			<p class="warning-text">This action is permanent and cannot be undone.</p>

			<div class="dialog-actions">
				<button type="button" class="btn-secondary" onclick={closeDeleteBatchDialog}>Cancel</button>
				<form
					method="POST"
					action="?/deleteBatch"
					use:enhance={() => {
						return async ({ result, update }) => {
							closeDeleteBatchDialog();
							if (result.type === 'success') {
								selectedKeys = [];
								await update();
							}
						};
					}}
				>
					<input type="hidden" name="keys" value={JSON.stringify(computedKeysToDelete())} />
					<!-- svelte-ignore a11y_autofocus -->
					<button type="submit" class="btn-danger" autofocus>
						Yes, Delete {computedKeysToDelete().length} Photo{computedKeysToDelete().length === 1 ? '' : 's'}
					</button>
				</form>
			</div>
		</div>
	</dialog>
</div>

<style>
	.admin-container {
		padding: 2rem 0;
	}

	.admin-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 2rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.admin-header h1 {
		font-size: 2rem;
		font-weight: 700;
		margin: 0;
		color: var(--text-surface-primary, #f8fafc);
	}

	.unified-toolbar {
		position: sticky;
		top: 1rem;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.5rem;
		background: rgba(30, 41, 59, 0.95);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		padding: 0.875rem 1.25rem;
		border-radius: 0.75rem;
		border: 1px solid var(--border-color);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
		flex-wrap: wrap;
		gap: 1rem;
	}

	.toolbar-left,
	.toolbar-right {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.select-all-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		color: var(--text-surface-primary, #f8fafc);
	}

	.select-all-label input[type='checkbox'] {
		width: 1.125rem;
		height: 1.125rem;
		cursor: pointer;
		accent-color: var(--color-primary, #3b82f6);
	}

	.selected-pill {
		font-size: 0.75rem;
		background: var(--color-primary, #3b82f6);
		color: white;
		padding: 0.2rem 0.5rem;
		border-radius: 9999px;
		font-weight: 600;
	}

	.clear-selection-btn {
		background: transparent;
		border: none;
		color: var(--text-surface-secondary, #94a3b8);
		font-size: 0.8125rem;
		text-decoration: underline;
		cursor: pointer;
	}

	.clear-selection-btn:hover {
		color: var(--text-surface-primary, #f8fafc);
	}

	.download-btn {
		padding: 0.625rem 1.25rem;
		background-color: var(--color-primary, #0153a4);
		color: var(--text-primary, #ffffff);
		border: none;
		border-radius: 0.5rem;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.download-btn:hover:not(:disabled) {
		opacity: 0.9;
	}

	.download-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.batch-print-btn {
		padding: 0.625rem 1.25rem;
		background-color: #4f46e5;
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: background-color 0.2s, opacity 0.2s;
	}

	.batch-print-btn:hover:not(:disabled) {
		background-color: #4338ca;
	}

	.batch-print-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.batch-delete-btn {
		padding: 0.625rem 1.25rem;
		background-color: #dc2626;
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: background-color 0.2s, opacity 0.2s;
	}

	.batch-delete-btn:hover:not(:disabled) {
		background-color: #b91c1c;
	}

	.batch-delete-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.progress-banner {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: rgba(59, 130, 246, 0.15);
		border: 1px solid rgba(59, 130, 246, 0.3);
		color: var(--text-surface-primary, #f8fafc);
		padding: 0.75rem 1.25rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		margin-bottom: 1.5rem;
	}

	.progress-spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: var(--color-primary, #3b82f6);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
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
		position: relative;
		background: var(--surface-secondary);
		border-radius: 0.75rem;
		overflow: hidden;
		box-shadow: var(--shadow-sm);
		border: 1px solid var(--border-color);
		transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
	}

	.image-card.is-selected,
	.raw-photo-card.is-selected {
		border-color: var(--color-primary, #3b82f6);
		box-shadow: 0 0 0 2px var(--color-primary, #3b82f6);
	}

	.card-select-label {
		position: absolute;
		top: 0.625rem;
		left: 0.625rem;
		z-index: 5;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.65);
		border-radius: 0.375rem;
		padding: 0.375rem;
		backdrop-filter: blur(4px);
		border: 1px solid rgba(255, 255, 255, 0.25);
		transition: background 0.2s;
	}

	.card-select-label:hover {
		background: rgba(0, 0, 0, 0.85);
	}

	.card-select-label input[type='checkbox'] {
		width: 1.125rem;
		height: 1.125rem;
		cursor: pointer;
		accent-color: var(--color-primary, #3b82f6);
		margin: 0;
	}

	.raw-select-label {
		top: 0.375rem;
		left: 0.375rem;
		padding: 0.25rem;
	}

	.image-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-md);
	}

	.image-wrapper {
		display: block;
		width: 100%;
		height: 200px;
		cursor: pointer;
	}

	.image-wrapper img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: opacity 0.2s ease;
	}

	.image-wrapper:hover img {
		opacity: 0.9;
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
		position: relative;
		background: var(--surface-secondary, #1e293b);
		border-radius: 0.5rem;
		overflow: hidden;
		border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.raw-img-wrapper {
		display: block;
		width: 100%;
		height: 130px;
		cursor: pointer;
	}

	.raw-img-wrapper img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: opacity 0.2s ease;
	}

	.raw-img-wrapper:hover img {
		opacity: 0.9;
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
	.btn-danger,
	.btn-print {
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

	.btn-print {
		background: #4f46e5;
		color: white;
	}

	.btn-print:hover {
		background: #4338ca;
	}

	.download-modal,
	.batch-modal {
		max-width: 540px;
		width: 95%;
	}

	.total-download-summary {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text-surface-primary, #f8fafc);
		background: rgba(59, 130, 246, 0.1);
		border: 1px solid rgba(59, 130, 246, 0.3);
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.selection-breakdown {
		margin: 0.75rem 0 1.25rem 1.25rem;
		padding: 0;
		font-size: 0.875rem;
		color: var(--text-surface-secondary, #94a3b8);
	}

	.selection-breakdown li {
		margin-bottom: 0.25rem;
	}

	.delete-options {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
		border-radius: 0.5rem;
		padding: 1rem;
		margin-bottom: 1.25rem;
	}

	.option-row {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		cursor: pointer;
	}

	.option-row input[type='checkbox'] {
		width: 1.125rem;
		height: 1.125rem;
		margin-top: 0.125rem;
		cursor: pointer;
		accent-color: var(--color-primary, #3b82f6);
		flex-shrink: 0;
	}

	.option-label {
		font-size: 0.875rem;
		color: var(--text-surface-primary, #f8fafc);
		line-height: 1.35;
	}

	.option-sub {
		display: block;
		font-size: 0.75rem;
		color: var(--text-surface-secondary, #94a3b8);
		margin-top: 0.125rem;
	}

	.total-delete-summary {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text-surface-primary, #f8fafc);
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		margin-bottom: 0.75rem;
	}
</style>
