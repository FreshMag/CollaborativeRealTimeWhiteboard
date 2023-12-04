<template>
    <div class="col" v-for="(whiteboard, index) in whiteboards" :key="index" >
        <div class="card border-secondary text-start h-100">
            <StaticWhiteboard :traits="whiteboard.traits"></StaticWhiteboard>
                <div class="card-body justify-content-center align-items-center">
                    <h6 class="card-title d-inline text-start"><strong>{{whiteboard.name}}</strong></h6>
                    <div class="dropdown text-end d-inline-flex align-items-center mx-auto">
                        <button class="btn btn-outline-light" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="z-index: 2;">
                            <img src="../../assets/icons/three-dots-vertical.svg" alt="context menu three dots button" width="20" height="20"/>
                        </button>
                        <ul class="dropdown-menu text-small" data-popper-placement="bottom-end" style="position: absolute; inset: 0px 0px auto auto; margin: 0px; transform: translate3d(0px, 34.4px, 0px);">
                            <li><a class="dropdown-item" role="button" @click="openWhiteboard(whiteboard._id)">Open</a></li>
                            <li v-if="!shared"><a class="dropdown-item" role="button" @click="inviteToWhiteboard(whiteboard.name, whiteboard._id)" data-bs-toggle="modal" data-bs-target="#searchModal">Invite Users</a></li>
                            <li><a class="dropdown-item" role="button" @click="renameCard(whiteboard._id)" data-bs-toggle="modal" data-bs-target="#whiteboardModalRename">Rename</a></li>
                            <li v-if="!shared"><hr class="dropdown-divider"></li>
                            <li v-if="!shared"><a class="dropdown-item link-danger" role="button" @click="deleteWhiteboard(whiteboard._id)" data-bs-toggle="modal" data-bs-target="#whiteboardModalDelete">Delete</a></li>
                        </ul>
                    </div>
                </div>
                <a role="button" @click="openWhiteboard(whiteboard._id)" class="stretched-link"></a>
        </div>
    </div>
</template>
<script>
import StaticWhiteboard from "@/components/whiteboards/StaticWhiteboard.vue";
import SearchModal from "@/components/whiteboards/SearchModal.vue";

export default {
    name: 'WhiteboardCardsList',
    components: {SearchModal, StaticWhiteboard},
    props: ['whiteboards', 'shared'],
    emits:['card-deleted', 'card-renamed', 'invite-to-whiteboard'],
    methods: {
        replaceByDefault(event) {
            event.target.src = "https://www.stillisolutions.com/wp-content/uploads/2017/09/no-image-box-300x155.png"
        },
        inviteToWhiteboard(name, id) {
            this.$emit('invite-to-whiteboard', {id:id, name: name});
        },
        openWhiteboard(id){
            this.$router.push({ name: "Whiteboard", params: { id } })
        },
        deleteWhiteboard(index) {
            this.$emit('card-deleted', index);
        },
        renameCard(index) {
            this.$emit('card-renamed', index);
        }
    },
}
</script>