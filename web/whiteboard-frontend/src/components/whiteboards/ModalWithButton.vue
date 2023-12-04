<template>
    <div class="modal" tabindex="-1" :id="modalId">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{title}}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <slot>
                    </slot>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" ref="closeBtn">Close</button>
                    <button type="button" class="btn btn-primary" @click="this.click">{{buttonText}}</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "ModalWithButton",
    props: {
      modalId: String,
      title: String,
      text: String,
      inputName: String,
      buttonText: String,
      click: Function
    },
    methods: {
        close() {
            this.$refs.closeBtn.click();
        }
    }
}
</script>

<style scoped>

</style>