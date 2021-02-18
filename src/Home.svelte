<script>
  import Header from "./Header.svelte";

  import JoinMailingList from "./JoinMailingList.svelte";
</script>

<div class="home-container">
  <img src="luminalogo.svg" alt="lumina logo" />
  <!-- <img class="sloth little_guy" src="sloth.svg" alt="sloth" /> -->
  <img class="whole_img" src="wholeImg.svg" alt="whole_img" />

  <!-- <Header
    noBackground
    subtextColor="white"
    subtext={''}
    title={"Lumina Wines"} /> -->
  <JoinMailingList />
  
<!-- svelte-ignore a11y-missing-content -->
<a href="https://www.instagram.com/luminawines/" class="fa fa-instagram"></a>

</div>

<style>
  .whole_img{
    position: fixed;
    bottom: -20em;
    width: 150%;
  }
  /* .little_guy {
    filter: saturate(5);
    opacity: .5;
    position: fixed;
    top: 1em;
    width: 19em;
    left: 5em;
  } */
  .fa-instagram {
    font-size: 3em;
    color: #dd9828;
  }
  .fa-instagram:hover {
    color: #db8e12;
    text-decoration: none;
  }
  .home-container {
    width: 100%;
    height: 100%;
    /* Center and scale the image nicely */
    /* background-image: url("/wedding_backdrop.jpg");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover; */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  img {
    width: 8em;
  }
</style>
