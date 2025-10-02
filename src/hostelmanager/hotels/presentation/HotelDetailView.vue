<template>
  <div class="hotel-detail">
    <div class="p-card p-shadow-2 mb-4">
      <div class="p-card-body">
        <div class="flex justify-content-between align-items-center mb-4">
          <div class="p-card-title mb-0">{{ $t('hotels.details') }}</div>
          <div class="flex gap-2">
            <Button
                icon="pi pi-arrow-left"
                :label="$t('common.back')"
                class="p-button-secondary"
                @click="goBack"
            />
            <Button
                v-if="isOwner && isOwnerOfHotel && hasSubscription"
                icon="pi pi-pencil"
                :label="$t('hotels.editBtn')"
                class="p-button-warning"
                @click="editHotel"
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

        <div v-if="loading" class="flex justify-content-center my-5">
          <ProgressSpinner />
        </div>
        <div v-else-if="!hotel" class="text-center my-5">
          <div class="mb-3">
            <i class="pi pi-exclamation-circle" style="font-size: 2rem"></i>
          </div>
          <p>{{ $t('hotels.noHotels') }}</p>
          <Button
              :label="$t('common.back')"
              icon="pi pi-arrow-left"
              class="p-button-secondary mt-3"
              @click="goBack"
          />
        </div>
        <div v-else class="grid">

          <template v-if="hotel">

            <div class="col-12 lg:col-5">
              <div class="mb-4">
                <img
                    :src="hotel.image"
                    :alt="hotel.name"
                    class="w-full hotel-image"
                />
              </div>
              <div class="flex flex-column gap-3">
                <div class="flex justify-content-between align-items-center">
                  <div class="text-xl font-bold">{{ hotel.name }}</div>
                  <Button
                      v-if="isOwner && isOwnerOfHotel"
                      icon="pi pi-key"
                      :label="$t('hotels.rooms')"
                      class="p-button-info p-button-sm"
                      @click="viewRooms"
                  />
                </div>
                <div>
                  <i class="pi pi-map-marker mr-2"></i>
                  <span>{{ hotel.address }}</span>
                </div>
                <div v-if="hotel.phone">
                  <i class="pi pi-phone mr-2"></i>
                  <span>{{ hotel.phone }}</span>
                </div>
                <div v-if="hotel.email">
                  <i class="pi pi-envelope mr-2"></i>
                  <span>{{ hotel.email }}</span>
                </div>
              </div>

              <div v-if="isOwner && isOwnerOfHotel && !hasSubscription" class="mt-4">
                <Message severity="warn" :closable="false">
                  <div>
                    <i class="pi pi-exclamation-triangle mr-2"></i>
                    <span>{{ $t('subscriptions.required') }}</span>
                    <Button
                        :label="$t('subscriptions.subscribe')"
                        class="p-button-sm p-button-text ml-3"
                        @click="goToSubscriptions"
                    />
                  </div>
                </Message>
              </div>
            </div>

            <div class="col-12 lg:col-7">
              <div v-if="hotel.description" class="mb-4">
                <h3>{{ $t('hotels.description') }}</h3>
                <p>{{ hotel.description }}</p>
              </div>

              <div v-if="hotel.amenities && hotel.amenities.length > 0" class="mb-4">
                <h3>{{ $t('hotels.amenities') }}</h3>
                <div class="flex flex-wrap gap-2">
                  <Chip v-for="(amenity, index) in hotel.amenities" :key="index" :label="amenity" />
                </div>
              </div>

              <div class="mt-4">
                <div class="flex justify-content-between align-items-center mb-3">
                  <h3 class="m-0">{{ $t('rooms.list') }}</h3>
                  <div class="flex gap-2">
                    <Button
                        @click="layout = 'grid'"
                        icon="pi pi-th-large"
                        :disabled="layout === 'grid'"
                        class="p-button-text p-button-sm"
                    />
                    <Button
                        @click="layout = 'list'"
                        icon="pi pi-bars"
                        :disabled="layout === 'list'"
                        class="p-button-text p-button-sm"
                    />
                    <Button
                        v-if="isOwner && isOwnerOfHotel && hasSubscription"
                        icon="pi pi-plus"
                        :label="$t('rooms.create')"
                        class="p-button-success p-button-sm"
                        @click="createRoom"
                    />
                  </div>
                </div>

                <div v-if="loadingRooms" class="flex justify-content-center my-5">
                  <ProgressSpinner />
                </div>
                <div v-else-if="rooms.length === 0" class="text-center my-3 p-3 bg-gray-100 border-round">
                  <div class="mb-2">
                    <i class="pi pi-info-circle" style="font-size: 1.5rem"></i>
                  </div>
                  <p>{{ $t('rooms.noRooms') }}</p>
                  <Button
                      v-if="isOwner && isOwnerOfHotel && hasSubscription"
                      :label="$t('rooms.create')"
                      icon="pi pi-plus"
                      class="p-button-success p-button-sm mt-2"
                      @click="createRoom"
                  />
                </div>

                <div v-else class="grid">
                  <template v-for="room in rooms" :key="room.id">

                    <div v-if="layout === 'grid'" class="col-12 sm:col-6 xl:col-4 p-2">
                      <div class="p-card room-card">
                        <div class="relative">
                          <img :src="room.image" :alt="room.room_number" class="room-grid-image" />
                          <Tag
                              :value="$t(`rooms.${room.status.toLowerCase()}`)"
                              :severity="getStatusSeverity(room.status)"
                              class="absolute right-0 top-0 m-2"
                          />
                        </div>
                        <div class="p-card-body">
                          <div class="flex justify-content-between align-items-center mb-2">
                            <div class="font-bold">{{ $t('rooms.roomNumber') }} {{ room.room_number }}</div>
                            <div>{{ $t(`rooms.types.${room.typeroom.toLowerCase()}`) }}</div>
                          </div>

                          <div class="flex justify-content-between align-items-center mb-3">
                            <div>
                              <i class="pi pi-users mr-1"></i>
                              <span>{{ room.capacity }}</span>
                            </div>
                            <div class="text-lg font-bold">{{ formatPrice(room.price) }}</div>
                          </div>

                          <div class="flex justify-content-between">
                            <Button
                                :label="$t('rooms.view')"
                                icon="pi pi-eye"
                                class="p-button-info p-button-sm"
                                @click="viewRoom(room.id)"
                            />
                            <div class="flex gap-1">
                              <Button
                                  v-if="isVisitor && room.status === 'Available'"
                                  icon="pi pi-calendar-plus"
                                  class="p-button-success p-button-sm"
                                  @click="reserveRoom(room.id)"
                                  v-tooltip.top="$t('rooms.reserve')"
                              />
                              <Button
                                  v-if="isOwner && isOwnerOfHotel && hasSubscription"
                                  icon="pi pi-pencil"
                                  class="p-button-warning p-button-sm"
                                  @click="editRoom(room.id)"
                                  v-tooltip.top="$t('rooms.editBtn')"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-else-if="layout === 'list'" class="col-12 p-2">
                      <div class="flex p-card">
                        <div class="relative">
                          <img :src="room.image" :alt="room.room_number" class="room-list-image" />
                          <Tag
                              :value="$t(`rooms.${room.status.toLowerCase()}`)"
                              :severity="getStatusSeverity(room.status)"
                              class="absolute right-0 top-0 m-2"
                          />
                        </div>
                        <div class="flex-1 flex flex-column p-4">
                          <div class="flex justify-content-between">
                            <div>
                              <div class="font-bold text-xl mb-1">{{ $t('rooms.roomNumber') }} {{ room.room_number }}</div>
                              <div class="mb-2">
                                {{ $t(`rooms.types.${room.typeroom.toLowerCase()}`) }} -
                                <span><i class="pi pi-users"></i> {{ room.capacity }}</span>
                              </div>
                            </div>
                            <div class="text-2xl font-bold">{{ formatPrice(room.price) }}</div>
                          </div>

                          <div v-if="room.description" class="my-2">{{ room.description }}</div>

                          <div v-if="room.amenities && room.amenities.length > 0" class="mb-3">
                            <div class="text-sm font-bold mb-1">{{ $t('rooms.amenities') }}:</div>
                            <div class="flex flex-wrap gap-1">
                              <Chip v-for="(amenity, index) in room.amenities" :key="index" :label="amenity" />
                            </div>
                          </div>

                          <div class="flex justify-content-end gap-2 mt-auto">
                            <Button
                                :label="$t('rooms.view')"
                                icon="pi pi-eye"
                                class="p-button-info p-button-sm"
                                @click="viewRoom(room.id)"
                            />
                            <Button
                                v-if="isVisitor && room.status === 'Available'"
                                :label="$t('rooms.reserve')"
                                icon="pi pi-calendar-plus"
                                class="p-button-success p-button-sm"
                                @click="reserveRoom(room.id)"
                            />
                            <Button
                                v-if="isOwner && isOwnerOfHotel && hasSubscription"
                                :label="$t('rooms.editBtn')"
                                icon="pi pi-pencil"
                                class="p-button-warning p-button-sm"
                                @click="editRoom(room.id)"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>

          </template>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { HotelRepository } from '../infrastructure/HotelRepository';
import { RoomRepository } from '../../room/infrastructure/RoomRepository';
import { UserRepository } from '../../profile/infrastructure/UserRepository';

// Composables
const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const toast = useToast();

// Repositorios
const hotelRepository = new HotelRepository();
const roomRepository = new RoomRepository();
const userRepository = new UserRepository();

// Estado
const user = ref(userRepository.getCurrentUser());
const hotel = ref(null);
const rooms = ref([]);
const loading = ref(true);
const loadingRooms = ref(true);
// Obtener el ID de la ruta
const hotelId = computed(() => route.params.id);
const layout = ref('grid'); // Valor inicial para el layout

// Propiedades computadas
const isOwner = computed(() => user.value?.user_type === 'Owner');
const isVisitor = computed(() => user.value?.user_type === 'Visitor');
const hasSubscription = computed(() => user.value?.subscription_id !== null);
const isOwnerOfHotel = computed(() => {
  return hotel.value && user.value && hotel.value.owner_id === user.value.id;
});

// Métodos
const loadData = async () => {
  loading.value = true;
  const id = hotelId.value;

  if (!id) {
    console.error('ID de hotel ausente en la ruta.');
    router.push('/hotels');
    loading.value = false;
    return;
  }

  try {
    const hotelData = await hotelRepository.findById(id);
    if (!hotelData) {
      throw new Error(t('hotels.notFound'));
    }
    hotel.value = hotelData;

    // Cargar habitaciones
    await loadRooms(id); // Esperar la carga de habitaciones
  } catch (error) {
    console.error('Error loading hotel data:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('common.unknownError'),
      life: 3000
    });
    hotel.value = null;
  } finally {
    loading.value = false;
  }
};

const loadRooms = async (hotelIdString) => {
  loadingRooms.value = true;
  rooms.value = [];
  try {
    let loadedRooms = await roomRepository.findByHotelId(hotelIdString);

    if (Array.isArray(loadedRooms)) {
      rooms.value = loadedRooms;
    } else {
      console.error('El repositorio de habitaciones no devolvió un array.');
      rooms.value = [];
    }
  } catch (error) {
    console.error('Error loading rooms:', error);
    rooms.value = [];
  } finally {
    loadingRooms.value = false;
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
    case 'Reserved': // Agregando Reserved si es un estado de la habitación
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

const editHotel = () => {
  router.push(`/hotels/${hotelId.value}/edit`);
};

const viewRooms = () => {
  router.push(`/hotels/${hotelId.value}/rooms`);
};

const viewRoom = (id) => {
  router.push(`/rooms/${id}`);
};

const editRoom = (id) => {
  router.push(`/rooms/${id}/edit`);
};

const createRoom = () => {
  router.push(`/hotels/${hotelId.value}/rooms/create`);
};

const reserveRoom = (id) => {
  router.push(`/rooms/${id}/reserve`);
};

const goToSubscriptions = () => {
  router.push('/subscriptions');
};

// Ciclo de vida
onMounted(() => {
  loadData();
});
</script>

<style scoped>
/* ... tus estilos CSS ... */
.hotel-detail {
  padding: 1rem;
}

.hotel-image {
  border-radius: 8px;
  object-fit: cover;
  max-height: 300px;
}

.room-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.room-grid-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.room-list-image {
  width: 200px;
  height: 140px;
  object-fit: cover;
}

.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

@media (max-width: 768px) {
  .room-list-image {
    width: 100%;
    height: 160px;
  }
}
</style>