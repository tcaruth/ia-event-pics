<script>
  import { BOOKING_MAILTO_URL } from './config.js';

  let includePrinter = $state(false);
  let includeHotspot = $state(false);

  let totalPrice = $derived(200 + (includePrinter ? 75 : 0) + (includeHotspot ? 25 : 0));
</script>

<section class="pricing" id="pricing">
  <div class="container">
    <h2 class="title">Simple, Transparent Pricing</h2>
    <p class="subtitle">No hidden fees. Custom estimate in real time.</p>
    
    <div class="card-container">
      <div class="card">
        <div class="badge">Most Popular</div>
        <h3 class="card-title">All-Day Rental</h3>
        
        <div class="price">
          <span class="amount">${totalPrice}</span>
          <span class="period">/ flat fee</span>
        </div>

        <ul class="features">
          <li class="feature-item">
            <span class="material-symbols-outlined check-icon">check_circle</span>
            <span>Full 24-hour rental period</span>
          </li>
          <li class="feature-item">
            <span class="material-symbols-outlined check-icon">check_circle</span>
            <span>Unlimited digital photo captures</span>
          </li>
          <li class="feature-item">
            <span class="material-symbols-outlined check-icon">check_circle</span>
            <span>Online guest gallery & QR sharing</span>
          </li>
        </ul>

        <div class="addons-section">
          <h4 class="addons-title">Optional Add-ons:</h4>
          
          <label class="addon-toggle" class:selected={includePrinter}>
            <input type="checkbox" bind:checked={includePrinter} />
            <div class="addon-info">
              <span class="addon-name">Physical Printer Add-on</span>
              <span class="addon-price">+$75</span>
            </div>
            <span class="material-symbols-outlined icon">print</span>
          </label>

          <label class="addon-toggle" class:selected={includeHotspot}>
            <input type="checkbox" bind:checked={includeHotspot} />
            <div class="addon-info">
              <span class="addon-name">Cellular Hotspot (No WiFi)</span>
              <span class="addon-price">+$25</span>
            </div>
            <span class="material-symbols-outlined icon">wifi</span>
          </label>
        </div>

        <a href={BOOKING_MAILTO_URL} class="button">Reserve Your Booth</a>
      </div>
    </div>
  </div>
</section>

<style>
  .pricing {
    padding: 6rem 0;
    background-color: var(--surface-color);
    color: var(--text-color);
  }

  .container {
    max-width: 80rem;
    margin: 0 auto;
    padding: 0 1.5rem;
    text-align: center;
  }

  .title {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: var(--text-muted);
    margin-bottom: 3rem;
    font-size: 1.125rem;
  }

  .card-container {
    max-width: 30rem;
    margin: 0 auto;
  }

  .card {
    background-color: var(--card-bg);
    border-radius: 1rem;
    box-shadow: var(--shadow-xl);
    border: 3px solid var(--primary);
    padding: 2.5rem 2rem;
    position: relative;
    overflow: hidden;
  }

  .badge {
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
    background-color: var(--primary-light);
    color: var(--primary);
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
  }

  .card-title {
    font-size: 1.75rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    text-align: left;
  }

  .price {
    display: flex;
    align-items: baseline;
    justify-content: flex-start;
    gap: 0.35rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 1.25rem;
  }

  .amount {
    font-size: 3.5rem;
    font-weight: 800;
    color: var(--primary);
    line-height: 1;
    transition: all 0.2s ease;
  }

  .period {
    color: var(--text-muted);
    font-weight: 600;
    font-size: 1rem;
  }

  .features {
    text-align: left;
    list-style: none;
    padding: 0;
    margin: 0 0 1.75rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1rem;
    font-weight: 500;
  }

  .check-icon {
    color: var(--primary);
    font-size: 1.25rem;
  }

  .addons-section {
    text-align: left;
    margin-bottom: 2rem;
    padding: 1.25rem;
    background-color: var(--surface-color);
    border-radius: 0.75rem;
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .addons-title {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.25rem;
  }

  .addon-toggle {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;

    input[type='checkbox'] {
      accent-color: var(--primary);
      width: 1.15rem;
      height: 1.15rem;
      cursor: pointer;
    }
  }

  .addon-toggle.selected {
    border-color: var(--primary);
    background-color: var(--primary-light);
  }

  .addon-info {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .addon-name {
    font-size: 0.9375rem;
    font-weight: 600;
  }

  .addon-price {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--primary);
  }

  .addon-toggle .icon {
    color: var(--text-muted);
    font-size: 1.25rem;
  }

  .button {
    display: block;
    width: 100%;
    padding: 1.125rem 0;
    background-color: var(--primary);
    color: white;
    border-radius: 0.75rem;
    font-weight: 700;
    font-size: 1.125rem;
    text-decoration: none;
    transition: all 0.25s ease;
    box-shadow: var(--shadow-md);
  }

  .button:hover {
    background-color: var(--primary-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
</style>
