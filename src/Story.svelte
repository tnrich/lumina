<script>
  import Header from "./Header.svelte";
</script>

<style>
  .logo {
    width: 10em;
    margin-top: 10px;
    margin-bottom: 10px;
  }

  .photoholder-img {
    object-fit: cover;
    width: 97vw;
    max-width: 600px;
    /* border-radius: 10px; */
  }
  .photoholder {
    max-width: 600px;
    padding: 1vw;
  }
  .main {
    display: flex;
    justify-content: center;
  }
</style>

  <!-- <Header
    subtext={'A bit about where I come from and what my journey has been'}
    title={'About'} /> -->
<div class='main'>

  <div class="photoholder">
  <img class="logo" src="luminalogo.svg" alt="lumina logo" />
    <h2>About</h2>
    <div>Lumina is the personal project of Janie Willheim.
      The fruit comes from organic and bio-dynamic vineyards on the central coast. 
      Janie's choice of varietals reflects her desire to encourcage bio-diversity and help move the region away from monocultures. 
      </div>
      <br/>
    <img class="photoholder-img" alt="2" src={'/photos/1.png'} />

    <br/>
    <br/>
    <img class="photoholder-img" alt="2" src={'/photos/2.png'} />
    <br/>
    <br/>
    <div>Lumina aims to put lesser known grapes into the spotlight. Much like how the craft beer movement democratized "fancy" tastes, 
      Janie believes that <i>good</i> wine needs to become more approachable to the masses. Lumina is her way of doing that.</div>
      <br/>
      <img class="photoholder-img" alt="2" src={'/photos/3.png'} />
    <br/>
    <br/>
    <br/>
    <br/>
  </div>
</div>
