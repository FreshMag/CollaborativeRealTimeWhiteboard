<template>
    <div class="row p-1 m-0">
    <div class="col-11 mobile-full">
        <WhiteboardComponent v-bind:title="drawProps.title"
                             v-bind:colors="drawProps.colors"
                             v-bind:bgColors="drawProps.bgColors"
                             v-bind:lineColor="drawProps.lineColor"
                             v-bind:bgColor="drawProps.bgColor"
                             v-bind:strokes="drawProps.strokes"
                             v-bind:stroke="drawProps.stroke"
                             v-on:changeLineColor="changeLineColor"
                             v-on:changeBgColor="changeBgColor"
                             v-on:changeStroke="changeStrokeWidth"
                             v-on:drawSubmit="saveDrawing"
                             v-on:setLoading="setLoading"
        >
        </WhiteboardComponent>
    </div>
        <div class="col-1 hideDesktop">
        </div>
    </div>


</template>

<script>
// @ is an alias to /src
import WhiteboardComponent from '@/components/whiteboard/WhiteboardComponent.vue'
import {socket} from "@/scripts/socket";

export default {
    name: 'WhiteboardView',
    components: {
        WhiteboardComponent,
    },
    data() {
        return {
            loading: true,
            err: false,
            drawProps:
                {
                    title: "Freehand SVG Draw",
                    colors: ['#EAEAEA', '#292929', '#00A0FF', '#FF29AA', '#FFE500', '#FF3030', '#12EB0A'],
                    bgColors: ['#FFFFFF', '#292929', '#00A0FF', '#FF29AA', '#FFE500', '#FF3030', '#12EB0A'],
                    strokes: [2 ,5, 10, 15, 20, 25, 30],
                    lineColor: "#292929",
                    bgColor: "#FFFFFF",
                    stroke: 10
                }

        }
    },

    methods: {
        changeLineColor: function (color) {
            this.drawProps.lineColor = color;
        },

      changeStrokeWidth: function (stroke) {
          this.drawProps.stroke = stroke;
      },
        changeBgColor: function (color) {
            this.drawProps.bgColor = color;
        },

        saveDrawing: function (drawSvg) {
        },
        setLoading(args) {
            this.loading = args.loading;
            this.err = args.err;
        }
    },

    mounted: function () {
    },
    unmounted() {
        socket.emit("leftWhiteboard");
    }

}
</script>

<style scoped>

@media only screen and (max-width: 720px) {
  .hideDesktop {
    display: none;
  }
  .mobile-full {
    width: 100%;
  }
}
</style>

