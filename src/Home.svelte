<script>
  import Header from "./Header.svelte";

  import JoinMailingList from "./JoinMailingList.svelte";
</script>

<div class="home-container">
  <img class="logo" src="luminalogo.svg" alt="lumina logo" />
  <img class="left_img" src="left_img.svg" alt="left_img" />
  <img class="bottom_img" src="bottom_img.svg" alt="bottom_img" />

  <JoinMailingList />

  <!-- svelte-ignore a11y-missing-content -->
  <a href="https://www.instagram.com/luminawines/" class="fa fa-instagram" />
</div>

<style>
  img {
    z-index: -1;
  }
  .logo {
    width: 14em;
  }
  .left_img {
    position: fixed;
    left: 0;
    height: 100%;
  }
  
  .bottom_img {
    display: none;
    position: fixed;
    bottom: 0;
    width: 100%;
  }
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
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  @media only screen and (max-width: 700px) {
    .left_img {
      display: none;
    }
    .bottom_img {
      display: block;
    }
    .logo {
      width: 10em;
    }
  }
</style>
