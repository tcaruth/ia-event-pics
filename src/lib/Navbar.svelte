<script>
  import { theme } from '$lib/stores.js';
  import { BOOKING_MAILTO_URL } from './config.js';

  function toggleTheme() {
    theme.update(current => (current === 'light' ? 'dark' : 'light'));
  }
</script>

<nav class="navbar">
  <div class="container">
    <a href="/" class="logo">
      <div class="logo-icon">
        <span class="material-symbols-outlined">camera</span>
      </div>
      <span class="logo-text">IA Event Pics</span>
    </a>
    <div class="nav-links">
      <a href="#pricing">Pricing</a>
      <a href="#features">Features</a>
      <a href="#gallery">Gallery</a>
      <button class="theme-toggle" onclick={toggleTheme} aria-label="Toggle dark mode">
        <span class="material-symbols-outlined light-icon">dark_mode</span>
        <span class="material-symbols-outlined dark-icon">light_mode</span>
      </button>
      <a href={BOOKING_MAILTO_URL} class="button-primary">Book Now</a>
    </div>
  </div>
</nav>

<style>
  .navbar {
    position: sticky;
    top: 0;
    z-index: 50;
    background-color: var(--navbar-bg);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border-color);
    transition: background-color 0.3s, border-color 0.3s;
  }

  .container {
    max-width: 80rem;
    margin: 0 auto;
    padding: 0 1.5rem;
    height: 5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .logo-icon {
    width: 2.5rem;
    height: 2.5rem;
    background-color: var(--primary);
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .logo-text {
    font-size: 1.25rem;
    font-weight: 800;
    letter-spacing: -0.05em;
  }

  .nav-links {
    display: none; /* Hidden on mobile by default */
  }

  @media (min-width: 768px) {
    .nav-links {
      display: flex;
      align-items: center;
      gap: 2rem;
      font-weight: 500;
    }
  }

  .nav-links a {
    color: var(--text-color);
    text-decoration: none;
    transition: color 0.3s;
  }

  .nav-links a:hover {
    color: var(--primary);
  }

  .theme-toggle {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 9999px;
    transition: background-color 0.3s;
    color: var(--text-color);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .theme-toggle:hover {
    background-color: var(--surface-color);
  }

  .dark-icon {
    display: none;
  }

  :global(html.dark) .light-icon {
    display: none;
  }

  :global(html.dark) .dark-icon {
    display: block;
  }

  .nav-links a.button-primary {
    background-color: var(--primary);
    color: white;
    padding: 0.625rem 1.5rem;
    border-radius: 9999px;
    font-weight: 600;
    transition: opacity 0.3s;
    text-decoration: none;
  }

  .nav-links a.button-primary:hover {
    color: white;
    opacity: 0.9;
  }
</style>
