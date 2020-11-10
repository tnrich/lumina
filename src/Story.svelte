<script>
  import Header from "./Header.svelte";
</script>

<style>

  img {
    margin-top: 5rem;
    object-fit: cover;
    height: 50vh;
  }


  /* .photoholder {
    color: white;
  } */
</style>

  <Header
    subtext={'A bit about where I come from and what my journey has been'}
    title={'Story'} />

  <div class="photoholder">
    <img alt="2" src={'/photos/4.jpg'} />
    <div>I like spicy things! I'm always using too much hot sauce..</div>
    <img alt="2" src={'/photos/2.jpg'} />
    <div>This is my best friend Tay! She and I do everything together!</div>
    <img alt="1" src={'/photos/1.jpg'} />
    <div>This is my soon to be hubby! Love you boo!</div>
    <img alt="2" src={'/photos/3.jpg'} />
    <div>This is the family I live with!</div>
    <br/>
    <br/>
  </div>
