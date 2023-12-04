<template>
</template>

<script>

import {socket} from "@/scripts/socket";

/**
 * Component that handles Socket.IO communications related to drawing events inside the whiteboard.
 */
export default  {
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
    /**
     * Setups all the listeners for drawing events using the <code>socket</code> object. It also notifies the Socket.IO
     * server that this client has joined the application.
     */
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
    /**
     * Called when the user starts drawing with the mouse (or with touch). It emits to the server the <code>drawStart</code>
     * event using the <code>socket</code> object
     * @param cursorX {Number} - X coordinate of where the user has started drawing. The coordinate is relative to the
     * SVG viewport (canvas coordinates)
     * @param cursorY {Number} - Y coordinate of where the user has started drawing. The coordinate is relative to the
     * SVG viewport (canvas coordinates)
     * @param color {String} - Color of the line that is being drawn in HEX format
     * @param stroke {Number} - Width (in pixels) of the line that is being drawn
     */
    drawStart(cursorX, cursorY, color, stroke) {
      socket.emit("drawStart", {cursorX, cursorY, color, stroke}, localStorage.getItem("accessToken"), (response) => {
        this.drawingId = response.newId;
      });
    },
    /**
     * Called when the user sends another point (according to the choose frequency of update) while drawing with the
     * mouse (or with touch). It emits to the server the <code>drawing</code> event using the <code>socket</code> object
     * @param cursorX {Number} - X coordinate of where the user is drawing. The coordinate is relative to the
     * SVG viewport (canvas coordinates)
     * @param cursorY {Number} - Y coordinate of where the user is drawing. The coordinate is relative to the
     * SVG viewport (canvas coordinates)
     */
    drawing(cursorX, cursorY) {
      socket.emit("drawing", {cursorX, cursorY}, this.drawingId, localStorage.getItem("accessToken"));
    },
    /**
     * Called when the user finished drawing a line (that is, when he/she releases the mouse or touch). It emits to the
     * server the <code>drawEnd</code> event using the <code>socket</code> object
     * @param lineToSend {{points: [[Number, Number]], color: String, stroke: Number}} - Line that the user finished
     * drawing
     * @param color {String} - Color of the line that has been drawn in HEX format
     * @param stroke {Number} - Width (in pixels) of the line that has been drawn
     */
    drawEnd(lineToSend, color, stroke) {
      socket.emit("drawEnd", {points: lineToSend, color, stroke}, this.drawingId, localStorage.getItem("accessToken"));
    },
    /**
     * Called when the user wants to undo a line. It emits the <code>lineDelete</code> event, effectively deleting a line
     * given the ID.
     * @param id {String} - The ID of the line to delete
     */
    undoLine(id) {
      socket.emit("lineDelete", id, localStorage.getItem("accessToken"));
    },
  }
}

</script>

<style scoped>

</style>