<template>
  <div class="layout">
    <TheHeader />
    <div class="main-content">
      <the-sidebar />
      <main class="content">
        <TutorialManagement />
      </main>
    </div>
    <TheFooter />
  </div>
</template>

<script setup>
import TheHeader from "./the-header.component.vue";
import TheFooter from "./the-foother.component.vue";
import TheSidebar from "./the-siderbar.component.vue";
import TutorialManagement from "./Hello.vue";
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.main-content {
  width: 100%;
  display: flex;
  flex: 1;
}
.content {
  flex: 1;
  padding: 20px;
}
</style>