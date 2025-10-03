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
              :class="{'p-invalid': v$.userData.name.$invalid && submitted}"
            />
            <small v-if="v$.userData.name.$invalid && submitted" class="p-error">
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
              :class="{'p-invalid': v$.userData.email.$invalid && submitted}"
            />
            <small v-if="v$.userData.email.$invalid && submitted" class="p-error">
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
              :class="{'p-invalid': v$.userData.password.$invalid && submitted}"
            />
            <small v-if="v$.userData.password.$invalid && submitted" class="p-error">
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
              :class="{'p-invalid': v$.userData.user_type.$invalid && submitted}"
            />
            <small v-if="v$.userData.user_type.$invalid && submitted" class="p-error">
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
import { required, email } from '@vuelidate/validators';
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

// Validación personalizada para verificar que las contraseñas coincidan
const sameAsPassword = (value) => value === userData.password;

// Validaciones
const rules = {
  userData: {
    name: { required },
    email: { required, email },
    password: { required },
    user_type: { required }
  },
  confirmPassword: {
    required,
    sameAsPassword
  }
};

const v$ = useVuelidate(rules, { userData, confirmPassword });

// Métodos
const register = async () => {
  submitted.value = true;

  const isValid = await v$.value.$validate();
  if (!isValid) {
    // Identificar los campos con error para mostrar mensaje más específico
    const fieldErrors = [];

    if (v$.value.userData.name.$invalid) fieldErrors.push('name');
    if (v$.value.userData.email.$invalid) fieldErrors.push('email');
    if (v$.value.userData.password.$invalid) fieldErrors.push('password');
    if (v$.value.userData.user_type.$invalid) fieldErrors.push('user type');
    if (v$.value.confirmPassword.$invalid && confirmPassword.value !== userData.password) {
      fieldErrors.push('password confirmation doesn\'t match');
    } else if (v$.value.confirmPassword.$invalid) {
      fieldErrors.push('password confirmation');
    }

    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: `Please complete these fields: ${fieldErrors.join(', ')}`,
      life: 5000
    });

    console.log('Validation errors:', v$.value.$errors);
    return;
  }

  loading.value = true;
  console.log('Registering with data:', userData);

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
      alert("Logged in successfully!");
      setTimeout(() => {
        router.push('/login');
      }, 100);
    } else {
      throw new Error('Failed to register user');
    }
  } catch (error) {
    console.error('Register error:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('auth.registerError'),
      life: 3000
    });
    // Implemnt temporal

    alert("Logged in successfully!");
    setTimeout(() => {
      router.push('/login');
    }, 100);
    /// Aqui llega
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
  min-height: 100vh;
  padding: 2rem;
  background-color: #f5f7f9;
  color: #555555;
}

.register-card {
  width: 100%;
  max-width: 550px;
  padding: 2.5rem;
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1) !important;
  background-color: white;
}

@media (max-width: 480px) {
  .register-card {
    padding: 1.5rem;
    margin: 1rem;
  }

  .register-container {
    padding: 0;
  }
}
</style>
