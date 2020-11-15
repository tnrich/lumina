<script>
  import { Router, Link, Route } from "svelte-routing";
  import Home from "./Home.svelte";
  import Story from "./Story.svelte";
  import Nav from "./Nav.svelte";
  import Shop from "./Shop.svelte";
  import Gallery from "./Gallery.svelte";
  import Notifications from "svelte-notifications";

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
    <Nav />

    <!-- <Route path="blog/:id" component="{BlogPost}" />
    <Route path="blog" component="{Blog}" />
    <Route path="about" component="{About}" /> -->
    <div class="page-container">
      <Route path="/">
        <Home />
      </Route>
      <Route path="/story">
        <Story />
      </Route>
      <Route path="/shop">
        <Shop />
      </Route>
      <Route path="/gallery">
        <Gallery />
      </Route>
    </div>
  </Router>
</Notifications>
