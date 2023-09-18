<template>
<div class="container min-vh-100">
    <div class="row min-vh-100 justify-content-center align-items-center">
        <div class="w-100" style="max-width: 400px;">
            <form @submit.prevent="submitForm">
                <h1 class="h3 mb-5">Login</h1>
                <EmailFormComponent @email-changed="emailHandler"></EmailFormComponent>
                <PasswordFormComponent @password-changed="passwordHandler"></PasswordFormComponent>
                <div class="alert alert-danger" role="alert" :hidden="!this.isInvalid">
                    Wrong Email or password.
                </div>
                <div class="form-floating mb-3">
                    <button type="submit" class="btn btn-primary col-12" id="SignInButton">Sign in</button>
                </div>
                <div class="text-center">
                    <p>Not a member? <a href="#/register">Register</a></p>
                </div>
            </form>
        </div>
    </div>
</div>
</template>
<script>
import axios from "axios";
import EmailFormComponent from "@/components/forms/EmailFormComponent.vue"
import PasswordFormComponent from "@/components/forms/PasswordFormComponent.vue";
export default {
    name: 'LoginView',
    components: {
        EmailFormComponent,
        PasswordFormComponent
    },
    data() {
        return {
            email: '',
            password: '',
            isInvalid: false,
        }
    },
    emits: ['onLogin'],
    methods: {
        emailHandler(email) {
            this.email = email;
        },
        passwordHandler(password) {
            this.password = password;
        },
        submitForm() {
            const ref = this;
            axios.post(`http://${process.env.VUE_APP_BACKEND_IP}:4000/api/auth/login`,
            {
                username: this.email,
                password: this.password,
            }, {withCredentials: true}).then(response => {
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('name', response.data.name);
                localStorage.setItem('userId', response.data.userId);
                localStorage.setItem('username', response.data.username);
                this.$router.replace({ path: '/whiteboards' })
                this.$emit("onLogin");
            }).catch(error => {
                this.isInvalid = true;
            });
        }
    }
}
</script>