import { BaseEndpoint } from "../../../shared/infrastructure/base-endpoint";
import { BaseApi } from "../../../shared/infrastructure/base-api";
import { Hotel } from "../domain/model/Hotel";

/**
 * HotelRepository for accessing hotel data from API
 */
export class HotelRepository {
    constructor() {
        const baseApi = new BaseApi();
        this.endpoint = new BaseEndpoint(
            baseApi,
            import.meta.env.VITE_HOTELS_ENDPOINT_PATH
        );
    }

    /**
     * Get all hotels
     * @returns {Promise<Hotel[]>} Array of Hotel entities
     */
    async findAll() {
        try {
            const response = await this.endpoint.getAll();
            return response.data.map(hotel => Hotel.fromPrimitives(hotel));
        } catch (error) {
            console.error('Error fetching hotels:', error);
            return [];
        }
    }

    /**
     * Get hotel by id
     * @param {number} id - Hotel identifier
     * @returns {Promise<Hotel|null>} Hotel entity
     */
    async findById(id) {
        try {
            const response = await this.endpoint.getById(id);
            return Hotel.fromPrimitives(response.data);
        } catch (error) {
            console.error(`Error fetching hotel with id ${id}:`, error);
            return null;
        }
    }

    /**
     * Get hotels by owner id
     * @param {number} ownerId - Owner user identifier
     * @returns {Promise<Hotel[]>} Array of Hotel entities
     */
    async findByOwnerId(ownerId) {
        // Asegura que el ID de búsqueda es un String
        const ownerIdString = String(ownerId);

        // Aquí, asumo que 'hotels' son objetos planos (primitivos)
        try {
            const hotels = await this.findAll();

            // CORRECCIÓN: Usamos String() en ambos lados de la comparación
            return hotels.filter(hotel => String(hotel.owner_id) === ownerIdString);

        } catch (error) {
            console.error(`Error fetching hotels for owner ${ownerId}:`, error);
            return [];
        }
    }

    /**
     * Create a new hotel
     * @param {Object} hotelData - Hotel data
     * @returns {Promise<Hotel|null>} Created Hotel entity
     */
    async create(hotelData) {
        try {
            const response = await this.endpoint.create(hotelData);
            return Hotel.fromPrimitives(response.data);
        } catch (error) {
            console.error('Error creating hotel:', error);
            return null;
        }
    }

    /**
     * Update an existing hotel
     * @param {number} id - Hotel identifier
     * @param {Object} hotelData - Hotel data to update
     * @returns {Promise<Hotel|null>} Updated Hotel entity
     */
    async update(id, hotelData) {
        try {
            const response = await this.endpoint.update(id, hotelData);
            return Hotel.fromPrimitives(response.data);
        } catch (error) {
            console.error(`Error updating hotel with id ${id}:`, error);
            return null;
        }
    }

    /**
     * Delete a hotel
     * @param {number} id - Hotel identifier
     * @returns {Promise<boolean>} True if deleted successfully
     */
    async delete(id) {
        try {
            await this.endpoint.delete(id);
            return true;
        } catch (error) {
            console.error(`Error deleting hotel with id ${id}:`, error);
            return false;
        }
    }
}
