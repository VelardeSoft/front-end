<template>
  <div class="register-container">
    <div class="register-card p-card p-shadow-3">
      <h2 class="text-center mb-4">{{ $t('auth.register') }}</h2>
      <form @submit.prevent="register">
        <div class="p-fluid">
          <div class="field">
            <label for="name">{{ $t('auth.name') }}</label>
            <InputText
              id="name"
              v-model="userData.name"
              :placeholder="$t('auth.name')"
              :class="{'p-invalid': v$.name.$invalid && submitted}"
            />
            <small v-if="v$.name.$invalid && submitted" class="p-error">
              {{ $t('common.required') }}
            </small>
          </div>

          <div class="field">
            <label for="email">{{ $t('auth.email') }}</label>
            <InputText
              id="email"
              v-model="userData.email"
              type="email"
              :placeholder="$t('auth.email')"
              :class="{'p-invalid': v$.email.$invalid && submitted}"
            />
            <small v-if="v$.email.$invalid && submitted" class="p-error">
              {{ $t('common.required') }}
            </small>
          </div>

          <div class="field">
            <label for="password">{{ $t('auth.password') }}</label>
            <Password
              id="password"
              v-model="userData.password"
              :placeholder="$t('auth.password')"
              toggleMask
              :class="{'p-invalid': v$.password.$invalid && submitted}"
            />
            <small v-if="v$.password.$invalid && submitted" class="p-error">
              {{ $t('common.required') }}
            </small>
          </div>

          <div class="field">
            <label for="confirmPassword">{{ $t('auth.confirmPassword') }}</label>
            <Password
              id="confirmPassword"
              v-model="confirmPassword"
              :placeholder="$t('auth.confirmPassword')"
              :feedback="false"
              toggleMask
              :class="{'p-invalid': v$.confirmPassword.$invalid && submitted}"
            />
            <small v-if="v$.confirmPassword.$invalid && submitted" class="p-error">
              {{ passwordsMatch ? $t('common.required') : $t('auth.passwordMismatch') }}
            </small>
          </div>

          <div class="field">
            <label for="userType">{{ $t('auth.userType') }}</label>
            <Dropdown
              id="userType"
              v-model="userData.user_type"
              :options="userTypes"
              optionLabel="name"
              optionValue="value"
              :placeholder="$t('auth.userType')"
              :class="{'p-invalid': v$.user_type.$invalid && submitted}"
            />
            <small v-if="v$.user_type.$invalid && submitted" class="p-error">
              {{ $t('common.required') }}
            </small>
          </div>

          <div class="field">
            <label for="phone">{{ $t('auth.phone') }}</label>
            <InputText
              id="phone"
              v-model="userData.phone"
              :placeholder="$t('auth.phone')"
            />
          </div>

          <div class="field">
            <label for="address">{{ $t('auth.address') }}</label>
            <Textarea
              id="address"
              v-model="userData.address"
              rows="3"
              :placeholder="$t('auth.address')"
            />
          </div>

          <div class="field">
            <Button
              type="submit"
              :label="$t('auth.register')"
              class="p-button-primary"
              :loading="loading"
            />
          </div>

          <div class="mt-4 text-center">
            <p>
              {{ $t('auth.alreadyAccount') }}
              <router-link to="/login" class="font-bold">{{ $t('auth.login') }}</router-link>
            </p>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useVuelidate } from '@vuelidate/core';
import { required, email, sameAs } from '@vuelidate/validators';
import { UserRepository } from '../infrastructure/UserRepository';

// Composables
const router = useRouter();
const { t } = useI18n();
const toast = useToast();

// Estado
const userRepository = new UserRepository();
const loading = ref(false);
const submitted = ref(false);
const confirmPassword = ref('');
const userData = reactive({
  name: '',
  email: '',
  password: '',
  user_type: '',
  phone: '',
  address: ''
});

const userTypes = [
  { name: t('auth.owner'), value: 'Owner' },
  { name: t('auth.visitor'), value: 'Visitor' }
];

// Validaciones
const passwordsMatch = computed(() => userData.password === confirmPassword.value);

const rules = {
  name: { required },
  email: { required, email },
  password: { required },
  confirmPassword: { required, sameAs: sameAs(userData.password) },
  user_type: { required }
};

const v$ = useVuelidate(rules, { ...userData, confirmPassword });

// Métodos
const register = async () => {
  submitted.value = true;

  const isValid = await v$.value.$validate();
  if (!isValid) {
    return;
  }

  loading.value = true;

  try {
    // Crear nuevo usuario
    const newUser = await userRepository.register({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      user_type: userData.user_type,
      phone: userData.phone || '',
      address: userData.address || '',
      subscription_id: null,
      createdAt: new Date().toISOString()
    });

    if (newUser) {
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('auth.registerSuccess'),
        life: 3000
      });

      // Iniciar sesión automáticamente con el nuevo usuario
      await userRepository.login(userData.email, userData.password);

      // Redirigir al dashboard
      router.push('/dashboard');
    } else {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('auth.registerError'),
        life: 3000
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('auth.registerError'),
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 140px);
  padding: 2rem;
}

.register-card {
  width: 100%;
  max-width: 550px;
  padding: 2rem;
}

@media (max-width: 480px) {
  .register-card {
    padding: 1.5rem;
  }
}
</style>
