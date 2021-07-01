
<style>
  .logo {
    width: 10em;
    margin-top: 20px;
    margin-bottom: 10px;
  }

  .photoholder {
    max-width: 600px;
    padding: 1vw;
  }
  .main {
    display: flex;
    justify-content: center;
  }
</style>
<div class='main'>
  <div class="photoholder">
  <img class="logo" src="luminalogo.svg" alt="lumina logo" />
    <slot/>
  </div>
</div>
