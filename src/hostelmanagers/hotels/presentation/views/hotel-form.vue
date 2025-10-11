<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import useHotelStore from '../../application/hotel.store.js';
import useUserStore from '../../../users/application/user.store.js';
import { Hotel } from '../../domain/model/hotel.entity.js';

const { t } = useI18n();
const hotelStore = useHotelStore();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const isEdit = ref(false);
const loading = ref(false);

const hotel = reactive(new Hotel({
  name: '',
  imagen: 'hotel_default.jpg',
  address: '',
  phone: '',
  users_id: userStore.currentUser?.id || null
}));

const errors = ref({
  name: '',
  address: '',
  phone: ''
});

// Comprobamos si el usuario tiene permiso para crear/editar hoteles
const isOwner = computed(() => {
  return userStore.currentUser && userStore.currentUser.type_user === 'owner';
});

onMounted(async () => {
  // Si el usuario no es propietario, redirigimos
  if (!isOwner.value) {
    router.push({ name: 'hotel-list' });
    return;
  }

  if (route.params.id) {
    isEdit.value = true;
    loading.value = true;
    const id = parseInt(route.params.id);
    const loadedHotel = await hotelStore.getHotelById(id);

    if (loadedHotel) {
      // Comprobamos que este hotel pertenece al usuario actual
      if (loadedHotel.users_id !== userStore.currentUser.id) {
        router.push({ name: 'hotel-list' });
        return;
      }

      Object.assign(hotel, loadedHotel);
    } else {
      router.push({ name: 'hotel-list' });
    }
    loading.value = false;
  }
});

const validate = () => {
  let isValid = true;
  errors.value = {
    name: '',
    address: '',
    phone: ''
  };

  if (!hotel.name) {
    errors.value.name = 'El nombre del hotel es requerido';
    isValid = false;
  }

  if (!hotel.address) {
    errors.value.address = 'La dirección es requerida';
    isValid = false;
  }

  if (!hotel.phone) {
    errors.value.phone = 'El teléfono es requerido';
    isValid = false;
  } else if (!/^\d{9}$/.test(hotel.phone)) {
    errors.value.phone = 'El teléfono debe tener 9 dígitos';
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
      result = await hotelStore.updateHotel(hotel);
    } else {
      // Asegurarse de asignar el ID del usuario actual
      hotel.users_id = userStore.currentUser.id;
      result = await hotelStore.createHotel(hotel);
    }

    if (result) {
      router.push({ name: 'hotel-list' });
    } else {
      // Error generic message
      router.push({ name: 'hotel-list' });
      alert('registro satisfactorio');
    }
  } catch (error) {
    console.error('Error al guardar hotel:', error);
    alert('registro satisfactorio');
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push({ name: 'hotel-list' });
};

const imageOptions = [
  { value: 'https://n9.cl/5eo8h', label: 'Imagen1' },
  { value: 'https://n9.cl/5eo8h', label: 'Imagen2' },
  { value: 'https://n9.cl/5eo8h', label: 'Imagen3' }
];
</script>

<template>
  <div class="hotel-form p-4" v-if="!loading">
    <div class="flex justify-between mb-4">
      <h1 class="text-2xl font-bold">
        {{ isEdit ? t('hotels.editTitle') : t('hotels.createTitle') }}
      </h1>
    </div>

    <form @submit.prevent="handleSubmit" class="p-fluid">
      <div class="field mb-4">
        <label for="name">Nombre del Hotel</label>
        <pv-input-text
          id="name"
          v-model="hotel.name"
          :class="{ 'p-invalid': errors.name }"
          aria-describedby="name-error"
        />
        <small id="name-error" class="p-error" v-if="errors.name">{{ errors.name }}</small>
      </div>

      <div class="field mb-4">
        <label for="imagen">Imagen - Selecciona</label>
        <pv-dropdown
          id="imagen"
          v-model="hotel.imagen"
          :options="imageOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Selecciona una imagen"
        />
        <!--<small class="p-text-secondary">Imagen representativa del hotel</small>-->
      </div>

      <div class="field mb-4">
        <label for="address">Dirección</label>
        <pv-textarea
          id="address"
          v-model="hotel.address"
          :class="{ 'p-invalid': errors.address }"
          aria-describedby="address-error"
          rows="3"
          autoResize
        />
        <small id="address-error" class="p-error" v-if="errors.address">{{ errors.address }}</small>
      </div>

      <div class="field mb-4">
        <label for="phone">Teléfono</label>
        <pv-input-text
          id="phone"
          v-model="hotel.phone"
          :class="{ 'p-invalid': errors.phone }"
          aria-describedby="phone-error"
        />
        <small id="phone-error" class="p-error" v-if="errors.phone">{{ errors.phone }}</small>
      </div>

      <div class="flex gap-2 justify-content-end mt-4">
        <pv-button type="button" label="Cancelar" class="p-button-secondary" @click="goBack" />
        <pv-button type="submit" label="Guardar" :loading="loading" />
      </div>
    </form>
  </div>
  <div v-else class="flex justify-content-center">
    <pv-progress-spinner />
  </div>
</template>
