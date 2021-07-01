<script>
  import JoinMailingList from "./JoinMailingList.svelte";
</script>

<div class="home-container">
  <img class="logo" src="luminalogo.svg" alt="lumina logo" />
  <img
    
    on:click={() => {
      console.log(`yee`);
      const a = document.querySelector(".bottom_character");
      a.classList.toggle("bottom-char-open");
    }}
    class="left_img"
    src="left_img.svg"
    alt="left_img"
  />
  <img
    on:click={() => {
      console.log(`yee`);
      const a = document.querySelector(".left_character");
      a.classList.toggle("left-char-open");
    }}
    class="bottom_img"
    src="bottom_img.svg"
    alt="bottom_img"
  />
  <img
    id="slider"
    class="transition-bottom left_character"
    src="left_img.svg"
    alt="left_character"
  />
  <img
  
    id="slider"
    class="transition bottom_character"
    src="bottom_img.svg"
    alt="bottom_character"
  />

  <JoinMailingList />

  <!-- svelte-ignore a11y-missing-content -->
  <a href="https://www.instagram.com/luminawines/" class="fa fa-instagram" />
</div>

<style>
  .logo {
    width: 14em;
  }
  .left_character,
  .left_img {
    position: fixed;
    right: 0;
    transform: scaleX(-1);
    height: 100%;
  }
  .left_character {
    z-index:-1;
    right: -520px;

    -webkit-transition: right 0.8s ease-out; /* Chrome 1-25, Safari 3.2+ */
    -webkit-transition: right 0.8s ease-in; /* Chrome 1-25, Safari 3.2+ */
    -moz-transition: right 0.8s ease-out; /* Firefox 4-15 */
    -moz-transition: right 0.8s ease-in; /* Firefox 4-15 */
    -o-transition: right 0.8s ease-out; /* Opera 10.50–12.00 */
    -o-transition: right 0.8s ease-in; /* Opera 10.50–12.00 */
    transition: right 0.8s ease-out; /* Chrome 26, Firefox 16+, IE 10+, Opera 12.10+ */
    transition: right 0.8s ease-in; /* Chrome 26, Firefox 16+, IE 10+, Opera 12.10+ */
  
  }

  .bottom_character,
  .bottom_img {
    display: none;
    position: fixed;
    bottom: 0;
    width: 100%;
  }
  .bottom_character {
    z-index:-1;
    bottom: -520px;
    display: block;
    -webkit-transition: bottom 0.8s ease-out; /* Chrome 1-25, Safari 3.2+ */
    -webkit-transition: bottom 0.8s ease-in; /* Chrome 1-25, Safari 3.2+ */
    -moz-transition: bottom 0.8s ease-out; /* Firefox 4-15 */
    -moz-transition: bottom 0.8s ease-in; /* Firefox 4-15 */
    -o-transition: bottom 0.8s ease-out; /* Opera 10.50–12.00 */
    -o-transition: bottom 0.8s ease-in; /* Opera 10.50–12.00 */
    transition: bottom 0.8s ease-out; /* Chrome 26, Firefox 16+, IE 10+, Opera 12.10+ */
    transition: bottom 0.8s ease-in; /* Chrome 26, Firefox 16+, IE 10+, Opera 12.10+ */
  
  }
  .fa-instagram {
    z-index: 1;
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
