<template>
</template>

<script>

import {socket} from "@/scripts/socket";


export default {
  name: "SocketComponent",
  props: {
    whiteboardId: String
  },
  data() {
    return {
      connected: false,
      drawingId: "",
      accessToken: localStorage.getItem("accessToken")
    }
  },
  created() {
    this.connected = true;
  },
  unmounted() {
    this.connected = false;
  },
  methods: {
    /**
     * Uses socket object to know if it has connected to the server. If it has, it performs the setup of all listeners.
     * If not, it waits for the Socket.IO to be connected to the application, and only then it performs the setup.
     */
    connect() {
      if (socket.connected) {
        this.joinWhiteboardSetup();
      } else {
        socket.on('joinedApplication', () => {
          this.joinWhiteboardSetup();
        })
      }
    },
    joinWhiteboardSetup() {
      socket.emit("joinWhiteboard", this.accessToken, this.whiteboardId, (response) => {
        this.$emit('whiteboardJoined', response.status);
      });
      socket.on("drawStartBC", (line, newId) => {
        this.$emit('drawStartBC', {id: newId, point: {x: line.cursorX, y: line.cursorY}, color: line.color, stroke: line.stroke});
      });
      socket.on("drawingBC", (line, lineId) => {
        this.$emit('drawingBC', {id: lineId, point: {x: line.cursorX, y: line.cursorY}})
      });
      socket.on("drawEndBC", (line, lineId) => {
        this.$emit('drawEndBC', {id: lineId, points: line.points, color: line.color, stroke: line.stroke});
      });
      socket.on("lineDeleteBC", (lineId) => {
        this.$emit("lineDeleteBC", {id: lineId});
      });
    },
    drawStart(cursorX, cursorY, color, stroke) {
      socket.emit("drawStart", {cursorX, cursorY, color, stroke}, localStorage.getItem("accessToken"), (response) => {
        this.drawingId = response.newId;
      });
    },
    drawing(cursorX, cursorY) {
      socket.emit("drawing", {cursorX, cursorY}, this.drawingId, localStorage.getItem("accessToken"));
    },
    drawEnd(lineToSend, color, stroke) {
      socket.emit("drawEnd", {points: lineToSend, color, stroke}, this.drawingId, localStorage.getItem("accessToken"));
    },
    undoLine(id) {
      socket.emit("lineDelete", id, localStorage.getItem("accessToken"));
    },
  }
}

</script>

<style scoped>

</style>