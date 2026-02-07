<script>
  import { BOOKING_MAILTO_URL } from './config.js';
</script>

<section class="pricing" id="pricing">
  <div class="container">
    <h2 class="title">Simple, Transparent Pricing</h2>
    <p class="subtitle">No hidden fees. Just great memories.</p>
    <div class="card-container">
      <div class="card">
        <h3 class="card-title">All-Day Rental</h3>
        <div class="price">
          <span class="amount">$200</span>
          <span class="period">/ flat fee</span>
        </div>
        <ul class="features">
          <li class="feature-item">
            <span class="material-symbols-outlined check-icon">check_circle</span>
            <span>Full 24-hour rental period</span>
          </li>
          <li class="feature-item">
            <span class="material-symbols-outlined check-icon">check_circle</span>
            <span>Unlimited digital captures</span>
          </li>
          <li class="feature-item">
            <span class="material-symbols-outlined check-icon">check_circle</span>
            <span>Online gallery for guests</span>
          </li>
          <li class="feature-item optional">
            <span class="material-symbols-outlined info-icon">info</span>
            <span>Optional printer: +$75 addon</span>
          </li>
          <li class="feature-item optional">
            <span class="material-symbols-outlined wifi-icon">wifi</span>
            <span>Hotspot fee: $25 (if no WiFi available)</span>
          </li>
        </ul>
        <a href={BOOKING_MAILTO_URL} class="button">Reserve Your Booth</a>
      </div>
    </div>
  </div>
</section>

<style>
  .pricing {
    padding: 5rem 0;
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
    margin-bottom: 1rem;
  }

  .subtitle {
    color: var(--text-muted);
    margin-bottom: 3rem;
  }

  .card-container {
    max-width: 28rem;
    margin: 0 auto;
  }

  .card {
    background-color: var(--card-bg);
    border-radius: 0.75rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    border: 4px solid var(--primary);
    padding: 2rem;
    position: relative;
    overflow: hidden;
  }

  .card-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .price {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.25rem;
    margin-bottom: 1.5rem;
  }

  .amount {
    font-size: 3rem;
    font-weight: 800;
    color: var(--primary);
  }

  .period {
    color: var(--text-muted);
    font-weight: 500;
  }

  .features {
    text-align: left;
    list-style: none;
    padding: 0;
    margin: 0 0 2rem 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .check-icon {
    color: #10b981;
    font-size: 1.125rem;
  }

  .optional {
      color: var(--text-muted);
  }

  .info-icon, .wifi-icon {
    color: var(--text-muted);
    opacity: 0.6;
  }

  .button {
    display: block;
    width: 100%;
    padding: 1rem 0;
    background-color: var(--primary);
    color: white;
    border-radius: 0.5rem;
    font-weight: 700;
    text-decoration: none;
    transition: transform 0.3s;
  }

  .button:hover {
    transform: scale(1.02);
  }
</style>
