<script>
	import { goto } from '$app/navigation';
	let eventCode = '';

	function handleSubmit() {
		if (eventCode) {
			const eventSlug = eventCode.toLowerCase().replace(/[^a-z0-9]/g, '-');
			goto(`/${eventSlug}`);
		}
	}
</script>

<section class="find-event" id="find">
	<div class="container">
		<div class="card">
			<h2 class="title">Find Your Event</h2>
			<p class="subtitle">Enter your unique event code to view and download your memories.</p>
			<form class="form-container" on:submit|preventDefault={handleSubmit}>
				<input class="input" placeholder="e.g. SMITH-WEDDING" type="text" bind:value={eventCode} />
				<button class="button" type="submit"> Go to Event </button>
			</form>
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
		border-radius: 0.75rem;
		padding: 2.5rem;
		text-align: center;
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.05),
			0 4px 6px -2px rgba(0, 0, 0, 0.05);
	}

	.title {
		font-size: 2rem;
		font-weight: 800;
		margin-bottom: 0.5rem;
	}

	.subtitle {
		color: var(--text-muted);
		margin-bottom: 2rem;
	}

	.form-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 24rem;
		margin: 0 auto;
	}

	.input {
		width: 100%;
		background-color: var(--bg-color);
		color: var(--text-color);
		border: 1px solid var(--border-color);
		border-radius: 0.75rem;
		padding: 1rem 1.5rem;
		text-align: center;
		font-weight: 700;
		letter-spacing: 0.1em;
		font-size: 1.125rem;
		text-transform: uppercase;
		transition:
			border-color 0.3s,
			box-shadow 0.3s;
	}

	.input::placeholder {
		text-transform: none;
		font-weight: 400;
		letter-spacing: normal;
		color: var(--text-muted);
		opacity: 0.5;
	}

	.input:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 3px rgba(6, 78, 59, 0.2);
	}

	.button {
		width: 100%;
		background-color: var(--primary);
		color: white;
		padding: 1rem;
		border-radius: 0.75rem;
		font-weight: 700;
		transition: opacity 0.3s;
		border: none;
		cursor: pointer;
		box-shadow:
			0 4px 6px -1px rgba(6, 78, 59, 0.1),
			0 2px 4px -1px rgba(6, 78, 59, 0.06);
	}

	.button:hover {
		opacity: 0.9;
	}
</style>
