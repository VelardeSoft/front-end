import { BaseEndpoint } from "../../../shared/infrastructure/base-endpoint";
import { BaseApi } from "../../../shared/infrastructure/base-api";
import { Room } from "../domain/model/Room";

/**
 * RoomRepository for accessing room data from API
 */
export class RoomRepository {
    constructor() {
        const baseApi = new BaseApi();
        this.endpoint = new BaseEndpoint(
            baseApi,
            import.meta.env.VITE_ROOMS_ENDPOINT_PATH
        );
    }

    /**
     * Get all rooms
     * @returns {Promise<Room[]>} Array of Room entities
     */
    async findAll() {
        try {
            const response = await this.endpoint.getAll();
            return response.data.map(room => Room.fromPrimitives(room));
        } catch (error) {
            console.error('Error fetching rooms:', error);
            return [];
        }
    }

    /**
     * Get room by id
     * @param {number} id - Room identifier
     * @returns {Promise<Room|null>} Room entity
     */
    async findById(id) {
        try {
            const response = await this.endpoint.getById(id);
            return Room.fromPrimitives(response.data);
        } catch (error) {
            console.error(`Error fetching room with id ${id}:`, error);
            return null;
        }
    }

    /**
     * Get rooms by hotel id
     * @param {number} hotelId - Hotel identifier
     * @returns {Promise<Room[]>} Array of Room entities
     */
    async findByHotelId(hotelId) {
        try {
            const rooms = await this.findAll();
            return rooms.filter(room => room.hotel_id === hotelId);
        } catch (error) {
            console.error(`Error fetching rooms for hotel ${hotelId}:`, error);
            return [];
        }
    }

    /**
     * Get available rooms by hotel id
     * @param {number} hotelId - Hotel identifier
     * @returns {Promise<Room[]>} Array of available Room entities
     */
    async findAvailableByHotelId(hotelId) {
        try {
            const rooms = await this.findByHotelId(hotelId);
            return rooms.filter(room => room.isAvailable());
        } catch (error) {
            console.error(`Error fetching available rooms for hotel ${hotelId}:`, error);
            return [];
        }
    }

    /**
     * Create a new room
     * @param {Object} roomData - Room data
     * @returns {Promise<Room|null>} Created Room entity
     */
    async create(roomData) {
        try {
            const response = await this.endpoint.create(roomData);
            return Room.fromPrimitives(response.data);
        } catch (error) {
            console.error('Error creating room:', error);
            return null;
        }
    }

    /**
     * Update an existing room
     * @param {number} id - Room identifier
     * @param {Object} roomData - Room data to update
     * @returns {Promise<Room|null>} Updated Room entity
     */
    async update(id, roomData) {
        try {
            const response = await this.endpoint.update(id, roomData);
            return Room.fromPrimitives(response.data);
        } catch (error) {
            console.error(`Error updating room with id ${id}:`, error);
            return null;
        }
    }

    /**
     * Delete a room
     * @param {number} id - Room identifier
     * @returns {Promise<boolean>} True if deleted successfully
     */
    async delete(id) {
        try {
            await this.endpoint.delete(id);
            return true;
        } catch (error) {
            console.error(`Error deleting room with id ${id}:`, error);
            return false;
        }
    }

    /**
     * Update room status
     * @param {number} id - Room identifier
     * @param {string} status - New status (Available, Occupied, Maintenance)
     * @returns {Promise<Room|null>} Updated Room entity
     */
    async updateStatus(id, status) {
        try {
            const room = await this.findById(id);
            if (!room) {
                throw new Error(`Room with id ${id} not found`);
            }

            return await this.update(id, { status });
        } catch (error) {
            console.error(`Error updating status for room ${id}:`, error);
            return null;
        }
    }
}
