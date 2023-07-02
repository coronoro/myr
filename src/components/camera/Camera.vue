<template>
  <div class="camera h-full flex-col bg-emerald-700">
    <div class="video-wrapper" v-show="showVideo">
      video
      <video class="video" autoplay playsinline ref="video"></video>
    </div>
    <!-- we need the canvas for their data but we wont show them-->
    <div class="invisible h-0">
      canvas
      <canvas class="canvas h-full" ref="canvasRef"></canvas>
      <canvas class="canvas h-full " ref="cvCanvas"></canvas>
    </div>
    <div class="button-bar flex w-full bg-amber-200 items-center">
      <div
          class="snap h-16 w-16 bg-amber-500"
          @click="snap">
        SNAP
      </div>

    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, Ref, ref} from "vue";
import {Camera, CameraUtils, MediaConstraints} from 'easy-ts-camera';
import CameraBuilder from "easy-ts-camera";
import {getContours} from "../../utils/opencv-util";
import Tesseract from "tesseract.js";


export interface CameraProps {
  showVideo: boolean
}

const props = withDefaults(defineProps<CameraProps>(), {
  showVideo: true,
})

const emit = defineEmits(['snap', 'delete'])

const video: Ref<HTMLVideoElement | null> = ref(null)
const canvasRef: Ref<HTMLCanvasElement | null> = ref(null)
const cvCanvas: Ref<HTMLCanvasElement | undefined> = ref(undefined)

const cameraRef = ref<Camera | null>(null)
const snaped = ref(false)

const snap = () => {
  if (cameraRef.value) {
    const camera = cameraRef.value
    debugger
    const snapCanvas = camera?.snap(false)
    snaped.value = true
    getContours(snapCanvas, cvCanvas.value)
    ocr()
  }
}

const ocr = () => {
  Tesseract.recognize(cvCanvas.value?.toDataURL(), 'eng', {
    logger: log => {
      console.log(log)
    }
  }).then(result => {
    alert(result.data.text)
  })
}

onMounted(() => {
  if (CameraUtils.isCameraSupported()) {
    if (canvasRef.value && video.value) {
      // create back camera constraint
      const constraints = MediaConstraints.envCameraConstraints()
      // request best resolution possible
      constraints.video.height = {
        ideal: 2160,
      };
      constraints.video.width = {
        ideal: 4096,
      };
      const instance = new CameraBuilder(constraints);
      instance.streamFrom(video.value)
          .drawInto(canvasRef.value)
          .getCameraAsync()
          .then((camera: Camera) => {
            cameraRef.value = camera
            camera.startAsync()
          })
          .catch((error: any) => {
            // Mostly happens if the user blocks the camera or the media devices are not supported
          });
    }
  } else {
    alert('No Camera!')
  }
})

</script>

<style lang="scss" scoped>

.video-wrapper {
  height: 100%;
}

.camera {
  //overflow: hidden;
  display: flex;
  align-items: center;
  position: relative;

  .canvas {
    width: 100%;
    height: auto;
  }
}


</style>