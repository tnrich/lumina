<script>
  import Carousel from "@beyonk/svelte-carousel";
  import Header from "./Header.svelte";
</script>

<style>
  /* .photoholder {
    color: white;
  } */
  .slide-content {
    width: 100%;
  }
</style>

<Header subtext={'A few of my favorite photos'} title={'Gallery'} />
<br />
<br />
<Carousel perPage={1}>
  <div class="slide-content">
    <img
      src="gallery_photos/1.jpg"
      alt="Kitten 1" />
  </div>

  <div class="slide-content">
    <img
      src="gallery_photos/2.jpg"
      alt="Kitten 1" />
  </div>

  <div class="slide-content">
    <img
      src="gallery_photos/3.jpg"
      alt="Kitten 1" />
  </div>

  <div class="slide-content">
    <img
      src="gallery_photos/4.jpg"
      alt="Kitten 1" />
  </div>

  <div class="slide-content">
    <img
      src="gallery_photos/5.jpg"
      alt="Kitten 1" />
  </div>

  <div class="slide-content">
    <img
      src="gallery_photos/6.jpg"
      alt="Kitten 1" />
  </div>

  <div class="slide-content">
    <img
      src="gallery_photos/7.jpg"
      alt="Kitten 1" />
  </div>
  <div class="slide-content">
    <img
      src="gallery_photos/8.jpg"
      alt="Kitten 1" />
  </div>
  <div class="slide-content">
    <img
      src="gallery_photos/9.jpg"
      alt="Kitten 1" />
  </div>

</Carousel>
