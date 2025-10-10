import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { RoomApi } from "../infrastructure/room-api.js";
import { RoomAssembler } from "../infrastructure/room.assembler.js";
import { Room } from "../domain/model/room.entity.js";
import useHotelStore from "../../hotels/application/hotel.store.js";
import useUserStore from "../../users/application/user.store.js";

const roomApi = new RoomApi();

const useRoomStore = defineStore('rooms', () => {
    // Mover la inicialización de los stores dentro de la función
    const hotelStore = useHotelStore();
    const userStore = useUserStore();

    const rooms = ref([]);
    const currentRoom = ref(null);
    const errors = ref([]);
    const loading = ref(false);

    // Opciones para los tipos de habitación
    const roomTypes = [
        { label: 'Individual', value: 'individual' },
        { label: 'Doble', value: 'doble' }
    ];

    const fetchRooms = async () => {
        loading.value = true;
        try {
            const response = await roomApi.getRooms();
            rooms.value = RoomAssembler.toEntitiesFromResponse(response);
        } catch (err) {
            console.error("Error fetching rooms:", err);
            errors.value.push(err);
        } finally {
            loading.value = false;
        }
    };

    const getRoomById = async (id) => {
        loading.value = true;
        try {
            const response = await roomApi.getRoomById(id);
            return RoomAssembler.toEntityFromResource(response.data);
        } catch (err) {
            console.error(`Error fetching room with ID ${id}:`, err);
            errors.value.push(err);
            return null;
        } finally {
            loading.value = false;
        }
    };

    const createRoom = async (roomData) => {
        loading.value = true;
        try {
            console.log("Creating room:", roomData);
            const room = new Room(roomData);
            const response = await roomApi.createRoom(room);
            console.log("Room created:", response.data);
            const created = RoomAssembler.toEntityFromResource(response.data);
            rooms.value.push(created);
            return created;
        } catch (err) {
            console.error("Error creating room:", err);
            errors.value.push(err);
            return null;
        } finally {
            loading.value = false;
        }
    };

    const updateRoom = async (roomData) => {
        loading.value = true;
        try {
            const room = new Room(roomData);
            const response = await roomApi.updateRoom(room);
            const updated = RoomAssembler.toEntityFromResource(response.data);
            const index = rooms.value.findIndex(r => r.id === updated.id);
            if (index !== -1) {
                rooms.value[index] = updated;
            }
            return updated;
        } catch (err) {
            console.error("Error updating room:", err);
            errors.value.push(err);
            return null;
        } finally {
            loading.value = false;
        }
    };

    const deleteRoom = async (id) => {
        loading.value = true;
        try {
            await roomApi.deleteRoom(id);
            const index = rooms.value.findIndex(r => r.id === id);
            if (index !== -1) {
                rooms.value.splice(index, 1);
            }
            return true;
        } catch (err) {
            console.error("Error deleting room:", err);
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    // Get rooms by hotel ID
    const getRoomsByHotelId = async (hotelId) => {
        loading.value = true;
        try {
            await fetchRooms();
            return rooms.value.filter(room => room.hotels_id === hotelId);
        } catch (err) {
            console.error(`Error getting rooms for hotel ID ${hotelId}:`, err);
            errors.value.push(err);
            return [];
        } finally {
            loading.value = false;
        }
    };

    // Get all rooms available for the current user's hotels
    const myHotelsRooms = computed(() => {
        if (!userStore.currentUser || !hotelStore.hotels.length) return [];

        // Get IDs of hotels owned by current user
        const myHotelIds = hotelStore.hotels
            .filter(hotel => hotel.users_id === userStore.currentUser.id)
            .map(hotel => hotel.id);

        return rooms.value.filter(room => myHotelIds.includes(room.hotels_id));
    });

    const getRoomTypeLabel = (value) => {
        const type = roomTypes.find(type => type.value === value);
        return type ? type.label : value;
    };

    return {
        rooms,
        currentRoom,
        errors,
        loading,
        roomTypes,
        fetchRooms,
        getRoomById,
        createRoom,
        updateRoom,
        deleteRoom,
        getRoomsByHotelId,
        myHotelsRooms,
        getRoomTypeLabel
    };
});

export default useRoomStore;
