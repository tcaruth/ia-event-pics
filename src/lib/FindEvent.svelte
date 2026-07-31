<script>
	import { goto } from '$app/navigation';

	let eventCode = $state('');
	let errorMsg = $state('');

	const sampleCodes = ['SMITH-WEDDING', 'CEDAR-FALLS-GALA'];

	function setSampleCode(code) {
		eventCode = code;
		errorMsg = '';
	}

	function handleSubmit(e) {
		e.preventDefault();
		const trimmed = eventCode.trim();
		if (!trimmed) {
			errorMsg = 'Please enter an event code';
			return;
		}
		errorMsg = '';
		const eventSlug = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '-');
		goto(`/${eventSlug}`);
	}
</script>

<section class="find-event" id="find">
	<div class="container">
		<div class="card">
			<div class="icon-header">
				<span class="material-symbols-outlined header-icon">search</span>
			</div>
			<h2 class="title">Find Your Event</h2>
			<p class="subtitle">Enter your unique event code to view and download your photos.</p>

			<form class="form-container" action="/" method="POST" onsubmit={handleSubmit}>
				<div class="input-wrapper">
					<input
						name="code"
						class="input"
						class:has-error={!!errorMsg}
						placeholder="e.g. SMITH-WEDDING"
						type="text"
						bind:value={eventCode}
						aria-label="Event Code"
					/>
					{#if errorMsg}
						<p class="error-text">{errorMsg}</p>
					{/if}
				</div>
				<button class="button" type="submit">
					<span>Go to Event</span>
					<span class="material-symbols-outlined">arrow_forward</span>
				</button>
			</form>

			<div class="samples">
				<span class="sample-label">Try sample codes:</span>
				<div class="chip-group">
					{#each sampleCodes as sample}
						<button type="button" class="chip" onclick={() => setSampleCode(sample)}>
							{sample}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.find-event {
		padding: 6rem 0;
		color: var(--text-color);
	}

	.container {
		max-width: 48rem;
		margin: 0 auto;
		padding: 0 1.5rem;
	}

	.card {
		background-color: var(--surface-color);
		border: 1px solid var(--border-color);
		border-radius: 1rem;
		padding: 3rem 2rem;
		text-align: center;
		box-shadow: var(--shadow-lg);
		position: relative;
	}

	.icon-header {
		width: 3.5rem;
		height: 3.5rem;
		background-color: var(--primary-light);
		color: var(--primary);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 1.5rem;
	}

	.header-icon {
		font-size: 2rem;
	}

	.title {
		font-size: 2.25rem;
		font-weight: 800;
		margin-bottom: 0.5rem;
	}

	.subtitle {
		color: var(--text-muted);
		margin-bottom: 2.5rem;
		font-size: 1.125rem;
	}

	.form-container {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		max-width: 26rem;
		margin: 0 auto 2rem;
	}

	.input-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.input {
		width: 100%;
		background-color: var(--bg-color);
		color: var(--text-color);
		border: 2px solid var(--border-color);
		border-radius: 0.75rem;
		padding: 1rem 1.5rem;
		text-align: center;
		font-weight: 700;
		letter-spacing: 0.08em;
		font-size: 1.125rem;
		text-transform: uppercase;
		transition: all 0.25s ease;
	}

	.input.has-error {
		border-color: #ef4444;
	}

	.input::placeholder {
		text-transform: none;
		font-weight: 400;
		letter-spacing: normal;
		color: var(--text-muted);
		opacity: 0.6;
	}

	.input:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 4px var(--primary-light);
	}

	.error-text {
		color: #ef4444;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.button {
		width: 100%;
		background-color: var(--primary);
		color: white;
		padding: 1rem 1.5rem;
		border-radius: 0.75rem;
		font-weight: 700;
		font-size: 1.125rem;
		transition: all 0.25s ease;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		box-shadow: var(--shadow-md);
	}

	.button:hover {
		background-color: var(--primary-hover);
		transform: translateY(-1px);
		box-shadow: var(--shadow-lg);
	}

	.samples {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding-top: 1rem;
		border-top: 1px dashed var(--border-color);
	}

	.sample-label {
		font-size: 0.875rem;
		color: var(--text-muted);
		font-weight: 500;
	}

	.chip-group {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.chip {
		background-color: var(--bg-color);
		color: var(--primary);
		border: 1px solid var(--border-color);
		padding: 0.35rem 0.85rem;
		border-radius: 9999px;
		font-size: 0.8125rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.chip:hover {
		border-color: var(--primary);
		background-color: var(--primary-light);
	}
</style>
