<script>
  import { Router, Link, Route } from "svelte-routing";
  import Home from "./Home.svelte";
  import Nav from "./Nav.svelte";

  // import About from "./About.svelte";
  // import Blog from "./Blog.svelte";

  export let url = "";
</script>

<style>
  
</style>

<Router {url}>
  <Nav />

  <div>
    <!-- <Route path="blog/:id" component="{BlogPost}" />
    <Route path="blog" component="{Blog}" />
    <Route path="about" component="{About}" /> -->
    <Route path="/"><Home /></Route>
  </div>
</Router>
