<script>
  const galleryItems = [
    {
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUltYURiaiPfCBddUY0oFRFiOOnbquva28o6Tk5qmQhX41ad4Yw-irWzneip6mrSys_Qj2YXGIq6IVBD83YIGuPB2rLbnGwjEQQAq5pxvrRwba0CGVcJGgvs-YcuBn2If5m-UK9wwpSDgfIILLx3IwtiIDI5_dC0SZPUl6LWcy5P9h2s4A9SwbPi3n3NYUbelNnAy_UbQFb_aqfOFj0MdfQvoFB6Ib6vXQOdNb_RaFRt-1gh_k9f7onRNPwIf3FGCswDT-malq9tM',
      alt: 'Corporate Event',
      title: 'Corporate Events',
    },
    {
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCx1sfICkJaoUKexvhMS_H_-C1EPwTPAnQ3ZJQkRniH30emuDodiT_R7zB5Y2kZxCUH5k5BFWKr1U9YndgkIcGj1Logum-48tP-78ZZKMuFCVkTgbhsXFFWSttqtQiha5Rd4v6L7cV7rSXidKWFVFhfD9RdL1imI6bJZTDFVx2fNBXv6Er47XWEMc1ILkaF7jPSuxYVYwR-hw0rbH5IRsXHZeTWr3GmeAXzs9Afy2sK39vqB0ofk50yw5o5soz2jd3PMk6oO6xDgkk',
      alt: 'Wedding Party',
      title: 'Weddings',
    },
    {
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAp2XWoWzDsxSMWraSKBVVsWGTEICk34I-FZKCfdnj2OK07Ae_bEvKXE8TDnYLtvTwagGV1fNWwagFMBuikxvl3CnI8bFVhSUOxLTFGaCSMCzd1CPHZv8NhgTJwoxi4D6k7jpqHlzj_v_pAQ3UC0MkVMCF9lHNHnOMfMhfp9aFtHgf1FWyWRo5ymEUygE65NgN4CImhPDl0WODLTRAt5SuQ8p_uZikBvqoIm-ZShggxROMKyo9rbkbnDzCfBeINOCxoUy91LfpmR8I',
      alt: 'Birthday Celebration',
      title: 'Birthdays',
    },
    {
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANbb95cRoAbQkEs4f4Ei80TlGHvwOQDs6NqFJXElugHYMzfBaOvQIc9mwaU0pFaXDMZ7eYPearGFZRuIzG-iimpIxSmHUeGTRJOnhnvFqrf6hS2_vtVJwX1c3nYm2o1pkZPHOXTrokNl_TxnuHdBpZleGEA8ehAmrHi7JBttlL0uB7ygT3_8kwJms4f-zwBWnlysGqi3gYbF4_NR-RRN91iqSsaX0eO50iX62yqcl-ikECG9wMgmWAJMe-euUkRxS0XGNvq9WI_l8',
      alt: 'Holiday Party',
      title: 'Special Occasions',
    },
  ];
</script>

<section class="gallery" id="gallery">
  <div class="container">
    <div class="header">
      <div>
        <h2 class="title">Perfect for Any Occasion</h2>
        <p class="subtitle">
          From intimate birthday gatherings in Waterloo to large-scale corporate galas, our booths
          bring the fun to everyone.
        </p>
      </div>
      <div class="navigation">
        <button class="nav-button">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <button class="nav-button">
          <span class="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
    <div class="grid">
      {#each galleryItems as item}
        <div class="gallery-item">
          <img src={item.src} alt={item.alt} class="image" />
          <div class="overlay">
            <span class="overlay-text">{item.title}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

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
    margin-bottom: 3rem;
    gap: 1.5rem;
  }
  @media (min-width: 768px) {
    .header {
      flex-direction: row;
      align-items: flex-end;
    }
  }
  .title {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 1rem;
  }
  .subtitle {
    font-size: 1.125rem;
    color: var(--text-muted);
    max-width: 40rem;
  }
  .navigation {
    display: flex;
    gap: 0.5rem;
  }
  .nav-button {
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    background: none;
    cursor: pointer;
    transition: background-color 0.3s;
    color: var(--text-color);
  }
  .nav-button:hover {
    background-color: var(--surface-color);
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  @media (min-width: 768px) {
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
    border-radius: 0.75rem;
    aspect-ratio: 1 / 1;
  }
  .image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s;
  }
  .gallery-item:hover .image {
    transform: scale(1.1);
  }
  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
    opacity: 0;
    transition: opacity 0.3s;
    display: flex;
    align-items: flex-end;
    padding: 1.5rem;
  }
  .gallery-item:hover .overlay {
    opacity: 1;
  }
  .overlay-text {
    color: white;
    font-weight: 700;
  }
</style>
