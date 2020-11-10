<script>
  import Carousel from '@beyonk/svelte-carousel'
</script>

<style>
  main {
    text-align: center;
    overflow-y: scroll;
    height: 100%;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
  /* .photoholder {
    color: white;
  } */
  .slide-content {
      width: 100%;
    }
</style>

<main>
  <br />
  <br />
  <h1 class="header-top">Gallery</h1>
  <h2>I'm only selling 2 varietals of wine at the momement. Swag will arrive soon!</h2>
  
  <Carousel perPage={1}>
    <div class="slide-content">
      <img src="//placekitten.com/400" alt="Kitten 1"/>
    </div>
    <div class="slide-content">
      <img src="//placekitten.com/401" alt="Kitten 1"/>
    </div>
    <div class="slide-content">
      <img src="//placekitten.com/402" alt="Kitten 1"/>
    </div>
    <div class="slide-content">
      <img src="//placekitten.com/403" alt="Kitten 1"/>
    </div>
  </Carousel>
  

</main>
