<template>

    <svg xmlns="http://www.w3.org/2000/svg"
        width="100%"
         height="100%"
         preserveAspectRatio="none"
         id="whiteboard"
         viewBox="0 0 1000 563"
    >
        <rect id="bg" width="100%" height="100%" fill="#FFFFFF"></rect>
        <g v-html="paths"></g>

    </svg>
</template>

<script>
import {traitToPaths} from "@/scripts/whiteboard/pointsToSvg";
const $ = document.querySelector.bind(document)
export default {
    name: "StaticWhiteboard",
    data() {
        return {
            svg: "",
            paths: ''
        }
    },
    methods: {
        traitToPaths,
        renderPaths() {
            if (this.traits) {
                for (const id in this.traits) {
                    const trait = this.traits[id];
                    this.paths += traitToPaths(trait, this.svg, id).outerHTML
                }
            }
        }
    },
    props: {
        traits: Object
    },
    mounted() {
        this.svg = $("#whiteboard")
        this.renderPaths()
    }
}
</script>

<style scoped>

</style>