<script>
  import CircleType from "circletype";
  import { onMount } from "svelte";

  export let title;
  export let subtext;
  export let subtextColor;
  onMount(() => {
    // const headerTop = document.querySelector(".header-top");
    const headerTopWords = document.querySelectorAll(".header-top div");
    console.log(`headerTopWords:`, headerTopWords);
    //  const toBend =  headerTopWords.length ? headerTopWords : headerTop
    for (const word of headerTopWords) {
      const circleType = new CircleType(word);
      // Set the text radius and direction. Note: setter methods are chainable.
      circleType.radius(600);
    }
  });
</script>

<style>
  .header-top {
    font-family: "LabelFont";
    color: #498184;
    text-transform: uppercase;

    font-weight: 200;
    padding-top: 39px;
    width: 100%;
    /* padding-left: 10vw;
    padding-right: 10vw; */
  }
  @media only screen and (min-width: 768px) {
    /* tablets and desktop */
    .header-top {
      font-size: 100px;
    }
  }

  @media only screen and (max-width: 767px) {
    /* phones */
    .header-top {
      font-size: 70px;
      margin-left: 10px;
    }
  }

  /* h2 {
    color: subtextColor;
  } */
  .header-container {
    width: 100%;
    padding-bottom: 10px;
  }
</style>

<div class="header-container">
  <h1 class="header-top">
    {#each title.split(' ') as word}
      <div>{word}</div>
    {/each}
  </h1>
  {#if subtext}
    <h2 style="color: {subtextColor}">{subtext}</h2>
  {/if}
</div>
