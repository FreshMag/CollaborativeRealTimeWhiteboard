

<template>
  <div>
    <i :class="`${this.icon} icon`"
       :style="`font-size: ${size}; color: ${color};`" @click="this.click" ref="icon"></i>
  </div>

</template>
<script>
import 'bootstrap-icons/font/bootstrap-icons.css'
export default {
  name: "BootstrapIcon",
  props: {
    icon: String,
    size: {
      default: "1rem",
      type: String
    },
    color: {
      default: "black",
      type: String
    },
    toggleable: {
      default: false,
      type: Boolean
    },
    toggleColor: {
      default: 'black',
      type: String
    }
  },
  methods: {
    click() {
      this.$refs.icon.classList.toggle("selected");
    }
  },
  mounted() {
    if (this.toggleable) {
      this.$refs.icon.classList.remove('icon')
    }
  }
}
</script>
<style scoped>
  .icon:hover {
    filter: brightness(50%);
    transition: 0.3s;
  }
  .selected {
    color: v-bind('toggleColor') !important;
  }

</style>