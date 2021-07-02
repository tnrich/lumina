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
  <meta name="Lumina wines Paso Robles Janie Willheim Release Page 2020 Riesling Valdiguié">
  <h1>Releases</h1>
  <h2>2020</h2>

  <div>100% Riesling from Oliver's Vineyard in Edna Valley.</div>
  <br />
  <br />
  <img class="photoholder-img" alt="2020 Riesling" src={'/release_photos/2020reis_front.png'} />
  <br />
  <br />
  <div>100% Valdiguié from Shell Creek Vineyard in Paso Robles Highlands AVA.</div>
  <br />
  <br />
  <img class="photoholder-img" alt="2020 valdiguie" src={'/release_photos/2020val_front.png'} />
  <br />
  <br />
  <h2>2019</h2>
  <div>100% Riesling from Oliver's Vineyard in Edna Valley.</div>
  <br />
  <br />
  <img class="photoholder-img" alt="2019 Riesling" src={'/release_photos/2019reis_front.png'} />
  <br />
  <br />
  <br />
  <br />
 
</ContentPageShell>