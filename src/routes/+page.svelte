<script>
    export let data;
</script>

<heading>
    <div>
        
        <h1>{data.event?.name}</h1>
        <p>{data.event?.description}{data.event?.description && data.event?.date ? ` - ${data.event?.date}` : `${data.event?.date}`}</p>
    </div>
</heading>

<div class="gallery">
    {#each data.images as image}
    <a href="/image/{image.name}">
        <figure>
            <div class="img"><img src={image.url} alt="User generated" /></div>
            <figcaption>{new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(image.created))}</figcaption>
        </figure>
    </a>
    {/each}
</div>
{#if data.event?.primary_image}
<div class="primary">
    <img src={data.event?.primary_image} alt="{data.event?.name}" />
</div>
{/if}

<style>
    heading > div {
        background: var(--color-primary);
        color: var(--text-primary);
        padding: 1rem;
        margin-block: 1rem;
        border-radius: 1rem;
        
        box-shadow: 
        0 4px 6px -1px rgb(0 0 0 / 0.1), 
        0 2px 4px -2px rgb(0 0 0 / 0.1);
    }
    .gallery {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        &:hover a figure{
            opacity: 0.9;
        }
        
        a figure {
            margin: 0;
            .img {
                border-radius: 1rem;
                overflow: hidden;
                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            }
            figcaption {
                color: var(--text-surface-primary);
                text-decoration: none;
            }
            &:hover {
                opacity: 1;
            }
        }
        
    }
    .primary {
        text-align: center;
        img {
            max-width: calc(100vw - 4rem);
        }
    }
</style>