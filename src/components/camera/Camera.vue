<template>
  <div class="camera h-full flex-col bg-emerald-700">
    <div class="grow h-0" v-show="showVideo">
      <video class="video" autoplay playsinline ref="video"></video>
    </div>
    <!-- we need the canvas for their data but we wont show them-->
    <div class="invisible h-0">
      <canvas class="canvas h-full" ref="canvasRef"></canvas>
      <canvas class="canvas h-full " ref="cardCanvas"></canvas>
      <canvas class="canvas h-full " ref="cardNameCanvas"></canvas>
      <canvas class="canvas h-full " ref="lowerLeftCanvas"></canvas>
    </div>
    <div class="button-bar flex w-full items-center justify-center z-10 pb-20">
      <button
          class="snap h-20 w-20 bg-gray-400 rounded-full border-gray-600 border-4"
          @click="snap">
      </button>
    </div>
    <n-modal v-model:show="showModal">
      <n-card
          style="width: 600px"
          title="Modal"
          :bordered="false"
          size="huge"
          role="dialog"
          aria-modal="true"
      >
        <template #header-extra>
        </template>
          <div>
            <canvas class="canvas h-full " ref="debugCanvas"></canvas>
            {{ ocrText }}
          </div>
        <template #footer>
          Footer
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, Ref, ref} from "vue";
import {Camera, CameraUtils, MediaConstraints} from 'easy-ts-camera';
import CameraBuilder from "easy-ts-camera";
import {cropCard, cropIdentifier} from "../../utils/opencv-util";
import Tesseract from "tesseract.js";
import {NModal, NCard} from 'naive-ui'

export interface CameraProps {
  showVideo: boolean
}

const props = withDefaults(defineProps<CameraProps>(), {
  showVideo: true,
})

const emit = defineEmits(['snap', 'delete'])

const video: Ref<HTMLVideoElement | null> = ref(null)
//canvas used to save the image data of the video element
const canvasRef: Ref<HTMLCanvasElement | undefined> = ref(undefined)

const cardCanvas: Ref<HTMLCanvasElement | undefined> = ref(undefined)

// canvas that should contain only the top part of the card where the name should be located
const cardNameCanvas: Ref<HTMLCanvasElement | undefined> = ref(undefined)

// canvas that should contain only the lower left part of the card where the identifier should be located
const lowerLeftCanvas: Ref<HTMLCanvasElement | undefined> = ref(undefined)

const debugCanvas: Ref<HTMLCanvasElement | undefined> = ref(undefined)

const text = ref('Hi')

const cameraRef = ref<Camera | null>(null)
const ocrText = ref('')
const showModal = ref(false)

const cardRegex = /ab+c/;

const snap = () => {
  text.value = 'snaped!'
  if (cameraRef.value) {
    const camera = cameraRef.value
    const snapCanvas = camera?.snap(false)
    if (cardCanvas.value){
      cropCard(snapCanvas, cardCanvas.value)
      cropIdentifier(cardCanvas.value, lowerLeftCanvas.value)
      ocr()
    }
  }
}

const ocr = () => {
  Tesseract.recognize(lowerLeftCanvas.value?.toDataURL(), 'eng', {
    logger: log => {
      console.log(log)
    }
  }).then(result => {
    ocrText.value = result.data.text
    showModal.value = true
    //grab the context from your destination canvas
    if (debugCanvas.value){
      var destCtx = debugCanvas.value.getContext('2d');
      if (destCtx && lowerLeftCanvas.value)
        //call its drawImage() function passing it the source canvas directly
        destCtx.drawImage(lowerLeftCanvas.value, 0, 0);

    }


    // https://api.scryfall.com/cards/{set}/{id}
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