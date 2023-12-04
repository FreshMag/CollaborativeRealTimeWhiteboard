<template>
    <div class="col-3 mb-3" v-for="(item, index) in importProps" :key="index">
        <button v-on:click="importFile()" type="button" :class="item.color" class="btn d-inline-flex align-items-center col-12 p-2 h-100" id="SignInButton" >
            <div class="flex-fill">{{item.title}}</div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi" viewBox="0 0 16 16">
                <path :d="item.icon"></path>
            </svg>
            <input type="file" id="fileInput" ref="fileInput" accept="image/svg" hidden/>
        </button>
    </div>
</template>
<script>
export default {
    name: 'AddWhiteboardComponent',
    props: ['importProps'],
    methods: {
        importFile() {
            document.getElementById("fileInput").click()
        }
    }
}
</script>