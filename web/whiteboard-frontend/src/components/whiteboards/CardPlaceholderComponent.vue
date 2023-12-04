<template>
    <div class="col" v-for="placeholder in placeholderNum">
        <div @click.right.prevent="onRightClick" class="card border-secondary text-start h-100" aria-hidden="true">
            <svg class="bd-placeholder-img card-img-top" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder" preserveAspectRatio="xMidYMid slice" focusable="false">
                <title>Placeholder</title>
                <rect width="100%" height="100%" fill="#868e96"></rect>
            </svg>
            <div class="card-body">
                <p class="card-text placeholder-glow">
                    <span class="placeholder placeholder-s col-7"></span>
                    <span class="placeholder placeholder-xs col-6"></span>
                </p>    
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'CardPlaceholderComponent',
    data() {
        return {
            placeholderNum: 8
        }
    },
    methods: {
        onRightClick() {
            
        }
    }
}
</script>