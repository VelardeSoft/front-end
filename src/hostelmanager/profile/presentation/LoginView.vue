<template>
  <div class="login-container">
    <div class="login-card p-card p-shadow-3">
      <h2 class="text-center mb-4">{{ $t('auth.login') }}</h2>
      <form @submit.prevent="login">
        <div class="p-fluid">
          <div class="field">
            <label for="email">{{ $t('auth.email') }}</label> <br/>
            <InputText
              id="email"
              v-model="email"
              type="email"
              :placeholder="$t('auth.email')"
              :class="{'p-invalid': v$.email.$invalid && submitted}"
            />
            <small v-if="v$.email.$invalid && submitted" class="p-error">
              {{ $t('common.required') }}
            </small>
          </div>

          <div class="field">
            <label for="password">{{ $t('auth.password') }}</label> <br/>
            <Password
              id="password"
              v-model="password"
              :placeholder="$t('auth.password')"
              :feedback="false"
              toggleMask
              :class="{'p-invalid': v$.password.$invalid && submitted}"
            />
            <small v-if="v$.password.$invalid && submitted" class="p-error">
              {{ $t('common.required') }}
            </small>
          </div>

          <div class="field">
            <Button
              type="submit"
              :label="$t('auth.login')"
              class="p-button-primary"
              :loading="loading"
            />
          </div>

          <div class="mt-4 text-center">
            <p>
              {{ $t('auth.noAccount') }}
              <router-link to="/register" class="font-bold">{{ $t('auth.register') }}</router-link>
            </p>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useVuelidate } from '@vuelidate/core';
import { required, email as emailValidator } from '@vuelidate/validators';
import { UserRepository } from '../infrastructure/UserRepository.js';

// Composables
const router = useRouter();
const { t } = useI18n();
const toast = useToast();

// Estado
const userRepository = new UserRepository();
const loading = ref(false);
const submitted = ref(false);
const email = ref('');
const password = ref('');

// Validaciones
const rules = {
  email: { required, email: emailValidator },
  password: { required }
};

const v$ = useVuelidate(rules, { email, password });

// Métodos
const login = async () => {
  submitted.value = true;

  const isValid = await v$.value.$validate();
  if (!isValid) {
    return;
  }

  loading.value = true;

  try {
    const user = await userRepository.login(email.value, password.value);

    if (user) {
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('auth.loginSuccess'),
        life: 3000
      });
      alert('Login successful!');
      // Redirigir al dashboard
      router.push('/dashboard');
    } else {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('auth.loginError'),
        life: 3000
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('auth.loginError'),
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
  padding: 2rem;
  background-color: #f5f7f9;
  text-align: center;
  color: #555555;
}

.login-card {
  width: 100%;
  max-width: 450px;
  padding: 2.5rem;
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1) !important;
  background-color: white;
}

@media (max-width: 480px) {
  .login-card {
    padding: 1.5rem;
    margin: 1rem;
  }

  .login-container {
    padding: 0;
  }
}
</style>
