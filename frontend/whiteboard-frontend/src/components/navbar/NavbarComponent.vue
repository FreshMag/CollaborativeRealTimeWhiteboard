<template>
    <nav class="row nav-container mb-4 no-gutters">
      <div class="col-3 menu-mobile">
        <a class="menu-mobile-button" data-bs-toggle="collapse" href="#menuMobileCollapse"
           role="button" aria-expanded="false" aria-controls="menuMobileCollapse" ref="mobileCollapseBtn">
          <BootstrapIcon icon="bi bi-list" size="2.3rem" color="black"></BootstrapIcon>
        </a>
      </div>
      <div class="col logo-container">
        <router-link to="/" class="col-md-3 mb-2 mb-md-0">
          <img class="logo" src="../../assets/icons/Logo.png" width="675" height="190" alt="Site Logo">
        </router-link>
      </div>

      <ul class="links-desktop nav nav-pills col text-center align-items-center justify-content-center ">
        <li v-for="link in this.links">
            <router-link v-if="(link.loginNeeded && this.isLogged) || (!link.loginNeeded)"
                      :to="link.href" class="nav-item nav-link px-2 navbar-links">{{link.name}}</router-link></li>

          <li>
              <div v-if="this.isLogged" class="position-relative">
                  <router-link :to="this.linkToNotification" class="nav-item nav-link px-2 navbar-links">{{ "Notifications" }}</router-link>
                  <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {{this.unreadMessage}}
              </span>
              </div>
          </li>
      </ul>
        <div class="col loginButtons">
            <div v-if="!isLogged">
                <a role="button" class="btn btn-light mx-2"  href="#/login">Sign In</a>
                <a role="button" class="btn btn-outline-success" href="#/register">Sign Up</a>
            </div>
            <div v-else>
              <NavbarUserDropdown :username="this.username" :first_name="this.first_name" @logout="this.logout"></NavbarUserDropdown>
            </div>
        </div>
      <div class="col-3 menu-mobile">
        <div v-if="!isLogged">
          <a role="button" href="#/login">
            <BootstrapIcon icon="bi bi-box-arrow-in-right" size="1.8rem" color="black"></BootstrapIcon>
          </a>
        </div>
        <div v-else>
          <NavbarUserDropdown :username="this.username" :first_name="this.first_name" @logout="this.logout"></NavbarUserDropdown>
        </div>
      </div>
      <div class="collapse menu-mobile" id="menuMobileCollapse" ref="collapse">
        <div class="collapse-body">
          <ul>
            <li v-for="link in this.links">
              <div v-if="(link.loginNeeded && this.isLogged) || (!link.loginNeeded)">
                <router-link :to="link.href" class="navbar-links" @click="this.collapse">{{ link.name }}</router-link>
                <hr/>
              </div>
            </li>
              <li>
                  <div v-if="this.isLogged" class="position-relative">
                      <router-link :to="this.linkToNotification" class="navbar-links" @click="this.collapse">{{ "Notifications" }}</router-link>
                      <hr/>
                      <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {{this.unreadMessage}}
              </span>
                  </div>
              </li>
          </ul>
        </div>
      </div>
    </nav>
</template>
<script>
import axios from "axios";
import {socket, state} from "@/scripts/socket";
import BootstrapIcon from "@/components/common/BootstrapIcon.vue";
import NavbarUserDropdown from "@/components/navbar/NavbarUserDropdown.vue";
export default {
    name: 'NavbarComponent',
    props: ['loginStatus'],
    components: {
      NavbarUserDropdown,
      BootstrapIcon,
    },
    data() {
        return {
            isLogged: false,
            first_name: '',
            defaultRefreshTimeoutMs: 5 * 60 * 1000,
            username: '',
            links: [{href: "/", name: "Home", loginNeeded: false},
              {href: "/whiteboards", name: "Whiteboards", loginNeeded: true}, {href: "/profile", name: "Profile", loginNeeded: true}, ],
            linkToNotification: '/notifications',
            unreadMessage:  0
        }
    },
    created() {
        this.loadUnreadNotification();
    },
    methods: {
        collapse() {
            this.$refs.mobileCollapseBtn.click();

        },
        updateNotificationNumber(){
          this.unreadMessage++;
        },
        loadUnreadNotification(){
            axios.get(`http://${process.env.VUE_APP_BACKEND_IP}/api/profile/unreadNotifications/`, {
                params: {
                    accessToken: localStorage.getItem("accessToken"),
                }
            }).then(response => {
                this.unreadMessage = response.data.number;
            }).catch(error => {
                this.$emit("onBadToken");
                console.log(error)
            })
        },
        reloadNavbar() {
            if (localStorage.getItem('accessToken') && !this.isLogged) {
                axios.post(`http://${process.env.VUE_APP_BACKEND_IP}/api/auth/refresh`, {
                    accessToken: localStorage.getItem('accessToken'),
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }, withCredentials: true
                }).then(() => {
                    socket.emit("joinApplication", localStorage.getItem('accessToken'), (callback) => {
                      socket.connected = callback.status === 'ok';
                    });
                    this.isLogged = true;
                    this.first_name = localStorage.getItem("name")
                    this.username = localStorage.getItem("username")
                    this.$forceUpdate();
                    // REFRESH TOKEN EVERY 8 minutes (or so)
                    setInterval(() => {
                        axios.post(`http://${process.env.VUE_APP_BACKEND_IP}/api/auth/refresh`, {
                            accessToken: localStorage.getItem('accessToken'),
                        }, {
                            headers: {
                                'Content-Type': 'application/json'
                            }, withCredentials: true
                        }).then(refresh => {
                            console.log(refresh);
                            localStorage.setItem('accessToken', refresh.data.token);
                        }).catch(error => {
                            console.log(error);
                            this.logout();
                        })
                    }, this.defaultRefreshTimeoutMs)
                }).catch(error => {
                    console.log(error)
                    console.log("Errore")
                    localStorage.removeItem("accessToken");
                    this.isLogged = false;
                });
            }
        },
        logout() {
            socket.emit('disconnectApplication', localStorage.getItem('accessToken'));
            localStorage.removeItem("accessToken")
            localStorage.removeItem("name")
            localStorage.removeItem("userId")
            localStorage.removeItem("username")
            this.first_name = ''
            this.isLogged = false
            this.$router.replace({ path: '/' })
        },
        changeName(name) {
            this.first_name = name;
        }
    },
    updated: function() {
      this.reloadNavbar();
      this.loadUnreadNotification();
    },
    mounted: function() {
        this.reloadNavbar();
        this.loadUnreadNotification();
    }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins&display=swap');
.no-gutters {
  margin-right: 0;
  margin-left: 0;

  > .col,
  > [class*="col-"] {
    padding-right: 0;
    padding-left: 0;
  }
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

li {
  list-style-type: none;
}

.menu-mobile {
  display: none;
}

.logo {
  max-width: 135px;
  max-height: 38px;
}

.loginButtons {
  display: flex;
  justify-content: center;
  align-items: center;
}

.nav-container {
  background-color: white;
  box-shadow: 0 1px 2px #cecece;
  min-height: 77px;
}

@media (max-width: 1002px) {

  .menu-mobile {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .loginButtons {
    display: none;
  }
  .menu-mobile-button {
    transition: all 300ms ease;
  }
  .menu-mobile-button:active {
    filter: brightness(50%);
  }
  .links-desktop {
    display: none;
  }

  .logo-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .nav-container {
    min-height: 80px;
  }
  .logo {
    display: inline-block;

  }
  .collapse-body {
    padding: 10px;
  }

  .navbar-links {
    font-size: 1rem;
    display: block;
    margin: 15px;
    text-decoration: none;
  }
  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
  hr {
    display: block;
    height: 1px;
    border: 0;
    border-top: 1px solid #ccc;
    margin: 1em 0;
    padding: 0;
  }


}

</style>