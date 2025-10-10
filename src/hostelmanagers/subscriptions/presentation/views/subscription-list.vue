<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import useSubscriptionStore from '../../application/subscription.store.js';

const { t } = useI18n();
const store = useSubscriptionStore();
const router = useRouter();
const subscriptions = ref([]);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  await store.fetchSubscriptions();
  subscriptions.value = store.subscriptions;
  loading.value = false;
});

const formatDate = (dateString) => {
  return dateString; // Mostrar como está en la base de datos
};

const navigateToCreate = () => {
  router.push({ name: 'subscription-create' });
};

const navigateToEdit = (id) => {
  router.push({ name: 'subscription-edit', params: { id } });
};

const confirmDelete = async (id) => {
  if (confirm(t('subscriptions.confirmDelete'))) {
    await store.deleteSubscription(id);
    await store.fetchSubscriptions();
    subscriptions.value = store.subscriptions;
  }
};
</script>

<template>
  <div class="subscription-list p-4">
    <div class="flex justify-between mb-4">
      <h1 class="text-2xl font-bold">{{ t('subscriptions.listTitle') }}</h1>
      <pv-button
        icon="pi pi-plus"
        label="Nueva Suscripción"
        @click="navigateToCreate"
        v-if="$store && $store.getters && $store.getters.isOwner"
      />
    </div>

    <pv-data-table
      :value="subscriptions"
      :paginator="true"
      :rows="10"
      :loading="loading"
      stripedRows
      responsiveLayout="scroll"
      class="p-datatable-sm"
    >
      <template #empty>
        <div class="text-center p-4">No hay suscripciones disponibles</div>
      </template>
      <template #loading>
        <div class="text-center p-4">Cargando suscripciones...</div>
      </template>

      <pv-column field="id" header="ID" sortable style="width: 10%"></pv-column>
      <pv-column field="type_plan" header="Tipo de Plan" sortable style="width: 25%">
        <template #body="slotProps">
          {{ store.getPlanTypeLabel(slotProps.data.type_plan) }}
        </template>
      </pv-column>
      <pv-column field="number_card" header="Tarjeta" style="width: 20%">
        <template #body="slotProps">
          **** **** **** {{ slotProps.data.number_card.substring(slotProps.data.number_card.length - 4) }}
        </template>
      </pv-column>
      <pv-column field="date" header="Fecha Exp." style="width: 15%"></pv-column>

      <pv-column header="Acciones" style="width: 15%">
        <template #body="slotProps">
          <div class="flex gap-2">
            <pv-button
              icon="pi pi-pencil"
              class="p-button-sm p-button-text p-button-info"
              @click="navigateToEdit(slotProps.data.id)"
              v-if="$store && $store.getters && $store.getters.isOwner"
            />
            <pv-button
              icon="pi pi-trash"
              class="p-button-sm p-button-text p-button-danger"
              @click="confirmDelete(slotProps.data.id)"
              v-if="$store && $store.getters && $store.getters.isOwner"
            />
          </div>
        </template>
      </pv-column>
    </pv-data-table>
  </div>
</template>
