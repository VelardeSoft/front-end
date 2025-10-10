<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import useSubscriptionStore from '../../application/subscription.store.js';
import { Subscription } from '../../domain/model/subscription.entity.js';

const { t } = useI18n();
const store = useSubscriptionStore();
const router = useRouter();
const route = useRoute();
const isEdit = ref(false);

const subscription = reactive(new Subscription({
  type_plan: '',
  number_card: '',
  date: '',
  cvv: ''
}));

const errors = ref({
  type_plan: '',
  number_card: '',
  date: '',
  cvv: ''
});

onMounted(async () => {
  if (route.params.id) {
    isEdit.value = true;
    const id = parseInt(route.params.id);
    const loadedSubscription = await store.getSubscriptionById(id);
    if (loadedSubscription) {
      Object.assign(subscription, loadedSubscription);
    } else {
      router.push({ name: 'subscription-list' });
    }
  }
});

const validate = () => {
  let isValid = true;
  errors.value = {
    type_plan: '',
    number_card: '',
    date: '',
    cvv: ''
  };

  if (!subscription.type_plan) {
    errors.value.type_plan = 'El tipo de plan es requerido';
    isValid = false;
  }

  if (!subscription.number_card) {
    errors.value.number_card = 'El número de tarjeta es requerido';
    isValid = false;
  } else if (!/^\d{4}-\d{4}-\d{4}-\d{4}$/.test(subscription.number_card)) {
    errors.value.number_card = 'Formato inválido. Debe ser XXXX-XXXX-XXXX-XXXX';
    isValid = false;
  }

  if (!subscription.date) {
    errors.value.date = 'La fecha de expiración es requerida';
    isValid = false;
  } else if (!/^\d{2}\/\d{2}$/.test(subscription.date)) {
    errors.value.date = 'Formato inválido. Debe ser MM/YY';
    isValid = false;
  }

  if (!subscription.cvv) {
    errors.value.cvv = 'El CVV es requerido';
    isValid = false;
  } else if (!/^\d{3}$/.test(subscription.cvv)) {
    errors.value.cvv = 'El CVV debe tener 3 dígitos';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validate()) {
    return;
  }

  let result;
  if (isEdit.value) {
    result = await store.updateSubscription(subscription);
  } else {
    result = await store.createSubscription(subscription);
  }

  if (result) {
    router.push({ name: 'subscription-list' });
  }
};

const goBack = () => {
  router.push({ name: 'subscription-list' });
};
</script>

<template>
  <div class="subscription-form p-4">
    <h1 class="text-2xl font-bold mb-4">
      {{ isEdit ? t('subscriptions.editTitle') : t('subscriptions.createTitle') }}
    </h1>

    <form @submit.prevent="handleSubmit" class="p-fluid">
      <div class="field mb-4">
        <label for="type_plan">Tipo de Plan</label>
        <pv-dropdown
          id="type_plan"
          v-model="subscription.type_plan"
          :options="store.planTypes"
          optionLabel="label"
          optionValue="value"
          placeholder="Selecciona un plan"
          :class="{ 'p-invalid': errors.type_plan }"
        />
        <small class="p-error" v-if="errors.type_plan">{{ errors.type_plan }}</small>
      </div>

      <div class="field mb-4">
        <label for="number_card">Número de Tarjeta</label>
        <pv-input-mask
          id="number_card"
          v-model="subscription.number_card"
          mask="9999-9999-9999-9999"
          placeholder="XXXX-XXXX-XXXX-XXXX"
          :class="{ 'p-invalid': errors.number_card }"
        />
        <small class="p-error" v-if="errors.number_card">{{ errors.number_card }}</small>
      </div>

      <div class="grid">
        <div class="col-6 field mb-4">
          <label for="date">Fecha de Expiración</label>
          <pv-input-mask
            id="date"
            v-model="subscription.date"
            mask="99/99"
            placeholder="MM/YY"
            :class="{ 'p-invalid': errors.date }"
          />
          <small class="p-error" v-if="errors.date">{{ errors.date }}</small>
        </div>

        <div class="col-6 field mb-4">
          <label for="cvv">CVV</label>
          <pv-input-mask
            id="cvv"
            v-model="subscription.cvv"
            mask="999"
            placeholder="123"
            :class="{ 'p-invalid': errors.cvv }"
          />
          <small class="p-error" v-if="errors.cvv">{{ errors.cvv }}</small>
        </div>
      </div>

      <div class="flex gap-2 justify-content-end mt-4">
        <pv-button type="button" label="Cancelar" class="p-button-secondary" @click="goBack" />
        <pv-button type="submit" label="Guardar" />
      </div>
    </form>
  </div>
</template>
