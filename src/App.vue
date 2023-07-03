<template>
  <div class="app flex h-screen flex-col">
    <Camera></Camera>
  </div>
</template>

<script setup>
import Camera from "./components/camera/Camera.vue";
</script>

<style lang="scss" scoped>
.app {
  overflow: hidden;
  display: flex;
  height: 100vh;

}


</style>
