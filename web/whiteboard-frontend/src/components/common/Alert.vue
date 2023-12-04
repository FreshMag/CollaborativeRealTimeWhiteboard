<template>
    <div :class="'alert ' + this.type  + ' alert-dismissible fade show'" role="alert">
        {{text}}
        <button type="button" class="btn-close bi-align-end" @click="closeClick"></button>
    </div>
</template>

<script>
export default {
    name: "Alert",
    props: {
        type: {
            type: String,
            default: "alert-danger"
        },
        text: String,
        closeClick: Function
    }
}
</script>

<style scoped>

</style>