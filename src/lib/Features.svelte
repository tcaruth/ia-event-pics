<script>
  const features = [
    {
      icon: 'photo_print',
      title: 'Instant Prints',
      description: 'Get high-quality prints in seconds for a lasting physical memory of your night. Our optional printer addon makes it easy.',
    },
    {
      icon: 'share',
      title: 'Digital Sharing',
      description: 'Instantly share your photos to social media or via email with our live gallery. Perfect for modern celebrations.',
    },
    {
      icon: 'palette',
      title: 'Custom Branding',
      description: "Personalize prints and screens with your event's unique logo and theme. We match your vibe perfectly.",
    },
  ];
</script>

<section class="features-section" id="features">
  <div class="container">
    <div class="grid">
      {#each features as feature}
        <div class="card">
          <div class="icon-container">
            <span class="material-symbols-outlined icon">{feature.icon}</span>
          </div>
          <h3 class="title">{feature.title}</h3>
          <p class="description">{feature.description}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .features-section {
    padding: 5rem 0;
    background-color: #f8fafc;
  }

  .dark .features-section {
    background-color: rgba(15, 23, 42, 0.5);
  }

  .container {
    max-width: 80rem;
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  @media (min-width: 768px) {
    .grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  .card {
    background-color: white;
    padding: 2rem;
    border-radius: 0.75rem;
    border: 1px solid #f1f5f9;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    transition: box-shadow 0.3s;
  }

  .dark .card {
    background-color: #0f172a;
    border-color: #1e293b;
  }

  .card:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .icon-container {
    width: 4rem;
    height: 4rem;
    background-color: #ecfdf5;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    transition: background-color 0.3s;
  }

  .dark .icon-container {
    background-color: rgba(6, 78, 59, 0.2);
  }

  .card:hover .icon-container {
    background-color: #064e3b; /* primary color */
  }

  .icon {
    font-size: 2rem;
    color: #064e3b; /* primary color */
    transition: color 0.3s;
  }

  .card:hover .icon {
    color: white;
  }

  .title {
    font-size: 1.25rem;
    font-weight: 800;
    margin-bottom: 1rem;
  }

  .description {
    color: #475569;
    line-height: 1.6;
  }

  .dark .description {
    color: #94a3b8;
  }
</style>
