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
		background: var(--surface-secondary, #1e293b);
		padding: 2.5rem;
		border-radius: 1rem;
		border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
		width: 100%;
		max-width: 400px;
		color: var(--text-surface-primary, #f8fafc);
	}

	h1 {
		margin-top: 0;
		margin-bottom: 2rem;
		text-align: center;
		font-size: 1.75rem;
		color: var(--text-surface-primary, #f8fafc);
	}

	.error-message {
		background-color: rgba(239, 68, 68, 0.2);
		border: 1px solid #ef4444;
		color: #ef4444;
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
		color: var(--text-surface-secondary, #cbd5e1);
	}

	input {
		width: 100%;
		padding: 0.75rem;
		background: var(--surface-primary, #0f172a);
		color: var(--text-surface-primary, #f8fafc);
		border: 1px solid #475569;
		border-radius: 0.5rem;
		font-size: 1rem;
		box-sizing: border-box;
		transition: border-color 0.2s;
	}

	input:focus {
		outline: none;
		border-color: var(--color-primary, #3b82f6);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
	}

	button {
		width: 100%;
		padding: 0.75rem;
		background-color: var(--color-primary, #3b82f6);
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
