<script>
  import JoinMailingList from "./JoinMailingList.svelte";
</script>

<style>
  main {
    text-align: center;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
  }


  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>

<main>
  <div>
    <br>
    <br>
    <h1 class="header-top">Lumina Wines</h1>
    <h2>Pressin' Dat Juice since 2019</h2>
  </div>
  <JoinMailingList />
</main>
