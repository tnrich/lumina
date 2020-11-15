<script>
  import Carousel from "@beyonk/svelte-carousel";
  import Header from "./Header.svelte";

  import { ChevronLeftIcon, ChevronRightIcon } from "svelte-feather-icons";
</script>

<style>
  /* .photoholder {
    color: white;
  } */
  .slide-content {
    width: 100%;
  }
  img {
    max-width: 500px;
    max-height: 500px;
  }
</style>

<Header subtext={''} title={'Gallery'} />
<Carousel perPage={1}>
  <span class="control" slot="left-control">
    <ChevronLeftIcon />
  </span>

  <span class="control" slot="right-control">
    <ChevronRightIcon />
  </span>
  <div class="slide-content">
    <img src="gallery_photos/1.jpg" alt="Kitten 1" />
  </div>

  <div class="slide-content">
    <img src="gallery_photos/2.jpg" alt="Kitten 1" />
  </div>

  <div class="slide-content">
    <img src="gallery_photos/3.jpg" alt="Kitten 1" />
  </div>

  <div class="slide-content">
    <img src="gallery_photos/4.jpg" alt="Kitten 1" />
  </div>

  <div class="slide-content">
    <img src="gallery_photos/5.jpg" alt="Kitten 1" />
  </div>

  <div class="slide-content">
    <img src="gallery_photos/6.jpg" alt="Kitten 1" />
  </div>

  <div class="slide-content">
    <img src="gallery_photos/7.jpg" alt="Kitten 1" />
  </div>
  <div class="slide-content">
    <img src="gallery_photos/8.jpg" alt="Kitten 1" />
  </div>
  <div class="slide-content">
    <img src="gallery_photos/9.jpg" alt="Kitten 1" />
  </div>

  <div class="slide-content">
    <img src="gallery_photos/10.jpg" alt="Kitten 1" />
  </div>
  <div class="slide-content">
    <img src="gallery_photos/11.jpg" alt="Kitten 1" />
  </div>
  <div class="slide-content">
    <img src="gallery_photos/12.jpg" alt="Kitten 1" />
  </div>
</Carousel>
