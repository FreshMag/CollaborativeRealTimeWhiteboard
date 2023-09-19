<template>
  <div class="row p-2" v-if="notification.length === 0">
    <h2>There are no notifications to display</h2>
    <img src="../assets/nothing_here.png" alt="no notification image" class="center">
  </div>
  <div class="row p-2" v-for="notif in notification">
    <div class="d-flex justify-content-center align-items-center w-100">
      <div class="toast position-relative">
        <div class="toast-header">
          <i class="bi bi-bell-fill" style="padding-right: 5px"></i>
          <strong class="me-auto">{{ notif.type ? notif.type : "Generic Notification" }}</strong>
          <small>{{ formatDate(new Date(notif.time)) }}</small>
          <button type="button" class="btn-close" @click="this.deleteNotification(notif._id)" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          {{ notif.body }}
        </div>
        <span v-if="!notif.visualized"
          class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">New!</span>
      </div>
    </div>
  </div>
</template>

<script>

import axios from "axios";
import { Toast } from "bootstrap";

export default {
  name: "NotificationView",
  data() {
    return {
      notification: [],
    }
  },
  emits: ['updateNotificationBadge', 'onBadToken'],
  mounted() {
    this.getNotification();
  },
  methods: {

    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");

      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    },

    getNotification() {
      axios.get(`http://${process.env.VUE_APP_BACKEND_IP}/api/profile/notifications/`, {
        params: {
          accessToken: localStorage.getItem("accessToken"),
        }
      }).then(response => {
        this.notification = response.data.notification;

        this.notification.sort(function (x, y) {
          return new Date(y.time) - new Date(x.time);
        });

        this.notification.filter(function (el) {
          return !el.visualized
        }).forEach(toVisualize => {
          this.setVisualized(toVisualize._id);
        })
      }).catch(error => {
        this.$emit("onBadToken");
        console.log(error)
      })
    },
    deleteNotification(id) {
      //start spinner
      axios.delete(`http://${process.env.VUE_APP_BACKEND_IP}/api/profile/deleteNotifications/`, {
        params: {
          accessToken: localStorage.getItem("accessToken"),
          id: id
        }
      }).then(() => {
        // stop spinner
        this.getNotification();
      }).catch(error => {
        // show error
        this.$emit("onBadToken");
        console.log(error)
      })
    },
    setVisualized(id) {
      axios.patch(`http://${process.env.VUE_APP_BACKEND_IP}/api/profile/updateNotification/`, {
        accessToken: localStorage.getItem("accessToken"),
        id: id
      }).then(() => {
        this.$emit('updateNotificationBadge');
      }).catch(error => {
        this.$emit("onBadToken");
        console.log(error)
      })
    }

  }
}
</script>

<style scoped>
.toast {
  display: block !important;
}

.center {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 60%;
}
</style>