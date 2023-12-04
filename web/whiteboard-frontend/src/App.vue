<template>
  <NavbarComponent ref="navbar"></NavbarComponent>
  <NotificationComponent v-on:notification="this.onLiveNotification"></NotificationComponent>
  <router-view v-on:updateNotificationBadge="this.onVisualizeNotification" v-on:onLogin="this.onLogin"
    v-on:onBadToken="this.onBadToken" v-on:onChangedInfo="this.onChangedInfo" />
  <FooterComponent></FooterComponent>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}

@import'~bootstrap/dist/css/bootstrap.css';
</style>
<script>
import NotificationComponent from "@/components/notification/NotificationComponent.vue";
import NavbarComponent from "@/components/navbar/NavbarComponent.vue"
import FooterComponent from "./components/common/FooterComponent.vue";
export default {
  name: "App",
  components: { NotificationComponent, NavbarComponent, FooterComponent },
  methods: {
    onLogin() {
      this.$refs.navbar.reloadNavbar();
    },
    onBadToken() {
      this.$refs.navbar.logout();
    },
    onChangedInfo(name) {
      console.log("Changing " + name)
      this.$refs.navbar.changeName(name)
    },
    onVisualizeNotification() {
      this.$refs.navbar.loadUnreadNotification();
    },
    onLiveNotification() {
      this.$refs.navbar.updateNotificationNumber();
    }
  }
}
</script>