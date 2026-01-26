<script>
  import { goto } from '$app/navigation';
  let eventCode = '';

  function handleSubmit() {
    if (eventCode) {
      goto(`/${eventCode}`);
    }
  }
</script>

<section class="find-event" id="find">
  <div class="container">
    <div class="card">
      <h2 class="title">Find Your Event</h2>
      <p class="subtitle">Enter your unique event code to view and download your memories.</p>
      <form class="form-container" on:submit|preventDefault={handleSubmit}>
        <input
          class="input"
          placeholder="e.g. WEDDING2024"
          type="text"
          bind:value={eventCode}
        />
        <button class="button" type="submit">
          Go to Event
        </button>
      </form>
    </div>
  </div>
</section>

<style>
  .find-event {
    padding: 6rem 0;
  }

  .container {
    max-width: 48rem;
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  .card {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 2.5rem;
    text-align: center;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  .dark .card {
    background-color: #0f172a;
    border-color: #1e293b;
  }

  .title {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: #475569;
    margin-bottom: 2rem;
  }

  .dark .subtitle {
    color: #94a3b8;
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
    background-color: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 1rem 1.5rem;
    text-align: center;
    font-weight: 700;
    letter-spacing: 0.1em;
    font-size: 1.125rem;
    text-transform: uppercase;
    transition: border-color 0.3s, box-shadow 0.3s;
  }

  .dark .input {
    background-color: #1e293b;
    border-color: #334155;
  }

  .input::placeholder {
    text-transform: none;
    font-weight: 400;
    letter-spacing: normal;
  }

  .input:focus {
    outline: none;
    border-color: #064e3b; /* primary color */
    box-shadow: 0 0 0 3px rgba(6, 78, 59, 0.2);
  }

  .button {
    width: 100%;
    background-color: #064e3b; /* primary color */
    color: white;
    padding: 1rem;
    border-radius: 0.75rem;
    font-weight: 700;
    transition: opacity 0.3s;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 6px -1px rgba(6, 78, 59, 0.1), 0 2px 4px -1px rgba(6, 78, 59, 0.06);
  }

  .button:hover {
    opacity: 0.9;
  }
</style>
