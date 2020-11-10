<script>
  // import { Router, Link, Route } from "svelte-routing";
  // import Home from "./Home.svelte";
  // import About from "./About.svelte";
  // import Blog from "./Blog.svelte";
</script>

<style>
  @import url(https://fonts.googleapis.com/css?family=Roboto:400,700);

  @keyframes checked-anim {
    50% {
      width: 3000px;
      height: 3000px;
    }
    100% {
      width: 100%;
      height: 100%;
      border-radius: 0;
    }
  }
  @keyframes not-checked-anim {
    0% {
      width: 3000px;
      height: 3000px;
    }
  }
  li,
  a {
    margin: 75px 0 -55px 0;
    color: black;
    font: 14pt "Roboto", sans-serif;
    font-weight: 700;
    line-height: 1.8;
    text-decoration: none;
    text-transform: none;
    list-style: none;
    outline: 0;
    display: none;
  }
  li {
    width: 230px;
    text-indent: 56px;
  }
  a:focus {
    display: block;
    color: #333;
    background-color: #eee;
    transition: all 0.5s;
  }

  #trigger,
  #burger,
  #burger:before,
  #burger:after {
    position: absolute;
    top: 25px;
    left: 25px;
    background: black;
    width: 30px;
    height: 5px;
    transition: 0.2s ease;
    cursor: pointer;
    z-index: 1;
  }
  #trigger {
    height: 25px;
    background: none;
  }
  #burger:before {
    content: " ";
    top: 10px;
    left: 0;
  }
  #burger:after {
    content: " ";
    top: 20px;
    left: 0;
  }

  #menu-toggle:checked + #trigger + #burger {
    top: 35px;
    transform: rotate(180deg);
    transition: transform 0.2s ease;
  }

  #menu-toggle:checked + #trigger + #burger:before {
    width: 20px;
    top: -2px;
    left: 18px;
    transform: rotate(45deg) translateX(-5px);
    transition: transform 0.2s ease;
  }
  #menu-toggle:checked + #trigger + #burger:after {
    width: 20px;
    top: 2px;
    left: 18px;
    transform: rotate(-45deg) translateX(-5px);
    transition: transform 0.2s ease;
  }
  #menu-toggle,
  #burger,
  #trigger {
    z-index: 11;
  }
  #menu {
    z-index: 10;
    position: absolute;
    margin: 0;
    padding: 0;
    width: 110px;
    height: 110px;

    border-bottom-right-radius: 100%;
    /* box-shadow: 0 2px 5px rgba(0,0,0,0.26); */
    animation: not-checked-anim 0.2s both;
    transition: 0.2s;
  }
  #menu-toggle:checked + #trigger + #burger + #menu {
    animation: checked-anim 1s ease both;
    background: wheat;
  }
  #menu-toggle:checked + #trigger ~ #menu > li,
  a {
    display: block;
  }
  [type="checkbox"]:not(:checked),
  [type="checkbox"]:checked {
    display: none;
  }
</style>

<div>
  <input type="checkbox" id="menu-toggle" />
  <label id="trigger" for="menu-toggle" />
  <label id="burger" for="menu-toggle" />
  <ul id="menu">
    <li><a href="/">Home</a></li>
    <li><a href="/story">Story</a></li>
    <li><a href="/shop">Shop</a></li>
    <li><a href="/gallery">Gallery</a></li>
    <li><a href="https://www.instagram.com/luminawines/">Instagram</a></li>
  </ul>
</div>
