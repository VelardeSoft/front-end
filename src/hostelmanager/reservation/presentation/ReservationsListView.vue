<template>
  <div class="reservations-list">
    <div class="p-card p-shadow-2 mb-4">
      <div class="p-card-body">
        <div class="p-card-title mb-4">{{ $t('reservations.list') }}</div>

        <div v-if="loading" class="flex justify-content-center my-5">
          <ProgressSpinner />
        </div>
        <div v-else-if="reservations.length === 0" class="text-center my-5">
          <div class="mb-3">
            <i class="pi pi-info-circle" style="font-size: 2rem"></i>
          </div>
          <p>{{ $t('reservations.noReservations') }}</p>
          <Button
              v-if="isVisitor"
              :label="$t('hotels.list')"
              icon="pi pi-search"
              class="p-button-info mt-3"
              @click="goToHotels"
          />
        </div>
        <div v-else>
          <div class="flex mb-3 gap-3 flex-column md:flex-row">
            <div class="p-input-icon-left flex-grow-1">
              <i class="pi pi-search"></i>
              <InputText
                  v-model="searchQuery"
                  :placeholder="$t('common.search')"
                  class="w-full"
              />
            </div>
            <Dropdown
                v-model="statusFilter"
                :options="statusOptions"
                optionLabel="name"
                optionValue="value"
                :placeholder="$t('reservations.status')"
            />
          </div>

          <DataTable
              :value="processedReservations"
              stripedRows
              :paginator="true"
              :rows="10"
              responsiveLayout="scroll"
              class="p-datatable-sm"
              :rowsPerPageOptions="[10, 20, 50]"
              :loading="loading"
          >
            <Column field="id" :header="$t('reservations.id')" :sortable="true" style="width: 100px"></Column>

            <Column field="room_details.room_number" :header="$t('reservations.room')" :sortable="true">
              <template #body="slotProps">
                <div class="flex align-items-center gap-2">
                  <div v-if="slotProps.data.room_details" class="room-info">
                    {{ slotProps.data.room_details.room_number }} -
                    {{ slotProps.data.typeroom_translated }}
                    ({{ slotProps.data.hotel_name }})
                  </div>
                  <div v-else>
                    <Tag :value="`${$t('rooms.notFound')} (${$t('common.unknown')})`" severity="info" />
                  </div>
                </div>
              </template>
            </Column>

            <Column field="date_range" :header="$t('reservations.dates')" :sortable="true">
              <template #body="slotProps">
                <div class="flex align-items-center gap-2">
                  <span>{{ formatDate(slotProps.data.start_date) }} - {{ formatDate(slotProps.data.end_date) }}</span>
                </div>
              </template>
            </Column>

            <Column field="total_price" :header="$t('reservations.totalPrice')" :sortable="true">
              <template #body="slotProps">
                {{ formatPrice(slotProps.data.total_price) }}
              </template>
            </Column>

            <Column field="status" :header="$t('reservations.status')" :sortable="true">
              <template #body="slotProps">
                <Tag
                    :value="$t(`reservations.${slotProps.data.status.toLowerCase()}`)"
                    :severity="getStatusSeverity(slotProps.data.status)"
                />
              </template>
            </Column>

            <Column :header="$t('reservations.actions')" style="width: 150px">
              <template #body="slotProps">
                <div class="flex gap-1">
                  <Button
                      icon="pi pi-eye"
                      class="p-button-rounded p-button-info p-button-sm"
                      v-tooltip.top="$t('rooms.view')"
                      @click="viewRoom(slotProps.data.room_details?.id)"
                      :disabled="!slotProps.data.room_details"
                  />
                  <Button
                      v-if="canCancelReservation(slotProps.data)"
                      icon="pi pi-times"
                      class="p-button-rounded p-button-danger p-button-sm"
                      v-tooltip.top="$t('reservations.cancel')"
                      @click="confirmCancelReservation(slotProps.data)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>

    <Dialog
        v-model:visible="cancelDialog"
        :style="{ width: '450px' }"
        :header="$t('reservations.cancel')"
        :modal="true"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span>{{ $t('reservations.cancelConfirm') }}</span>
        <div v-if="reservationToCancel" class="mt-3">
          <div v-if="getRoomDetails(reservationToCancel.room_id)">
            <div>
              <strong>{{ getHotelName(getRoomDetails(reservationToCancel.room_id).hotel_id) }}</strong>
            </div>
            <div>
              {{ $t('rooms.roomNumber') }} {{ getRoomDetails(reservationToCancel.room_id).room_number }}
            </div>
            <div>
              {{ formatDate(reservationToCancel.start_date) }} - {{ formatDate(reservationToCancel.end_date) }}
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <Button
            :label="$t('common.no')"
            icon="pi pi-times"
            class="p-button-text"
            @click="cancelDialog = false"
        />
        <Button
            :label="$t('common.yes')"
            icon="pi pi-check"
            class="p-button-danger"
            @click="cancelReservation"
            :loading="canceling"
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
import { ReservationRepository } from '../infrastructure/ReservationRepository';
import { RoomRepository } from '../../room/infrastructure/RoomRepository';
import { HotelRepository } from '../../hotels/infrastructure/HotelRepository';
import { UserRepository } from '../../profile/infrastructure/UserRepository';

// Composables
const router = useRouter();
const { t } = useI18n();
const toast = useToast();

// Repositorios
const reservationRepository = new ReservationRepository();
const roomRepository = new RoomRepository();
const hotelRepository = new HotelRepository();
const userRepository = new UserRepository();

// Estado
const user = ref(userRepository.getCurrentUser());
const reservations = ref([]);
const rooms = ref([]);
const hotels = ref([]);
const loading = ref(true);
const cancelDialog = ref(false);
const reservationToCancel = ref(null);
const canceling = ref(false);
const searchQuery = ref('');
const statusFilter = ref(null);

// Opciones para el filtro de estado
const statusOptions = [
  { name: t('common.all'), value: null },
  { name: t('reservations.confirmed'), value: 'Confirmed' },
  { name: t('reservations.pending'), value: 'Pending' },
  { name: t('reservations.cancelled'), value: 'Cancelled' },
];

const filters = ref({});

// Propiedades computadas
const isOwner = computed(() => user.value?.user_type === 'Owner');
const isVisitor = computed(() => user.value?.user_type === 'Visitor');

// Funciones accesorias: TODAS las comparaciones usan String()
const getRoomDetails = (roomId) => {
  return rooms.value.find(room => String(room.id) === String(roomId));
};

const getHotelById = (hotelId) => {
  return hotels.value.find(hotel => String(hotel.id) === String(hotelId));
};

const getHotelName = (hotelId) => {
  const hotel = getHotelById(hotelId);
  return hotel ? hotel.name : t('common.unknown');
};

/**
 * Propiedad Computada: Pre-procesa y filtra los datos.
 */
const processedReservations = computed(() => {
  // 1. Enriquecer los datos
  let result = reservations.value.map(reservation => {
    const room = getRoomDetails(reservation.room_id);
    const hotel = room ? getHotelById(room.hotel_id) : null;

    const typeroom_translated = room?.typeroom
        ? t(`rooms.types.${room.typeroom.toLowerCase()}`)
        : t('rooms.notFound');

    return {
      ...reservation,
      room_details: room,
      hotel_name: hotel ? hotel.name : t('common.unknown'),
      typeroom_translated: typeroom_translated,

      searchable_text: `${room?.room_number || ''} ${hotel?.name || ''} ${typeroom_translated} ${reservation.status}`.toLowerCase()
    };
  });

  // 2. Aplicar filtro de estado
  if (statusFilter.value) {
    result = result.filter(r => r.status === statusFilter.value);
  }

  // 3. Aplicar filtro de búsqueda global
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(r =>
        r.searchable_text.includes(query) ||
        (r.start_date || '').toLowerCase().includes(query) ||
        (r.end_date || '').toLowerCase().includes(query)
    );
  }

  return result;
});


// Métodos
const loadData = async () => {
  loading.value = true;

  try {
    // 1. Cargar reservaciones
    reservations.value = await reservationRepository.findByUserId(user.value.id);

    // 2. Cargar información de habitaciones (Asegurando que los IDs sean strings)
    const roomIds = [...new Set(reservations.value.map(reservation => String(reservation.room_id)).filter(id => id))];

    // Usamos async/await dentro del map y Promise.all para manejar errores de carga por ID
    const roomsPromises = roomIds.map(async id => {
      try {
        return await roomRepository.findById(id);
      } catch (e) {
        console.error(`Error loading room ID ${id}:`, e);
        return null;
      }
    });
    const roomsData = await Promise.all(roomsPromises);
    rooms.value = roomsData.filter(Boolean); // Filtrar resultados nulos/undefined

    // 3. Cargar información de hoteles (CORRECCIÓN CLAVE: Limpieza estricta de IDs)
    const hotelIds = [...new Set(
        rooms.value
            .map(room => room.hotel_id)
            .filter(Boolean) // Elimina null, undefined, 0, o ""
            .map(id => String(id)) // Asegura que todos los IDs sean strings
    )];

    const hotelsPromises = hotelIds.map(async id => {
      try {
        return await hotelRepository.findById(id);
      } catch (e) {
        console.error(`Error loading hotel ID ${id}:`, e);
        return null;
      }
    });
    const hotelsData = await Promise.all(hotelsPromises);
    hotels.value = hotelsData.filter(Boolean);
  } catch (error) {
    console.error('Error general loading reservations data:', error);
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

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(price);
};

const getStatusSeverity = (status) => {
  switch (status) {
    case 'Confirmed':
      return 'success';
    case 'Pending':
      return 'warning';
    case 'Cancelled':
      return 'danger';
    default:
      return 'info';
  }
};

const goToHotels = () => {
  router.push('/hotels');
};

const viewRoom = (roomId) => {
  if (roomId) {
    // Aseguramos que el ID de la ruta sea un string válido
    router.push(`/rooms/${String(roomId)}`);
  }
};

const canCancelReservation = (reservation) => {
  return reservation.status !== 'Cancelled';
};

const confirmCancelReservation = (reservation) => {
  reservationToCancel.value = reservation;
  cancelDialog.value = true;
};

const cancelReservation = async () => {
  if (!reservationToCancel.value) return;

  canceling.value = true;

  try {
    // Aseguramos que el ID de la reserva es string
    const result = await reservationRepository.cancelReservation(String(reservationToCancel.value.id));

    if (result) {
      // Actualizar la reserva en el estado local
      const index = reservations.value.findIndex(r => String(r.id) === String(reservationToCancel.value.id));
      if (index !== -1) {
        reservations.value[index] = result;
      }

      // Liberar la habitación
      const room = getRoomDetails(reservationToCancel.value.room_id);
      if (room) {
        // Aseguramos que el ID de la habitación es string
        await roomRepository.updateStatus(String(room.id), 'Available');

        // Actualizar la habitación en el estado local
        const roomIndex = rooms.value.findIndex(r => String(r.id) === String(room.id));
        if (roomIndex !== -1) {
          rooms.value[roomIndex].status = 'Available';
        }
      }

      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('reservations.cancelSuccess'),
        life: 3000
      });

      cancelDialog.value = false;
      reservationToCancel.value = null;
    } else {
      throw new Error('No se pudo cancelar la reservación');
    }
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message,
      life: 3000
    });
  } finally {
    canceling.value = false;
  }
};

// Ciclo de vida
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.reservations-list {
  padding: 1rem;
}

.room-info {
  font-weight: 500;
}
</style>