<template>
  <form class="container">
    <div class="alert alert-success mb-3" role="alert" :hidden="!this.isValid">
      Updated succesfully!
    </div>
    <div class="alert alert-danger mb-3" role="alert" :hidden="!this.isInvalid">
      Something went wrong
    </div>
    <div class="row border rounded g-3 text-start mb-5">
      <div class="col m-3">
        <h3><strong>Avatar</strong></h3>
        <p>Upload your avatar here</p>
      </div>
      <div class="col m-3">
        <div class="row d-flex justify-content-center">
          <div class="col-3 ">
            <IdenticonComponent style="width: 75px; height: 75px;" v-bind:seed="email"></IdenticonComponent>
          </div>
        </div>
      </div>
    </div>
    <div class="row border rounded g-3 text-start mb-5">
      <div class="col m-3">
        <h3><strong>User Informations</strong></h3>
        <p>This information will appear on your profile</p>
      </div>
      <div class="col m-3">
        <p><strong>Email</strong></p>
        <div class="input-group mb-3">
          <input disabled v-model="email" type="email" class="form-control" placeholder="email" aria-label="Email">
        </div>
        <p clsss="mb-2"><strong>Name</strong></p>
        <div class="input-group flex-nowrap mb-3">
          <input @input="checkChanges" v-model="name" type="text" class="form-control" placeholder="first name"
            aria-label="First name">
        </div>
        <p><strong>Surname</strong></p>
        <div class="input-group flex-nowrap mb-3">
          <input @input="checkChanges" v-model="surname" type="text" class="form-control" placeholder="Last name"
            aria-label="Last name">
        </div>
        <button type="button" class="btn btn-primary" @click="updateUserInfo" :disabled="!isEnabled">Update</button>
      </div>
    </div>
    <div class="row border rounded g-3 text-start mb-5">
      <div class="col m-3">
        <h3><strong>Password</strong></h3>
        <p>Manage your password</p>
      </div>
      <div class="col m-3">
        <p><strong>Password</strong></p>
        <div class="input-group mb-3">
          <input disabled v-model="password" type="password" class="form-control" placeholder="Password"
            aria-label="Password">
        </div>
        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#staticBackdrop">Change
          Password</button>
        <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
          aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Update your password</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <p>Insert a new password</p>
                <div class="input-group flex-nowrap mb-3">
                  <span class="input-group-text" id="modalNameInput">Password</span>
                  <input type="password" ref="newPassword" class="form-control" placeholder="New user password"
                    aria-label="New user password">
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" ref="closeBtn">Close</button>
                <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="updatePassword">Update
                  Password</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>
<script>

import axios from "axios";
import FooterComponent from "@/components/common/FooterComponent.vue"
import IdenticonComponent from "@/components/common/Identicon.vue";
export default {
  name: 'UserProfileView',
  components: {
    FooterComponent,
    IdenticonComponent
  },
  emits: ['onChangedInfo'],
  data() {
    return {
      email: localStorage.getItem('username'),
      name: '',
      surname: '',
      image: '',
      isValid: false,
      isInvalid: false,
      isEnabled: false,
      currentName: '',
      currentSurname: '',
      password: 'placeholder'
    }
  },
  methods: {
    scrollToTop() {
      window.scrollTo(0, 0);
    },
    getUserData() {
      axios.get(`http://${process.env.VUE_APP_BACKEND_IP}/api/userSetting/`, {
        params: {
          accessToken: localStorage.getItem("accessToken")
        }
      }).then(response => {
        const user = response.data
        this.email = user.username
        this.name = user.first_name
        this.surname = user.last_name
        this.currentName = user.first_name
        this.currentSurname = user.last_name
      }).catch(error => {
        this.$emit("onBadToken");
        console.log(error)
      })
    },
    updateUserInfo() {
      axios.put(`http://${process.env.VUE_APP_BACKEND_IP}/api/userSetting/updateInfo`, {
        accessToken: localStorage.getItem("accessToken"),
        first_name: this.name,
        last_name: this.surname,
        username: this.email
      }).then(response => {
        this.currentName = this.name
        this.currentSurname = this.surname
        this.isValid = true
        this.isInvalid = false
        const user = response.data
        localStorage.setItem('name', user.first_name);
        this.$emit("onChangedInfo", user.first_name);
        this.checkChanges()
        this.scrollToTop()
      }).catch(error => {
        this.isInvalid = true
        this.isValid = false
        this.scrollToTop()
      })

    },
    updatePassword() {
      axios.put(`http://${process.env.VUE_APP_BACKEND_IP}/api/userSetting/updatePassword`, {
        accessToken: localStorage.getItem("accessToken"),
        password: this.$refs.newPassword.value,
        username: this.email
      }).then(response => {
        this.isValid = true
        this.isInvalid = false
        this.scrollToTop()
      }).catch(error => {
        console.log(error)
        this.isValid = false
        this.isInvalid = true
        this.scrollToTop()
      })
    },
    checkChanges() {
      this.isEnabled = this.name !== this.currentName || this.surname !== this.currentSurname;
    },
  },
  mounted: function () {
    this.getUserData()
  }
}
</script>