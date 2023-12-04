<template>
  <div class="col-3 mb-3 hideDesktop" v-for="(item, index) in addProps" :key="index">
    <a @click="addWhiteboard(index)" role="button" :class="item.color"
            class="btn d-inline-flex align-items-center col-12 p-2 h-100 mb-3" id="addWhiteboardId"
            data-bs-toggle="modal" data-bs-target="#whiteboardModal">
      <div class="flex-fill">{{item.title}}</div>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi" viewBox="0 0 16 16">
        <path :d="item.icon"></path>
      </svg>
    </a>
  </div>
  <div class="hideMobile">
    <FAB v-on:click="this.openModal"></FAB>
  </div>
</template>
<script>
import FAB from "@/components/whiteboards/FAB.vue";

export default {
  name: 'WhiteboardsListComponent',
  components: {FAB},
  props: ['addProps'],
  emits: ['add-whiteboard'],
  methods: {
    addWhiteboard(index) {
      this.$emit('add-whiteboard', index);
    },
    openModal() {
      document.getElementById("addWhiteboardId").click()
    }
  }
}
</script>

<style scoped>

.hideMobile {
  display: none;
}

@media (max-width: 770px) {

  .hideDesktop {
    display: none;
  }
  .hideMobile {
    display: block;
  }
}
</style>