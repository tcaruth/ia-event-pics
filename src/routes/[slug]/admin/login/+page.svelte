<script>
	export let form;
	console.log('login page');
</script>

<div class="login-container">
	<div class="login-card">
		<h1>Admin Login</h1>

		{#if form?.error}
			<div class="error-message">
				{form.error}
			</div>
		{/if}

		<form method="POST">
			<div class="form-group">
				<label for="password">Password</label>
				<input type="password" id="password" name="password" required />
			</div>
			<button type="submit"> Login </button>
		</form>
	</div>
</div>

<style>
	.login-container {
		min-height: 80vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.login-card {
		background: white;
		padding: 2.5rem;
		border-radius: 1rem;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 400px;
	}

	h1 {
		margin-top: 0;
		margin-bottom: 2rem;
		text-align: center;
		font-size: 1.75rem;
		color: var(--color-primary);
	}

	.error-message {
		background-color: #fee2e2;
		border: 1px solid #ef4444;
		color: #b91c1c;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		margin-bottom: 1.5rem;
		font-size: 0.875rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		font-size: 0.875rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: #374151;
	}

	input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 1rem;
		box-sizing: border-box;
		transition:
			border-color 0.2s,
			ring 0.2s;
	}

	input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(1, 83, 164, 0.1);
	}

	button {
		width: 100%;
		padding: 0.75rem;
		background-color: var(--color-primary);
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	button:hover {
		opacity: 0.9;
	}
</style>
