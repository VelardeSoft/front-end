import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { HotelsApi } from "../infrastructure/hotels-api.js";
import { HotelsAssembler } from "../infrastructure/hotels.assembler.js";
import { Hotel } from "../domain/model/hotel.entity.js";
import useUserStore from "../../users/application/user.store.js";

const hotelsApi = new HotelsApi();

const useHotelStore = defineStore('hotels', () => {
    // Llamar a useUserStore dentro del store, no en el ámbito global
    const userStore = useUserStore();

    const hotels = ref([]);
    const currentHotel = ref(null);
    const errors = ref([]);
    const loading = ref(false);

    const fetchHotels = async () => {
        loading.value = true;
        try {
            const response = await hotelsApi.getHotels();
            hotels.value = HotelsAssembler.toEntitiesFromResponse(response);
        } catch (err) {
            console.error("Error fetching hotels:", err);
            errors.value.push(err);
        } finally {
            loading.value = false;
        }
    };

    const getHotelById = async (id) => {
        loading.value = true;
        try {
            const response = await hotelsApi.getHotelById(id);
            return HotelsAssembler.toEntityFromResource(response.data);
        } catch (err) {
            console.error(`Error fetching hotel with ID ${id}:`, err);
            errors.value.push(err);
            return null;
        } finally {
            loading.value = false;
        }
    };

    const createHotel = async (hotelData) => {
        loading.value = true;
        try {
            // Asignar el ID del usuario actual como propietario
            if (userStore.currentUser && userStore.currentUser.id) {
                hotelData.users_id = userStore.currentUser.id;
            }

            console.log("Creating hotel:", hotelData);
            const hotel = new Hotel(hotelData);
            const response = await hotelsApi.createHotel(hotel);
            console.log("Hotel created:", response.data);
            const created = HotelsAssembler.toEntityFromResource(response.data);
            hotels.value.push(created);
            return created;
        } catch (err) {
            console.error("Error creating hotel:", err);
            errors.value.push(err);
            return null;
        } finally {
            loading.value = false;
        }
    };

    const updateHotel = async (hotelData) => {
        loading.value = true;
        try {
            const hotel = new Hotel(hotelData);
            const response = await hotelsApi.updateHotel(hotel);
            const updated = HotelsAssembler.toEntityFromResource(response.data);
            const index = hotels.value.findIndex(h => h.id === updated.id);
            if (index !== -1) {
                hotels.value[index] = updated;
            }
            return updated;
        } catch (err) {
            console.error("Error updating hotel:", err);
            errors.value.push(err);
            return null;
        } finally {
            loading.value = false;
        }
    };

    const deleteHotel = async (id) => {
        loading.value = true;
        try {
            await hotelsApi.deleteHotel(id);
            const index = hotels.value.findIndex(h => h.id === id);
            if (index !== -1) {
                hotels.value.splice(index, 1);
            }
            return true;
        } catch (err) {
            console.error("Error deleting hotel:", err);
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    // Get hotels owned by the current user
    const myHotels = computed(() => {
        if (!userStore.currentUser) return [];
        return hotels.value.filter(hotel => hotel.users_id === userStore.currentUser.id);
    });

    return {
        hotels,
        myHotels,
        currentHotel,
        errors,
        loading,
        fetchHotels,
        getHotelById,
        createHotel,
        updateHotel,
        deleteHotel,
    };
});

export default useHotelStore;
