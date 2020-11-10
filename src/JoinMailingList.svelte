<script>
  import { writable } from "svelte/store";
  import emailjs from "emailjs-com";

  export const user = writable({
    name: "",
    // phone: "11 972393003",
    email: "",
  });

  let isOpen = true;
  let sending = false;
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
      type="name"
      placeholder="Name"
      bind:value={$user.name} />
    <input
      class="input is-primary"
      type="email"
      placeholder="Email"
      bind:value={$user.email} />
    <button
      disabled={sending}
      on:click={() => {
        const templateParams = { name: 'James', notes: 'Check this out!' };
        sending = true;
        emailjs
          .send(
            process.env.service_id,
            process.env.template_id,
            { from_name: $user.name, message: $user.email },
            process.env.emailjs_user_id
          )
          .then(
            (response) => {
              sending = false;
              console.log('SUCCESS!', response.status, response.text);
            },
            (err) => {
              sending = false;
              console.log('FAILED...', err);
            }
          );
      }}
      class="button is-primary">Join Mailing List</button>
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
