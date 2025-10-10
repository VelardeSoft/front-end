<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import useUsersStore from "../../application/user.store.js";

const store = useUsersStore();
const router = useRouter();

const typeUserOptions = [
  { label: 'Owner', value: 'owner' },
  { label: 'Client', value: 'client' }
];

const form = ref({
  name: '',
  email: '',
  password: '',
  type_user: '',
  subscriptions_id: null  // Cambiado de subscription_id a subscriptions_id
});
const error = ref('');

const handleRegister = async () => {
  // Validaciones simples
  if (!form.value.name || !form.value.email || !form.value.password) {
    error.value = "Todos los campos son obligatorios";
    return;
  }
  const success = await store.register(form.value);
  if (success) {
    router.push({ name: "profile" });
  } else {
    error.value = "Error al registrar usuario";
  }
};

const goToLogin = () => {
  router.push({ name: "login" });
};
</script>

<template>
  <div class="p-4 max-w-md mx-auto">
    <h1>Registro</h1>
    <form @submit.prevent="handleRegister">

      <pv-float-label variant="on">
        <pv-input-text id="name" v-model="form.name" type="text" required />
        <label for="name">Name</label>
      </pv-float-label> <br />

      <pv-float-label variant="on">
        <pv-input-text id="email" v-model="form.email" type="email" required />
        <label for="email">Email</label>
      </pv-float-label> <br />

      <pv-float-label variant="on">
        <pv-input-text id="password" v-model="form.password" type="password" required />
        <label for="password">Password</label>
      </pv-float-label> <br />

      <label for="type_user" class="block mb-2">Type User</label>
      <pv-select-button
          id="type_user"
          v-model="form.type_user"
          :options="typeUserOptions"
          optionLabel="label"
          optionValue="value"
          aria-label="Tipo de usuario"
          required
      /> <br/> <br />

      <pv-button type="submit" label="Register" /> <br /> <br />
      <pv-button
          class="ml-2"
          label="Login"
          severity="secondary"
          @click="goToLogin"
      />



    </form>
    <div v-if="error" class="text-red-600 mt-2">{{ error }}</div>
  </div>
</template>
