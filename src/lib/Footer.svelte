<script>
  import { BOOKING_MAILTO_URL } from './config.js';
</script>

<footer class="footer">
  <div class="container main-footer">
    <div class="about">
      <div class="logo">
        <div class="logo-icon">
          <span class="material-symbols-outlined">camera</span>
        </div>
        <span class="logo-text">IA Event Pics</span>
      </div>
      <p class="description">
        Premium photobooth rental service based in Waterloo, Iowa. Serving the entire Cedar Valley
        area with professional equipment and exceptional service.
      </p>
      <!-- Socials commented out as requested
      <div class="socials">
        <a href="/" class="social-link" aria-label="Facebook">
          <svg class="icon" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
            ></path>
          </svg>
        </a>
        <a href="/" class="social-link" aria-label="Instagram">
          <svg class="icon" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M12.315 2c2.43 0 2.784.01 3.8.058 1.016.048 1.565.204 1.935.347.49.19.84.417 1.208.786.369.369.595.718.785 1.208.143.37.3.919.348 1.935.048 1.016.058 1.37.058 3.8s-.01 2.784-.058 3.8c-.048 1.017-.204 1.564-.347 1.935-.19.49-.417.84-.786 1.208-.369.369-.718.595-1.208.785-.37.143-.919.3-1.935.348-1.016.048-1.37.058-3.8.058s-2.784-.01-3.8-.058c-1.017-.048-1.564-.204-1.935-.347-.49-.19-.84-.417-1.208.786-.369-.369-.595-.718-.785-1.208-.143-.37-.3-.919-.348-1.935-.048-1.016-.058-1.37-.058-3.8s.01-2.784.058-3.8c.048-1.017.204-1.564.347-1.935.19-.49.417-.84.786-1.208.369-.369.718-.595 1.208-.785.37-.143.919-.3 1.935-.348 1.016-.048 1.37-.058 3.8-.058zm0-2C9.835 0 9.527.01 8.556.055 7.59.1 6.93.254 6.35.479c-.6.234-1.11.547-1.615 1.052s-.818 1.016-1.052 1.615c-.225.58-.38 1.24-.424 2.206C3.21 4.316 3.2 4.624 3.2 7.104s.01 2.787.055 3.758c.045.966.2 1.626.424 2.206.234.6.547 1.11 1.052 1.615s1.016.818 1.615 1.052c.58.225 1.24.38 2.206.424.97.045 1.278.055 3.758.055s2.787-.01 3.758-.055c.966-.045 1.626-.2 2.206-.424.6-.234 1.11-.547 1.615-1.052s.818-1.016 1.052-1.615c.225-.58.38-1.24.424-2.206.045-.97.055-1.278.055-3.758s-.01-2.787-.055-3.758c-.045-.966-.2-1.626-.424-2.206-.234-.6-.547-1.11-1.052-1.615s-1.016-.818-1.615-1.052c-.58-.225-1.24-.38-2.206-.424C14.884.01 14.576 0 12.104 0z"
            ></path>
          </svg>
        </a>
      </div>
      -->
    </div>
    <div>
      <h4 class="menu-title">Quick Links</h4>
      <ul class="links">
        <li><a href="#pricing">Pricing Details</a></li>
        <li><a href="#gallery">Event Gallery</a></li>
        <li><a href="#find">Find Photos</a></li>
        <li><a href={BOOKING_MAILTO_URL}>Book Now</a></li>
      </ul>
    </div>
    <div>
      <h4 class="menu-title">Contact</h4>
      <ul class="contact-info">
        <li class="contact-item">
          <span class="material-symbols-outlined icon">mail</span>
          us@smilewhale.com
        </li>
        <li class="contact-item">
          <span class="material-symbols-outlined icon">call</span>
          (515) 981-6543
        </li>
        <li class="contact-item">
          <span class="material-symbols-outlined icon">location_on</span>
          Waterloo, IA 50701
        </li>
      </ul>
    </div>
  </div>
  <div class="container sub-footer">
    <p>© {new Date().getFullYear()} IA Event Pics. All rights reserved.</p>
    <div class="legal-links">
      <a href="/privacy">Privacy Policy</a>
      <a href="/terms">Terms of Service</a>
    </div>
  </div>
</footer>

<style>
  .footer {
    background-color: var(--bg-color);
    color: var(--text-muted);
    padding: 4rem 0 2rem 0;
    border-top: 1px solid var(--border-color);
  }

  .container {
    max-width: 80rem;
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  .main-footer {
    display: grid;
    grid-template-columns: 1fr;
    gap: 3rem;
    margin-bottom: 4rem;
  }

  @media (min-width: 768px) {
    .main-footer {
      grid-template-columns: 2fr 1fr 1fr;
    }
  }

  .about {
    max-width: 24rem;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-color);
    margin-bottom: 1.5rem;
  }

  .logo-icon {
    width: 2rem;
    height: 2rem;
    background-color: var(--primary);
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .logo-icon .material-symbols-outlined {
    font-size: 1.25rem;
  }

  .logo-text {
    font-size: 1.125rem;
    font-weight: 800;
  }

  .description {
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }


  .menu-title {
    color: var(--text-color);
    font-weight: 700;
    margin-bottom: 1.5rem;
  }

  .links {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .links a {
    color: inherit;
    transition: color 0.3s;
  }

  .links a:hover {
    color: var(--text-color);
  }

  .contact-info {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .contact-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .contact-item .icon {
    color: var(--primary);
    font-size: 1.25rem;
  }

  .sub-footer {
    padding-top: 2rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    font-size: 0.875rem;
  }

  @media (min-width: 768px) {
    .sub-footer {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }

  .legal-links {
    display: flex;
    gap: 2rem;
  }

  .legal-links a {
    color: inherit;
    transition: color 0.3s;
  }

  .legal-links a:hover {
    color: var(--text-color);
  }
</style>
