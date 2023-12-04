<template>
    <button v-on:click="undoLine()" class="btn undoBtn"><img src="../../../assets/undo.svg" alt="Undo"></button>
</template>

<script>
export default {
    name: "UndoStack",
    data() {
        return {
            idStack : []
        }
    },
    emits:['undoLine'],
    methods: {
        undoLine: function () {
            try {
                const id = this.idStack.pop();
                this.$emit("undoLine", id);
            } catch (ignored) {}
        },
        addLine(id) {
            this.idStack.push(id)
        }
    }
}
</script>

<style scoped>

</style>