<template>
  <div class="hotel-edit">
    <div class="p-card p-shadow-2 mb-4">
      <div class="p-card-body">
        <div class="flex justify-content-between align-items-center mb-4">
          <div class="p-card-title mb-0">{{ $t('hotels.edit') }}</div>
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
        <div v-else>
          <form @submit.prevent="saveHotel">
            <div class="p-fluid formgrid grid">
              <div class="field col-12 md:col-6">
                <label for="name">{{ $t('hotels.name') }} *</label>
                <InputText
                  id="name"
                  v-model="hotel.name"
                  :class="{'p-invalid': v$.name.$invalid && submitted}"
                  :placeholder="$t('hotels.name')"
                  autofocus
                />
                <small v-if="v$.name.$invalid && submitted" class="p-error">
                  {{ $t('hotels.requiredField') }}
                </small>
              </div>

              <div class="field col-12 md:col-6">
                <label for="email">{{ $t('hotels.email') }}</label>
                <InputText
                  id="email"
                  v-model="hotel.email"
                  type="email"
                  :class="{'p-invalid': v$.email.$invalid && submitted}"
                  :placeholder="$t('hotels.email')"
                />
                <small v-if="v$.email.$invalid && submitted" class="p-error">
                  {{ $t('common.required') }}
                </small>
              </div>

              <div class="field col-12">
                <label for="address">{{ $t('hotels.address') }} *</label>
                <InputText
                  id="address"
                  v-model="hotel.address"
                  :class="{'p-invalid': v$.address.$invalid && submitted}"
                  :placeholder="$t('hotels.address')"
                />
                <small v-if="v$.address.$invalid && submitted" class="p-error">
                  {{ $t('hotels.requiredField') }}
                </small>
              </div>

              <div class="field col-12 md:col-6">
                <label for="phone">{{ $t('hotels.phone') }}</label>
                <InputText
                  id="phone"
                  v-model="hotel.phone"
                  :placeholder="$t('hotels.phone')"
                />
              </div>

              <div class="field col-12 md:col-6">
                <label for="image">URL {{ $t('hotels.image') }}</label>
                <InputText
                  id="image"
                  v-model="hotel.image"
                  :placeholder="$t('hotels.image') + ' URL'"
                />
              </div>

              <div class="field col-12">
                <label for="description">{{ $t('hotels.description') }}</label>
                <Textarea
                  id="description"
                  v-model="hotel.description"
                  rows="3"
                  :placeholder="$t('hotels.description')"
                />
              </div>

              <div class="field col-12">
                <label for="amenities">{{ $t('hotels.amenities') }}</label>
                <div class="p-inputgroup">
                  <InputText
                    v-model="newAmenity"
                    :placeholder="$t('hotels.amenities')"
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
                    v-for="(amenity, index) in hotel.amenities"
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
import {ref, reactive, onMounted, computed} from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useVuelidate } from '@vuelidate/core';
import { required, email } from '@vuelidate/validators';
import { HotelRepository } from '../infrastructure/HotelRepository';
import { UserRepository } from '../../profile/infrastructure/UserRepository';

// Composables
const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const toast = useToast();

// Repositorios
const hotelRepository = new HotelRepository();
const userRepository = new UserRepository();

// Estado
const user = ref(userRepository.getCurrentUser());
const hotel = ref(null);
const loading = ref(true);
const saving = ref(false);
const submitted = ref(false);
const newAmenity = ref('');
const hotelId = computed(() => Number(route.params.id));

// Propiedades computadas
const isOwner = computed(() => user.value?.user_type === 'Owner');
const hasSubscription = computed(() => user.value?.subscription_id !== null);

// Validaciones
const rules = {
  name: { required },
  email: { email },
  address: { required }
};

const v$ = useVuelidate(rules, hotel);

// Métodos
const loadData = async () => {
  loading.value = true;

  try {
    // Verificar si el usuario es propietario y tiene suscripción
    if (!user.value || user.value.user_type !== 'Owner' || !user.value.subscription_id) {
      router.push('/dashboard');
      return;
    }

    // Cargar hotel
    const hotelData = await hotelRepository.findById(hotelId.value);
    if (!hotelData) {
      throw new Error('Hotel no encontrado');
    }

    // Verificar si el usuario es el propietario del hotel
    if (hotelData.owner_id !== user.value.id) {
      router.push('/dashboard');
      return;
    }

    hotel.value = hotelData;

    // Asegurarse de que amenities sea un array
    if (!hotel.value.amenities) {
      hotel.value.amenities = [];
    }
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

const goBack = () => {
  router.go(-1);
};

const addAmenity = () => {
  if (newAmenity.value.trim()) {
    if (!hotel.value.amenities) {
      hotel.value.amenities = [];
    }
    hotel.value.amenities.push(newAmenity.value.trim());
    newAmenity.value = '';
  }
};

const removeAmenity = (index) => {
  hotel.value.amenities.splice(index, 1);
};

const saveHotel = async () => {
  submitted.value = true;

  const isValid = await v$.value.$validate();
  if (!isValid) {
    return;
  }

  saving.value = true;

  try {
    // Actualizar hotel
    const updatedHotel = await hotelRepository.update(hotelId.value, {
      ...hotel.value,
      updatedAt: new Date().toISOString()
    });

    if (updatedHotel) {
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('hotels.updateSuccess'),
        life: 3000
      });

      // Redirigir a la vista de detalle
      router.push(`/hotels/${hotelId.value}`);
    } else {
      throw new Error('No se pudo actualizar el hotel');
    }
  } catch (error) {
    console.error('Error updating hotel:', error);
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
.hotel-edit {
  padding: 1rem;
}
</style>
