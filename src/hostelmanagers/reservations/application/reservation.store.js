import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ReservationApi } from "../infrastructure/reservation-api.js";
import { ReservationAssembler } from "../infrastructure/reservation.assembler.js";
import { Reservation } from "../domain/model/reservation.entity.js";
import useUserStore from "../../users/application/user.store.js";
import useRoomStore from "../../rooms/application/room.store.js";
import useHotelStore from "../../hotels/application/hotel.store.js";

const reservationApi = new ReservationApi();

const useReservationStore = defineStore('reservations', () => {
    // Mover la inicialización de los stores dentro de la función
    const userStore = useUserStore();
    const roomStore = useRoomStore();
    const hotelStore = useHotelStore();

    const reservations = ref([]);
    const currentReservation = ref(null);
    const errors = ref([]);
    const loading = ref(false);

    const fetchReservations = async () => {
        loading.value = true;
        try {
            const response = await reservationApi.getReservations();
            reservations.value = ReservationAssembler.toEntitiesFromResponse(response);
        } catch (err) {
            console.error("Error fetching reservations:", err);
            errors.value.push(err);
        } finally {
            loading.value = false;
        }
    };

    const getReservationById = async (id) => {
        loading.value = true;
        try {
            const response = await reservationApi.getReservationById(id);
            return ReservationAssembler.toEntityFromResource(response.data);
        } catch (err) {
            console.error(`Error fetching reservation with ID ${id}:`, err);
            errors.value.push(err);
            return null;
        } finally {
            loading.value = false;
        }
    };

    const createReservation = async (reservationData) => {
        loading.value = true;
        try {
            // Asignar el ID del usuario actual
            if (userStore.currentUser && userStore.currentUser.id) {
                reservationData.users_id = userStore.currentUser.id;
            }

            console.log("Creating reservation:", reservationData);
            const reservation = new Reservation(reservationData);
            const response = await reservationApi.createReservation(reservation);
            console.log("Reservation created:", response.data);
            const created = ReservationAssembler.toEntityFromResource(response.data);
            reservations.value.push(created);
            return created;
        } catch (err) {
            console.error("Error creating reservation:", err);
            errors.value.push(err);
            return null;
        } finally {
            loading.value = false;
        }
    };

    const updateReservation = async (reservationData) => {
        loading.value = true;
        try {
            const reservation = new Reservation(reservationData);
            const response = await reservationApi.updateReservation(reservation);
            const updated = ReservationAssembler.toEntityFromResource(response.data);
            const index = reservations.value.findIndex(r => r.id === updated.id);
            if (index !== -1) {
                reservations.value[index] = updated;
            }
            return updated;
        } catch (err) {
            console.error("Error updating reservation:", err);
            errors.value.push(err);
            return null;
        } finally {
            loading.value = false;
        }
    };

    const deleteReservation = async (id) => {
        loading.value = true;
        try {
            await reservationApi.deleteReservation(id);
            const index = reservations.value.findIndex(r => r.id === id);
            if (index !== -1) {
                reservations.value.splice(index, 1);
            }
            return true;
        } catch (err) {
            console.error("Error deleting reservation:", err);
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    // Obtener reservas del usuario actual
    const myReservations = computed(() => {
        if (!userStore.currentUser) return [];
        return reservations.value.filter(reservation => reservation.users_id === userStore.currentUser.id);
    });

    // Obtener reservas para los hoteles del propietario actual
    const hotelReservations = computed(() => {
        if (!userStore.currentUser || !hotelStore.hotels.length || !roomStore.rooms.length) return [];

        // Solo para propietarios
        if (userStore.currentUser.type_user !== 'owner') return [];

        // Obtener IDs de hoteles que pertenecen al usuario
        const myHotelIds = hotelStore.hotels
            .filter(h => h.users_id === userStore.currentUser.id)
            .map(h => h.id);

        // Obtener IDs de habitaciones que pertenecen a esos hoteles
        const myRoomIds = roomStore.rooms
            .filter(r => myHotelIds.includes(r.hotels_id))
            .map(r => r.id);

        // Filtrar reservas para esas habitaciones
        return reservations.value.filter(reservation => myRoomIds.includes(reservation.rooms_id));
    });

    // Obtener información detallada de una reserva
    const getReservationDetails = (reservation) => {
        const room = roomStore.rooms.find(r => r.id === reservation.rooms_id);
        const hotel = room ? hotelStore.hotels.find(h => h.id === room.hotels_id) : null;
        const user = userStore.users.find(u => u.id === reservation.users_id);

        return {
            reservation,
            room,
            hotel,
            user
        };
    };

    // Verificar si una habitación está disponible en las fechas especificadas
    const isRoomAvailable = (roomId, startDate, endDate, excludeReservationId = null) => {
        // Convertir fechas a objetos Date para comparación
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Buscar reservaciones que se solapan para esta habitación
        const overlappingReservations = reservations.value.filter(res => {
            // Excluir la reserva actual en caso de estar editando
            if (excludeReservationId && res.id === excludeReservationId) {
                return false;
            }

            // Verificar si es la misma habitación
            if (res.rooms_id !== roomId) {
                return false;
            }

            const resStart = new Date(res.start_date);
            const resEnd = new Date(res.end_date);

            // Verificar solapamiento de fechas
            // (inicio1 <= fin2) && (fin1 >= inicio2)
            return start <= resEnd && end >= resStart;
        });

        return overlappingReservations.length === 0;
    };

    return {
        reservations,
        currentReservation,
        errors,
        loading,
        fetchReservations,
        getReservationById,
        createReservation,
        updateReservation,
        deleteReservation,
        myReservations,
        hotelReservations,
        getReservationDetails,
        isRoomAvailable
    };
});

export default useReservationStore;
