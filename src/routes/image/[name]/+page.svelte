<script>
    import { page } from '$app/stores';
    import { PUBLIC_BUCKET_READ } from '$env/static/public';
    import QRCode from "qrcode";
    
    export let data;
    
    const image_url = `${PUBLIC_BUCKET_READ}${$page.params.name}`
    
    let qrPageUrlDataUrl = QRCode.toDataURL($page.url.href,  { errorCorrectionLevel: 'L' });
    
    async function downloadImage() {
        const response = await fetch(image_url);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = $page.params.name;
        a.click();
        URL.revokeObjectURL(url);
    }
    async function shareImage() {
        const response = await fetch(image_url);
        const blob = await response.blob();
        console.log(blob.type);
        const file = new File([blob], `${$page.params.name}`, { type: blob.type });
        
        // Check if the browser supports sharing files
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                // title: 'Shared Image',
                // text: 'Check out this image!'
            });
        } else if (navigator.canShare && navigator.canShare({url: image_url, title: $page.params.name})) {
            navigator.share({url: image_url, title: $page.params.name})
        } else {
            navigator.clipboard.writeText(image_url)
        }
        
    }
</script>

<svelte:head>
<title>{$page.params.name.length>0 ? $page.params.name + ' - ': ''}IA Event Pics</title>
</svelte:head>

<nav>
    <a href="/?e={data.event?.id}">← <span>View all images in the gallery!</span></a>
</nav>
<!-- <heading>
<h1>{$page.params.name}</h1>
</heading> -->
<div class="content">
    <figure>
        <img src={image_url} alt="User generated" />
    </figure>
    <div class="actions">
        <!-- <a class="button" download={$page.params.name} href={image_url}>
            Download
        </a> -->
        <button class="button" type="button"
            on:click={downloadImage}>
            Download
        </button>
        <button class="button" type="button" 
        on:click={shareImage}>
        Share
    </button>
</div>
{#await qrPageUrlDataUrl then dataUrl}
<figure>
    <!-- svelte-ignore a11y_img_redundant_alt -->
    <img class="qrcode" src={dataUrl} alt="QR Code for the displayed photo" />
    <figcaption>Scan this QR code to share this image</figcaption>
</figure>
{/await}
</div>

<style>
    nav {
        background: var(--color-primary);
        color: var(--text-primary);
        border-radius: 1rem;
        a {
            font-size: large;
            font-weight: bold;
            color: var(--text-primary);
            padding: 2rem;
            display: block;
            span {
                text-decoration: underline;
            }
        }
    }
    .content {
        text-align: center;
        margin-bottom: 25vh;
    }
    figure {
        margin-inline: 0px;
        img {
            width: 100%;
        }
    }
    .actions {
        display: flex;
        align-items: center;
        justify-content: space-around;
        .button {
            display: block;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            border: 2px solid var(--color-primary);
            color: var(--color-primary);
            text-decoration: none;
            background: var(--color-secondary);
            font-size: 1rem;
            cursor: pointer;
        }
    }
    .qrcode {
        margin-inline: auto;
        max-width: 400px;
        max-height: 400px;
        width: 100%;
        aspect-ratio: 1;
    }
</style>