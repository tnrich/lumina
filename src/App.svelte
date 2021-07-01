<script>
  import { Router, Link, Route } from "svelte-routing";
  import Home from "./Home.svelte";
  import Story from "./Story.svelte";
  import Nav from "./Nav.svelte";
  // import Shop from "./Shop.svelte";
  // import Gallery from "./Gallery.svelte";
  import Notifications from "svelte-notifications";
  import Releases from "./Releases.svelte";

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
    

    <!-- <Route path="blog/:id" component="{BlogPost}" />
    <Route path="blog" component="{Blog}" />
    <Route path="about" component="{About}" /> -->
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
      <!-- 
      <Route path="/shop">
        <Shop />
      </Route>
      <Route path="/gallery">
        <Gallery />
      </Route> -->
    </div>
  </Router>
</Notifications>
