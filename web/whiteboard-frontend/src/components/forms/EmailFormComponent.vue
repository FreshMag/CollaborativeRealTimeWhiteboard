<template>
    <div class="form-floating mb-3">
            <input type="email" class="form-control" :class="{ 'is-invalid' : isValid, 'is-valid' : validationFeedback}" id="floatingUsername" v-model="email" @input="validateEmail(); changeEmail()" aria-required="true" placeholder="name@example.com" required>
            <label for="floatingUsername">Email address</label> 
            <div class="invalid-feedback">
                Please provide a valid email.
            </div>
        </div>
</template>
<script>
export default {
    name: "EmailFormComponent",
    emits:['email-changed'],
    data () {
      return {
        isValid: false,
        validationFeedback: false,
        email: '',
      }
    },
    methods: {
        validateEmail() {
            const emailRegularExpression = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            const item = document.getElementById("floatingUsername");
            if(emailRegularExpression.test(this.email)) {
                this.isValid = false;
                this.validationFeedback = true;
            } else {
                this.isValid = true;
            }
        },
        changeEmail() {
            this.$emit('email-changed',this.email);
        }
    }
}
</script>