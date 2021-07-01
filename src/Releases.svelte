<script>
import ContentPageShell from "./ContentPageShell.svelte";
</script>

<style>
  .photoholder-img {
    object-fit: cover;
    width: 97vw;
    max-width: 600px;
  }

</style>

<ContentPageShell>
  <meta name="Lumina wines Paso Robles Janie Willheim Release Page 2020 Reisling Valdiguié">
  <h1>Releases</h1>
  <h2>2020</h2>

  <div>Lumina Dry Reisling from Oliver's Vineyard in Paso Robles. Bottled at Desparada Winery.</div>
  <br />
  <br />
  <img class="photoholder-img" alt="2020 reisling" src={'/release_photos/2020reis_front.png'} />
  <img class="photoholder-img" alt="2020 reisling" src={'/release_photos/2020reis_back.png'} />
  <br />
  <br />
  <div>Lumina Valdiguié from Oliver's Vineyard in Paso Robles. Bottled at Desparada Winery.</div>
  <br />
  <br />
  <img class="photoholder-img" alt="2020 valdiguie" src={'/release_photos/2020val_front.png'} />
  <img class="photoholder-img" alt="2020 valdiguie" src={'/release_photos/2020val_back.png'} />
  <br />
  <br />
  <h2>2019</h2>
  <div>Lumina Dry Reisling from Oliver's Vineyard in Paso. Bottled at Desparada Winery.</div>
  <br />
  <br />
  <img class="photoholder-img" alt="2019 reisling" src={'/release_photos/2019reis_front.png'} />
  <img class="photoholder-img" alt="2019 reisling" src={'/release_photos/2019reis_back.png'} />
  <br />
  <br />
  <br />
  <br />
 
</ContentPageShell>