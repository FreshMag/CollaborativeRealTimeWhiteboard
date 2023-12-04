<template>
    <ul class="row pb-3 activeUsers">
      <template v-for="(username,index) in this.onlineUsernames" :key="username">
          <div class="col" @mouseover="hover[index] = true" @mouxseleave="hover[index] = false" style="height: 40px"><Identicon :seed="username"></Identicon></div>
          <div class="col align-middle hideDesktop" v-if="hover[index]"><p>{{username}}</p></div>
      </template>
    </ul>
</template>

<script>
import {socket} from "@/scripts/socket";
import Identicon from "@/components/common/Identicon.vue";

export default {

    name: "ActiveUserInWhiteboard",
    components: {Identicon},
    data() {
        return {
            onlineUsernames: [],
            hover: [],
        };
    },
    created() {
        socket.on('allConnectedUsers', (usernames) => {
            this.onlineUsernames = usernames;
        })
    },
    mounted() {
        socket.on("user-connected", (username) => {
            if(!this.onlineUsernames.includes(username)){
                this.onlineUsernames.push(username);
            }
        });
        socket.on("user-disconnected", (username) =>{
            if(this.onlineUsernames.includes(username)){
                this.onlineUsernames.splice(this.onlineUsernames.indexOf(username),1);
            }

        })
    },
    unmounted() {
        this.onlineUsernames = [];
    }
}
</script>

<style scoped>
#front {
    overflow: hidden;
    overflow-wrap: break-word;
}

.vcenter-item{
    display: flex;
    align-items: center;
}

.activeUsers {
  list-style-type: none;
  margin-bottom: 0;
  padding-left: 0;
  flex-direction: row;
}
container {
    position: relative;
    height: auto;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
}

@media screen and (max-width: 720px) {
  .hideDesktop {
    display: none;
  }
}

</style>