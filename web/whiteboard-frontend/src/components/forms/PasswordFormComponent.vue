<template>
    <div class="input-group mb-3">
            <div class="form-floating">
                <input v-model="password" :type="isVisible ? 'text' : 'password'" class="form-control" id="floatingPassword" @input="changePassword()" placeholder="Password" aria-required="true" required>
                <label for="floatingPassword">Password</label>
            </div>
            <button class="btn btn-outline-secondary" type="button" id="button-addon1" @click="showPassword">
                <img :src="require('@/assets/icons/' + image)" alt="show password"/>
            </button>
        </div>
</template>
<script>
export default {
    name: "PasswordFormComponent",
    emits:['password-changed'],
    data(){
        return{
            image: 'eye-slash.svg',
            iconHide: 'eye-slash.svg',
            iconShow: 'eye.svg', 
            isVisible: false,
            password: ''
        }
    },   
    methods: {
        init() {
            if (this.isVisible) {
                this.image = this.iconShow;
            } else {
                this.image = this.iconHide;
            }
        },
        showPassword() {
            this.isVisible = this.isVisible ? false : true;
            this.init();
        },
        changePassword() {
            this.$emit('password-changed',this.password);
        }
    }
}
</script>