<template>
  <div class="profile-view">
    <div class="p-card p-shadow-2 mb-4">
      <div class="p-card-body">
        <div class="p-card-title mb-4">{{ $t('profile.title') }}</div>

        <div v-if="loading" class="flex justify-content-center my-5">
          <ProgressSpinner />
        </div>
        <div v-else>
          <form @submit.prevent="updateProfile">
            <div class="p-fluid formgrid grid">
              <div class="field col-12">
                <h3>{{ $t('profile.personalInfo') }}</h3>
              </div>

              <div class="field col-12 md:col-6">
                <label for="name">{{ $t('profile.name') }} *</label>
                <InputText
                  id="name"
                  v-model="userData.name"
                  :class="{'p-invalid': v$.name.$invalid && submitted}"
                  :placeholder="$t('profile.name')"
                />
                <small v-if="v$.name.$invalid && submitted" class="p-error">
                  {{ $t('profile.requiredField') }}
                </small>
              </div>

              <div class="field col-12 md:col-6">
                <label for="email">{{ $t('profile.email') }} *</label>
                <InputText
                  id="email"
                  v-model="userData.email"
                  type="email"
                  :class="{'p-invalid': v$.email.$invalid && submitted}"
                  :placeholder="$t('profile.email')"
                  disabled
                />
                <small v-if="v$.email.$invalid && submitted" class="p-error">
                  {{ $t('profile.requiredField') }}
                </small>
              </div>

              <div class="field col-12 md:col-6">
                <label for="phone">{{ $t('profile.phone') }}</label>
                <InputText
                  id="phone"
                  v-model="userData.phone"
                  :placeholder="$t('profile.phone')"
                />
              </div>

              <div class="field col-12 md:col-6">
                <label for="user_type">{{ $t('profile.userType') }}</label>
                <InputText
                  id="user_type"
                  :value="getUserTypeLabel"
                  disabled
                />
              </div>

              <div class="field col-12">
                <label for="address">{{ $t('profile.address') }}</label>
                <Textarea
                  id="address"
                  v-model="userData.address"
                  rows="3"
                  :placeholder="$t('profile.address')"
                />
              </div>

              <div v-if="isOwner && hasSubscription" class="field col-12">
                <div class="p-card p-shadow-1 p-3 bg-primary-50">
                  <div class="flex justify-content-between align-items-center">
                    <div>
                      <div class="text-lg font-bold">{{ $t('subscriptions.currentPlan') }}</div>
                      <div v-if="subscription">{{ subscription.plan }}</div>
                      <div v-if="subscription">{{ $t('subscriptions.expiresOn') }}: {{ formatDate(subscription.endDate) }}</div>
                    </div>
                    <Button
                      :label="$t('subscriptions.list')"
                      icon="pi pi-list"
                      class="p-button-sm p-button-text"
                      @click="goToSubscriptions"
                    />
                  </div>
                </div>
              </div>

              <div v-if="isOwner && !hasSubscription" class="field col-12">
                <Message severity="info" :closable="false">
                  <div class="flex align-items-center">
                    <i class="pi pi-info-circle mr-2"></i>
                    <span>{{ $t('subscriptions.required') }}</span>
                    <Button
                      :label="$t('subscriptions.subscribe')"
                      class="p-button-sm p-button-text ml-3"
                      @click="goToSubscriptions"
                    />
                  </div>
                </Message>
              </div>

              <div class="flex justify-content-end col-12 mt-4">
                <Button
                  type="submit"
                  :label="$t('profile.updateProfile')"
                  icon="pi pi-save"
                  class="p-button-primary"
                  :loading="updating"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useVuelidate } from '@vuelidate/core';
import { required, email } from '@vuelidate/validators';
import { UserRepository } from '../infrastructure/UserRepository';
import { SubscriptionRepository } from '../../suscription/infrastructure/SubscriptionRepository';

// Composables
const router = useRouter();
const { t } = useI18n();
const toast = useToast();

// Repositorios
const userRepository = new UserRepository();
const subscriptionRepository = new SubscriptionRepository();

// Estado
const currentUser = ref(userRepository.getCurrentUser());
const subscription = ref(null);
const loading = ref(true);
const updating = ref(false);
const submitted = ref(false);

// Datos de usuario que se pueden editar
const userData = reactive({
  id: currentUser.value?.id,
  name: currentUser.value?.name || '',
  email: currentUser.value?.email || '',
  user_type: currentUser.value?.user_type || '',
  phone: currentUser.value?.phone || '',
  address: currentUser.value?.address || '',
  subscription_id: currentUser.value?.subscription_id
});

// Propiedades computadas
const isOwner = computed(() => userData.user_type === 'Owner');
const isVisitor = computed(() => userData.user_type === 'Visitor');
const hasSubscription = computed(() => userData.subscription_id !== null);

const getUserTypeLabel = computed(() => {
  return isOwner.value ? t('profile.owner') : t('profile.visitor');
});

// Validaciones
const rules = {
  name: { required },
  email: { required, email }
};

const v$ = useVuelidate(rules, userData);

// Métodos
const loadData = async () => {
  loading.value = true;

  try {
    // Si no hay usuario, redirigir al login
    if (!currentUser.value) {
      router.push('/login');
      return;
    }

    // Si el usuario es propietario y tiene suscripción, cargar los datos de la suscripción
    if (isOwner.value && hasSubscription.value) {
      subscription.value = await subscriptionRepository.findById(userData.subscription_id);
    }
  } catch (error) {
    console.error('Error loading profile data:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message,
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString();
};

const goToSubscriptions = () => {
  router.push('/subscriptions');
};

const updateProfile = async () => {
  submitted.value = true;

  const isValid = await v$.value.$validate();
  if (!isValid) {
    return;
  }

  updating.value = true;

  try {
    // Actualizar perfil
    const updatedUser = await userRepository.update(userData.id, userData);

    if (updatedUser) {
      // Actualizar usuario en localStorage
      userRepository.saveToLocalStorage(updatedUser.toPrimitives());
      currentUser.value = updatedUser;

      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('profile.updateSuccess'),
        life: 3000
      });
    } else {
      throw new Error('No se pudo actualizar el perfil');
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('profile.updateError'),
      life: 3000
    });
  } finally {
    updating.value = false;
  }
};

// Ciclo de vida
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.profile-view {
  padding: 1rem;
}

.bg-primary-50 {
  background-color: #f0f7ff;
}
</style>
