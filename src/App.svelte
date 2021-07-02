<script>
  import { Router, Link, Route } from "svelte-routing";
  import Home from "./Home.svelte";
  import Story from "./Story.svelte";
  import Nav from "./Nav.svelte";
  import Notifications from "svelte-notifications";
  import Releases from "./Releases.svelte";
  import Contact from "./Contact.svelte";

  export let url = "";
</script>

<style>
  .page-container {
    text-align: center;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>

<Notifications>
  <Router {url}>
    <div class="page-container">
      <Nav />
      <Route path="/">
        <Home />
      </Route>
      <Route path="/about">
        <Story />
      </Route>
      <Route path="/releases">
        <Releases />
      </Route>
      <Route path="/contact-me">
        <Contact/>
      </Route>
    </div>
  </Router>
</Notifications>
