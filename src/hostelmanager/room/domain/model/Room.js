/**
 * Room entity representing a room in a hotel
 * @class
 */
export class Room {
    /**
     * @param {number} id - Room identifier
     * @param {number} hotel_id - Hotel identifier
     * @param {string} room_number - Room number
     * @param {string} typeroom - Room type (Single, Double, Suite, etc.)
     * @param {number} capacity - Maximum capacity
     * @param {number} price - Price per night
     * @param {string} status - Room status (Available, Occupied, Maintenance)
     * @param {string[]} amenities - Room amenities
     * @param {string} description - Room description
     * @param {string} image - Room image URL
     */
    constructor(id, hotel_id, room_number, typeroom, capacity, price, status, amenities = [], description = '', image = '') {
        this.id = id;
        this.hotel_id = hotel_id;
        this.room_number = room_number;
        this.typeroom = typeroom;
        this.capacity = capacity;
        this.price = price;
        this.status = status;
        this.amenities = amenities;
        this.description = description;
        this.image = image;
    }

    /**
     * Creates a new Room instance from raw data
     * @param {Object} data - Raw room data
     * @returns {Room} Room instance
     */
    static fromPrimitives(data) {
        return new Room(
            data.id,
            data.hotel_id,
            data.room_number,
            data.typeroom,
            data.capacity,
            data.price,
            data.status || 'Available',
            data.amenities || [],
            data.description || '',
            data.image || ''
        );
    }

    /**
     * Converts Room instance to primitive object
     * @returns {Object} Plain object representation
     */
    toPrimitives() {
        return {
            id: this.id,
            hotel_id: this.hotel_id,
            room_number: this.room_number,
            typeroom: this.typeroom,
            capacity: this.capacity,
            price: this.price,
            status: this.status,
            amenities: this.amenities,
            description: this.description,
            image: this.image
        };
    }

    /**
     * Checks if the room is available
     * @returns {boolean} True if room is available
     */
    isAvailable() {
        return this.status === 'Available';
    }

    /**
     * Sets the room as occupied
     */
    occupy() {
        this.status = 'Occupied';
    }

    /**
     * Sets the room as available
     */
    release() {
        this.status = 'Available';
    }

    /**
     * Sets the room as under maintenance
     */
    setMaintenance() {
        this.status = 'Maintenance';
    }

    /**
     * Updates room information
     * @param {Object} data - Data to update
     * @returns {Room} Updated room instance
     */
    update(data) {
        if (data.room_number) this.room_number = data.room_number;
        if (data.typeroom) this.typeroom = data.typeroom;
        if (data.capacity) this.capacity = data.capacity;
        if (data.price) this.price = data.price;
        if (data.status) this.status = data.status;
        if (data.amenities) this.amenities = data.amenities;
        if (data.description) this.description = data.description;
        if (data.image) this.image = data.image;

        return this;
    }
}
