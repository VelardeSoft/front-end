<script setup>
import useUsersStore from "../../application/user.store.js";
const store = useUsersStore();
const user = store.currentUser;
</script>

<template>
  <div class="p-4 max-w-md mx-auto">
    <h1>Perfil</h1>
    <div v-if="user">
      <p><b>ID:</b> {{ user.id }}</p>
      <p><b>Nombre:</b> {{ user.name }}</p>
      <p><b>Email:</b> {{ user.email }}</p>
      <p><b>Tipo de usuario:</b> {{ user.type_user }}</p>
      <pv-button @click="store.logout" label="Logout" />
    </div>
    <div v-else>
      <p>No has iniciado sesión</p>
    </div>
  </div>
</template>
