<template>
    <div id="searchModal" class="modal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Invite to Whiteboard {{ name }}</h5>
                    <button aria-label="Close" class="btn-close" data-bs-dismiss="modal" type="button"></button>
                </div>
                <div class="modal-body">
                    <Alert v-if="alertOn" :text="alertText" :close-click="() => { alertOn = false; }" :type="this.alertType">
                    </Alert>
                    <span>Search users to add to this whiteboard</span>
                    <div class="m-1">
                        <Spinner v-if="this.loading"></Spinner>
                    </div>

                    <div class="mb-3">
                        <div class="dropdown">
                            <label class="form-label" for="dropdownSearch">Username</label>
                            <div class="row">
                                <input id="dropdownSearch" autocomplete="off" class="form-control"
                                    data-bs-toggle="dropdown" placeholder="name@example.com" type="search" @click="click"
                                    @focusin="focusIn" @focusout="focusOut" @input="inputChange">
                                <ul aria-labelledby="dropdownSearch" class="dropdown-menu">
                                    <li v-for="user in foundUsers" :key="user.username">

                                        <a class="dropdown-item" role="button" v-bind:class="{ disabled: user.alreadyIn }"
                                            @click="invite(user.username)">
                                            <div class="m-1 d-inline-block align-top" style="width: 30px;">
                                                <Identicon :seed="user.username"></Identicon>
                                            </div>
                                            <div class="d-inline-block">
                                                <div class="list-group" style="width: 18rem;">
                                                    <div class="card-body">
                                                        <h5 class="card-title">{{ user.first_name }} {{ user.last_name }}</h5>
                                                        <span v-if="user.alreadyIn" class="small text-secondary">(Already on
                                                            the whiteboard)</span>
                                                        <p class="card-text">{{ user.username }}</p>
                                                    </div>
                                                </div>

                                            </div>

                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>


                    </div>

                </div>
                <div class="modal-footer">
                    <button ref="closeBtn" class="btn btn-secondary" data-bs-dismiss="modal" type="button">Close</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Spinner from "@/components/common/Spinner.vue";
import axios from "axios";
import Identicon from "@/components/common/Identicon.vue";
import { socket } from "@/scripts/socket";
import Alert from "@/components/common/Alert.vue";

const $ = document.querySelector.bind(document);

export default {
    name: "SearchModal",
    components: { Alert, Identicon, Spinner },
    data() {
        return {
            dropDownOn: false,
            searchCoolDown: null,
            coolDownMillis: 500,
            loading: false,
            foundUsers: [],
            isFocus: false,
            enterFocus: false,
            alertOn: false,
            alertText: "",
            alertType: "alert-danger"
        }
    },
    props: {
        name: String,
        whiteboardId: String
    },
    emits: ["invited"],
    methods: {
        focusIn() {
            this.inputChange();
            this.isFocus = true;
            this.dropDownOn = true;
            this.enterFocus = true;
        },
        focusOut() {
            this.isFocus = false;
            this.dropDownOn = false;
        },
        click() {
            if (!this.enterFocus) {
                if (this.isFocus && this.dropDownOn) {
                    $("#dropdownSearch").click();
                }
            } else {
                this.enterFocus = false;
            }
        },
        inputChange(input) {
            if (this.isFocus && !this.dropDownOn) {
                $("#dropdownSearch").click();
                this.dropDownOn = true;
            }
            const query = input?.srcElement.value.trim();
            if (query) {
                this.loading = true;
                clearTimeout(this.searchCoolDown);
                this.searchCoolDown = setTimeout(() => {
                    this.search(query);
                }, this.coolDownMillis);
            }
        },
        search(query) {
            if (!query) {
                this.foundUsers = [];
            } else {
                axios.get(`http://${process.env.VUE_APP_BACKEND_IP}/api/profile/users`, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`
                  },
                  params: {
                        filters: { username: query, whiteboardId: this.whiteboardId }
                    }
                }).then(response => {
                    this.foundUsers = response.data.users;
                    this.loading = false;
                }).catch(error => {
                    console.log(error);
                    this.loading = false;
                })
            }
        },
        invite(username) {
            axios.put(`http://${process.env.VUE_APP_BACKEND_IP}/api/whiteboard/invite`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`
              },
                username: username,
                whiteboardId: this.whiteboardId
            }).then(() => {
                socket.emit("inviteCollaborator", localStorage.getItem("accessToken"), username);

                axios.post(`http://${process.env.VUE_APP_BACKEND_IP}/api/profile/addNotification/`, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`
                  },
                    notification: { type: 'Whiteboard Sharing', time: new Date(), body: localStorage.getItem("username") + " invited you to collaborate on one of his whiteboards!", visualized: false },
                    username: username
                })

                this.$emit("invited", username);
                this.showAlert(`User ${username} invited successfully`, "alert-success")
            }).catch(error => {
                console.log(error.response.data.message)
                this.showAlert(error?.response?.data?.message, "alert-danger")
            })
        },
        showAlert(text, type) {
            this.alertText = text;
            this.alertType = type;
            this.alertOn = true;
        }
    }
}
</script>

<style scoped></style>