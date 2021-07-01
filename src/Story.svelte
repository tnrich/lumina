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
  <h2>About</h2>
  <div>Lumina is the personal project of Janie Willheim.
    The fruit comes from organic and bio-dynamic vineyards on the central coast. 
    Janie's choice of varietals reflects her desire to encourcage bio-diversity and help move the region away from monocultures. 
    </div>
    <br/>
    <img class="photoholder-img" alt="2" src={'/photos/3.jpg'} />

  <br/>
  <br/>
  <img class="photoholder-img" alt="2" src={'/photos/2.png'} />
  <br/>
  <br/>
  <div>Lumina aims to put lesser known grapes into the spotlight. Much like how the craft beer movement democratized "fancy" tastes, 
    Janie believes that <i>good</i> wine needs to become more approachable to the masses. Lumina is her way of doing that.</div>
    <br/>
    <img class="photoholder-img" alt="bart-simpson-with-lumina" src={'/photos/1.png'} />
  <br/>
  <br/>
  <br/>
  <br/>
</ContentPageShell>
 