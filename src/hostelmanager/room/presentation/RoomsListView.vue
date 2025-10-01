<template>
  <div class="rooms-list">
    <div class="p-card p-shadow-2 mb-4">
      <div class="p-card-body">
        <div class="flex justify-content-between align-items-center mb-4">
          <div>
            <div class="p-card-title mb-0">{{ hotel ? hotel.name : '' }}</div>
            <div class="p-card-subtitle">{{ $t('rooms.list') }}</div>
          </div>
          <div class="flex gap-2">
            <Button
              icon="pi pi-arrow-left"
              :label="$t('common.back')"
              class="p-button-secondary"
              @click="goBack"
            />
            <Button
              v-if="isOwner && isOwnerOfHotel && hasSubscription"
              icon="pi pi-plus"
              :label="$t('rooms.create')"
              class="p-button-success"
              @click="createRoom"
            />
          </div>
        </div>

        <!-- Buscador de habitaciones -->
        <div class="p-input-icon-left mb-4 w-full">
          <i class="pi pi-search"></i>
          <InputText
            v-model="searchQuery"
            :placeholder="$t('common.search')"
            class="w-full"
          />
        </div>

        <!-- Listado de habitaciones -->
        <div v-if="loading" class="flex justify-content-center my-5">
          <ProgressSpinner />
        </div>
        <div v-else-if="filteredRooms.length === 0" class="text-center my-5">
          <div class="mb-3">
            <i class="pi pi-info-circle" style="font-size: 2rem"></i>
          </div>
          <p>{{ $t('rooms.noRooms') }}</p>
          <Button
            v-if="isOwner && isOwnerOfHotel && hasSubscription"
            icon="pi pi-plus"
            :label="$t('rooms.create')"
            class="p-button-success mt-3"
            @click="createRoom"
          />
        </div>
        <div v-else>
          <DataView :value="filteredRooms" :layout="layout" :paginator="true" :rows="6">
            <template #header>
              <div class="flex justify-content-between">
                <div>
                  <Button @click="layout = 'grid'" icon="pi pi-th-large" :disabled="layout === 'grid'" class="p-button-text" />
                  <Button @click="layout = 'list'" icon="pi pi-bars" :disabled="layout === 'list'" class="p-button-text" />
                </div>
                <Dropdown
                  v-model="statusFilter"
                  :options="statusOptions"
                  optionLabel="name"
                  :placeholder="$t('rooms.status')"
                  class="p-inputtext-sm"
                />
              </div>
            </template>

            <template #grid="slotProps">
              <div class="col-12 sm:col-6 lg:col-4 xl:col-3 p-2">
                <div class="p-card p-shadow-2 room-card">
                  <div class="relative">
                    <img :src="slotProps.data.image" :alt="slotProps.data.room_number" class="room-image" />
                    <Tag
                      :value="$t(`rooms.${slotProps.data.status.toLowerCase()}`)"
                      :severity="getStatusSeverity(slotProps.data.status)"
                      class="absolute right-0 top-0 m-2"
                    />
                  </div>
                  <div class="p-card-body">
                    <div class="flex justify-content-between align-items-center mb-3">
                      <div class="room-number font-bold">{{ $t('rooms.roomNumber') }} {{ slotProps.data.room_number }}</div>
                      <div class="room-type">{{ $t(`rooms.types.${slotProps.data.typeroom.toLowerCase()}`) }}</div>
                    </div>
                    <div class="flex justify-content-between align-items-center mb-3">
                      <div class="room-capacity">
                        <i class="pi pi-users mr-2"></i>
                        {{ slotProps.data.capacity }}
                      </div>
                      <div class="room-price font-bold text-lg">{{ formatPrice(slotProps.data.price) }}</div>
                    </div>
                    <div class="room-actions flex gap-2 justify-content-between">
                      <Button
                        :label="$t('rooms.view')"
                        icon="pi pi-eye"
                        class="p-button-sm p-button-info"
                        @click="viewRoom(slotProps.data.id)"
                      />
                      <div class="flex gap-1">
                        <Button
                          v-if="isVisitor && slotProps.data.status === 'Available'"
                          icon="pi pi-calendar-plus"
                          class="p-button-sm p-button-success"
                          @click="reserveRoom(slotProps.data.id)"
                          v-tooltip.top="$t('rooms.reserve')"
                        />
                        <Button
                          v-if="isOwner && isOwnerOfHotel"
                          icon="pi pi-pencil"
                          class="p-button-sm p-button-warning"
                          @click="editRoom(slotProps.data.id)"
                          v-tooltip.top="$t('rooms.editBtn')"
                        />
                        <Button
                          v-if="isOwner && isOwnerOfHotel"
                          icon="pi pi-trash"
                          class="p-button-sm p-button-danger"
                          @click="confirmDeleteRoom(slotProps.data)"
                          v-tooltip.top="$t('rooms.delete')"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <template #list="slotProps">
              <div class="col-12 p-2">
                <div class="flex p-card p-shadow-2">
                  <div class="room-image-container">
                    <img :src="slotProps.data.image" :alt="slotProps.data.room_number" class="room-image-list" />
                    <Tag
                      :value="$t(`rooms.${slotProps.data.status.toLowerCase()}`)"
                      :severity="getStatusSeverity(slotProps.data.status)"
                      class="absolute right-0 top-0 m-2"
                    />
                  </div>
                  <div class="flex-1 flex flex-column p-4">
                    <div class="flex justify-content-between">
                      <div>
                        <div class="font-bold text-xl mb-1">{{ $t('rooms.roomNumber') }} {{ slotProps.data.room_number }}</div>
                        <div class="mb-2">{{ $t(`rooms.types.${slotProps.data.typeroom.toLowerCase()}`) }} -
                          <span>
                            <i class="pi pi-users"></i> {{ slotProps.data.capacity }}
                          </span>
                        </div>
                      </div>
                      <div class="text-2xl font-bold">{{ formatPrice(slotProps.data.price) }}</div>
                    </div>

                    <div v-if="slotProps.data.description" class="my-3">{{ slotProps.data.description }}</div>

                    <div v-if="slotProps.data.amenities && slotProps.data.amenities.length > 0" class="my-2">
                      <div class="text-sm font-bold mb-1">{{ $t('rooms.amenities') }}:</div>
                      <div class="flex flex-wrap gap-1">
                        <Chip v-for="(amenity, index) in slotProps.data.amenities" :key="index" :label="amenity" />
                      </div>
                    </div>

                    <div class="flex justify-content-end gap-2 mt-3">
                      <Button
                        :label="$t('rooms.view')"
                        icon="pi pi-eye"
                        class="p-button-info p-button-sm"
                        @click="viewRoom(slotProps.data.id)"
                      />
                      <Button
                        v-if="isVisitor && slotProps.data.status === 'Available'"
                        :label="$t('rooms.reserve')"
                        icon="pi pi-calendar-plus"
                        class="p-button-success p-button-sm"
                        @click="reserveRoom(slotProps.data.id)"
                      />
                      <Button
                        v-if="isOwner && isOwnerOfHotel"
                        :label="$t('rooms.editBtn')"
                        icon="pi pi-pencil"
                        class="p-button-warning p-button-sm"
                        @click="editRoom(slotProps.data.id)"
                      />
                      <Button
                        v-if="isOwner && isOwnerOfHotel"
                        :label="$t('rooms.delete')"
                        icon="pi pi-trash"
                        class="p-button-danger p-button-sm"
                        @click="confirmDeleteRoom(slotProps.data)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </DataView>
        </div>
      </div>
    </div>

    <!-- Diálogo de confirmación de eliminación -->
    <Dialog
      v-model:visible="deleteDialog"
      :style="{ width: '450px' }"
      :header="$t('rooms.delete')"
      :modal="true"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span>{{ $t('rooms.deleteConfirm') }}</span>
        <div class="mt-3">
          <strong>{{ $t('rooms.roomNumber') }} {{ roomToDelete?.room_number }}</strong>
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
          @click="deleteRoom"
          :loading="deleting"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { RoomRepository } from '../infrastructure/RoomRepository';
import { HotelRepository } from '../../hotels/infrastructure/HotelRepository';
import { UserRepository } from '../../profile/infrastructure/UserRepository';

// Composables
const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const toast = useToast();

// Repositorios
const roomRepository = new RoomRepository();
const hotelRepository = new HotelRepository();
const userRepository = new UserRepository();

// Estado
const user = ref(userRepository.getCurrentUser());
const hotel = ref(null);
const rooms = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const layout = ref('grid');
const statusFilter = ref(null);
const deleteDialog = ref(false);
const roomToDelete = ref(null);
const deleting = ref(false);
const hotelId = computed(() => Number(route.params.hotelId));

// Opciones para el filtro de estado
const statusOptions = [
  { name: t('common.all'), value: null },
  { name: t('rooms.available'), value: 'Available' },
  { name: t('rooms.occupied'), value: 'Occupied' },
  { name: t('rooms.maintenance'), value: 'Maintenance' }
];

// Propiedades computadas
const isOwner = computed(() => user.value?.user_type === 'Owner');
const isVisitor = computed(() => user.value?.user_type === 'Visitor');
const hasSubscription = computed(() => user.value?.subscription_id !== null);
const isOwnerOfHotel = computed(() => {
  return hotel.value && user.value && hotel.value.owner_id === user.value.id;
});

const filteredRooms = computed(() => {
  let result = rooms.value;

  // Filtrar por estado si hay un filtro seleccionado
  if (statusFilter.value) {
    result = result.filter(room => room.status === statusFilter.value);
  }

  // Filtrar por búsqueda
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(room =>
      room.room_number.toLowerCase().includes(query) ||
      room.typeroom.toLowerCase().includes(query) ||
      (room.description && room.description.toLowerCase().includes(query))
    );
  }

  return result;
});

// Métodos
const loadData = async () => {
  loading.value = true;

  try {
    // Cargar hotel
    const hotelData = await hotelRepository.findById(hotelId.value);
    if (!hotelData) {
      throw new Error('Hotel no encontrado');
    }
    hotel.value = hotelData;

    // Cargar habitaciones
    rooms.value = await roomRepository.findByHotelId(hotelId.value);
  } catch (error) {
    console.error('Error loading rooms data:', error);
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

const getStatusSeverity = (status) => {
  switch (status) {
    case 'Available':
      return 'success';
    case 'Occupied':
      return 'warning';
    case 'Maintenance':
      return 'danger';
    default:
      return 'info';
  }
};

const goBack = () => {
  router.push('/hotels');
};

const createRoom = () => {
  router.push(`/hotels/${hotelId.value}/rooms/create`);
};

const viewRoom = (id) => {
  router.push(`/rooms/${id}`);
};

const editRoom = (id) => {
  router.push(`/rooms/${id}/edit`);
};

const reserveRoom = (id) => {
  router.push(`/rooms/${id}/reserve`);
};

const confirmDeleteRoom = (room) => {
  roomToDelete.value = room;
  deleteDialog.value = true;
};

const deleteRoom = async () => {
  if (!roomToDelete.value) return;

  deleting.value = true;

  try {
    const result = await roomRepository.delete(roomToDelete.value.id);

    if (result) {
      // Eliminar habitación del estado
      const index = rooms.value.findIndex(r => r.id === roomToDelete.value.id);
      if (index !== -1) {
        rooms.value.splice(index, 1);
      }

      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('rooms.deleteSuccess'),
        life: 3000
      });

      deleteDialog.value = false;
      roomToDelete.value = null;
    } else {
      throw new Error('No se pudo eliminar la habitación');
    }
  } catch (error) {
    console.error('Error deleting room:', error);
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
  loadData();
});
</script>

<style scoped>
.rooms-list {
  padding: 1rem;
}

.room-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.room-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.room-image-container {
  position: relative;
  width: 200px;
}

.room-image-list {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 576px) {
  .room-image-container {
    width: 100%;
    height: 180px;
  }
}
</style>

