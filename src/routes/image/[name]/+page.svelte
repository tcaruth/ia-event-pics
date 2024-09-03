<script>
    import { page } from '$app/stores';
    import { PUBLIC_BUCKET_READ } from '$env/static/public';
    import QRCode from "qrcode";

    export let data;

    const image_url = `${PUBLIC_BUCKET_READ}${$page.params.name}`

    let qrPageUrlDataUrl = QRCode.toDataURL($page.url.href,  { errorCorrectionLevel: 'L' });
    const referrer = document.referrer;

</script>
<nav>
    <a href="/?e={data.event?.id}">Home</a>
    <a href="{referrer}">Back</a>
</nav>
<heading>
    <h1>{$page.params.name}</h1>
</heading>
<div class="content">
    <figure>
        <img src={image_url} alt="User generated" />
    </figure>
    <div class="actions">
        <a download={$page.params.name} href={image_url}>
            Download
        </a>
        <button type="button" 
            on:click={() => navigator.share({url: image_url, title: $page.params.name})}>
            Share
        </button>
    </div>
    {#await qrPageUrlDataUrl then dataUrl}
    <!-- svelte-ignore a11y_img_redundant_alt -->
        <img class="qrcode" src={dataUrl} alt="QR Code for the displayed photo" />
    {/await}
</div>

<style>
.content {
    text-align: center;
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
}
.qrcode {
    margin-inline: auto;
    max-width: 50%;
    max-height: 400px;
}
</style>