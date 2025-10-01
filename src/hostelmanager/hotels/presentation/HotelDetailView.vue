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
          <!-- Información del Hotel -->
          <div class="col-12 lg:col-5">
            <div class="mb-4">
              <img :src="hotel.image" :alt="hotel.name" class="w-full hotel-image"/>
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

            <!-- Habitaciones disponibles -->
            <div class="mt-4">
              <h3>{{ $t('rooms.list') }}</h3>
              <DataTable :value="availableRooms" stripedRows :rows="5" :paginator="true" class="mt-2">
                <Column field="room_number" :header="$t('rooms.roomNumber')" sortable></Column>
                <Column field="typeroom" :header="$t('rooms.type')" sortable>
                  <template #body="slotProps">
                    {{ $t(`rooms.types.${slotProps.data.typeroom.toLowerCase()}`) }}
                  </template>
                </Column>
                <Column field="capacity" :header="$t('rooms.capacity')" sortable></Column>
                <Column field="price" :header="$t('rooms.price')" sortable>
                  <template #body="slotProps">
                    {{ formatPrice(slotProps.data.price) }}
                  </template>
                </Column>
                <Column :header="$t('rooms.actions')" style="width: 120px">
                  <template #body="slotProps">
                    <div class="flex gap-1">
                      <Button
                        icon="pi pi-eye"
                        class="p-button-rounded p-button-info p-button-sm"
                        @click="viewRoom(slotProps.data.id)"
                        v-tooltip.top="$t('rooms.view')"
                      />
                      <Button
                        v-if="isVisitor && slotProps.data.status === 'Available'"
                        icon="pi pi-calendar-plus"
                        class="p-button-rounded p-button-success p-button-sm"
                        @click="reserveRoom(slotProps.data.id)"
                        v-tooltip.top="$t('rooms.reserve')"
                      />
                    </div>
                  </template>
                </Column>
              </DataTable>
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
const hotelId = computed(() => Number(route.params.id));

// Propiedades computadas
const isOwner = computed(() => user.value?.user_type === 'Owner');
const isVisitor = computed(() => user.value?.user_type === 'Visitor');
const hasSubscription = computed(() => user.value?.subscription_id !== null);
const isOwnerOfHotel = computed(() => {
  return hotel.value && user.value && hotel.value.owner_id === user.value.id;
});

const availableRooms = computed(() => {
  return rooms.value.filter(room => room.status === 'Available');
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
    console.error('Error loading hotel data:', error);
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

const reserveRoom = (id) => {
  router.push(`/rooms/${id}/reserve`);
};

// Ciclo de vida
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.hotel-detail {
  padding: 1rem;
}

.hotel-image {
  border-radius: 8px;
  object-fit: cover;
  max-height: 300px;
}
</style>
