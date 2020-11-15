<script>
  import Header from "./Header.svelte";
</script>

<style>
  img {
    margin-top: 1rem;
    object-fit: cover;
    height: 50vh;
    border-radius: 10px;
  }

</style>

<Header
  subtext={'Wines by Year'}
  title={'Releases'} />

<div class="photoholder">
  <h2>2019</h2>
  <div>Lumina Dry Reisling from Oliver's Vineyard in Paso. Bottled at Desparada Winery.</div>
  <img alt="2" src={'/release_photos/1.jpg'} />

  <h2>2020</h2>

  <div>Lumina Dry Reisling from Oliver's Vineyard in Paso Robles. Bottled at Desparada Winery.</div>
  --Photo here--
  <div>Lumina Valdiguié from Oliver's Vineyard in Paso Robles. Bottled at Desparada Winery.</div>
  --Photo here--

  <br />
  <br />
</div>
