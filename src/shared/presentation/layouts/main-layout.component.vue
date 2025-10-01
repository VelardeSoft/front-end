<template>
  <div class="layout">
    <TheHeader />
    <div class="main-content">
      <the-sidebar class="sidebar-container" v-show="showSidebar" />
      <div class="sidebar-toggle" @click="toggleSidebar">
        <i :class="[showSidebar ? 'pi pi-angle-left' : 'pi pi-angle-right']"></i>
      </div>
      <main class="content">
        <slot></slot>
        <TutorialManagement v-if="!$slots.default" />
      </main>
    </div>
    <TheFooter />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import TheHeader from "./the-header.component.vue";
import TheFooter from "./the-foother.component.vue";
import TheSidebar from "./the-siderbar.component.vue";
import TutorialManagement from "./Hello.vue";

const showSidebar = ref(true);

function toggleSidebar() {
  showSidebar.value = !showSidebar.value;
}
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
  color: #333;
}
.main-content {
  width: 100%;
  display: flex;
  flex: 1;
  position: relative;
}
.sidebar-container {
  transition: all 0.3s ease;
}
.content {
  flex: 1;
  padding: 20px;
  transition: all 0.3s ease;
  overflow-y: auto;
}
.sidebar-toggle {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  background-color: #e6f7ff;
  border-radius: 0 4px 4px 0;
  padding: 10px 5px;
  cursor: pointer;
  z-index: 10;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}
.sidebar-toggle:hover {
  background-color: #d6f0ff;
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  .sidebar-container {
    width: 100% !important;
    height: auto;
    max-height: 300px;
    overflow-y: auto;
  }
  .sidebar-toggle {
    top: 305px;
    left: 50%;
    transform: translateX(-50%) rotate(90deg);
    border-radius: 0 0 4px 4px;
  }
}
</style>