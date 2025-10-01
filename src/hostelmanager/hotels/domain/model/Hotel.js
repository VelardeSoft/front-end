/**
 * Hotel entity representing a hotel in the system
 * @class
 */
export class Hotel {
    /**
     * @param {number} id - Hotel identifier
     * @param {string} name - Hotel name
     * @param {string} address - Hotel address
     * @param {string} phone - Hotel phone number
     * @param {string} email - Hotel email
     * @param {number} owner_id - Owner user ID
     * @param {number} subscription_id - Subscription ID
     * @param {string} description - Hotel description
     * @param {string[]} amenities - Hotel amenities
     * @param {string} image - Hotel image URL
     */
    constructor(id, name, address, phone, email, owner_id, subscription_id, description = '', amenities = [], image = '') {
        this.id = id;
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.email = email;
        this.owner_id = owner_id;
        this.subscription_id = subscription_id;
        this.description = description;
        this.amenities = amenities;
        this.image = image;
    }

    /**
     * Creates a new Hotel instance from raw data
     * @param {Object} data - Raw hotel data
     * @returns {Hotel} Hotel instance
     */
    static fromPrimitives(data) {
        return new Hotel(
            data.id,
            data.name,
            data.address,
            data.phone || '',
            data.email || '',
            data.owner_id,
            data.subscription_id,
            data.description || '',
            data.amenities || [],
            data.image || ''
        );
    }

    /**
     * Converts Hotel instance to primitive object
     * @returns {Object} Plain object representation
     */
    toPrimitives() {
        return {
            id: this.id,
            name: this.name,
            address: this.address,
            phone: this.phone,
            email: this.email,
            owner_id: this.owner_id,
            subscription_id: this.subscription_id,
            description: this.description,
            amenities: this.amenities,
            image: this.image
        };
    }

    /**
     * Updates hotel information
     * @param {Object} data - Data to update
     * @returns {Hotel} Updated hotel instance
     */
    update(data) {
        if (data.name) this.name = data.name;
        if (data.address) this.address = data.address;
        if (data.phone) this.phone = data.phone;
        if (data.email) this.email = data.email;
        if (data.description) this.description = data.description;
        if (data.amenities) this.amenities = data.amenities;
        if (data.image) this.image = data.image;

        return this;
    }
}
