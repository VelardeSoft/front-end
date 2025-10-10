<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import useUsersStore from "../../application/user.store.js";

const store = useUsersStore();
const router = useRouter();
const form = ref({ email: '', password: '' });
const error = ref('');

const handleLogin = async () => {
  const success = await store.login(form.value);
  if (success) {
    router.push({ name: "profile" });
  } else {
    error.value = "Email o contraseña incorrectos";
  }
};
</script>

<template>
  <div class="p-4 max-w-md mx-auto">
    <h1>Login</h1>
    <form @submit.prevent="handleLogin">

      <pv-float-label variant="on">
        <pv-input-text id="username" v-model="form.email" type="email" required />
        <label for="username">Username</label>
      </pv-float-label> <br />

      <pv-float-label variant="on">
        <pv-input-text id="password" v-model="form.password" type="password" required />
        <label for="password">Password</label>
      </pv-float-label> <br />
      <pv-button type="submit" label="Login" />
    </form>
    <div v-if="error" class="text-red-600 mt-2">{{ error }}</div>
  </div>
</template>
