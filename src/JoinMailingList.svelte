<script>
  import { writable } from "svelte/store";
  import emailjs from "emailjs-com";
  import { getNotificationsContext } from "svelte-notifications";

  const { addNotification } = getNotificationsContext();

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
    width: 300px;
    border-radius: 4px;
    margin-bottom: 10px;
  }
  button {
    width: 300px;
    border-radius: 4px;
    background-color: #e6a683;
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
              addNotification({
                text: `You've been added you to the mailing list!`,
                position: 'top-center',
                type: 'success',
              });
              console.log('SUCCESS!', response.status, response.text);
            },
            (err) => {
              addNotification({
                text: `That didn't work for some reason. Email me to make sure I get you on the list!`,
                position: 'top-center',
                type: 'warning',
              });
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
