<script>
  import { writable } from "svelte/store";

  export const user = writable({
    name: "",
    // phone: "11 972393003",
    email: "",
  });
  let isOpen = true;
</script>

<style>
  .bottom-holder {
    padding: 20px;
    max-width: 300px;
    align-self: center;
  }

  input {
    margin-bottom: 10px;
  }
</style>

{#if isOpen}
  <div class="bottom-holder">
    <input
      class="input is-primary"
      type="text"
      placeholder="Name"
      bind:value={$user.name} />
    <input
      class="input is-primary"
      type="text"
      placeholder="Email"
      bind:value={$user.name} />
    <button class="button is-primary">Join Mailing List</button>
  </div>
{:else}
  <button
    on:click={() => {
      isOpen = !isOpen;
    }}
    class="button is-primary">
    Join Mailing List
  </button>
{/if}
<!-- </main> -->
