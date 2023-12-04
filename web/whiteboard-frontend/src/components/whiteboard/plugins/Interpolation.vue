<template>
    <path v-for="(path) in this.interpolatingPaths"
          v-bind="{d: path.points, stroke: path.color,'stroke-opacity': this.strokeOpacity,
                    'stroke-width': path.stroke}"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
    >
    </path>
</template>

<script>
import {interpolate} from "@/scripts/whiteboard/interpolation";

export default {
    name: "Interpolation",
    data() {
        return {
            interpolatingPoints: {},
            interpolatingPaths: {},
            testInterpolation: 0,
            testInterpolationPeriod: 100, // temporarily, will be done by emitting less frequent data on sender side
            strokeOpacity: 0.5,
        }
    },
    methods: {
        init: function () {
            this.testInterpolation = performance.now();
        },
        createInterpolatingPath: function (id, color, stroke) {
            this.interpolatingPoints[id] = []
            this.interpolatingPaths[id] = {points:[], color:color, stroke: stroke};
        },

        interpolate: function (x, y, id) {
            if (performance.now() - this.testInterpolation > this.testInterpolationPeriod) {
                this.testInterpolation = performance.now();
                if (this.interpolatingPoints[id]) {
                    this.interpolatingPoints[id]?.push(x,y)
                    const path = this.interpolatingPaths[id]
                    interpolate(this.interpolatingPoints[id], path)
                }
            }
        },

        deleteInterpolatingPath(id) {
            delete this.interpolatingPoints[id]
            delete this.interpolatingPaths[id]
        },

    },
    mounted() {
        this.init();
    }
}
</script>

<style scoped>

</style>