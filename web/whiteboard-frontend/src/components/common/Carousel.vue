<template>
  <div id="carouselExampleSlidesOnly" class="carousel slide pb-4" data-bs-ride="carousel" data-bs-interval="2000">
    <div class="carousel-inner p-4">
      <slot></slot>
    </div>
  </div>
</template>
<script>
import {Carousel} from "bootstrap"
const $ = document.querySelector.bind(document);
export default {
    name: "Carousel",
  mounted() {
    new Carousel($("#carouselExampleSlidesOnly")).cycle()
  }
}
</script>
<style scoped>
</style>