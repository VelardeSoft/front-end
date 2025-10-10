<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import useRoomStore from '../../application/room.store.js';
import useHotelStore from '../../../hotels/application/hotel.store.js';
import useUserStore from '../../../users/application/user.store.js';
import { Room } from '../../domain/model/room.entity.js';

const { t } = useI18n();
const roomStore = useRoomStore();
const hotelStore = useHotelStore();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const isEdit = ref(false);
const loading = ref(false);
const selectedHotel = ref(null);

// Lista de hoteles filtrada por los que son propiedad del usuario actual
const userHotels = computed(() => {
  if (!userStore.currentUser || userStore.currentUser.type_user !== 'owner') {
    return [];
  }
  return hotelStore.hotels.filter(hotel => hotel.users_id === userStore.currentUser.id);
});

const room = reactive(new Room({
  price: 0,
  type_room: '',
  hotels_id: null
}));

const errors = ref({
  price: '',
  type_room: '',
  hotels_id: ''
});

onMounted(async () => {
  loading.value = true;

  // Verificar si el usuario es propietario
  if (!userStore.currentUser || userStore.currentUser.type_user !== 'owner') {
    router.push({ name: 'room-list' });
    return;
  }

  // Cargar hoteles si no están cargados
  if (hotelStore.hotels.length === 0) {
    await hotelStore.fetchHotels();
  }

  // Si estamos en modo edición
  if (route.params.id) {
    isEdit.value = true;
    const id = parseInt(route.params.id);
    const loadedRoom = await roomStore.getRoomById(id);

    if (loadedRoom) {
      // Verificar que esta habitación pertenezca a un hotel del usuario
      const hotel = hotelStore.hotels.find(h => h.id === loadedRoom.hotels_id);
      if (!hotel || hotel.users_id !== userStore.currentUser.id) {
        router.push({ name: 'room-list' });
        return;
      }

      Object.assign(room, loadedRoom);
      selectedHotel.value = hotel;
    } else {
      router.push({ name: 'room-list' });
      return;
    }
  }
  // Si estamos creando y hay un hotel preseleccionado en la query
  else if (route.query.hotelId) {
    const hotelId = parseInt(route.query.hotelId);
    const hotel = hotelStore.hotels.find(h => h.id === hotelId);

    // Verificar que este hotel pertenezca al usuario
    if (hotel && hotel.users_id === userStore.currentUser.id) {
      room.hotels_id = hotelId;
      selectedHotel.value = hotel;
    }
  }

  loading.value = false;
});

const validate = () => {
  let isValid = true;
  errors.value = {
    price: '',
    type_room: '',
    hotels_id: ''
  };

  if (!room.price || room.price <= 0) {
    errors.value.price = 'El precio debe ser mayor que 0';
    isValid = false;
  }

  if (!room.type_room) {
    errors.value.type_room = 'El tipo de habitación es requerido';
    isValid = false;
  }

  if (!room.hotels_id) {
    errors.value.hotels_id = 'Debe seleccionar un hotel';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validate()) {
    return;
  }

  loading.value = true;
  let result;

  try {
    if (isEdit.value) {
      result = await roomStore.updateRoom(room);
    } else {
      result = await roomStore.createRoom(room);
    }

    if (result) {
      // Si venimos de los detalles de un hotel, regresar allí
      if (route.query.hotelId) {
        router.push({
          name: 'hotel-details',
          params: { id: room.hotels_id }
        });
      } else {
        // Sino, ir a la lista de habitaciones del hotel
        router.push({
          name: 'room-list',
          query: { hotelId: room.hotels_id }
        });
      }
    } else {
      alert('Ha ocurrido un error al guardar la habitación');
    }
  } catch (error) {
    console.error('Error al guardar la habitación:', error);
    alert('Ha ocurrido un error al guardar la habitación');
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  if (route.query.hotelId) {
    router.push({
      name: 'hotel-details',
      params: { id: route.query.hotelId }
    });
  } else {
    router.push({
      name: 'room-list',
      query: room.hotels_id ? { hotelId: room.hotels_id } : {}
    });
  }
};

const onHotelChange = () => {
  if (room.hotels_id) {
    selectedHotel.value = hotelStore.hotels.find(h => h.id === room.hotels_id);
  }
};
</script>

<template>
  <div class="room-form p-4" v-if="!loading">
    <div class="flex justify-between mb-4">
      <div>
        <pv-button
          icon="pi pi-arrow-left"
          label="Volver"
          class="p-button-text mb-2"
          @click="goBack"
        />
        <h1 class="text-2xl font-bold m-0">
          {{ isEdit ? 'Editar Habitación' : 'Nueva Habitación' }}
        </h1>
        <p v-if="selectedHotel" class="text-gray-600 mt-1">
          Para el hotel: <strong>{{ selectedHotel.name }}</strong>
        </p>
      </div>
    </div>

    <div class="grid">
      <div class="col-12 lg:col-8">
        <pv-panel header="Información de la Habitación">
          <form @submit.prevent="handleSubmit" class="p-fluid">
            <div class="field mb-4">
              <label for="hotels_id">Hotel *</label>
              <pv-dropdown
                id="hotels_id"
                v-model="room.hotels_id"
                :options="userHotels"
                optionLabel="name"
                optionValue="id"
                placeholder="Selecciona un hotel"
                :class="{ 'p-invalid': errors.hotels_id }"
                :disabled="isEdit || !!route.query.hotelId"
                @change="onHotelChange"
              />
              <small class="p-error" v-if="errors.hotels_id">{{ errors.hotels_id }}</small>
              <small v-if="isEdit || route.query.hotelId" class="p-text-secondary">
                El hotel no se puede cambiar después de crear la habitación
              </small>
            </div>

            <div class="field mb-4">
              <label for="type_room">Tipo de Habitación *</label>
              <pv-dropdown
                id="type_room"
                v-model="room.type_room"
                :options="roomStore.roomTypes"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecciona un tipo"
                :class="{ 'p-invalid': errors.type_room }"
              />
              <small class="p-error" v-if="errors.type_room">{{ errors.type_room }}</small>
            </div>

            <div class="field mb-4">
              <label for="price">Precio por noche (€) *</label>
              <pv-input-number
                id="price"
                v-model="room.price"
                :min="0"
                :minFractionDigits="0"
                :maxFractionDigits="2"
                mode="currency"
                currency="EUR"
                locale="es-ES"
                :class="{ 'p-invalid': errors.price }"
              />
              <small class="p-error" v-if="errors.price">{{ errors.price }}</small>
            </div>

            <div class="flex gap-2 justify-content-end mt-4">
              <pv-button type="button" label="Cancelar" class="p-button-secondary" @click="goBack" />
              <pv-button type="submit" :label="isEdit ? 'Actualizar' : 'Crear Habitación'" :loading="loading" />
            </div>
          </form>
        </pv-panel>
      </div>

      <!-- Panel de información del hotel seleccionado -->
      <div class="col-12 lg:col-4" v-if="selectedHotel">
        <pv-panel header="Hotel Seleccionado">
          <div class="hotel-info">
            <div class="mb-3">
              <img
                :src="selectedHotel.imagen || 'https://via.placeholder.com/200x100?text=Hotel'"
                class="w-full border-round"
                alt="Hotel image"
                style="height: 120px; object-fit: cover;"
              />
            </div>
            <h4 class="mt-0 mb-2">{{ selectedHotel.name }}</h4>
            <div class="flex align-items-center gap-2 mb-2 text-sm">
              <i class="pi pi-map-marker text-gray-600"></i>
              <span class="text-gray-600">{{ selectedHotel.address }}</span>
            </div>
            <div class="flex align-items-center gap-2 text-sm">
              <i class="pi pi-phone text-gray-600"></i>
              <span class="text-gray-600">{{ selectedHotel.phone }}</span>
            </div>
          </div>
        </pv-panel>
      </div>
    </div>
  </div>
  <div v-else class="flex justify-content-center">
    <pv-progress-spinner />
  </div>
</template>
