<template>
  <div class="room-detail">
    <div class="p-card p-shadow-2 mb-4">
      <div class="p-card-body">
        <div class="flex justify-content-between align-items-center mb-4">
          <div class="p-card-title mb-0">{{ $t('rooms.details') }}</div>
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
              :label="$t('rooms.editBtn')"
              class="p-button-warning"
              @click="editRoom"
            />
            <Button
              v-if="isVisitor && room && room.status === 'Available'"
              icon="pi pi-calendar-plus"
              :label="$t('rooms.reserve')"
              class="p-button-success"
              @click="reserveRoom"
            />
          </div>
        </div>

        <div v-if="loading" class="flex justify-content-center my-5">
          <ProgressSpinner />
        </div>
        <div v-else-if="!room" class="text-center my-5">
          <div class="mb-3">
            <i class="pi pi-exclamation-circle" style="font-size: 2rem"></i>
          </div>
          <p>{{ $t('rooms.noRooms') }}</p>
          <Button
            :label="$t('common.back')"
            icon="pi pi-arrow-left"
            class="p-button-secondary mt-3"
            @click="goBack"
          />
        </div>
        <div v-else class="grid">
          <!-- Información de la habitación -->
          <div class="col-12 lg:col-6">
            <div class="mb-4">
              <img :src="room.image" :alt="room.room_number" class="w-full room-image"/>
            </div>
            <div class="mt-4 flex justify-content-between align-items-center">
              <div>
                <Tag
                  :value="$t(`rooms.${room.status.toLowerCase()}`)"
                  :severity="getStatusSeverity(room.status)"
                />
              </div>
              <div class="text-2xl font-bold">{{ formatPrice(room.price) }}</div>
            </div>
          </div>

          <div class="col-12 lg:col-6">
            <div class="room-info p-4 bg-gray-50 border-round">
              <h2 class="mt-0 mb-3">{{ $t('rooms.roomNumber') }} {{ room.room_number }}</h2>
              <div class="grid">
                <div class="col-6">
                  <div class="font-bold mb-2">{{ $t('rooms.type') }}</div>
                  <div>{{ $t(`rooms.types.${room.typeroom.toLowerCase()}`) }}</div>
                </div>
                <div class="col-6">
                  <div class="font-bold mb-2">{{ $t('rooms.capacity') }}</div>
                  <div>
                    <i class="pi pi-users mr-2"></i>
                    <span>{{ room.capacity }}</span>
                  </div>
                </div>
              </div>

              <div v-if="hotel" class="mt-4">
                <div class="font-bold mb-2">{{ $t('reservations.hotel') }}</div>
                <div>{{ hotel.name }}</div>
              </div>

              <div v-if="room.description" class="mt-4">
                <div class="font-bold mb-2">{{ $t('rooms.description') }}</div>
                <div>{{ room.description }}</div>
              </div>

              <div v-if="room.amenities && room.amenities.length > 0" class="mt-4">
                <div class="font-bold mb-2">{{ $t('rooms.amenities') }}</div>
                <div class="flex flex-wrap gap-2">
                  <Chip v-for="(amenity, index) in room.amenities" :key="index" :label="amenity" />
                </div>
              </div>

              <div v-if="isVisitor && room.status === 'Available'" class="mt-4">
                <Button
                  :label="$t('rooms.reserve')"
                  icon="pi pi-calendar-plus"
                  class="p-button-success w-full"
                  @click="reserveRoom"
                />
              </div>
            </div>
          </div>
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
const room = ref(null);
const hotel = ref(null);
const loading = ref(true);
const roomId = computed(() => route.params.id);

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

  try {
    // Cargar habitación
    const roomData = await roomRepository.findById(roomId.value);
    if (!roomData) {
      throw new Error('Habitación no encontrada');
    }
    room.value = roomData;

    // Cargar hotel
    const hotelData = await hotelRepository.findById(roomData.hotel_id);
    if (!hotelData) {
      throw new Error('Hotel no encontrado');
    }
    hotel.value = hotelData;
  } catch (error) {
    console.error('Error loading room data:', error);
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
  router.go(-1);
};

const editRoom = () => {
  router.push(`/rooms/${roomId.value}/edit`);
};

const reserveRoom = () => {
  router.push(`/rooms/${roomId.value}/reserve`);
};

// Ciclo de vida
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.room-detail {
  padding: 1rem;
}

.room-image {
  border-radius: 8px;
  object-fit: cover;
  max-height: 400px;
}
</style>

