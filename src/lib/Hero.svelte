<header class="hero">
  <div class="container">
    <div class="content">
      <span class="badge">Serving the Cedar Valley</span>
      <h1 class="title">
        Capture the Joy at Your <span class="highlight">Next Event</span>
      </h1>
      <p class="subtitle">
        High-quality photobooth rentals for weddings, corporate events, and parties. Professional service for memories that last a lifetime.
      </p>
      <div class="actions">
        <a href="#book" class="button-primary">Book Your Date</a>
        <a href="#find" class="button-secondary">Find Photos</a>
      </div>
    </div>
    <div class="image-container">
      <div class="blur-circle"></div>
      <img
        alt="Happy people at a photobooth"
        class="main-image"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtzeR67qz3UC6xi6eKqDOg4OiVmoNS1sIsrUQllzNLbTnLtNPMVqSH1MNuL_L-LiCcj-RahdP_Fvxhnei3Gh6REXLIPGOyjk63ysHazzZVD7ETQUayBV-PYYWFL82G40nD4dGiRGN8HazxIc-5m4VBsZC3RKt3WOWSVJtP5FDNO4S08BKiELfuKhGWNBJ7w9p0RslL4JGmRcMJ7FxJOjwzf8zOB7V121cKD326BhjH74SSpEnNNCvy-TZy05NFE2DQcxXn2wm3ITY"
      />
      <div class="card">
        <div class="card-icon">
          <span class="material-symbols-outlined">verified</span>
        </div>
        <div>
          <div class="card-title">Top Rated</div>
          <div class="card-subtitle">Service in Cedar Valley</div>
        </div>
      </div>
    </div>
  </div>
</header>

<style>
  .hero {
    position: relative;
    padding-top: 4rem;
    padding-bottom: 6rem;
    overflow: hidden;
  }

  .container {
    max-width: 80rem;
    margin: 0 auto;
    padding: 0 1.5rem;
    display: grid;
    grid-template-columns: 1fr;
    gap: 4rem;
    align-items: center;
  }

  @media (min-width: 1024px) {
    .container {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .content {
    z-index: 10;
  }

  .badge {
    display: inline-block;
    padding: 0.25rem 1rem;
    border-radius: 9999px;
    background-color: var(--primary-light);
    color: var(--primary);
    font-size: 0.875rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .title {
    font-size: 3rem;
    line-height: 1.1;
    font-weight: 800;
    margin-bottom: 1.5rem;
    color: var(--text-color);
  }

  @media (min-width: 1024px) {
    .title {
      font-size: 4.5rem;
    }
  }

  .highlight {
    color: var(--primary);
  }

  .subtitle {
    font-size: 1.25rem;
    color: var(--text-muted);
    margin-bottom: 2.5rem;
    max-width: 32rem;
    line-height: 1.6;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  @media (min-width: 640px) {
    .actions {
      flex-direction: row;
    }
  }

  .button-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 1rem 2rem;
    background-color: var(--primary);
    color: white;
    font-size: 1.125rem;
    font-weight: 700;
    border-radius: 0.75rem;
    transition: all 0.3s;
    text-decoration: none;
  }

  .button-primary:hover {
    box-shadow: 0 10px 15px -3px rgba(6, 78, 59, 0.2), 0 4px 6px -2px rgba(6, 78, 59, 0.1);
  }

  .button-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 1rem 2rem;
    border: 2px solid var(--border-color);
    color: var(--text-color);
    font-size: 1.125rem;
    font-weight: 700;
    border-radius: 0.75rem;
    transition: all 0.3s;
    text-decoration: none;
  }

  .button-secondary:hover {
    background-color: var(--surface-color);
  }

  .image-container {
    position: relative;
  }

  .blur-circle {
    position: absolute;
    top: -2.5rem;
    right: -2.5rem;
    width: 16rem;
    height: 16rem;
    background-color: var(--primary-light);
    border-radius: 9999px;
    filter: blur(5rem);
    opacity: 0.6;
  }

  .main-image {
    border-radius: 0.75rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    position: relative;
    z-index: 10;
    width: 100%;
    object-fit: cover;
    aspect-ratio: 4 / 3;
  }

  .card {
    position: absolute;
    bottom: -1.5rem;
    left: -1.5rem;
    background-color: var(--card-bg);
    color: var(--text-color);
    padding: 1.5rem;
    border-radius: 0.75rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 1rem;
    border: 1px solid var(--border-color);
  }

  .card-icon {
    width: 3rem;
    height: 3rem;
    border-radius: 9999px;
    background-color: rgba(6, 78, 59, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-icon .material-symbols-outlined {
    color: var(--primary);
  }

  .card-title {
    font-weight: 700;
    font-size: 1.125rem;
  }

  .card-subtitle {
    font-size: 0.875rem;
    color: var(--text-muted);
  }
</style>
