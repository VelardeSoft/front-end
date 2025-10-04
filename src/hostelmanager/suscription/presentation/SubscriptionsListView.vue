<template>
  <div class="subscriptions">
    <div class="p-card p-shadow-2 mb-4">
      <div class="p-card-body">
        <div class="flex justify-content-between align-items-center mb-4">
          <div class="p-card-title">{{ $t('subscriptions.list') }}</div>
          <Button
              icon="pi pi-arrow-left"
              :label="$t('common.back')"
              class="p-button-secondary"
              @click="goBack"
          />
        </div>

        <div v-if="currentSubscription" class="current-subscription mb-5">
          <h3>{{ $t('subscriptions.currentPlan') }}</h3>
          <div class="p-card p-shadow-1 p-4">
            <div class="flex align-items-center justify-content-between">
              <div>
                <div class="text-xl font-bold">{{ $t(`subscriptions.${currentSubscription.plan.toLowerCase()}`) }}</div>
                <div class="mt-2">{{ $t('subscriptions.expiresOn') }}: {{ formatDate(currentSubscription.endDate) }}</div>
                <div class="mt-1">{{ $t('subscriptions.maxRooms') }}: {{ currentSubscription.cant_rooms }}</div>
              </div>
              <Tag :value="currentSubscription.status || 'active'" severity="success" />
            </div>
          </div>
        </div>

        <div v-if="!hasActiveSubscription" class="available-plans">
          <h3>{{ $t('subscriptions.list') }}</h3>
          <div v-if="loading" class="flex justify-content-center my-5">
            <ProgressSpinner />
          </div>
          <div v-else class="grid">
            <div v-for="plan in subscriptionPlans" :key="plan.id" class="col-12 md:col-4 mb-3">
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

    <Dialog
        v-model:visible="showSubscriptionDialog"
        :header="$t('subscriptions.subscribe')"
        :style="{ width: '450px' }"
        :modal="true"
        :closable="!subscribing"
    >
      <div class="confirmation-content">
        <div v-if="selectedPlan">
          <div class="mb-4">{{ $t('common.confirm') }} {{ $t('subscriptions.subscribe').toLowerCase() }} - {{ $t('subscriptions.selectPaymentMethod') }}:</div>
          <div class="p-card p-shadow-1 p-3 mb-4">
            <div class="text-xl font-bold">{{ $t(`subscriptions.${selectedPlan.plan.toLowerCase()}`) }}</div>
            <div class="mt-2">{{ formatPrice(selectedPlan.price) }}</div>
            <div class="mt-1">{{ selectedPlan.duration_months }} {{ selectedPlan.duration_months === 1 ? 'mes' : 'meses' }}</div>
            <div class="mt-1">{{ $t('subscriptions.maxRooms') }}: {{ selectedPlan.cant_rooms }}</div>
          </div>

          <div id="paypal-button-container" class="mt-4">
            <div v-if="subscribing" class="flex justify-content-center my-3">
              <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".8s" aria-label="Cargando pago de PayPal" />
            </div>
            <div v-else-if="!paypalScriptLoaded" class="text-center text-500">
              Cargando opciones de pago...
            </div>
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
const { t } = useI18n(); // ⬅️ Corregido a useI18n (solo una '1')
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
const paypalScriptLoaded = ref(false);

// Propiedades computadas
const hasActiveSubscription = computed(() => {
  return currentSubscription.value && currentSubscription.value.status === 'active';
});

// Métodos
const loadData = async () => {
  loading.value = true;

  try {
    subscriptionPlans.value = await subscriptionRepository.findAllPlans();

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

const goBack = () => {
  router.push('/dashboard');
};

/**
 * Carga el script de PayPal de forma dinámica.
 */
const loadPaypalScript = () => {
  if (paypalScriptLoaded.value) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');

    // USANDO TU CLIENT ID para Sandbox
    const clientId = 'Aaaz6QtFCC66fcDFIzwyi-kVLfLqYfd4rb9I2mp58R1ZrvJdqGJHgDvQUSVz1GmKr6iFaVcpxQ00sIAe';

    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;

    script.onload = () => {
      paypalScriptLoaded.value = true;
      resolve();
    };
    script.onerror = (error) => {
      console.error("Error loading PayPal script:", error);
      reject(error);
    };
    document.head.appendChild(script);
  });
};

const subscribe = async (plan) => {
  selectedPlan.value = plan;
  selectedPlanId.value = plan.id;
  showSubscriptionDialog.value = true;

  // Carga el script al seleccionar el plan
  try {
    await loadPaypalScript();
    if (showSubscriptionDialog.value) {
      // Pequeño retardo para asegurar que el DOM del Dialog esté listo
      setTimeout(() => renderPaypalButtons(plan), 50);
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('subscriptions.paypalLoadError') || 'Error al cargar el script de PayPal.',
      life: 3000
    });
  }
};

const closeSubscriptionDialog = () => {
  showSubscriptionDialog.value = false;
  selectedPlan.value = null;
  selectedPlanId.value = null;
  // Limpia el contenedor de botones de PayPal
  const container = document.getElementById('paypal-button-container');
  if (container) {
    container.innerHTML = '';
  }
};

const renderPaypalButtons = (plan) => {
  // Asegúrate de que el SDK de PayPal y el elemento contenedor estén disponibles
  if (!window.paypal || !document.getElementById('paypal-button-container')) return;

  // Limpia el contenedor para evitar botones duplicados
  document.getElementById('paypal-button-container').innerHTML = '';

  window.paypal.Buttons({
    // 1. Configuración de la transacción (crear pedido)
    createOrder: (data, actions) => {
      return actions.order.create({
        purchase_units: [{
          amount: {
            // ✅ CORRECCIÓN: Aseguramos que plan.price sea un número antes de usar toFixed(2)
            value: parseFloat(plan.price).toFixed(2),
            currency_code: 'USD'
          },
          description: `${t('subscriptions.subscribe')}: ${t(`subscriptions.${plan.plan.toLowerCase()}`)}`
        }]
      });
    },

    // 2. Transacción aprobada por el comprador
    onApprove: async (data, actions) => {
      subscribing.value = true;
      try {
        // Capturar el pago
        const order = await actions.order.capture();

        // Llama a la función que maneja la lógica de tu backend
        await completeSubscriptionProcess(plan, order.id);

      } catch (error) {
        console.error('Error al capturar el pago:', error);
        toast.add({
          severity: 'error',
          summary: t('common.error'),
          detail: t('subscriptions.paymentError') || 'Error al procesar el pago. Inténtelo de nuevo.',
          life: 5000
        });
      } finally {
        subscribing.value = false;
        closeSubscriptionDialog();
      }
    },

    // 3. Transacción cancelada o error
    onCancel: (data) => {
      toast.add({
        severity: 'info',
        summary: t('common.info'),
        detail: t('subscriptions.paymentCanceled') || 'El pago ha sido cancelado.',
        life: 3000
      });
    },
    onError: (err) => {
      console.error('Error de PayPal:', err);
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('subscriptions.paypalError') || 'Ocurrió un error con el servicio de PayPal.',
        life: 5000
      });
    }
  }).render('#paypal-button-container');
};


// FUNCIÓN para manejar la creación de la suscripción después del pago exitoso
const completeSubscriptionProcess = async (plan, paypalOrderId) => {
  if (!plan || !user.value) return;

  try {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + parseInt(plan.duration_months));

    const subscriptionData = {
      userId: user.value.id,
      plan: plan.plan,
      cant_rooms: plan.cant_rooms,
      duration_months: plan.duration_months,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: 'active',
      price: plan.price,
      features: plan.features,
      paymentDetails: {
        processor: 'paypal',
        orderId: paypalOrderId,
      }
    };

    const newSubscription = await subscriptionRepository.create(subscriptionData);

    if (newSubscription) {
      const updatedUserData = {
        ...user.value,
        subscription_id: newSubscription.id
      };

      const updatedUser = await userRepository.update(user.value.id, updatedUserData);

      if (updatedUser) {
        userRepository.saveToLocalStorage(updatedUser);
        user.value = updatedUser;
        currentSubscription.value = newSubscription;

        toast.add({
          severity: 'success',
          summary: t('common.success'),
          detail: t('subscriptions.subscribeSuccess'),
          life: 3000
        });

        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);

        return true;
      }
    } else {
      throw new Error('No se pudo completar la suscripción en el sistema.');
    }

  } catch (error) {
    console.error('Error al finalizar la suscripción en el sistema:', error);
    throw error;
  }
};

const confirmSubscription = () => {
  toast.add({
    severity: 'info',
    summary: t('common.info'),
    detail: t('subscriptions.usePaypalButtons') || 'Por favor, utiliza los botones de PayPal para completar la suscripción.',
    life: 3000
  });
};


// Ciclo de vida
onMounted(() => {
  if (!user.value || user.value.user_type !== 'Owner') {
    router.push('/dashboard');
    return;
  }

  loadData();
});
</script>

<style scoped>
/* Tu CSS se mantiene igual */
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