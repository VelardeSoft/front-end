<template>
  <div class="register-container-v5">
    <div class="register-card-v5">
      <h2 class="text-center mb-5 text-green-title">{{ $t('auth.register') }}</h2>
      <form @submit.prevent="register">
        <div class="p-fluid">

          <div class="form-grid-2col">

            <div class="col-side">

              <div class="field">
                <label for="name-v5" class="text-dark">{{ $t('auth.name') || 'Nombre Completo' }}</label>
                <InputText
                    id="name-v5"
                    v-model="userData.name"
                    :placeholder="$t('auth.name') || 'Ej: Juan Pérez'"
                    :class="{'p-invalid': v$.userData.name.$invalid && submitted}"
                />
                <small v-if="v$.userData.name.$invalid && submitted" class="p-error">
                  {{ $t('common.required') }}
                </small>
              </div>

              <div class="field">
                <label for="email-v5" class="text-dark">{{ $t('auth.email') }}</label>
                <InputText
                    id="email-v5"
                    v-model="userData.email"
                    type="email"
                    :placeholder="$t('auth.email') || 'ejemplo@correo.com'"
                    :class="{'p-invalid': v$.userData.email.$invalid && submitted}"
                />
                <small v-if="v$.userData.email.$invalid && submitted" class="p-error">
                  {{ $t('common.required') }}
                </small>
              </div>

              <div class="field">
                <label for="userType-v5" class="text-dark">{{ $t('auth.userType') }}</label>
                <Dropdown
                    id="userType-v5"
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
            </div>

            <div class="col-side">

              <div class="field">
                <label for="password-v5" class="text-dark">{{ $t('auth.password') }}</label>
                <Password
                    id="password-v5"
                    v-model="userData.password"
                    :placeholder="$t('auth.password') || 'Mínimo 8 caracteres'"
                    toggleMask
                    :class="{'p-invalid': v$.userData.password.$invalid && submitted}"
                />
                <small v-if="v$.userData.password.$invalid && submitted" class="p-error">
                  {{ $t('common.required') }}
                </small>
              </div>

              <div class="field">
                <label for="confirmPassword-v5" class="text-dark">{{ $t('auth.confirmPassword') }}</label>
                <Password
                    id="confirmPassword-v5"
                    v-model="confirmPassword"
                    :placeholder="$t('auth.confirmPassword') || 'Repite la contraseña'"
                    :feedback="false"
                    toggleMask
                    :class="{'p-invalid': v$.confirmPassword.$invalid && submitted}"
                />
                <small v-if="v$.confirmPassword.$invalid && submitted" class="p-error">
                  {{ v$.confirmPassword.required.$invalid && submitted ? $t('common.required') : $t('auth.passwordMismatch') }}
                </small>
              </div>

              <div class="field">
                <label for="phone-v5" class="text-dark">{{ $t('auth.phone') }}</label>
                <InputText
                    id="phone-v5"
                    v-model="userData.phone"
                    :placeholder="$t('auth.phone') || 'Ej: +51 987 654 321'"
                />
              </div>
            </div>
          </div>

          <div class="field">
            <label for="address-v5" class="text-dark">{{ $t('auth.address') }}</label>
            <Textarea
                id="address-v5"
                v-model="userData.address"
                rows="2"
                :placeholder="$t('auth.address') || 'Tu calle, número, ciudad... (Opcional)'"
            />
          </div>

          <div class="field mt-5">
            <Button
                type="submit"
                :label="$t('auth.register')"
                class="p-button-lg p-button-green w-full"
                :loading="loading"
            />
          </div>

          <div class="mt-4 text-center">
            <p class="text-dark">
              {{ $t('auth.alreadyAccount') }}
              <router-link to="/login" class="font-bold text-primary">{{ $t('auth.login') }}</router-link>
            </p>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
// *** Lógica (Script) - IDÉNTICA a la versión original para mantener la funcionalidad ***

import { ref, reactive } from 'vue';
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
    const fieldErrors = [];

    if (v$.value.userData.name.$invalid) fieldErrors.push('Nombre Completo');
    if (v$.value.userData.email.$invalid) fieldErrors.push('Email');
    if (v$.value.userData.password.$invalid) fieldErrors.push('Contraseña');
    if (v$.value.userData.user_type.$invalid) fieldErrors.push('Tipo de Usuario');
    if (v$.value.confirmPassword.$invalid && confirmPassword.value !== userData.password) {
      fieldErrors.push('Confirmación de Contraseña (no coincide)');
    } else if (v$.value.confirmPassword.$invalid) {
      fieldErrors.push('Confirmación de Contraseña');
    }

    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: `Por favor, completa estos campos: ${fieldErrors.join(', ')}`,
      life: 5000
    });

    console.log('Validation errors:', v$.value.$errors);
    return;
  }

  loading.value = true;
  console.log('Registering with data:', userData);

  try {
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

      await userRepository.login(userData.email, userData.password);
      alert("Logged in successfully!");
      router.push('/login');
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

    alert("Logged in successfully!");
    router.push('/login');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Estilos para el Diseño V5: Compacto con Grid de Dos Columnas y Color Verde */
.register-container-v5 {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
  padding: 2rem;
  background-color: #f7f9fc;
}

.register-card-v5 {
  width: 100%;
  max-width: 700px;
  padding: 3rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: white;
  border: 1px solid #e0e6ed;
  display: block;
}

/* Título: Aseguramos el color verde */
.text-green-title {
  color: #333333!important; /* Un verde vibrante (Material Design Green 500) */
  font-weight: 700;
}

/* Contenedor del Grid de 2 Columnas */
.form-grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 1rem;
}

.field {
  margin-bottom: 1.5rem;
}

/* Etiquetas de campos oscuras */
.text-dark {
  color: #333333;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
  font-size: 0.95rem;
}

/* Enlace de Login */


/* Estilos de respuesta: En móvil, las 2 columnas colapsan a 1 */
@media (max-width: 768px) {
  .form-grid-2col {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .register-card-v5 {
    padding: 1.5rem;
    max-width: 100%;
    margin: 1rem;
    box-shadow: none;
    border: none;
  }

  .register-container-v5 {
    padding: 0;
  }
}
</style>