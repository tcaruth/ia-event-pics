<script>
  const galleryItems = [
    {
      id: 'weddings',
      src: '/images/gallery_weddings.jpg',
      alt: 'Wedding Reception Photobooth',
      title: 'Weddings',
      category: 'Weddings',
      description: 'Elegant setups with custom print borders matching your wedding theme.'
    },
    {
      id: 'corporate',
      src: '/images/gallery_corporate.jpg',
      alt: 'Corporate Gala Photobooth',
      title: 'Corporate Galas',
      category: 'Corporate',
      description: 'Professional branded photo experiences for team galas and launches.'
    },
    {
      id: 'birthdays',
      src: '/images/gallery_birthdays.jpg',
      alt: 'Birthday Party Photobooth',
      title: 'Birthdays',
      category: 'Birthdays',
      description: 'Fun props, vivid lighting, and instant memories for all ages.'
    },
    {
      id: 'special',
      src: '/images/gallery_special.jpg',
      alt: 'Festival and Special Occasion Photobooth',
      title: 'Special Occasions',
      category: 'Special Occasions',
      description: 'High-volume instant capturing for festivals, anniversaries, and proms.'
    }
  ];

  let selectedCategory = $state('All');
  /** @type {typeof galleryItems[0] | null} */
  let activeLightboxItem = $state(null);

  let filteredItems = $derived(
    selectedCategory === 'All'
      ? galleryItems
      : galleryItems.filter((item) => item.category === selectedCategory)
  );

  /**
   * @param {typeof galleryItems[0]} item
   */
  function openLightbox(item) {
    activeLightboxItem = item;
  }

  function closeLightbox() {
    activeLightboxItem = null;
  }

  function nextImage() {
    if (!activeLightboxItem) return;
    const idx = galleryItems.findIndex((i) => i.id === activeLightboxItem?.id);
    const nextIdx = (idx + 1) % galleryItems.length;
    activeLightboxItem = galleryItems[nextIdx];
  }

  function prevImage() {
    if (!activeLightboxItem) return;
    const idx = galleryItems.findIndex((i) => i.id === activeLightboxItem?.id);
    const prevIdx = (idx - 1 + galleryItems.length) % galleryItems.length;
    activeLightboxItem = galleryItems[prevIdx];
  }

  /**
   * @param {KeyboardEvent} e
   */
  function handleKeydown(e) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<section class="gallery" id="gallery">
  <div class="container">
    <div class="header">
      <div>
        <h2 class="title">Perfect for Any Occasion</h2>
        <p class="subtitle">
          From intimate birthday gatherings in Waterloo to large-scale corporate galas across the Cedar Valley, our photobooths bring non-stop fun.
        </p>
      </div>

      <div class="category-tabs">
        <button
          class="tab"
          class:active={selectedCategory === 'All'}
          onclick={() => (selectedCategory = 'All')}
        >
          All
        </button>
        {#each ['Weddings', 'Corporate', 'Birthdays', 'Special Occasions'] as cat}
          <button
            class="tab"
            class:active={selectedCategory === cat}
            onclick={() => (selectedCategory = cat)}
          >
            {cat}
          </button>
        {/each}
      </div>
    </div>

    <div class="grid">
      {#each filteredItems as item}
        <button class="gallery-item" onclick={() => openLightbox(item)} aria-label="View {item.title}">
          <img src={item.src} alt={item.alt} class="image" loading="lazy" />
          <div class="overlay">
            <div class="overlay-content">
              <span class="category-badge">{item.category}</span>
              <span class="overlay-title">{item.title}</span>
              <span class="click-hint">Click to expand <span class="material-symbols-outlined hint-icon">zoom_in</span></span>
            </div>
          </div>
        </button>
      {/each}
    </div>
  </div>
</section>

{#if activeLightboxItem}
  <div
    class="lightbox-backdrop"
    onclick={(e) => { if (e.target === e.currentTarget) closeLightbox(); }}
    onkeydown={(e) => e.key === 'Escape' && closeLightbox()}
    role="button"
    tabindex="0"
    aria-label="Close preview overlay"
  >
    <div class="lightbox-modal" role="document">
      <button class="close-button" onclick={closeLightbox} aria-label="Close preview">
        <span class="material-symbols-outlined">close</span>
      </button>

      <div class="lightbox-content">
        <img src={activeLightboxItem.src} alt={activeLightboxItem.alt} class="lightbox-img" />
        <div class="lightbox-details">
          <span class="category-badge">{activeLightboxItem.category}</span>
          <h3>{activeLightboxItem.title}</h3>
          <p>{activeLightboxItem.description}</p>
        </div>
      </div>

      <button class="nav-btn prev" onclick={prevImage} aria-label="Previous photo">
        <span class="material-symbols-outlined">chevron_left</span>
      </button>
      <button class="nav-btn next" onclick={nextImage} aria-label="Next photo">
        <span class="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  </div>
{/if}

<style>
  .gallery {
    padding: 6rem 0;
    color: var(--text-color);
  }

  .container {
    max-width: 80rem;
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  .header {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2.5rem;
    gap: 1.5rem;
  }

  @media (min-width: 1024px) {
    .header {
      flex-direction: row;
      align-items: flex-end;
    }
  }

  .title {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    font-size: 1.125rem;
    color: var(--text-muted);
    max-width: 40rem;
  }

  .category-tabs {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .tab {
    background-color: var(--surface-color);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s ease;
  }

  .tab.active,
  .tab:hover {
    background-color: var(--primary);
    color: white;
    border-color: var(--primary);
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  @media (min-width: 640px) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1024px) {
    .grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  .gallery-item {
    position: relative;
    overflow: hidden;
    border-radius: 1rem;
    aspect-ratio: 1 / 1;
    border: none;
    padding: 0;
    cursor: pointer;
    background-color: var(--surface-color);
    box-shadow: var(--shadow-md);

    &:focus-visible {
      outline: 3px solid var(--primary);
    }
  }

  .image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .gallery-item:hover .image {
    transform: scale(1.08);
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.2) 60%, transparent 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    display: flex;
    align-items: flex-end;
    padding: 1.5rem;
    text-align: left;
  }

  .gallery-item:hover .overlay {
    opacity: 1;
  }

  .overlay-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .category-badge {
    display: inline-block;
    align-self: flex-start;
    background-color: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(4px);
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.2rem 0.6rem;
    border-radius: 9999px;
    text-transform: uppercase;
  }

  .overlay-title {
    color: white;
    font-size: 1.25rem;
    font-weight: 800;
  }

  .click-hint {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.8125rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-top: 0.25rem;
  }

  .hint-icon {
    font-size: 1rem;
  }

  /* Lightbox Modal */
  .lightbox-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }

  .lightbox-modal {
    position: relative;
    max-width: 50rem;
    width: 100%;
    background-color: var(--card-bg);
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: var(--shadow-xl);
    border: 1px solid var(--border-color);
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: background 0.2s;
  }

  .close-button:hover {
    background: rgba(0, 0, 0, 0.8);
  }

  .lightbox-content {
    display: flex;
    flex-direction: column;

    @media (min-width: 768px) {
      flex-direction: row;
    }
  }

  .lightbox-img {
    width: 100%;
    max-height: 28rem;
    object-fit: cover;

    @media (min-width: 768px) {
      width: 60%;
      max-height: 32rem;
    }
  }

  .lightbox-details {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;

    @media (min-width: 768px) {
      width: 40%;
    }

    h3 {
      font-size: 1.75rem;
      font-weight: 800;
      margin: 0.75rem 0 0.5rem;
    }

    p {
      color: var(--text-muted);
      line-height: 1.6;
    }
  }

  .nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: rgba(0, 0, 0, 0.85);
    }
  }

  .nav-btn.prev {
    left: 1rem;
  }

  .nav-btn.next {
    right: 1rem;
  }
</style>
