<template>
  <div class="room-edit">
    <div class="p-card p-shadow-2 mb-4">
      <div class="p-card-body">
        <div class="flex justify-content-between align-items-center mb-4">
          <div class="p-card-title mb-0">{{ $t('rooms.edit') }}</div>
          <Button
            icon="pi pi-arrow-left"
            :label="$t('common.back')"
            class="p-button-secondary"
            @click="goBack"
          />
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
        <div v-else>
          <form @submit.prevent="saveRoom">
            <div class="p-fluid formgrid grid">
              <div class="field col-12 md:col-6">
                <label for="room_number">{{ $t('rooms.roomNumber') }} *</label>
                <InputText
                  id="room_number"
                  v-model="room.room_number"
                  :class="{'p-invalid': v$.room_number.$invalid && submitted}"
                  :placeholder="$t('rooms.roomNumber')"
                  autofocus
                />
                <small v-if="v$.room_number.$invalid && submitted" class="p-error">
                  {{ $t('rooms.requiredField') }}
                </small>
              </div>

              <div class="field col-12 md:col-6">
                <label for="typeroom">{{ $t('rooms.type') }} *</label>
                <Dropdown
                  id="typeroom"
                  v-model="room.typeroom"
                  :options="roomTypes"
                  optionLabel="name"
                  optionValue="value"
                  :class="{'p-invalid': v$.typeroom.$invalid && submitted}"
                  :placeholder="$t('rooms.type')"
                />
                <small v-if="v$.typeroom.$invalid && submitted" class="p-error">
                  {{ $t('rooms.requiredField') }}
                </small>
              </div>

              <div class="field col-12 md:col-6">
                <label for="capacity">{{ $t('rooms.capacity') }} *</label>
                <InputNumber
                  id="capacity"
                  v-model="room.capacity"
                  :min="1"
                  :max="10"
                  :class="{'p-invalid': v$.capacity.$invalid && submitted}"
                  :placeholder="$t('rooms.capacity')"
                />
                <small v-if="v$.capacity.$invalid && submitted" class="p-error">
                  {{ $t('rooms.requiredField') }}
                </small>
              </div>

              <div class="field col-12 md:col-6">
                <label for="price">{{ $t('rooms.price') }} *</label>
                <InputNumber
                  id="price"
                  v-model="room.price"
                  mode="currency"
                  currency="PEN"
                  :min="0"
                  :class="{'p-invalid': v$.price.$invalid && submitted}"
                  :placeholder="$t('rooms.price')"
                />
                <small v-if="v$.price.$invalid && submitted" class="p-error">
                  {{ $t('rooms.requiredField') }}
                </small>
              </div>

              <div class="field col-12 md:col-6">
                <label for="status">{{ $t('rooms.status') }}</label>
                <Dropdown
                  id="status"
                  v-model="room.status"
                  :options="statusOptions"
                  optionLabel="name"
                  optionValue="value"
                  :placeholder="$t('rooms.status')"
                />
              </div>

              <div class="field col-12 md:col-6">
                <label for="image">URL {{ $t('rooms.image') }}</label>
                <InputText
                  id="image"
                  v-model="room.image"
                  :placeholder="$t('rooms.image') + ' URL'"
                />
              </div>

              <div class="field col-12">
                <label for="description">{{ $t('rooms.description') }}</label>
                <Textarea
                  id="description"
                  v-model="room.description"
                  rows="3"
                  :placeholder="$t('rooms.description')"
                />
              </div>

              <div class="field col-12">
                <label for="amenities">{{ $t('rooms.amenities') }}</label>
                <div class="p-inputgroup">
                  <InputText
                    v-model="newAmenity"
                    :placeholder="$t('rooms.amenities')"
                    @keydown.enter.prevent="addAmenity"
                  />
                  <Button
                    icon="pi pi-plus"
                    type="button"
                    @click="addAmenity"
                  />
                </div>
                <div class="mt-2 flex flex-wrap gap-2">
                  <Chip
                    v-for="(amenity, index) in room.amenities"
                    :key="index"
                    :label="amenity"
                    removable
                    @remove="removeAmenity(index)"
                  />
                </div>
              </div>

              <div class="flex justify-content-end col-12 mt-4">
                <Button
                  type="button"
                  :label="$t('common.cancel')"
                  icon="pi pi-times"
                  class="p-button-text mr-2"
                  @click="goBack"
                />
                <Button
                  type="submit"
                  :label="$t('common.save')"
                  icon="pi pi-save"
                  class="p-button-primary"
                  :loading="saving"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useVuelidate } from '@vuelidate/core';
import { required, minValue } from '@vuelidate/validators';
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
const saving = ref(false);
const submitted = ref(false);
const newAmenity = ref('');
const roomId = computed(() => Number(route.params.id));

// Opciones para los selectores
const roomTypes = [
  { name: t('rooms.types.single'), value: 'Single' },
  { name: t('rooms.types.double'), value: 'Double' },
  { name: t('rooms.types.twin'), value: 'Twin' },
  { name: t('rooms.types.suite'), value: 'Suite' },
  { name: t('rooms.types.family'), value: 'Family' },
];

const statusOptions = [
  { name: t('rooms.available'), value: 'Available' },
  { name: t('rooms.occupied'), value: 'Occupied' },
  { name: t('rooms.maintenance'), value: 'Maintenance' },
];

// Validaciones
const rules = {
  room_number: { required },
  typeroom: { required },
  capacity: { required, minValue: minValue(1) },
  price: { required, minValue: minValue(0) }
};

const v$ = useVuelidate(rules, room);

// Métodos
const loadData = async () => {
  loading.value = true;

  try {
    // Verificar si el usuario es propietario y tiene suscripción
    if (!user.value || user.value.user_type !== 'Owner' || !user.value.subscription_id) {
      router.push('/dashboard');
      return;
    }

    // Cargar habitación
    const roomData = await roomRepository.findById(roomId.value);
    if (!roomData) {
      throw new Error('Habitación no encontrada');
    }
    room.value = roomData;

    // Asegurarse de que amenities sea un array
    if (!room.value.amenities) {
      room.value.amenities = [];
    }

    // Cargar hotel
    const hotelData = await hotelRepository.findById(roomData.hotel_id);
    if (!hotelData) {
      throw new Error('Hotel no encontrado');
    }
    hotel.value = hotelData;

    // Verificar si el usuario es el propietario del hotel
    if (hotelData.owner_id !== user.value.id) {
      router.push('/dashboard');
      return;
    }
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

const goBack = () => {
  router.push(`/hotels/${room.value?.hotel_id}/rooms`);
};

const addAmenity = () => {
  if (newAmenity.value.trim()) {
    if (!room.value.amenities) {
      room.value.amenities = [];
    }
    room.value.amenities.push(newAmenity.value.trim());
    newAmenity.value = '';
  }
};

const removeAmenity = (index) => {
  room.value.amenities.splice(index, 1);
};

const saveRoom = async () => {
  submitted.value = true;

  const isValid = await v$.value.$validate();
  if (!isValid) {
    return;
  }

  saving.value = true;

  try {
    // Actualizar habitación
    const updatedRoom = await roomRepository.update(roomId.value, room.value);

    if (updatedRoom) {
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('rooms.updateSuccess'),
        life: 3000
      });

      // Redirigir a la vista de detalle
      router.push(`/rooms/${roomId.value}`);
    } else {
      throw new Error('No se pudo actualizar la habitación');
    }
  } catch (error) {
    console.error('Error updating room:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message,
      life: 3000
    });
  } finally {
    saving.value = false;
  }
};

// Ciclo de vida
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.room-edit {
  padding: 1rem;
}
</style>

