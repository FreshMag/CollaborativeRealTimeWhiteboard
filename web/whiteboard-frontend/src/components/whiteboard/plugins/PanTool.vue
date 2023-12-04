
<template>
  <BootstrapIcon icon="bi bi-arrows-move" size="2rem" @click="this.togglePan" :toggleable="true"
                 color="black" toggle-color="lightgreen"></BootstrapIcon>
</template>
<script>
import {defineComponent} from 'vue'
import BootstrapIcon from "@/components/common/BootstrapIcon.vue";

export default defineComponent({
  name: "PanTool",
  components: {BootstrapIcon},
  data() {
    return {
      canvas: undefined,
      panActive: false,
      startClient: undefined,
      startGlobal: undefined,
      point: undefined,
      viewBox: undefined,
      moving: false
    }
  },
  emits: ['togglePan'],
  mounted() {
  },
  methods: {
    togglePan() {
      this.panActive = !this.panActive;
      this.$emit('togglePan');
      this.canvas.style.cursor = this.panActive ? 'grab' : 'none';

      if (this.panActive) {
        this.canvas.addEventListener("mousedown", this.mouseDown)
        this.canvas.addEventListener("mousemove", this.mouseMove)
        this.canvas.addEventListener("mouseup", this.mouseUp)
        //-------
        this.canvas.addEventListener("touchstart", this.mouseDown)
        this.canvas.addEventListener("touchmove", this.mouseMove)
        this.canvas.addEventListener("touchend", this.mouseUp)
      } else {
        this.canvas.removeEventListener("mousedown", this.mouseDown)
        this.canvas.removeEventListener("mousemove", this.mouseMove)
        this.canvas.removeEventListener("mouseup", this.mouseUp)
        //-------
        this.canvas.removeEventListener("touchstart", this.mouseDown)
        this.canvas.removeEventListener("touchmove", this.mouseMove)
        this.canvas.removeEventListener("touchend", this.mouseUp)
      }
    },
    move(dx, dy) {
      const viewBox = this.canvas?.viewBox?.baseVal;
      viewBox.x -= dx;
      viewBox.y -= dy;
    },
    setCanvas(canvas) {
      this.canvas = canvas;
      this.viewBox = this.canvas?.viewBox?.baseVal;
      this.startClient = this.canvas.createSVGPoint();
      this.startGlobal = this.canvas.createSVGPoint();
      this.point = this.canvas.createSVGPoint();
    },
    mouseMove(e) {
      if (this.moving) {
        this.point = this.getCoordinates(e);

        const moveGlobal = this.point.matrixTransform(this.canvas.getScreenCTM().inverse());
        this.move(moveGlobal.x - this.startGlobal.x, moveGlobal.y - this.startGlobal.y)
      }
    },
    mouseDown(e) {
      this.moving = true;
      this.startClient = this.getCoordinates(e);
      this.startGlobal = this.startClient.matrixTransform(this.canvas.getScreenCTM().inverse());
    },
    mouseUp() {
      this.moving = false;
    },
    getCoordinates(event) {
      const screenPoint = this.canvas.createSVGPoint();
      event.preventDefault();
      if (event.clientX && event.clientY) {
        screenPoint.x = event.clientX;
        screenPoint.y = event.clientY;
      } else if (event.changedTouches[0].clientX && event.changedTouches[0].clientY) {
        screenPoint.x = event.changedTouches[0].clientX;
        screenPoint.y = event.changedTouches[0].clientY;
      }

      return screenPoint;
    }

  }
})
</script>

<style scoped>
.btnRandom {
  position: absolute;
  z-index: 500;
  top: 50%;
  left: 50%;
}
</style>