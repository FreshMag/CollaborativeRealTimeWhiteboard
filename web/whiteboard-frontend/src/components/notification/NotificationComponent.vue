<template>
  <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
    <div class="toast" ref="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        <i class="bi bi-bell-fill" style="padding-right: 5px"></i>
        <strong class="me-auto">{{ notificationType }}</strong>
        <small></small>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        {{ notificationBody }}
      </div>
    </div>
  </div>
</template>

<script>
import {socket} from "@/scripts/socket";
import {Toast} from "bootstrap"

export default {
  name: "NotificationComponent",
  data() {
    return {
      connected: false,
      accessToken: localStorage.getItem("accessToken"),
      notificationBody: "",
      notificationType: "",
      toast: null
    }
  },
  emits: ['notification'],
  created() {
    this.connected = true;
  },
  mounted() {
    this.toast = new Toast(this.$refs.toast);
    // todo add the remaining attributes to socket.IO calls
    socket.on("user-connected", (username) => {
      this.notificationType = "User Connected to Whiteboard"
      this.notificationBody = username + " successfully connected to your whiteboard!";
      this.$emit('notification');
      this.toast.show();
    });

    socket.on('receiveCollaborationInvite', (from) => {
      this.notificationType = "Invite to Whiteboard"
      this.notificationBody = from + " invited you to their whiteboard!";
      this.$emit('notification');
      this.toast.show();
    })
  },
  unmounted() {
    this.connected = false;
    socket.removeAllListeners();
    socket.disconnect();
  },
  methods: {}
}

</script>

<style scoped>
</style>