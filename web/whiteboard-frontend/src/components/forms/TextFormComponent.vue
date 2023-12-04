<template>
    <div class="form-floating mb-3">
        <input type="text" class="form-control"  id="floatingUsername" v-model="text" aria-required="true" placeholder="Example Name" required>
        <label for="floatingUsername">{{name}}</label>
    </div>
</template>

<script>
export default {
    name: "TextFormComponent",
    props: {
      text: String,
      name: String
    },
    emits: ['update:text'],
    data() {
        return {
            text: ""
        }
    }
}
</script>

<style scoped>

</style>