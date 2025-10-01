<template>
  <div class="hotels-list">
    <div class="p-card p-shadow-2 mb-4">
      <div class="p-card-body">
        <div class="flex justify-content-between align-items-center mb-4">
          <div class="p-card-title mb-0">{{ $t('hotels.list') }}</div>
          <Button
            v-if="isOwner && hasSubscription"
            icon="pi pi-plus"
            :label="$t('hotels.create')"
            class="p-button-success"
            @click="createHotel"
          />
        </div>

        <!-- Mensaje para propietarios sin suscripción -->
        <Message
          v-if="isOwner && !hasSubscription"
          severity="warn"
          :closable="false"
          class="mb-4"
        >
          <div class="flex align-items-center">
            <i class="pi pi-exclamation-circle mr-2"></i>
            <span>{{ $t('subscriptions.required') }}</span>
            <Button
              :label="$t('subscriptions.subscribe')"
              class="p-button-sm p-button-text ml-3"
              @click="goToSubscriptions"
            />
          </div>
        </Message>

        <!-- Buscador de hoteles -->
        <div class="p-input-icon-left mb-4 w-full">
          <i class="pi pi-search"></i>
          <InputText
            v-model="searchQuery"
            :placeholder="$t('common.search')"
            class="w-full"
          />
        </div>

        <!-- Listado de hoteles -->
        <div v-if="loading" class="flex justify-content-center my-5">
          <ProgressSpinner />
        </div>
        <div v-else-if="filteredHotels.length === 0" class="text-center my-5">
          <div class="mb-3">
            <i class="pi pi-info-circle" style="font-size: 2rem"></i>
          </div>
          <p>{{ $t('hotels.noHotels') }}</p>
          <Button
            v-if="isOwner && hasSubscription"
            icon="pi pi-plus"
            :label="$t('hotels.create')"
            class="p-button-success mt-3"
            @click="createHotel"
          />
        </div>
        <div v-else>
          <DataTable :value="filteredHotels" responsiveLayout="scroll" paginator :rows="10" stripedRows>
            <Column field="name" :header="$t('hotels.name')" sortable>
              <template #body="slotProps">
                <div class="flex align-items-center">
                  <div v-if="slotProps.data.image" class="hotel-table-image mr-2">
                    <img :src="slotProps.data.image" :alt="slotProps.data.name" />
                  </div>
                  <div>{{ slotProps.data.name }}</div>
                </div>
              </template>
            </Column>
            <Column field="address" :header="$t('hotels.address')" sortable></Column>
            <Column field="phone" :header="$t('hotels.phone')" class="hidden-xs"></Column>
            <Column :header="$t('hotels.actions')" style="width: 200px" class="text-center">
              <template #body="slotProps">
                <div class="flex justify-content-center gap-2">
                  <Button
                    icon="pi pi-eye"
                    class="p-button-rounded p-button-info p-button-sm"
                    @click="viewHotel(slotProps.data.id)"
                    v-tooltip.top="$t('hotels.view')"
                  />
                  <Button
                    v-if="isOwner && isOwnerOfHotel(slotProps.data)"
                    icon="pi pi-key"
                    class="p-button-rounded p-button-success p-button-sm"
                    @click="viewRooms(slotProps.data.id)"
                    v-tooltip.top="$t('hotels.rooms')"
                  />
                  <Button
                    v-if="isOwner && isOwnerOfHotel(slotProps.data)"
                    icon="pi pi-pencil"
                    class="p-button-rounded p-button-warning p-button-sm"
                    @click="editHotel(slotProps.data.id)"
                    v-tooltip.top="$t('hotels.editBtn')"
                  />
                  <Button
                    v-if="isOwner && isOwnerOfHotel(slotProps.data)"
                    icon="pi pi-trash"
                    class="p-button-rounded p-button-danger p-button-sm"
                    @click="confirmDeleteHotel(slotProps.data)"
                    v-tooltip.top="$t('hotels.delete')"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>

    <!-- Diálogo de confirmación de eliminación -->
    <Dialog
      v-model:visible="deleteDialog"
      :style="{ width: '450px' }"
      :header="$t('hotels.delete')"
      :modal="true"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span>{{ $t('hotels.deleteConfirm') }}</span>
        <div class="mt-3">
          <strong>{{ hotelToDelete?.name }}</strong>
        </div>
      </div>
      <template #footer>
        <Button
          :label="$t('common.no')"
          icon="pi pi-times"
          class="p-button-text"
          @click="deleteDialog = false"
        />
        <Button
          :label="$t('common.yes')"
          icon="pi pi-check"
          class="p-button-danger"
          @click="deleteHotel"
          :loading="deleting"
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
import { HotelRepository } from '../infrastructure/HotelRepository';
import { UserRepository } from '../../profile/infrastructure/UserRepository';

// Composables
const router = useRouter();
const { t } = useI18n();
const toast = useToast();

// Repositorios
const hotelRepository = new HotelRepository();
const userRepository = new UserRepository();

// Estado
const user = ref(userRepository.getCurrentUser());
const hotels = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const deleteDialog = ref(false);
const hotelToDelete = ref(null);
const deleting = ref(false);

// Propiedades computadas
const isOwner = computed(() => user.value?.user_type === 'Owner');
const hasSubscription = computed(() => user.value?.subscription_id !== null);

const filteredHotels = computed(() => {
  if (!searchQuery.value.trim()) {
    return hotels.value;
  }

  const query = searchQuery.value.toLowerCase();
  return hotels.value.filter(hotel =>
    hotel.name.toLowerCase().includes(query) ||
    hotel.address.toLowerCase().includes(query) ||
    (hotel.phone && hotel.phone.includes(query)) ||
    (hotel.email && hotel.email.toLowerCase().includes(query))
  );
});

// Métodos
const loadHotels = async () => {
  loading.value = true;

  try {
    if (isOwner.value) {
      // Los propietarios solo ven sus hoteles
      hotels.value = await hotelRepository.findByOwnerId(user.value.id);
    } else {
      // Los visitantes ven todos los hoteles
      hotels.value = await hotelRepository.findAll();
    }
  } catch (error) {
    console.error('Error loading hotels:', error);
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

const createHotel = () => {
  router.push('/hotels/create');
};

const viewHotel = (id) => {
  router.push(`/hotels/${id}`);
};

const viewRooms = (id) => {
  router.push(`/hotels/${id}/rooms`);
};

const editHotel = (id) => {
  router.push(`/hotels/${id}/edit`);
};

const goToSubscriptions = () => {
  router.push('/subscriptions');
};

const isOwnerOfHotel = (hotel) => {
  return hotel.owner_id === user.value.id;
};

const confirmDeleteHotel = (hotel) => {
  hotelToDelete.value = hotel;
  deleteDialog.value = true;
};

const deleteHotel = async () => {
  if (!hotelToDelete.value) return;

  deleting.value = true;

  try {
    const result = await hotelRepository.delete(hotelToDelete.value.id);

    if (result) {
      // Eliminar hotel del estado
      const index = hotels.value.findIndex(h => h.id === hotelToDelete.value.id);
      if (index !== -1) {
        hotels.value.splice(index, 1);
      }

      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('hotels.deleteSuccess'),
        life: 3000
      });

      deleteDialog.value = false;
      hotelToDelete.value = null;
    } else {
      throw new Error('No se pudo eliminar el hotel');
    }
  } catch (error) {
    console.error('Error deleting hotel:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message,
      life: 3000
    });
  } finally {
    deleting.value = false;
  }
};

// Ciclo de vida
onMounted(() => {
  loadHotels();
});
</script>

<style scoped>
.hotels-list {
  padding: 1rem;
}

.hotel-table-image {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  overflow: hidden;
}

.hotel-table-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 576px) {
  .hidden-xs {
    display: none;
  }
}
</style>

