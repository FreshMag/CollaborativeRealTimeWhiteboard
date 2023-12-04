<template>
    <div class="wrap">
      <div class="headerWrap">
        <header class="w-100 text-center mainHeader">
          <div class="whiteboard-container">
            <div class="whiteBoard d-inline-block"></div>
          </div>

          <div class="headerText">
            <h1><span class="w">W</span>hiteboard</h1>
            <div class="realtime-container">
              <p class="r one">Real</p>
              <p class="r two"><span class="w">time</span></p>
            </div>
          </div>
        </header>
        <router-link
            :to="isLogged ? '/whiteboards' : '/login'"
            custom
            v-slot="{ navigate }"
        >
          <button
              class="btn btn-primary shadow mt-5 mainBtn"
              @click="navigate"
              role="link">
            {{ isLogged ? "Your Whiteboards" : "Sign In" }}
          </button>
        </router-link>
      </div>
        <div class="canvasContainer">
         <img class="imgHomeDesktop m-1" src="../assets/home/homeall.png" alt="Drawing examples">
        </div>
      <div class="carousel-container">
        <Carousel>
          <div class="carousel-item active">
            <img class="imgSvg rounded shadow" src="../assets/home/home1.svg" alt="Drawing 1">
          </div>
          <div class="carousel-item">
            <img class="imgSvg rounded shadow" src="../assets/home/home2.svg" alt="Drawing 2">
          </div>
          <div class="carousel-item">
            <img class="imgSvg rounded shadow m-1" src="../assets/home/home3.svg" alt="Drawing 3">
          </div>
        </Carousel>
      </div>

    </div>
</template>
<script>


import Carousel from "@/components/common/Carousel.vue";

export default {
    name: 'HomepageView',
  components: {Carousel},
    data() {
       return {
         isLogged: false
       }
    },
    mounted() {
      this.isLogged = localStorage.getItem('accessToken');
    }
}
</script>
<style scoped>

.imgSvg{
    width: 30vh;
}

.imgHomeDesktop{
    width: 60%;
}
.canvasContainer{
  justify-content: center;
  width: 100%;
  height: 100%;
  padding-top: 1vh;
}

* {
    transition: all 0.3s ease;
    -webkit-animation-fill-mode: both;
}

.wrap {
  display: block;
  width: 100%;
  height: 100%;
  text-align: center;
  margin-top: 30px;
  zoom: 150%;
}

.headerWrap {
  display: flex;
  flex-direction: column;
}

.whiteboard-container {
  display: flex;
  width: 110px;
  height: 90px;
  flex-direction: column;
  justify-content: flex-end;
  align-content: flex-end;
}

.whiteBoard {
    width: 55px;
    height: 55px;
    border: 5px solid gray;
    position: absolute;
    transform: rotateX(30deg) rotateY(30deg);
    margin-top: 25px;
}

.whiteBoard:before {
    content: ' ';
    width: 55px;
    height: 55px;
    border: 5px solid gray;
    position: absolute;
    transform: translateY(-15px) translateX(-23px) rotateZ(10deg);
    animation: rotateLogoOne 0.75s ease 1;
    -webkit-animation-fill-mode: both;
    animation-delay: 0.2s;
}

.whiteBoard:after {
    content: ' ';
    width: 55px;
    height: 55px;
    border: 5px solid gray;
    position: absolute;
    transform: translateY(-25px) translateX(-13px) rotateZ(20deg);
    animation: rotateLogoTwo 1s ease 1;
    -webkit-animation-fill-mode: both;
    animation-delay: 0.2s;
}

h1, .realtime-container {
    text-align: right;
    font-weight: normal;
    height: 30px;
    font-family: 'Raleway', sans-serif;
}

h1 {
  width: 100%;
  text-align: right;
  display: block;
  font-size: 40px;
  transform: translateX(-30px);
  animation: rotate 0.3s ease 1;
  -webkit-animation-fill-mode: both;
  animation-delay: 0.3s;
}

.w {
    font-family: 'Titillium Web', sans-serif;
}

.realtime-container {
  width: 100%;
  text-align: right;
  color: #979599;
  font-size: 25px;
  display: block;
}

.r {
    margin-top: 0;
    display: inline-block;
    transform: rotateX(90deg);
    transform-origin: 50% 100%;
}

.one {
    animation: rotate 0.3s ease 1;
    -webkit-animation-fill-mode: both;
    animation-delay: 0.1s;
}

.two {
    animation: rotate 0.3s ease 1;
    -webkit-animation-fill-mode: both;
    animation-delay: 0.75s;
}

.headerText {
  display: flex;
  justify-content: center;
  align-content: center;
  flex-direction: column;
  text-align: center;
  margin-top: 10px;
  width: auto
}

.mainHeader {
  display: flex;
  justify-content: center;
  align-content: center;
}

.mainBtn {
  max-width: 300px;
  margin: 30px auto auto;
}

.carousel-container {
  display: none;
}
@keyframes rotate {
    to {
        transform: rotateX(0deg);
    }
}

@keyframes translate {
    to {
        transform: translateX(0px);
    }
}

@keyframes rotateLogoOne {
    to {
        transform: translateY(-15px) translateX(4px) rotateZ(0deg);
    }
}

@keyframes rotateLogoTwo {
    to {
        transform: translateY(-25px) translateX(13px) rotateZ(0deg);
    }
}

@media screen and (max-width: 500px) {

  .wrap {
    zoom: 100%;
  }

  .whiteboard-container {
    display: flex;
    margin: auto;
    max-width: 100px;
    max-height: 100px;
  }

  h1 {
    text-align: center;
    font-size: 30px;
    height: 20px;
  }
  .headerText {
    width: auto;
  }

  .realtime-container {
    text-align: center;
    margin: auto;
  }

  .mainHeader {
    display: block;

  }

  .canvasContainer {
    display: none;
  }

  .carousel-container {
    display: block;
    width: 100%;
    padding-top: 40px;
  }

  .imgSvg {
    width: auto;
    max-width: 300px;
  }
}
</style>