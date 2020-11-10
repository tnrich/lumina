<script>
  import Header from "./Header.svelte";

  import JoinMailingList from "./JoinMailingList.svelte";
</script>

<style>
  .home-container {
    width: 100%;
    height: 100%;
    background-image: url("/wedding_backdrop.jpg");
    /* Center and scale the image nicely */
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
  }
</style>

<div class="home-container">
  <Header noBackground subtext={"Pressin' Dat Juice since 2019"} title={'Lumina Wines'} />
  <JoinMailingList />
</div>
