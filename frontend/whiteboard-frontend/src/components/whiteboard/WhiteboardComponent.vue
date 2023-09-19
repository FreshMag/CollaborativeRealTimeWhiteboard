<template>
  <div class="position-fixed w-100">
    <Alert class="w-75 text-center d-inline-block" v-if="alertOn" :text="alertText" :close-click="() => {alertOn = false;}"></Alert>
    <BigGlowingSpinner v-if="loading" class="align-content-center"></BigGlowingSpinner>
  </div>
  <div v-bind:class="{'visually-hidden': this.loading || this.error}"  class="draw">
    <!--     <ul class="toolbar" v-bind:style='{ "background-color": bgColor }'>
          <li v-for="color in colors" v-bind:style='{ "background-color": color }' v-on:click="changeLineColor(color)" v-bind:key="color"></li>
          <li class="bgColor" v-bind:style='{ "background-color": bgColor }' @click="changeBg()" ></li>
        </ul> -->

    <div class="buttons" v-bind:class="{ showButtons: undo }">
      <button v-on:click="download()" class="btn submitBtn"><img src="../../assets/download.svg" alt="Download">
      </button>
      <ActiveUserInWhiteboard/>
      <UndoStack @undo-line="undoLine" ref="undoStack"></UndoStack>
      <PanTool ref="panTool" @toggle-pan="this.togglePan"></PanTool>
    </div>

    <div class="canvas rounded shadow ">

      <!-- Canvas size is defined in CSS, search for ".canvas" -->

      <svg xmlns="http://www.w3.org/2000/svg" class="drawSvg" width="100%"
           height="100%" viewBox="0 0 1000 1000" ref="svg" :style="{'background-color' : bgColor}"
           @mousedown="lineStart"
           @touchstart="lineStart"
           @mousemove="lineMove"
           @touchmove="lineMove"
           @mouseup="lineEnd"
           @touchend="lineEnd"
      >

        <Interpolation ref="interpolation"></Interpolation>
        <g v-html="paths"></g>
      </svg>

      <div id="cursor" v-bind:style='{ "background-color": lineColor }'></div>

    </div>


    <div class="toolbar" :style="{ right: toolBarRight }">

      <div class="allColors">

        <div class="panelUp mobile"></div>

        <transition-group class="stroke" name="color-list" tag="ul">
          <li v-for="(stroke, $index) in strokes" v-bind:style='{ "background-color": "white" }' v-bind:value="stroke"
              v-on:click="changeLineWidth(stroke, $index)" v-bind:key="stroke" v-bind:class="{ 'activeColor': (this.stroke === stroke)}">
            <div class="container d-flex align-items-center justify-content-center" style="height: 100%; border:none;">
              <span style="border-radius: 50%; position: absolute" v-bind:style='{ "width": stroke + "px", "height":stroke +"px","background-color":this.lineColor }'></span>
            </div>
          </li>
        </transition-group>

        <transition-group class="lineColor" name="color-list" tag="ul">
          <li v-for="(color, $index) in colors" v-bind:style='{ "background-color": color }'
              v-on:click="changeLineColor(color, $index)" v-bind:key="color"></li>
        </transition-group>

        <transition-group class="bgColor" name="color-list" tag="ul">
          <li v-for="(color, $index) in bgColors" v-bind:key="color"
              v-bind:style='{ "background-color": color }' @click="changeBg(color, $index)"></li>
        </transition-group>

      </div>

    </div>

  </div>
  <SocketComponent ref="socket"
                   v-on:whiteboardJoined="onJoinedWhiteboard"
                   v-on:drawStartBC="remoteLineStart"
                   v-on:drawingBC="remoteLineMove"
                   v-on:drawEndBC="remoteLineEnd"
                   v-on:lineDeleteBC="remoteLineDelete"
                   :whiteboard-id="this.$route.params.id"
  ></SocketComponent>
</template>

<script>
import Interpolation from "@/components/whiteboard/plugins/Interpolation.vue";
import {arrayMove, rgb2hex} from "@/scripts/utility";
import UndoStack from "@/components/whiteboard/plugins/UndoStack.vue";
import SocketComponent from "@/components/whiteboard/SocketComponent.vue";
import Spinner from "@/components/common/Spinner.vue";
import BigGlowingSpinner from "@/components/common/BigGlowingSpinner.vue";
import axios from "axios";
import Alert from "@/components/common/Alert.vue";
import {traitToPaths} from "@/scripts/whiteboard/pointsToSvg";
import ActiveUserInWhiteboard from "@/components/whiteboard/ActiveUserInWhiteboard.vue";
import PanTool from "@/components/whiteboard/plugins/PanTool.vue";

require('../../assets/css/freehandDraw.css')

// hello jquery
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const strokeToDotRadius = 2.7;

export default {
  name: 'WhiteboardComponent',
  components: {
    PanTool,
    ActiveUserInWhiteboard, Alert, BigGlowingSpinner, SocketComponent, UndoStack, Interpolation},
  emits: ['setLoading', 'changeLineColor', "changeBgColor", "drawSubmit", 'changeStroke'],
  props: [
    'title',
    'colors',
    'bgColors',
    'strokes',
    'lineColor',
    'bgColor',
    'stroke'
  ],
  data() {
    return {
      panSelected: false,
      whiteboardJoined: false,
      board: '',
      cursor: '',
      colorNum: 0,
      gesture: false,
      line: '',
      radius: this.stroke/strokeToDotRadius,
      undo: true,
      onCanvas: false, // mouseout event is not firing, dunno why,
      lineToSend: [],
      drawingId: "",
      loading: true,
      alertOn: false,
      error: false,
      alertText: "",
      paths: ""
    }
  },

  computed: {

    canvasWidth: function () {
      return this.board?.clientWidth
    },

    canvasHeight: function () {
      return this.board?.clientHeight
    },

    toolBarRight: {
      get: function () {
        return -this.colors.length * 51.5 + 'px'
      },
    }
  },
  mounted() {
    console.log(this.canvasWidth)
    console.log(this.canvasHeight)
    this.$refs.socket.connect()
  },

  methods: {
    togglePan() {
      this.panSelected = !this.panSelected;
    },
    onJoinedWhiteboard(status) {
      if (status === 'ok') {
        this.whiteboardJoined = true;
        this.initBoard()
      } else if (status === "ko") {
        console.log("ERRORE nel connettersi alla lavagna")
        this.error = true;
        this.showAlert("There was an error. Maybe expired Token");
        this.loading = false;
      }
    },

    initBoard: function () {
      this.board = $('.drawSvg')
      this.cursor = $('#cursor')
      axios.get(`http://${process.env.VUE_APP_BACKEND_IP}/api/whiteboard/${this.$route.params.id}`, {
        params: {
          accessToken: localStorage.getItem("accessToken")
        }
      }).then(result => {
        const traits = result.data.whiteboardData.traits;
        this.$emit('setLoading', {loading:false, err: false});
        if (traits) {
          for (const id in traits) {
            const trait = traits[id];
            this.paths += traitToPaths(trait, this.board, id).outerHTML
          }
          this.error = false;
        }
        this.loading = false;
        this.$refs.panTool.setCanvas(this.$refs.svg)
      }).catch(error => {
        console.log(error)
        this.showAlert(error.response?.data?.message)
        this.$emit('setLoading', {loading:false, err: true});
        this.loading = false;
        this.error = true;
      })
      this.gesture = false
      this.setActiveColorMounted('.lineColor li', this.colors, this.lineColor)
      this.setActiveColorMounted('.bgColor li', this.bgColors, this.bgColor)
      this.setActiveStrokeMounted('.stroke li', this.strokes, this.stroke)
    },

    showAlert(text) {
      this.alertText = text;
      this.alertOn = true;
    },

    lineStart: function (e) {

      if ((!this.whiteboardJoined) || (this.panSelected === true)) {return}

      this.undo = true;

      let pointToAdd = this.getViewBoxCoordinates(e);
      this.$refs.socket.drawStart(pointToAdd.x, pointToAdd.y, this.lineColor, this.stroke)
      this.addPointToLine(pointToAdd);

      this.cursor.style.opacity = 0.5
      this.gesture = true
      e.preventDefault()
    },

    lineMove: function (e) {



      if (!this.whiteboardJoined || this.panSelected) {return}

      let pointToAdd = this.getViewBoxCoordinates(e);

      if (this.gesture === true) {
        this.addPointToLine(pointToAdd);
        this.$refs.socket.drawing(pointToAdd.x, pointToAdd.y);
        this.traceCursorMovement(e)
      }

      this.cursorX = pointToAdd.x;
      this.cursorY = pointToAdd.y;

      const rect = this.board.getBoundingClientRect();

      this.cursor.style.top = e.clientY - rect.y - this.radius + 'px'
      this.cursor.style.left = e.clientX - rect.x - this.radius + 'px'


      this.onCanvas = true
    },

    traceCursorMovement: function (e) {

      // adding scroll to this calculation to fix messed up cursor position when the user scrolls the page
      // (mainly on mobile)
      const x = (e.clientX || e.touches[0].clientX) + window.scrollX;
      const y = (e.clientY || e.touches[0].clientY) + window.scrollY;

      let dot = document.createElement('div');
      dot.classList.add('dot')
      dot.style.top = y - this.radius + 'px';
      dot.style.left = x - this.radius + 'px';
      dot.style.background = this.lineColor;
      dot.style.width = dot.style.height = this.radius * 2 + 'px';
      document.body.appendChild(dot);
    },

    lineEnd: function (e) {

      if (!this.whiteboardJoined || this.panSelected) {return}

      const pointToAdd = this.getViewBoxCoordinates(e);
      this.addPointToLine(pointToAdd);

      this.$refs.socket.drawEnd(this.lineToSend, this.lineColor, this.stroke);

      this.cursor.style.opacity = .5
      const id = this.$refs.socket.drawingId;  // taken from the socket component, just updated with the new id

      this.createPath(id, this.line, this.lineColor, this.stroke);

      this.gesture = false;
      this.line = '';
      this.lineToSend = [];
      const dots = document.getElementsByClassName("dot");
      while (dots[0]) {
        dots[0].parentNode.removeChild(dots[0]);
      }

    },

    undoLine: function(id) {

      if (!this.whiteboardJoined) {return}

      document.getElementById(id).remove();
      this.$refs.socket.undoLine(id);
    },

    remoteLineStart: function (data) {
      if (data.id !== undefined) {
        this.$refs.interpolation.createInterpolatingPath(data.id, data.color, data.stroke);
      }
    },
    remoteLineMove: function (data) {
      if (data.id && data.point) {
        const point = data.point
        this.$refs.interpolation.interpolate(point.x, point.y, data.id)
      }
    },
    remoteLineEnd: function (data) {
      if (data.id && data.points) {
        this.$refs.interpolation.deleteInterpolatingPath(data.id);

        let remoteLine = "";
        let point = data.points[0];

        remoteLine += 'M' + point.x + ',' + point.y;
        data.points.splice(0, 1);
        data.points.forEach(point => {
          remoteLine += 'L' + point.x + ',' + point.y;
        })

        const id = data.id;
        this.createPath(id, remoteLine, data.color, data.stroke);
        data.points = [];
      }
    },
    remoteLineDelete: function(data) {
      document.getElementById(data.id).remove();
    },

    createPath: function(id, line, lineColor, width){
      let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttributeNS(null, 'd', line);
      path.setAttributeNS(null, 'fill', 'none');
      path.setAttributeNS(null, 'stroke-linecap', 'round');
      path.setAttributeNS(null, 'stroke-linejoin', 'round');
      path.setAttributeNS(null, 'stroke', lineColor);
      path.setAttribute("id", id);
      this.$refs.undoStack.addLine(id);
      path.setAttributeNS(null, 'stroke-width', width);
      this.board.appendChild(path);
    },

    setActiveColor: function (Li) {
      let allColors = $$(Li)
      let target = event.target // for set time out

      for (let color of allColors) {
        color.classList.remove('activeColor')
      }

      setTimeout(function () {
        target.classList.add('activeColor')
      }, 10)
    },

    setActiveStrokeMounted: function(li, arr, stroke) {
      let allLi = $$(li)
      let strokeIndex = arr.indexOf(stroke)
      for (let li of allLi) {
        let liStroke = li.value;
        if (liStroke === stroke) {
          li.classList.add('activeColor')

          arrayMove(arr, strokeIndex, 0)
        }
      }
    },

    setActiveColorMounted: function (li, arr, color) {

      let allLi = $$(li)
      let colorIndex = arr.indexOf(color)

      for (let li of allLi) {
        let liColor = rgb2hex(li.style.backgroundColor).toUpperCase()

        if (liColor === color) {
          li.classList.add('activeColor')

          arrayMove(arr, colorIndex, 0)
        }
      }
    },

    changeLineColor(color, index) {
      window.scrollTo({top: 0, behavior: 'smooth'});

      this.$emit('changeLineColor', color)

      this.setActiveColor('.lineColor li')

      // changing circle position
      arrayMove(this.colors, index, 0)
    },

    changeBg(color, index) { // just change backgrounds colors one after another
      window.scrollTo({top: 0, behavior: 'smooth'});

      this.$emit('changeBgColor', color)

      this.setActiveColor('.bgColor li')

      arrayMove(this.bgColors, index, 0)

    },

    changeLineWidth: function (stroke, index){
      window.scrollTo({top: 0, behavior: 'smooth'});

      this.$emit('changeStroke', stroke)
      this.radius = stroke/ strokeToDotRadius;

      // changing circle position
      arrayMove(this.strokes, index, 0)
    },



    download: function () {
      const dl = document.createElement("a");

      let drawing = this.svgDataURL($('.drawSvg'))


      document.body.appendChild(dl); // This line makes it work in Firefox.
      dl.setAttribute("href", drawing)
      dl.setAttribute("download", "freehand-svg-drawing.svg");
      dl.click();
    },

    svgDataURL: function () {
      let serialSvg = (new XMLSerializer).serializeToString(this.board);
      return "data:image/svg+xml," + encodeURIComponent(serialSvg);

    },

    getViewBoxCoordinates(event) {
      const screenPoint = this.$refs.svg.createSVGPoint();
      if (event.clientX && event.clientY) {
        screenPoint.x = event.clientX;
        screenPoint.y = event.clientY;
      } else if (event.changedTouches[0].clientX && event.changedTouches[0].clientY) {
        screenPoint.x = event.changedTouches[0].clientX;
        screenPoint.y = event.changedTouches[0].clientY;
      }

      return screenPoint.matrixTransform(this.$refs.svg.getScreenCTM().inverse());
    },

    addPointToLine(point) {
      const letter = this.line && this.line.length ? 'L' : 'M';
      this.line += letter + Math.round(point.x) + ',' + Math.round(point.y);
      this.lineToSend.push({x: Math.round(point.x), y: Math.round(point.y)})
    },


  },



}
</script>

