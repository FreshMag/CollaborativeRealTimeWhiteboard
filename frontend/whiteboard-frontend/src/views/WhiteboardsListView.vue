<template>
    <div class="container text-start">
        <Alert v-if="alertOn" :text="alertText" :close-click="() => {alertOn = false;}"></Alert>

        <WhiteboardsListComponent v-bind:addProps="addProps"></WhiteboardsListComponent>

        <SearchModal v-bind:name="whiteboardInviteName" v-bind:whiteboard-id="inviteId"
                     @invited="getWhiteboards"></SearchModal>
        <ModalWithButton modal-id="whiteboardModal" ref="createModal" title="Create a Whiteboard"
                         :click="createWhiteboard" button-text="Create">
            <p>Insert a name for the whiteboard</p>
            <div class="input-group flex-nowrap mb-3">
                <span class="input-group-text" id="whiteboardName">Whiteboard name</span>
                <input type="text" v-model="whiteboardCreateName" class="form-control" placeholder="Whiteboard Name"
                       aria-label="Whiteboard Name" aria-describedby="addon-wrapping">
            </div>
        </ModalWithButton>
        <ModalWithButton modal-id="whiteboardModalRename" ref="renameModal" title="Rename the Whiteboard"
                         :click="renameWhiteboard" button-text="Rename">
            <p>Insert a new name for the whiteboard</p>
            <div class="input-group flex-nowrap mb-3">
                <span class="input-group-text" id="modalNameInput">Whiteboard name</span>
                <input type="text" v-model="whiteboardRenameName" class="form-control" placeholder="Whiteboard New Name"
                       aria-label="Whiteboard New Name" aria-describedby="addon-wrapping">
            </div>
        </ModalWithButton>
        <ModalWithButton modal-id="whiteboardModalDelete" ref="deleteModal" title="Delete the Whiteboard"
                         :click="deleteWhiteboard" button-text="Delete">
            <p>Are you sure you want to delete this whiteboard?</p>
        </ModalWithButton>
        <h1 class="h3 mb-3">Your files</h1>
        <div v-if="loading" class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <div class="row row-cols-1 row-cols-md-4 g-4">
            <CardPlaceholderComponent v-if="!isReady"></CardPlaceholderComponent>
            <WhiteboardCardsList @card-deleted="openDeleteModal" @card-renamed="openRenameModal"
                           @invite-to-whiteboard="setInviteWhiteboard"
                           v-bind:whiteboards="myWhiteboards"
                           v-bind:shared='false'
                           v-else-if="myWhiteboards?.length !== 0">

            </WhiteboardCardsList>
            <div class="col align-self-center" v-else>Add a new whiteboard to start</div>
        </div>
      <hr class="mt-5 mb-5 justify-content-center" />
        <h1 class="h3 mb-3 mt-3">Shared with you</h1>
        <div class="row row-cols-1 row-cols-md-4 g-4">
            <CardPlaceholderComponent v-if="!isReady"></CardPlaceholderComponent>
            <WhiteboardCardsList @card-deleted="deleteWhiteboard" @card-renamed="openRenameModal"
                           @invite-to-whiteboard="setInviteWhiteboard"
                           v-bind:whiteboards="sharedWhiteboards"
                           v-bind:shared='true'
                           v-else-if="sharedWhiteboards?.length !== 0">

            </WhiteboardCardsList>
            <div class="col align-self-center pb-5" v-else>No one has shared slates with you yet</div>
        </div>
    </div>
</template>
<script>
import CardPlaceholderComponent from "@/components/whiteboards/CardPlaceholderComponent.vue"
import WhiteboardCardsList from "@/components/whiteboards/WhiteboardCardsList.vue"
import WhiteboardsListComponent from "@/components/whiteboards/WhiteboardsListComponent.vue"

import axios from "axios";
import ModalWithButton from "@/components/whiteboards/ModalWithButton.vue";
import Alert from "@/components/common/Alert.vue";
import SearchModal from "@/components/whiteboards/SearchModal.vue";

export default {
    name: 'WhiteboardsListView',
    data() {
        return {
            isReady: false,
            loading: false,
            alertOn: false,
            alertText: "",
            addProps: [
                {
                    title: 'Add new whiteboard',
                    icon: "M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z",
                    color: 'btn-outline-primary',
                    alt: 'add whiteboard plus icon'
                },
            ],
            importProps: [
                {
                    title: 'Import whiteboard',
                    icon: "M8 10a.5.5 0 0 0 .5-.5V3.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 3.707V9.5a.5.5 0 0 0 .5.5zm-7 2.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5z",
                    color: 'btn-outline-secondary',
                    alt: 'import whiteboard arrow up icon'
                },
            ],
            whiteboardCreateName: "",
            whiteboardRenameName: "",
            whiteboardInviteName: "",
            inviteId: "",
            renameId: "",
            deleteId: "",
            myWhiteboards: [],
            sharedWhiteboards: []
        }
    },
    components: {
        SearchModal,
        Alert,
        ModalWithButton,
        WhiteboardCardsList,
        CardPlaceholderComponent,
        WhiteboardsListComponent,
    },
    methods: {
        getWhiteboards() {
            this.loading = true;
            axios.get(`http://${process.env.VUE_APP_BACKEND_IP}/api/profile/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`
                }
            }).then(response => {
                this.isReady = true;
                this.loading = false;
                const wb = [];
                const data = response.data.whiteboards;
                for (let i = 0; i < data.length; i++) {
                    if (data[i]) {
                        wb.push(data[i]);
                    }
                }

                const filterMyWhiteboard = event =>
                    event.ownerId === localStorage.getItem('userId')
                const filterSharedWhiteboard = event =>
                    event.ownerId !== localStorage.getItem('userId')

                this.myWhiteboards = wb.filter(filterMyWhiteboard);
                this.sharedWhiteboards = wb.filter(filterSharedWhiteboard);
                this.alertOn = false;
            }).catch(error => {
                console.log(error)
                this.loading = false;
                this.showAlert(error.response.data.message);
                this.goToLogin();
            })
        },
        importWhiteboard() {

        },
        setInviteWhiteboard(whiteboard) {
            this.inviteId = whiteboard.id;
            this.whiteboardInviteName = whiteboard.name;
        },
        createWhiteboard() {
            this.$refs.createModal.close();

            if (this.whiteboardCreateName) {
                this.loading = true;
                axios.post(`http://${process.env.VUE_APP_BACKEND_IP}/api/profile/createWhiteboard`,{
                  whiteboardName: this.whiteboardCreateName
                }, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`
                  }
                }).then(() => {
                    this.whiteboardCreateName = "";
                    this.alertOn = false;
                    this.loading = false;
                    this.getWhiteboards();
                }).catch(error => {
                    this.whiteboardCreateName = "";
                    this.showAlert(error.response.data.message);
                    this.goToLogin();
                    this.loading = false;
                })
            }
        },
        goToLogin() {
            this.$emit("onBadToken")
            this.$router.replace({path: "/login"})
        },
        showAlert(text) {
            this.alertOn = true;
            this.alertText = text;
        },
        openDeleteModal(id) {
            this.deleteId = id;
        },
        deleteWhiteboard() {
            const token = localStorage.getItem("accessToken");
            this.$refs.deleteModal.close();
            axios.delete(`http://${process.env.VUE_APP_BACKEND_IP}/api/profile/deleteWhiteboard`, {
              headers: {
                  Authorization: `Bearer ${token}`
              },
              data: {
                    whiteboardId: this.deleteId
                }
            }).then(() => {
                this.deleteId = -1;
                this.getWhiteboards();
            }).catch(error => {
                this.showAlert(error.response.data.message);
                this.goToLogin();
                this.loading = false;
                this.deleteId = -1;
            });
        },
        openRenameModal(id) {
            this.renameId = id;
        },
        renameWhiteboard() {
            this.$refs.renameModal.close();
            axios.put(`http://${process.env.VUE_APP_BACKEND_IP}/api/profile/updateWhiteboard`, {
                whiteboardId: this.renameId,
                newName: this.whiteboardRenameName
            }, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`
              }
            }).then(() => {
                this.getWhiteboards();
                this.loading = false;
                this.whiteboardRenameName = "";
                this.alertOn = false;
                this.renameId = -1;
            }).catch(error => {
                this.whiteboardRenameName = "";
                this.showAlert(error.response.data.message);
                this.goToLogin();
                this.loading = false;
                this.renameId = -1;
            });
        }
    },
    mounted: function () {
        this.getWhiteboards();
    }
}
</script>


