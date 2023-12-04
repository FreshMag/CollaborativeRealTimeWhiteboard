

<template>
  <div class="fabContainer">
    <a role="button" class="adminButton" @click="onClick"><i class="bi bi-plus"></i></a>
  </div>
</template>

<script>
export default {
  name: "FAB",
  emits: ["click"],
  methods: {
    onClick() {
      this.$emit("click")
    }
  }
}
</script>

<style scoped>


.fabContainer {
  z-index: 10;
  position: fixed;
  bottom: 35px; right: 25px;
}

.adminButton {
  height: 60px;
  width: 60px;
  background-color: rgba(67, 83, 143, 1);
  border-radius: 50%;
  display: block;
  color: #fff;
  text-align: center;
  position: relative;
  z-index: 1;
}

.adminButton i {
  font-size: 30px;
}

.adminButtons a {
  display: block;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  text-decoration: none;
  margin: 10px auto 0;
  line-height: 1.15;
  color: #fff;
  opacity: 0;
  visibility: hidden;
  position: relative;
  box-shadow: 0 0 5px 1px rgba(51, 51, 51, .3);
}

.adminButtons a:hover {
  transform: scale(1.1);
}

.adminButtons a:nth-child(1) {background-color: #ff5722; transition: opacity .2s ease-in-out .3s, transform .15s ease-in-out;}
.adminButtons a:nth-child(2) {background-color: #03a9f4; transition: opacity .2s ease-in-out .25s, transform .15s ease-in-out;}
.adminButtons a:nth-child(3) {background-color: #f44336; transition: opacity .2s ease-in-out .2s, transform .15s ease-in-out;}
.adminButtons a:nth-child(4) {background-color: #4CAF50; transition: opacity .2s ease-in-out .15s, transform .15s ease-in-out;}

.fabContainer a i {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
}

.adminToggle:checked ~ .adminButtons a {
  opacity: 1;
  visibility: visible;
}
</style>