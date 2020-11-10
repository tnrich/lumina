<script>
  export let title;
  export let subtext;
  export let noBackground;
</script>

<style>
  .header-top {
    color: #498184;
    text-transform: uppercase;
    font-size: 90px;
    font-weight: 200;
    padding-top: 39px;
    padding-left: 10vw;
    padding-right: 10vw;
  }
  .header-container {
    width: 100%;
    padding-bottom: 10px;
  }
</style>

<div class="header-container">
  
  <h1 class="header-top">{title}</h1>
  {#if subtext}
    <h2>{subtext}</h2>
  {/if}
</div>
