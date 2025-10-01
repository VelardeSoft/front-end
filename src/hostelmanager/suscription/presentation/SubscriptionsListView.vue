<template>
  <div class="subscriptions">
    <div class="p-card p-shadow-2 mb-4">
      <div class="p-card-body">
        <div class="p-card-title">{{ $t('subscriptions.list') }}</div>
        <div class="p-card-content">
          <!-- Mostrar suscripción actual si existe -->
          <div v-if="currentSubscription" class="current-subscription mb-5">
            <h3>{{ $t('subscriptions.currentPlan') }}</h3>
            <div class="p-card p-shadow-1 p-4">
              <div class="flex align-items-center justify-content-between">
                <div>
                  <div class="text-xl font-bold">{{ $t(`subscriptions.${currentSubscription.plan.toLowerCase()}`) }}</div>
                  <div class="mt-2">{{ $t('subscriptions.expiresOn') }}: {{ formatDate(currentSubscription.endDate) }}</div>
                  <div class="mt-1">{{ $t('subscriptions.maxRooms') }}: {{ currentSubscription.cant_rooms }}</div>
                </div>
                <Tag :value="currentSubscription.status" severity="success" />
              </div>
            </div>
          </div>

          <div v-if="!hasActiveSubscription" class="available-plans">
            <h3>{{ $t('subscriptions.list') }}</h3>
            <div v-if="loading" class="flex justify-content-center my-5">
              <ProgressSpinner />
            </div>
            <div v-else class="grid">
              <div v-for="plan in subscriptionPlans" :key="plan.id" class="col-12 md:col-4">
                <div class="p-card p-shadow-2 h-full plan-card">
                  <div class="p-card-body">
                    <div class="plan-header">
                      <div class="plan-name">{{ $t(`subscriptions.${plan.plan.toLowerCase()}`) }}</div>
                      <div class="plan-price">{{ formatPrice(plan.price) }}</div>
                    </div>
                    <div class="plan-details">
                      <div class="mb-2">{{ $t('subscriptions.duration') }}: {{ plan.duration_months }} {{ plan.duration_months === 1 ? 'mes' : 'meses' }}</div>
                      <div class="mb-3">{{ $t('subscriptions.maxRooms') }}: {{ plan.cant_rooms }}</div>

                      <div v-if="plan.features && plan.features.length > 0" class="plan-features">
                        <div class="text-sm font-bold mb-2">{{ $t('subscriptions.features') }}:</div>
                        <ul>
                          <li v-for="(feature, idx) in plan.features" :key="idx">
                            <i class="pi pi-check mr-2 text-success"></i>
                            <span>{{ feature }}</span>
                          </li>
                        </ul>
                      </div>

                      <div class="mt-4">
                        <Button
                          :label="$t('subscriptions.subscribe')"
                          class="p-button-primary w-full"
                          @click="subscribe(plan)"
                          :disabled="subscribing"
                          :loading="subscribing && selectedPlanId === plan.id"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Diálogo de confirmación de suscripción -->
    <Dialog
      v-model:visible="showSubscriptionDialog"
      :header="$t('subscriptions.subscribe')"
      :style="{ width: '450px' }"
      :modal="true"
      :closable="!subscribing"
    >
      <div class="confirmation-content">
        <div v-if="selectedPlan">
          <div class="mb-4">{{ $t('common.confirm') }} {{ $t('subscriptions.subscribe').toLowerCase() }} {{ $t('common.to') }}:</div>
          <div class="p-card p-shadow-1 p-3 mb-4">
            <div class="text-xl font-bold">{{ $t(`subscriptions.${selectedPlan.plan.toLowerCase()}`) }}</div>
            <div class="mt-2">{{ formatPrice(selectedPlan.price) }}</div>
            <div class="mt-1">{{ plan.duration_months }} {{ plan.duration_months === 1 ? 'mes' : 'meses' }}</div>
          </div>
        </div>
      </div>
      <template #footer>
        <Button
          :label="$t('common.cancel')"
          icon="pi pi-times"
          class="p-button-text"
          @click="closeSubscriptionDialog"
          :disabled="subscribing"
        />
        <Button
          :label="$t('common.confirm')"
          icon="pi pi-check"
          class="p-button-primary"
          @click="confirmSubscription"
          :loading="subscribing"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { SubscriptionRepository } from '../infrastructure/SubscriptionRepository';
import { UserRepository } from '../../profile/infrastructure/UserRepository';

// Composables
const router = useRouter();
const { t } = useI18n();
const toast = useToast();

// Repositorios
const subscriptionRepository = new SubscriptionRepository();
const userRepository = new UserRepository();

// Estado
const user = ref(userRepository.getCurrentUser());
const loading = ref(true);
const subscribing = ref(false);
const subscriptionPlans = ref([]);
const currentSubscription = ref(null);
const showSubscriptionDialog = ref(false);
const selectedPlan = ref(null);
const selectedPlanId = ref(null);

// Propiedades computadas
const hasActiveSubscription = computed(() => {
  return currentSubscription.value && currentSubscription.value.status === 'active';
});

// Métodos
const loadData = async () => {
  loading.value = true;

  try {
    // Cargar planes de suscripción
    subscriptionPlans.value = await subscriptionRepository.findAllPlans();

    // Verificar si el usuario tiene una suscripción activa
    if (user.value && user.value.subscription_id) {
      const subscription = await subscriptionRepository.findById(user.value.subscription_id);
      if (subscription) {
        currentSubscription.value = subscription;
      }
    }
  } catch (error) {
    console.error('Error loading subscription data:', error);
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

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(price);
};

const formatDate = (dateString) => {
  if (!dateString) return '';

  return new Date(dateString).toLocaleDateString();
};

const subscribe = (plan) => {
  selectedPlan.value = plan;
  selectedPlanId.value = plan.id;
  showSubscriptionDialog.value = true;
};

const closeSubscriptionDialog = () => {
  showSubscriptionDialog.value = false;
  selectedPlan.value = null;
  selectedPlanId.value = null;
};

const confirmSubscription = async () => {
  if (!selectedPlan.value || !user.value) return;

  subscribing.value = true;

  try {
    // Crear suscripción
    const newSubscription = await subscriptionRepository.subscribeToPlan(
      user.value.id,
      selectedPlan.value.id
    );

    if (newSubscription) {
      // Actualizar el usuario con la nueva suscripción
      const updatedUser = await userRepository.update(user.value.id, {
        ...user.value,
        subscription_id: newSubscription.id
      });

      if (updatedUser) {
        // Actualizar usuario en localStorage
        userRepository.saveToLocalStorage(updatedUser.toPrimitives());
        user.value = updatedUser;
        currentSubscription.value = newSubscription;

        toast.add({
          severity: 'success',
          summary: t('common.success'),
          detail: t('subscriptions.subscribeSuccess'),
          life: 3000
        });

        // Redirigir al dashboard
        router.push('/dashboard');
      }
    } else {
      throw new Error('No se pudo completar la suscripción');
    }
  } catch (error) {
    console.error('Error subscribing to plan:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message,
      life: 3000
    });
  } finally {
    subscribing.value = false;
    closeSubscriptionDialog();
  }
};

// Ciclo de vida
onMounted(() => {
  // Solo permitir propietarios en esta página
  if (!user.value || user.value.user_type !== 'Owner') {
    router.push('/dashboard');
    return;
  }

  loadData();
});
</script>

<style scoped>
.subscriptions {
  padding: 1rem;
}

.plan-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.plan-card .p-card-body {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
}

.plan-header {
  background-color: #f0f7ff;
  padding: 1.5rem;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  text-align: center;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #4f86c6;
}

.plan-price {
  font-size: 2rem;
  font-weight: 700;
  margin-top: 0.5rem;
}

.plan-details {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.plan-features {
  flex-grow: 1;
}

.plan-features ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.plan-features li {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}

.text-success {
  color: #4caf50;
}

.current-subscription .p-card {
  background-color: #f0f7ff;
}
</style>
