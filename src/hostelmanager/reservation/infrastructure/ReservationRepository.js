import { BaseEndpoint } from "../../../shared/infrastructure/base-endpoint";
import { BaseApi } from "../../../shared/infrastructure/base-api";
import { Reservation } from "../domain/model/Reservation";

/**
 * ReservationRepository for accessing reservation data from API
 */
export class ReservationRepository {
    constructor() {
        const baseApi = new BaseApi();
        this.endpoint = new BaseEndpoint(
            baseApi,
            import.meta.env.VITE_RESERVATIONS_ENDPOINT_PATH
        );
    }

    /**
     * Get all reservations
     * @returns {Promise<Reservation[]>} Array of Reservation entities
     */
    async findAll() {
        try {
            const response = await this.endpoint.getAll();
            return response.data.map(reservation => Reservation.fromPrimitives(reservation));
        } catch (error) {
            console.error('Error fetching reservations:', error);
            return [];
        }
    }

    /**
     * Get reservation by id
     * @param {number} id - Reservation identifier
     * @returns {Promise<Reservation|null>} Reservation entity
     */
    async findById(id) {
        try {
            const response = await this.endpoint.getById(id);
            return Reservation.fromPrimitives(response.data);
        } catch (error) {
            console.error(`Error fetching reservation with id ${id}:`, error);
            return null;
        }
    }

    /**
     * Get reservations by user id
     * @param {number} userId - User identifier
     * @returns {Promise<Reservation[]>} Array of Reservation entities
     */
    async findByUserId(userId) {
        try {
            const reservations = await this.findAll();
            return reservations.filter(reservation => reservation.user_id === userId);
        } catch (error) {
            console.error(`Error fetching reservations for user ${userId}:`, error);
            return [];
        }
    }

    /**
     * Get reservations by room id
     * @param {number} roomId - Room identifier
     * @returns {Promise<Reservation[]>} Array of Reservation entities
     */
    // Nombre del método cambiado de findByRoomId a findByRoomIds,
// y se asegura que la comparación sea entre Strings para evitar errores de tipo.

    async findByRoomId(roomIds) {
        // Asegura que roomIds es un array, incluso si viene un solo ID o si es nulo.
        const idsToFilter = Array.isArray(roomIds) ? roomIds.map(String) : [String(roomIds)];

        try {
            const reservations = await this.findAll();

            // Filtra las reservas cuya room_id esté incluida en la lista de IDs proporcionada
            return reservations.filter(reservation =>
                idsToFilter.includes(String(reservation.room_id))
            );
        } catch (error) {
            console.error(`Error fetching reservations for rooms ${roomIds}:`, error);
            return [];
        }
    }

    /**
     * Create a new reservation
     * @param {Object} reservationData - Reservation data
     * @returns {Promise<Reservation|null>} Created Reservation entity
     */
    async create(reservationData) {
        try {
            const response = await this.endpoint.create(reservationData);
            return Reservation.fromPrimitives(response.data);
        } catch (error) {
            console.error('Error creating reservation:', error);
            return null;
        }
    }

    /**
     * Update an existing reservation
     * @param {number} id - Reservation identifier
     * @param {Object} reservationData - Reservation data to update
     * @returns {Promise<Reservation|null>} Updated Reservation entity
     */
    async update(id, reservationData) {
        try {
            const response = await this.endpoint.update(id, reservationData);
            return Reservation.fromPrimitives(response.data);
        } catch (error) {
            console.error(`Error updating reservation with id ${id}:`, error);
            return null;
        }
    }

    /**
     * Delete a reservation
     * @param {number} id - Reservation identifier
     * @returns {Promise<boolean>} True if deleted successfully
     */
    async delete(id) {
        try {
            await this.endpoint.delete(id);
            return true;
        } catch (error) {
            console.error(`Error deleting reservation with id ${id}:`, error);
            return false;
        }
    }

    /**
     * Check if a room is available for the given dates
     * @param {number} roomId - Room identifier
     * @param {string} startDate - Check-in date (YYYY-MM-DD)
     * @param {string} endDate - Check-out date (YYYY-MM-DD)
     * @returns {Promise<boolean>} True if room is available for the dates
     */
    async isRoomAvailable(roomId, startDate, endDate) {
        try {
            const reservations = await this.findByRoomId(roomId);

            // Filter active reservations that overlap with the requested dates
            const overlappingReservations = reservations.filter(reservation => {
                if (reservation.status === 'Cancelled') {
                    return false;
                }

                const resStart = new Date(reservation.start_date);
                const resEnd = new Date(reservation.end_date);
                const reqStart = new Date(startDate);
                const reqEnd = new Date(endDate);

                // Check if date ranges overlap
                return resStart < reqEnd && resEnd > reqStart;
            });

            return overlappingReservations.length === 0;
        } catch (error) {
            console.error(`Error checking availability for room ${roomId}:`, error);
            return false;
        }
    }

    /**
     * Make a reservation for a room
     * @param {number} roomId - Room identifier
     * @param {number} userId - User identifier
     * @param {string} startDate - Check-in date (YYYY-MM-DD)
     * @param {string} endDate - Check-out date (YYYY-MM-DD)
     * @param {number} totalPrice - Total price of the reservation
     * @returns {Promise<Reservation|null>} Created Reservation entity
     */
    async makeReservation(roomId, userId, startDate, endDate, totalPrice) {
        try {
            // Check if room is available for the dates
            const isAvailable = await this.isRoomAvailable(roomId, startDate, endDate);
            if (!isAvailable) {
                throw new Error(`Room ${roomId} is not available for the requested dates`);
            }

            const reservationData = {
                room_id: roomId,
                user_id: userId,
                start_date: startDate,
                end_date: endDate,
                status: 'Pending',
                total_price: totalPrice,
                created_at: new Date().toISOString()
            };

            return await this.create(reservationData);
        } catch (error) {
            console.error('Error making reservation:', error);
            return null;
        }
    }

    /**
     * Cancel a reservation
     * @param {number} id - Reservation identifier
     * @returns {Promise<Reservation|null>} Updated Reservation entity
     */
    async cancelReservation(id) {
        try {
            return await this.update(id, { status: 'Cancelled' });
        } catch (error) {
            console.error(`Error cancelling reservation ${id}:`, error);
            return null;
        }
    }

    /**
     * Confirm a reservation
     * @param {number} id - Reservation identifier
     * @returns {Promise<Reservation|null>} Updated Reservation entity
     */
    async confirmReservation(id) {
        try {
            return await this.update(id, { status: 'Confirmed' });
        } catch (error) {
            console.error(`Error confirming reservation ${id}:`, error);
            return null;
        }
    }
}
