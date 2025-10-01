<template>
  <div class="hotel-create">
    <div class="p-card p-shadow-2 mb-4">
      <div class="p-card-body">
        <div class="flex justify-content-between align-items-center mb-4">
          <div class="p-card-title mb-0">{{ $t('hotels.create') }}</div>
          <Button
            icon="pi pi-arrow-left"
            :label="$t('common.back')"
            class="p-button-secondary"
            @click="goBack"
          />
        </div>

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
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useVuelidate } from '@vuelidate/core';
import { required, email } from '@vuelidate/validators';
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
const saving = ref(false);
const submitted = ref(false);
const newAmenity = ref('');

// Hotel a crear
const hotel = reactive({
  name: '',
  email: '',
  address: '',
  phone: '',
  description: '',
  image: 'https://placehold.co/600x400?text=Hotel+Image',
  amenities: [],
  owner_id: user.value?.id,
  subscription_id: user.value?.subscription_id
});

// Validaciones
const rules = {
  name: { required },
  email: { email },
  address: { required }
};

const v$ = useVuelidate(rules, hotel);

// Métodos
const goBack = () => {
  router.push('/hotels');
};

const addAmenity = () => {
  if (newAmenity.value.trim()) {
    hotel.amenities.push(newAmenity.value.trim());
    newAmenity.value = '';
  }
};

const removeAmenity = (index) => {
  hotel.amenities.splice(index, 1);
};

const saveHotel = async () => {
  submitted.value = true;

  const isValid = await v$.value.$validate();
  if (!isValid) {
    return;
  }

  saving.value = true;

  try {
    const createdHotel = await hotelRepository.create({
      ...hotel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    if (createdHotel) {
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('hotels.createSuccess'),
        life: 3000
      });

      // Redirigir a la lista de hoteles
      router.push('/hotels');
    } else {
      throw new Error('No se pudo crear el hotel');
    }
  } catch (error) {
    console.error('Error creating hotel:', error);
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
  // Verificar si el usuario es propietario y tiene suscripción
  if (!user.value || user.value.user_type !== 'Owner' || !user.value.subscription_id) {
    router.push('/dashboard');
    return;
  }
});
</script>

<style scoped>
.hotel-create {
  padding: 1rem;
}
</style>

