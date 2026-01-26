<script>
  let isDark = false;

  function toggleDarkMode() {
    isDark = !isDark;
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }
</script>

<nav class="sticky top-0 z-50 bg-background/80 dark:bg-background/80 backdrop-blur-md border-b border-border-color">
  <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
        <span class="material-symbols-outlined">camera</span>
      </div>
      <span class="text-xl font-extrabold tracking-tight">IA Event Pics</span>
    </div>
    <div class="hidden md:flex items-center gap-8 font-medium">
      <a class="hover:text-primary transition-colors" href="#pricing">Pricing</a>
      <a class="hover:text-primary transition-colors" href="#features">Features</a>
      <a class="hover:text-primary transition-colors" href="#gallery">Gallery</a>
      <button class="p-2 rounded-full hover:bg-surface transition-colors" on:click={toggleDarkMode}>
        {#if isDark}
          <span class="material-symbols-outlined">light_mode</span>
        {:else}
          <span class="material-symbols-outlined">dark_mode</span>
        {/if}
      </button>
      <a class="bg-primary text-white px-6 py-2.5 rounded-full font-semibold hover:opacity-90 transition-opacity" href="#book">Book Now</a>
    </div>
  </div>
</nav>

<style>
  nav {
    background-color: hsla(var(--background) / 0.8);
    border-bottom: 1px solid var(--border-color);
    backdrop-filter: blur(10px);
  }
  .bg-primary {
    background-color: var(--primary);
  }
  .text-white {
    color: white;
  }
  .hover\:text-primary:hover {
    color: var(--primary);
  }
  .hover\:opacity-90:hover {
    opacity: 0.9;
  }
  .max-w-7xl {
    max-width: 80rem;
  }
  .mx-auto {
    margin-left: auto;
    margin-right: auto;
  }
  .px-6 {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
  .h-20 {
    height: 5rem;
  }
  .flex {
    display: flex;
  }
  .items-center {
    align-items: center;
  }
  .justify-between {
    justify-content: space-between;
  }
  .gap-2 {
    gap: 0.5rem;
  }
  .w-10 {
    width: 2.5rem;
  }
  .h-10 {
    height: 2.5rem;
  }
  .rounded-lg {
    border-radius: var(--radius-lg);
  }
  .justify-center {
    justify-content: center;
  }
  .text-xl {
    font-size: 1.25rem;
  }
  .font-extrabold {
    font-weight: 800;
  }
  .tracking-tight {
    letter-spacing: -0.025em;
  }
  .hidden {
    display: none;
  }
  @media (min-width: 768px) {
    .md\:flex {
      display: flex;
    }
  }
  .gap-8 {
    gap: 2rem;
  }
  .font-medium {
    font-weight: 500;
  }
  .transition-colors {
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }
  .p-2 {
    padding: 0.5rem;
  }
  .rounded-full {
    border-radius: 9999px;
  }
  .hover\:bg-surface:hover {
    background-color: var(--surface);
  }
  .px-6 {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
  .py-2\.5 {
    padding-top: 0.625rem;
    padding-bottom: 0.625rem;
  }
  .font-semibold {
    font-weight: 600;
  }
  .transition-opacity {
    transition-property: opacity;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }
  .sticky {
    position: sticky;
  }
  .top-0 {
    top: 0;
  }
  .z-50 {
    z-index: 50;
  }
</style>
