/**
 * Reservation entity representing a room reservation
 * @class
 */
export class Reservation {
    /**
     * @param {number} id - Reservation identifier
     * @param {number} room_id - Room identifier
     * @param {number} user_id - User identifier
     * @param {string} start_date - Check-in date
     * @param {string} end_date - Check-out date
     * @param {string} status - Reservation status (Confirmed, Cancelled, Pending)
     * @param {number} total_price - Total price of the reservation
     * @param {string} created_at - Creation timestamp
     */
    constructor(id, room_id, user_id, start_date, end_date, status, total_price, created_at) {
        this.id = id;
        this.room_id = room_id;
        this.user_id = user_id;
        this.start_date = start_date;
        this.end_date = end_date;
        this.status = status;
        this.total_price = total_price;
        this.created_at = created_at;
    }

    /**
     * Creates a new Reservation instance from raw data
     * @param {Object} data - Raw reservation data
     * @returns {Reservation} Reservation instance
     */
    static fromPrimitives(data) {
        return new Reservation(
            data.id,
            data.room_id,
            data.user_id,
            data.start_date,
            data.end_date,
            data.status || 'Pending',
            data.total_price || 0,
            data.created_at || new Date().toISOString()
        );
    }

    /**
     * Converts Reservation instance to primitive object
     * @returns {Object} Plain object representation
     */
    toPrimitives() {
        return {
            id: this.id,
            room_id: this.room_id,
            user_id: this.user_id,
            start_date: this.start_date,
            end_date: this.end_date,
            status: this.status,
            total_price: this.total_price,
            created_at: this.created_at
        };
    }

    /**
     * Confirms the reservation
     */
    confirm() {
        this.status = 'Confirmed';
    }

    /**
     * Cancels the reservation
     */
    cancel() {
        this.status = 'Cancelled';
    }

    /**
     * Checks if the reservation is active
     * @returns {boolean} True if reservation is active (not cancelled)
     */
    isActive() {
        return this.status !== 'Cancelled';
    }

    /**
     * Calculates the duration of stay in days
     * @returns {number} Number of nights
     */
    getDurationInDays() {
        const startDate = new Date(this.start_date);
        const endDate = new Date(this.end_date);
        const diffTime = endDate.getTime() - startDate.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Checks if the reservation dates overlap with another reservation
     * @param {Reservation} otherReservation - Another reservation to check against
     * @returns {boolean} True if reservations overlap
     */
    overlaps(otherReservation) {
        if (this.room_id !== otherReservation.room_id) {
            return false;
        }

        const thisStart = new Date(this.start_date);
        const thisEnd = new Date(this.end_date);
        const otherStart = new Date(otherReservation.start_date);
        const otherEnd = new Date(otherReservation.end_date);

        return thisStart < otherEnd && thisEnd > otherStart;
    }
}
