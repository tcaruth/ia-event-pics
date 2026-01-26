<script>
  import { theme } from '$lib/stores.js';

  function toggleTheme() {
    theme.update(current => (current === 'light' ? 'dark' : 'light'));
  }
</script>

<nav class="navbar">
  <div class="container">
    <div class="logo">
      <div class="logo-icon">
        <span class="material-symbols-outlined">camera</span>
      </div>
      <span class="logo-text">IA Event Pics</span>
    </div>
    <div class="nav-links">
      <a href="#pricing">Pricing</a>
      <a href="#features">Features</a>
      <a href="#gallery">Gallery</a>
      <button class="theme-toggle" on:click={toggleTheme}>
        <span class="material-symbols-outlined light-icon">dark_mode</span>
        <span class="material-symbols-outlined dark-icon">light_mode</span>
      </button>
      <a href="#book" class="button-primary">Book Now</a>
    </div>
  </div>
</nav>

<style>
  .navbar {
    position: sticky;
    top: 0;
    z-index: 50;
    background-color: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid #e2e8f0;
    transition: background-color 0.3s, border-color 0.3s;
  }

  .dark .navbar {
    background-color: rgba(15, 23, 42, 0.8);
    border-bottom: 1px solid #1e293b;
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
    background-color: #064e3b; /* primary color */
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
    color: inherit;
    text-decoration: none;
    transition: color 0.3s;
  }

  .nav-links a:hover {
    color: #064e3b; /* primary color */
  }

  .theme-toggle {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 9999px;
    transition: background-color 0.3s;
  }

  .theme-toggle:hover {
    background-color: #f1f5f9;
  }

  .dark .theme-toggle:hover {
    background-color: #1e293b;
  }

  .dark-icon {
    display: none;
  }

  .dark .light-icon {
    display: none;
  }

  .dark .dark-icon {
    display: block;
  }

  .button-primary {
    background-color: #064e3b; /* primary color */
    color: white;
    padding: 0.625rem 1.5rem;
    border-radius: 9999px;
    font-weight: 600;
    transition: opacity 0.3s;
  }

  .button-primary:hover {
    opacity: 0.9;
  }
</style>
